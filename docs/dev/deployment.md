# Deployment Guide

ViePilot là một local framework — không có server để deploy. "Deployment" ở đây nghĩa là **distribution**: đưa ViePilot đến máy của users.

## Distribution Methods

### Method 1: npm distribution (recommended for users)

```bash
npx viepilot install
```

Direct target mode:

```bash
npx viepilot install --target cursor-agent --yes
```

### Method 2: Git Clone + Install Script (maintainers/dev)

```bash
git clone https://github.com/0-CODE/viepilot
cd viepilot
./install.sh
```

`install.sh` is a thin **bash** wrapper: optional **cloc** / **PATH** prompts, then **`node bin/viepilot.cjs install`** (same **Node** engine as `npx viepilot install`). It installs to:
- `skills/vp-*/` → `~/.cursor/skills/`
- `workflows/`, `templates/`, `bin/`, `lib/` → `~/.cursor/viepilot/…`
- Optional PATH symlinks (Unix) via `VIEPILOT_ADD_PATH=1`

### Method 3: Development Mode

Dùng khi đang develop ViePilot itself — symlinks thay vì copy:

```bash
./dev-install.sh
```

Changes to `skills/`, `workflows/`, `bin/` phản ánh ngay lập tức mà không cần reinstall.

---

## Environments

| Environment | Purpose | Notes |
|-------------|---------|-------|
| Local dev | Developing ViePilot | Use `dev-install.sh` |
| User machine | Using ViePilot | Use `install.sh` |
| CI | Running tests | `npm ci && npm test` |

---

## Versioning

ViePilot dùng SemVer, tracked trong `TRACKER.md`:

```bash
# Check current version
vp-tools version get

# Bump for new features
vp-tools version bump minor

# Bump for bug fixes
vp-tools version bump patch
```

Release tags (use current framework version from `vp-tools version get`):
```bash
git tag v0.8.2
git push origin v0.8.2
```

---

## npm Publish Workflow

### Preflight Checklist

```bash
npm run release:checklist
npm run verify:release
```

This verifies:
- CLI syntax (`vp-tools.cjs`, `viepilot.cjs`)
- test suite pass
- publish tarball preview (`npm pack --dry-run`)

### Manual Publish

```bash
npm publish --access public
```

Required:
- npm account with publish permission for package `viepilot`
- `NPM_TOKEN` configured (for CI publish)

### CI Publish (GitHub Actions)

Workflow file: `.github/workflows/release-npm.yml`

Triggers:
- release published
- manual workflow dispatch

Secret required:
- `NPM_TOKEN` (repository secret)

### Post-publish Smoke Verification

```bash
npm run smoke:published
# or explicitly:
npx viepilot --help
npx viepilot install --help
```

Optional version pin:

```bash
NPM_VERSION=1.0.0 npm run smoke:published
```

### Rollback / Mitigation

If a bad release is published:

```bash
# Deprecate bad version
npm deprecate viepilot@<bad_version> "Deprecated due to release issue; use latest stable version"

# Publish hotfix version after fix
npm version patch
npm publish --access public
```

For dist-tag mitigation:

```bash
npm dist-tag add viepilot@<stable_version> latest
```

---

## Updating ViePilot

Users cập nhật bằng cách pull và reinstall:

```bash
cd /path/to/viepilot
git pull
./install.sh
```

---

## CI/CD Pipeline

GitHub Actions tại `.github/workflows/ci.yml`:

```
Push/PR → test (Node 18/20/22) → coverage → lint
```

**Jobs**:
1. **test**: Runs unit + integration tests on 3 Node versions
2. **coverage**: Generates lcov report, enforces >80% threshold
3. **lint**: Syntax check for CLI and test files

**Artifacts**: Coverage report (7-day retention)

---

## Makefile Targets

```bash
make help       # Show available targets
make test       # Run test suite
make install    # Install to ~/.cursor/
make dev        # Development mode install
make clean      # Remove installed files
```

---

## Monitoring

ViePilot không có runtime monitoring. "Health" được kiểm tra bằng:

```bash
# Check installation
vp-tools help

# Check project state
vp-tools init
vp-tools progress

# Check documentation sync
/vp-audit
```
