#!/bin/bash

# ViePilot Development Installation Script
# Creates symlinks to development version for instant updates

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

echo -e "${YELLOW}Development mode installation${NC}"
echo "  Source: $SCRIPT_DIR"
echo "  Target: $CURSOR_SKILLS_DIR, $VIEPILOT_DIR"
echo "  Profile: $INSTALL_PROFILE"
echo ""

# Confirm
if [ "$AUTO_YES" != "1" ]; then
    read -p "This will replace existing installation with symlinks. Continue? (y/n) " -n 1 -r
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
echo -e "${BLUE}Creating skill symlinks...${NC}"

# Create skill symlinks
mkdir -p "$CURSOR_SKILLS_DIR"
for skill in "$SCRIPT_DIR"/skills/vp-*/; do
    skill_name=$(basename "$skill")
    ln -s "$skill" "$CURSOR_SKILLS_DIR/$skill_name"
    echo -e "  ${GREEN}✓${NC} $skill_name"
done

echo ""
echo -e "${BLUE}Creating viepilot symlinks...${NC}"

# Create viepilot directory and symlinks
mkdir -p "$VIEPILOT_DIR"
ln -s "$SCRIPT_DIR/workflows" "$VIEPILOT_DIR/workflows"
ln -s "$SCRIPT_DIR/templates" "$VIEPILOT_DIR/templates"
ln -s "$SCRIPT_DIR/bin" "$VIEPILOT_DIR/bin"
ln -s "$SCRIPT_DIR/lib" "$VIEPILOT_DIR/lib"
ln -s "$SCRIPT_DIR/ui-components" "$VIEPILOT_DIR/ui-components"

echo -e "  ${GREEN}✓${NC} workflows"
echo -e "  ${GREEN}✓${NC} templates"
echo -e "  ${GREEN}✓${NC} bin"
echo -e "  ${GREEN}✓${NC} lib"
echo -e "  ${GREEN}✓${NC} ui-components"

# Count installed
SKILL_COUNT=$(ls -d "$CURSOR_SKILLS_DIR"/vp-*/ 2>/dev/null | wc -l | tr -d ' ')
WORKFLOW_COUNT=$(ls "$SCRIPT_DIR"/workflows/*.md 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} DEV INSTALLATION COMPLETE ✓${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Installed (via symlinks):"
echo "  - Skills: $SKILL_COUNT"
echo "  - Workflows: $WORKFLOW_COUNT"
echo ""
echo -e "${YELLOW}Development mode enabled!${NC}"
echo "Any changes to $SCRIPT_DIR will be reflected immediately."
echo ""
echo "To switch back to stable installation:"
echo "  ./install.sh"
echo ""
