#!/bin/bash

# ViePilot Development Installation Script
# Installs development build without symlink dependency by default
#
# Optional: VIEPILOT_SYMLINK_SKILLS=1 — symlink each skills/vp-* into ~/.cursor/skills/
# (live edits from this repo; default remains copy for reliability — see FEAT-005)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory (project root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURSOR_SKILLS_DIR="$HOME/.cursor/skills"
VIEPILOT_DIR="$HOME/.cursor/viepilot"
AUTO_YES="${VIEPILOT_AUTO_YES:-0}"
INSTALL_PROFILE="${VIEPILOT_INSTALL_PROFILE:-cursor-agent}"

echo -e "${BLUE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " VIEPILOT DEV INSTALLER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${NC}"

if [ "${VIEPILOT_SYMLINK_SKILLS:-0}" = "1" ]; then
    echo -e "${YELLOW}Development mode installation (skills: SYMLINK → repo)${NC}"
else
    echo -e "${YELLOW}Development mode installation (copy-first for reliability)${NC}"
fi
echo "  Source: $SCRIPT_DIR"
echo "  Target: $CURSOR_SKILLS_DIR, $VIEPILOT_DIR"
echo "  Profile: $INSTALL_PROFILE"
echo ""

check_cloc_dependency() {
    if command -v cloc >/dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} cloc detected"
        return 0
    fi

    echo -e "${YELLOW}  cloc not found.${NC}"
    echo "  README LOC auto-sync will fallback safely, but metrics won't refresh automatically."
    echo "  Install suggestion:"
    echo "    - macOS: brew install cloc"
    echo "    - Ubuntu/Debian: sudo apt-get install -y cloc"
    echo "    - Windows: choco install cloc"
}

# Confirm
if [ "$AUTO_YES" != "1" ]; then
    read -p "This will replace existing installation with dev files. Continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
else
    echo "Auto-yes enabled via VIEPILOT_AUTO_YES=1"
fi

echo ""
echo -e "${BLUE}Removing old installations...${NC}"

# Remove old skill installations
for skill in "$CURSOR_SKILLS_DIR"/vp-*/; do
    if [ -d "$skill" ] || [ -L "$skill" ]; then
        rm -rf "$skill"
        echo "  Removed: $(basename "$skill")"
    fi
done

# Remove old viepilot installation
if [ -d "$VIEPILOT_DIR" ] || [ -L "$VIEPILOT_DIR" ]; then
    rm -rf "$VIEPILOT_DIR"
    echo "  Removed: viepilot/"
fi

echo ""
echo -e "${BLUE}Installing skills...${NC}"

# Install skills: copy (default) or symlink when VIEPILOT_SYMLINK_SKILLS=1
mkdir -p "$CURSOR_SKILLS_DIR"
for skill in "$SCRIPT_DIR"/skills/vp-*/; do
    skill_name=$(basename "$skill")
    if [ "${VIEPILOT_SYMLINK_SKILLS:-0}" = "1" ]; then
        if command -v realpath >/dev/null 2>&1; then
            skill_abs=$(realpath "$skill")
        else
            skill_abs=$(cd "$skill" && pwd)
        fi
        ln -sfn "$skill_abs" "$CURSOR_SKILLS_DIR/$skill_name"
        echo -e "  ${GREEN}✓${NC} $skill_name (symlink)"
    else
        cp -R "$skill" "$CURSOR_SKILLS_DIR/$skill_name"
        echo -e "  ${GREEN}✓${NC} $skill_name"
    fi
done

echo ""
echo -e "${BLUE}Installing viepilot files...${NC}"

# Install file copies (avoid symlink discovery issues)
mkdir -p "$VIEPILOT_DIR"
mkdir -p "$VIEPILOT_DIR/workflows"
mkdir -p "$VIEPILOT_DIR/templates"
mkdir -p "$VIEPILOT_DIR/bin"
mkdir -p "$VIEPILOT_DIR/lib"
mkdir -p "$VIEPILOT_DIR/ui-components"

cp -R "$SCRIPT_DIR/workflows/"* "$VIEPILOT_DIR/workflows/"
cp -R "$SCRIPT_DIR/templates/"* "$VIEPILOT_DIR/templates/"
cp -R "$SCRIPT_DIR/bin/"* "$VIEPILOT_DIR/bin/"
cp -R "$SCRIPT_DIR/lib/"* "$VIEPILOT_DIR/lib/"
if [ -d "$SCRIPT_DIR/ui-components" ]; then
    cp -R "$SCRIPT_DIR/ui-components/"* "$VIEPILOT_DIR/ui-components/"
fi

echo -e "  ${GREEN}✓${NC} workflows"
echo -e "  ${GREEN}✓${NC} templates"
echo -e "  ${GREEN}✓${NC} bin"
echo -e "  ${GREEN}✓${NC} lib"
echo -e "  ${GREEN}✓${NC} ui-components"
check_cloc_dependency

# Count installed
SKILL_COUNT=$(ls -d "$CURSOR_SKILLS_DIR"/vp-*/ 2>/dev/null | wc -l | tr -d ' ')
WORKFLOW_COUNT=$(ls "$SCRIPT_DIR"/workflows/*.md 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} DEV INSTALLATION COMPLETE ✓${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
if [ "${VIEPILOT_SYMLINK_SKILLS:-0}" = "1" ]; then
    echo "Installed (skills symlink mode):"
    echo -e "${YELLOW}Skills point at repo — edits in $SCRIPT_DIR/skills/ are live.${NC}"
else
    echo "Installed (copy mode):"
    echo -e "${YELLOW}Development mode enabled (reliable copy mode).${NC}"
    echo "Re-run this script after local changes to refresh installed files."
fi
echo "  - Skills: $SKILL_COUNT"
echo "  - Workflows: $WORKFLOW_COUNT"
echo ""
