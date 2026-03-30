# Deployment Guide

ViePilot là một local framework — không có server để deploy. "Deployment" ở đây nghĩa là **distribution**: đưa ViePilot đến máy của users.

## Distribution Methods

### Method 1: Git Clone + Install Script (Recommended)

```bash
git clone https://github.com/0-CODE/viepilot
cd viepilot
./install.sh
```

`install.sh` copies:
- `skills/vp-*/` → `~/.cursor/skills/`
- `workflows/` → `~/.cursor/viepilot/workflows/`
- `templates/` → `~/.cursor/viepilot/templates/`
- `bin/vp-tools.cjs` → `~/.local/bin/vp-tools`

### Method 2: Development Mode

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

Release tags:
```bash
git tag v0.2.0
git push origin v0.2.0
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
