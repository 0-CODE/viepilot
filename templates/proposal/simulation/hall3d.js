/* Rehearsal Hall replay (ENH-121) — embedded into report.html. No network: three.js is inlined as
   text (#three-src) and loaded through a Blob URL; without WebGL (or if loading fails) a 2D SVG hall
   with the same controls is shown. HallCore is plain logic shared with the Node tests. */
(function (root) {
  'use strict';

  var HallCore = {
    segmentAt: function (segments, t) {
      for (var i = 0; i < segments.length; i++) if (t >= segments[i].tStart && t < segments[i].tEnd) return i;
      return segments.length ? segments.length - 1 : -1;
    },
    stateAt: function (listener, seg) {
      var best = null;
      for (var i = 0; i < listener.states.length; i++) if (listener.states[i].seg <= seg) best = listener.states[i];
      return best;
    },
    isTunedOut: function (listener, seg) {
      if (!listener.tuneOut || seg < listener.tuneOut.seg) return false;
      return !(listener.regainedAt !== null && listener.regainedAt !== undefined && seg >= listener.regainedAt);
    },
    // attention 0 → red, 50 → amber, 100 → green
    attentionColor: function (a) {
      var v = Math.max(0, Math.min(100, a)) / 100;
      var r = v < 0.5 ? 220 : Math.round(220 - (v - 0.5) * 2 * 180);
      var g = v < 0.5 ? Math.round(60 + v * 2 * 140) : Math.round(200 - (v - 0.5) * 2 * 20);
      return 'rgb(' + r + ',' + g + ',70)';
    },
    seatLayout: function (n) {
      // rows of up to 8 seats on an arc facing the stage at z = 0
      var seats = [], perRow = 8;
      for (var i = 0; i < n; i++) {
        var row = Math.floor(i / perRow), idx = i % perRow, inRow = Math.min(perRow, n - row * perRow);
        var spread = 1.6, angle = (idx - (inRow - 1) / 2) * 0.16;
        var radius = 6 + row * spread;
        seats.push({ x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, row: row });
      }
      return seats;
    },
    frame: function (data, t) {
      var seg = HallCore.segmentAt(data.timeline.segments, t);
      var s = data.timeline.segments[seg] || {};
      return {
        seg: seg, slide: s.slide, text: s.text || '',
        seats: data.listeners.map(function (l) {
          var st = HallCore.stateAt(l, seg) || { attention: 100, comprehension: 100, emotion: 0, funnelStage: 'aware' };
          var out = HallCore.isTunedOut(l, seg);
          return { personaId: l.personaId, attention: st.attention, comprehension: st.comprehension, emotion: st.emotion, stage: st.funnelStage,
            question: st.seg === seg ? (st.question || null) : null, objection: st.seg === seg ? (st.objection || null) : null,
            tunedOut: out, color: HallCore.attentionColor(out ? 0 : st.attention),
            primary: (data.hall && data.hall.primary || []).indexOf(l.personaId) !== -1 };
        }),
      };
    },
  };

  if (typeof module !== 'undefined' && module.exports) { module.exports = { HallCore: HallCore }; return; }

  var doc = root.document;
  var dataEl = doc.getElementById('hall-data');
  var mount = doc.getElementById('hall-root');
  if (!dataEl || !mount) return;
  var data = JSON.parse(dataEl.textContent);
  var segs = data.timeline.segments;
  var total = segs.length ? segs[segs.length - 1].tEnd : 0;
  var names = data.names || {};
  var nameOf = function (id) { return names[id] || ('#' + id); };
  var slideTitle = function (n) { var s = (data.timeline.slides || []).filter(function (x) { return x.slide === n; })[0]; return s ? s.heading : ''; };
  // Slide images (BUG-036): data URIs keyed by slide number; the heading is the fallback when one is missing.
  var slideImages = data.slideImages || {};
  var imgCache = {};
  function slideImage(n, onload) {
    var src = slideImages[n];
    if (!src || !root.Image) return null;
    if (!imgCache[n]) { var im = new root.Image(); im.onload = function () { im.ready = true; if (onload) onload(n); }; im.src = src; imgCache[n] = im; }
    return imgCache[n];
  }

  mount.innerHTML =
    '<div class="hall-ui" style="display:grid;gap:8px">' +
    '<div class="hall-view" style="position:relative;width:100%;aspect-ratio:16/9;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--bg)"></div>' +
    '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
    '<button type="button" class="hall-play" style="min-width:72px">▶</button>' +
    '<input class="hall-scrub" type="range" min="0" max="' + total + '" step="0.1" value="0" style="flex:1;min-width:140px" aria-label="timeline">' +
    '<select class="hall-speed" aria-label="speed"><option value="1">1×</option><option value="2" selected>2×</option><option value="4">4×</option><option value="8">8×</option></select>' +
    '<span class="hall-time muted"></span></div>' +
    '<div class="hall-line" style="min-height:2.6em"></div>' +
    '<div class="hall-info muted" style="font-size:.9rem"></div></div>';
  var view = mount.querySelector('.hall-view'), playBtn = mount.querySelector('.hall-play'), scrub = mount.querySelector('.hall-scrub');
  var speedSel = mount.querySelector('.hall-speed'), timeEl = mount.querySelector('.hall-time'), lineEl = mount.querySelector('.hall-line'), infoEl = mount.querySelector('.hall-info');
  var t = 0, playing = false, last = 0, selected = null, renderer2or3 = null;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var fmt = function (s) { return Math.floor(s / 60) + ':' + ('0' + Math.round(s % 60)).slice(-2); };

  function showInfo(f) {
    if (selected === null) { infoEl.textContent = ''; return; }
    var s = f.seats.filter(function (x) { return x.personaId === selected; })[0];
    if (!s) return;
    infoEl.innerHTML = '<b>' + esc(nameOf(s.personaId)) + '</b>' + (s.primary ? ' ★' : '') + ' — attention ' + s.attention + ', comprehension ' + s.comprehension +
      ', emotion ' + s.emotion + ', ' + esc(s.stage) + (s.tunedOut ? ' — tuned out' : '') + (s.question ? '<br>? ' + esc(s.question) : '') + (s.objection ? '<br>! ' + esc(s.objection) : '');
  }
  function update() {
    var f = HallCore.frame(data, t);
    scrub.value = t; timeEl.textContent = fmt(t) + ' / ' + fmt(total);
    lineEl.innerHTML = '<b>Slide ' + esc(f.slide) + ' · ' + esc(slideTitle(f.slide)) + '</b><br>' + esc(f.text);
    if (renderer2or3) renderer2or3.draw(f);
    showInfo(f);
  }
  function tick(now) {
    if (playing) {
      t = Math.min(total, t + ((now - last) / 1000) * Number(speedSel.value));
      if (t >= total) { playing = false; playBtn.textContent = '▶'; }
    }
    last = now; update();
    root.requestAnimationFrame(tick);
  }
  playBtn.addEventListener('click', function () { if (t >= total) t = 0; playing = !playing; playBtn.textContent = playing ? '❚❚' : '▶'; });
  scrub.addEventListener('input', function () { t = Number(scrub.value); });

  // ── 2D fallback ─────────────────────────────────────────────────────────────
  function make2D() {
    var NS = 'http://www.w3.org/2000/svg'; // XML namespace identifier, not a network request
    var svg = doc.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-11 -2 22 14'); svg.style.width = '100%'; svg.style.height = '100%';
    var stage = doc.createElementNS(NS, 'rect'); stage.setAttribute('x', -5); stage.setAttribute('y', -1.5); stage.setAttribute('width', 10); stage.setAttribute('height', 1.2); stage.setAttribute('rx', 0.3); stage.setAttribute('fill', '#4f6ef7');
    svg.appendChild(stage);
    var shot = doc.createElementNS(NS, 'image'); shot.setAttribute('x', -3.2); shot.setAttribute('y', -1.9); shot.setAttribute('width', 6.4); shot.setAttribute('height', 3.6);
    shot.setAttribute('preserveAspectRatio', 'xMidYMid meet'); svg.setAttribute('viewBox', '-11 -2.5 22 14.5'); svg.appendChild(shot);
    var shown2D = null;
    var layout = HallCore.seatLayout(data.listeners.length), dots = [];
    data.listeners.forEach(function (l, i) {
      var c = doc.createElementNS(NS, 'circle'); c.setAttribute('cx', layout[i].x); c.setAttribute('cy', layout[i].z - 4); c.setAttribute('r', 0.55); c.style.cursor = 'pointer';
      c.addEventListener('click', function () { selected = l.personaId; });
      var title = doc.createElementNS(NS, 'title'); title.textContent = nameOf(l.personaId); c.appendChild(title);
      svg.appendChild(c); dots.push(c);
    });
    view.appendChild(svg);
    return { draw: function (f) {
      if (f.slide !== shown2D) { shown2D = f.slide; if (slideImages[f.slide]) { shot.setAttribute('href', slideImages[f.slide]); shot.style.display = ''; } else shot.style.display = 'none'; }
      f.seats.forEach(function (s, i) { dots[i].setAttribute('fill', s.color); dots[i].setAttribute('fill-opacity', s.tunedOut ? 0.25 : 1); dots[i].setAttribute('stroke', s.primary ? '#fff' : 'none'); dots[i].setAttribute('stroke-width', s.primary ? 0.15 : 0); }); } };
  }

  // ── 3D hall ─────────────────────────────────────────────────────────────────
  function make3D(THREE) {
    var w = view.clientWidth || 640, h = view.clientHeight || 360;
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, root.devicePixelRatio || 1)); renderer.setSize(w, h); view.appendChild(renderer.domElement);
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
    var orbit = { angle: 0.0, tilt: 0.45, dist: 20 };
    function place() { camera.position.set(Math.sin(orbit.angle) * orbit.dist, orbit.dist * orbit.tilt, Math.cos(orbit.angle) * orbit.dist); camera.lookAt(0, 1, 2); }
    place();
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    var sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(5, 12, 8); scene.add(sun);
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({ color: 0x8a8f9c, transparent: true, opacity: 0.15 }));
    floor.rotation.x = -Math.PI / 2; scene.add(floor);
    // stage + screen with the current slide title
    var stage = new THREE.Mesh(new THREE.BoxGeometry(10, 0.4, 2.5), new THREE.MeshStandardMaterial({ color: 0x2a2f3a })); stage.position.set(0, 0.2, -1.5); scene.add(stage);
    var canvas = doc.createElement('canvas'); canvas.width = 1024; canvas.height = 576; var ctx = canvas.getContext('2d');
    var screenTex = new THREE.CanvasTexture(canvas);
    var screen = new THREE.Mesh(new THREE.PlaneGeometry(8, 4.5), new THREE.MeshBasicMaterial({ map: screenTex })); screen.position.set(0, 3.2, -2.6); scene.add(screen);
    var lastSlide = null;
    function paintScreen(slide) {
      ctx.fillStyle = '#1a1f36'; ctx.fillRect(0, 0, 1024, 576);
      var im = slideImage(slide, function (n) { if (n === lastSlide) paintScreen(n); });
      if (im && im.ready) {
        var r = Math.min(1024 / im.width, 576 / im.height), dw = im.width * r, dh = im.height * r;
        ctx.drawImage(im, (1024 - dw) / 2, (576 - dh) / 2, dw, dh);
      } else {
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 60px system-ui, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('Slide ' + slide, 512, 220); ctx.font = '44px system-ui, sans-serif'; ctx.fillText(String(slideTitle(slide)).slice(0, 40), 512, 320);
      }
      screenTex.needsUpdate = true;
    }
    var layout = HallCore.seatLayout(data.listeners.length), people = [];
    data.listeners.forEach(function (l, i) {
      var g = new THREE.Group();
      var mat = new THREE.MeshStandardMaterial({ color: 0x55aa55, transparent: true });
      var body = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.1, 16), mat); body.position.y = 0.55;
      var head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mat); head.position.y = 1.35;
      var ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffffff })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.05;
      var flag = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffcc00 })); flag.position.y = 2.0;
      g.add(body); g.add(head); g.add(ring); g.add(flag);
      g.position.set(layout[i].x, layout[i].row * 0.35, layout[i].z);
      g.userData.personaId = l.personaId; body.userData.personaId = l.personaId; head.userData.personaId = l.personaId;
      scene.add(g); people.push({ g: g, mat: mat, ring: ring, flag: flag, body: body, head: head });
    });
    // drag to orbit, wheel to zoom, click a seat for details
    var dragging = false, px = 0, py = 0, moved = 0;
    renderer.domElement.addEventListener('pointerdown', function (e) { dragging = true; px = e.clientX; py = e.clientY; moved = 0; });
    root.addEventListener('pointerup', function (e) {
      if (dragging && moved < 4) {
        var rect = renderer.domElement.getBoundingClientRect();
        var ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1), camera);
        var hit = ray.intersectObjects(people.reduce(function (a, p) { return a.concat([p.body, p.head]); }, []))[0];
        if (hit) selected = hit.object.userData.personaId;
      }
      dragging = false;
    });
    root.addEventListener('pointermove', function (e) {
      if (!dragging) return; moved += Math.abs(e.clientX - px) + Math.abs(e.clientY - py);
      orbit.angle -= (e.clientX - px) * 0.005; orbit.tilt = Math.max(0.12, Math.min(1.2, orbit.tilt + (e.clientY - py) * 0.003)); px = e.clientX; py = e.clientY; place();
    });
    renderer.domElement.addEventListener('wheel', function (e) { e.preventDefault(); orbit.dist = Math.max(10, Math.min(40, orbit.dist + e.deltaY * 0.02)); place(); }, { passive: false });
    root.addEventListener('resize', function () { var W = view.clientWidth, H = view.clientHeight; renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); });
    return {
      draw: function (f) {
        if (f.slide !== lastSlide) { paintScreen(f.slide); lastSlide = f.slide; }
        f.seats.forEach(function (s, i) {
          var p = people[i]; p.mat.color.set(s.color); p.mat.opacity = s.tunedOut ? 0.25 : 1;
          p.ring.visible = s.primary || s.personaId === selected; p.ring.material.color.set(s.personaId === selected ? 0x4f6ef7 : 0xffffff);
          p.flag.visible = !!(s.question || s.objection); p.flag.material.color.set(s.objection ? 0xff5533 : 0xffcc00);
        });
        renderer.render(scene, camera);
      },
    };
  }

  function hasWebGL() {
    try { var c = doc.createElement('canvas'); return !!(root.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  }
  function start(r) { renderer2or3 = r; last = root.performance.now(); root.requestAnimationFrame(tick); }
  var src = doc.getElementById('three-src');
  if (src && hasWebGL()) {
    var url = root.URL.createObjectURL(new root.Blob([src.textContent], { type: 'text/javascript' }));
    import(url).then(function (THREE) { start(make3D(THREE)); }).catch(function () { start(make2D()); });
  } else start(make2D());
})(typeof window !== 'undefined' ? window : globalThis);
