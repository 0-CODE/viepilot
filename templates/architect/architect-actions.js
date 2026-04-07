/**
 * ViePilot Architect Item Actions (ENH-033)
 *
 * Injects per-item Approve / Edit prompt-copy buttons into every element
 * marked with [data-arch-id] in the Architect HTML workspace.
 *
 * ISOLATION RULE: Each action is scoped exclusively to the identified item
 * on the identified page. Approving one item does NOT imply approval of any
 * related item on any other page. Cross-page updates require separate prompts.
 *
 * Prompt formats:
 *   APPROVE: [ARCH:{slug}:{id}] APPROVE — "{title}" on {slug} page. No changes needed.
 *   EDIT:    [ARCH:{slug}:{id}] EDIT — "{title}" on {slug} page. Current: "{excerpt}". What should I change?
 */

(function () {
  'use strict';

  // ── Prompt templates ──────────────────────────────────────────────────────

  function approvePrompt(slug, id, title) {
    return '[ARCH:' + slug + ':' + id + '] APPROVE — "' + title + '" on ' + slug + ' page. No changes needed.';
  }

  function editPrompt(slug, id, title, excerpt) {
    var body = excerpt ? ' Current: "' + excerpt + '".' : '';
    return '[ARCH:' + slug + ':' + id + '] EDIT — "' + title + '" on ' + slug + ' page.' + body + ' What should I change?';
  }

  // ── Clipboard helper ─────────────────────────────────────────────────────

  function copyText(text, btn) {
    var original = btn.textContent;
    function onDone() {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('copied');
      }, 1500);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onDone).catch(function () {
        legacyCopy(text);
        onDone();
      });
    } else {
      legacyCopy(text);
      onDone();
    }
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* silent */ }
    document.body.removeChild(ta);
  }

  // ── Text extraction ───────────────────────────────────────────────────────

  function getTitle(el) {
    if (el.dataset.archTitle) return el.dataset.archTitle.trim().slice(0, 80);
    // Table row: first <td>
    if (el.tagName === 'TR') {
      var td = el.querySelector('td');
      if (td) return td.textContent.trim().slice(0, 80);
    }
    // Card/div: heading
    var h = el.querySelector('h2,h3,h4,h5');
    if (h) return h.textContent.trim().slice(0, 80);
    return el.textContent.trim().slice(0, 80);
  }

  function getExcerpt(el) {
    if (el.dataset.archExcerpt) return el.dataset.archExcerpt.trim().slice(0, 100);
    // Table row: second <td>
    if (el.tagName === 'TR') {
      var tds = el.querySelectorAll('td');
      if (tds.length >= 2) return tds[1].textContent.trim().slice(0, 100);
    }
    // Card/div: first <p>
    var p = el.querySelector('p');
    if (p) return p.textContent.trim().slice(0, 100);
    return '';
  }

  // ── Build actions DOM ─────────────────────────────────────────────────────

  function makeActionsEl(slug, id, title, excerpt) {
    var wrap = document.createElement('div');
    wrap.className = 'arch-item-actions';

    var badge = document.createElement('span');
    badge.className = 'arch-id-badge';
    badge.textContent = id;
    badge.title = 'Item ID: [ARCH:' + slug + ':' + id + ']';

    var btnApprove = document.createElement('button');
    btnApprove.className = 'arch-btn arch-btn-approve';
    btnApprove.textContent = '✅ Approve';
    btnApprove.title = 'Copy APPROVE prompt — scoped to this item only';
    btnApprove.type = 'button';
    btnApprove.addEventListener('click', function (e) {
      e.stopPropagation();
      copyText(approvePrompt(slug, id, title), btnApprove);
    });

    var btnEdit = document.createElement('button');
    btnEdit.className = 'arch-btn arch-btn-edit';
    btnEdit.textContent = '✏️ Edit';
    btnEdit.title = 'Copy EDIT prompt — scoped to this item only';
    btnEdit.type = 'button';
    btnEdit.addEventListener('click', function (e) {
      e.stopPropagation();
      copyText(editPrompt(slug, id, title, excerpt), btnEdit);
    });

    wrap.appendChild(badge);
    wrap.appendChild(btnApprove);
    wrap.appendChild(btnEdit);
    return wrap;
  }

  // ── Inject into page ──────────────────────────────────────────────────────

  function inject() {
    var slug = (document.body.dataset.archSlug || 'unknown').trim();
    var items = document.querySelectorAll('[data-arch-id]');

    items.forEach(function (el) {
      var id = el.dataset.archId;
      if (!id) return;
      var title = getTitle(el);
      var excerpt = getExcerpt(el);
      var actionsEl = makeActionsEl(slug, id, title, excerpt);

      if (el.tagName === 'TR') {
        // Ensure thead gets an empty actions header column (once per table)
        var table = el.closest('table');
        if (table) {
          var theadRow = table.querySelector('thead tr');
          if (theadRow && !theadRow.querySelector('.arch-actions-th')) {
            var th = document.createElement('th');
            th.className = 'arch-actions-th';
            theadRow.appendChild(th);
          }
        }
        var td = document.createElement('td');
        td.className = 'arch-actions-cell';
        td.appendChild(actionsEl);
        el.appendChild(td);
      } else {
        // Card / div: insert after first child (heading area)
        var first = el.firstElementChild;
        if (first && first.nextSibling) {
          el.insertBefore(actionsEl, first.nextSibling);
        } else if (first) {
          el.appendChild(actionsEl);
        } else {
          el.prepend(actionsEl);
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
