#!/bin/bash

# ViePilot installation — thin wrapper around the Node installer (bin/viepilot.cjs).
# Implements prompts + optional cloc install here; file copy/symlink/chmod/path is in lib/viepilot-install.cjs.
#
# Optional: VIEPILOT_SYMLINK_SKILLS=1 — passed through to Node (symlink skills into ~/.cursor/skills/)
# Optional: VIEPILOT_INSTALL_DRY_RUN=1 — runs `viepilot install --dry-run` (for CI/tests)

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

CURSOR_SKILLS_DIR="$HOME/.cursor/skills"
VIEPILOT_DIR="$HOME/.cursor/viepilot"
AUTO_YES="${VIEPILOT_AUTO_YES:-0}"
INSTALL_PROFILE="${VIEPILOT_INSTALL_PROFILE:-cursor-ide}"
ADD_PATH_CHOICE="${VIEPILOT_ADD_PATH:-0}"

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " VIEPILOT INSTALLER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

if [ ! -f "$SCRIPT_DIR/README.md" ] || [ ! -d "$SCRIPT_DIR/skills" ]; then
    echo -e "${RED}Error: Please run this script from the viepilot directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Installation paths:${NC}"
echo "  Skills: $CURSOR_SKILLS_DIR"
echo "  ViePilot: $VIEPILOT_DIR"
echo "  Profile: $INSTALL_PROFILE"
echo "  Engine: Node (bin/viepilot.cjs) — no bash copy logic"
echo ""

install_cloc_best_effort() {
    if command -v cloc >/dev/null 2>&1; then
        echo "  ✓ cloc detected"
        return 0
    fi

    echo -e "${YELLOW}  cloc not found.${NC}"
    echo "  README metric auto-sync can still run with fallback, but LOC refresh will be skipped."
    echo "  Suggested install:"
    echo "    - macOS: brew install cloc"
    echo "    - Ubuntu/Debian: sudo apt-get install -y cloc"
    echo "    - Windows: choco install cloc"

    if [ "$AUTO_YES" = "1" ]; then
        return 0
    fi

    read -p "  Attempt automatic cloc install now (best effort)? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 0
    fi

    if command -v brew >/dev/null 2>&1; then
        brew install cloc || true
    elif command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y cloc || true
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y cloc || true
    elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y cloc || true
    elif command -v pacman >/dev/null 2>&1; then
        sudo pacman -Sy --noconfirm cloc || true
    else
        echo -e "${YELLOW}  Could not detect supported package manager. Install cloc manually.${NC}"
    fi

    if command -v cloc >/dev/null 2>&1; then
        echo "  ✓ cloc installed"
    else
        echo -e "${YELLOW}  cloc is still unavailable; continuing without blocking installation.${NC}"
    fi
}

if [ "$AUTO_YES" != "1" ]; then
    read -p "Continue with installation? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
else
    echo "Auto-yes enabled via VIEPILOT_AUTO_YES=1"
fi

echo ""
echo -e "${BLUE}Preparing Node installer...${NC}"
install_cloc_best_effort

echo ""
if [ "$AUTO_YES" != "1" ]; then
    read -p "Add vp-tools + viepilot to PATH? (symlinks via Node installer, often /usr/local/bin) (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        export VIEPILOT_ADD_PATH=1
    fi
else
    if [ "$ADD_PATH_CHOICE" = "1" ]; then
        export VIEPILOT_ADD_PATH=1
    fi
fi

export VIEPILOT_AUTO_YES=1

NODE_ARGS=(install --target "$INSTALL_PROFILE" --yes)
if [ "${VIEPILOT_INSTALL_DRY_RUN:-0}" = "1" ]; then
    NODE_ARGS+=(--dry-run)
fi

echo ""
echo -e "${BLUE}Running: node bin/viepilot.cjs ${NODE_ARGS[*]}${NC}"
exec node "$SCRIPT_DIR/bin/viepilot.cjs" "${NODE_ARGS[@]}"
