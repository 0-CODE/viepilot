#!/bin/bash

# ViePilot Installation Script
# Installs ViePilot skills and tools to Cursor/Claude environment
#
# Optional: VIEPILOT_SYMLINK_SKILLS=1 — symlink skills/* into ~/.cursor/skills/ (absolute paths)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default installation paths
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

# Check if running from viepilot directory
if [ ! -f "$SCRIPT_DIR/README.md" ] || [ ! -d "$SCRIPT_DIR/skills" ]; then
    echo -e "${RED}Error: Please run this script from the viepilot directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Installation paths:${NC}"
echo "  Skills: $CURSOR_SKILLS_DIR"
echo "  ViePilot: $VIEPILOT_DIR"
echo "  Profile: $INSTALL_PROFILE"
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

# Confirm installation
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
echo -e "${BLUE}Installing...${NC}"

# Create directories
echo "  Creating directories..."
mkdir -p "$CURSOR_SKILLS_DIR"
mkdir -p "$VIEPILOT_DIR/workflows"
mkdir -p "$VIEPILOT_DIR/templates/project"
mkdir -p "$VIEPILOT_DIR/templates/phase"
mkdir -p "$VIEPILOT_DIR/bin"
mkdir -p "$VIEPILOT_DIR/lib"
mkdir -p "$VIEPILOT_DIR/ui-components"

# Install skills (copy default; VIEPILOT_SYMLINK_SKILLS=1 for dev-style live links)
echo "  Installing skills..."
for skill_dir in "$SCRIPT_DIR/skills"/*; do
    if [ -d "$skill_dir" ]; then
        skill_name=$(basename "$skill_dir")
        if [ "${VIEPILOT_SYMLINK_SKILLS:-0}" = "1" ]; then
            if command -v realpath >/dev/null 2>&1; then
                skill_abs=$(realpath "$skill_dir")
            else
                skill_abs=$(cd "$skill_dir" && pwd)
            fi
            ln -sfn "$skill_abs" "$CURSOR_SKILLS_DIR/$skill_name"
            echo "    ✓ $skill_name (symlink)"
        else
            cp -r "$skill_dir" "$CURSOR_SKILLS_DIR/"
            echo "    ✓ $skill_name"
        fi
    fi
done

# Install workflows
echo "  Installing workflows..."
cp -r "$SCRIPT_DIR/workflows"/* "$VIEPILOT_DIR/workflows/"
echo "    ✓ workflows"

# Install templates
echo "  Installing templates..."
cp -r "$SCRIPT_DIR/templates/project"/* "$VIEPILOT_DIR/templates/project/"
cp -r "$SCRIPT_DIR/templates/phase"/* "$VIEPILOT_DIR/templates/phase/"
echo "    ✓ templates"

# Install stock UI components
echo "  Installing stock UI components..."
if [ -d "$SCRIPT_DIR/ui-components" ]; then
    cp -r "$SCRIPT_DIR/ui-components"/* "$VIEPILOT_DIR/ui-components/"
    echo "    ✓ ui-components"
fi

# Install CLI tools
echo "  Installing CLI tools..."
cp "$SCRIPT_DIR/bin/vp-tools.cjs" "$VIEPILOT_DIR/bin/"
cp "$SCRIPT_DIR/bin/viepilot.cjs" "$VIEPILOT_DIR/bin/"
cp "$SCRIPT_DIR/lib/cli-shared.cjs" "$VIEPILOT_DIR/lib/"
chmod +x "$VIEPILOT_DIR/bin/vp-tools.cjs"
chmod +x "$VIEPILOT_DIR/bin/viepilot.cjs"
echo "    ✓ vp-tools.cjs + viepilot.cjs + lib/cli-shared.cjs"

echo "  Checking optional dependency for README metric sync..."
install_cloc_best_effort

# Create symlink in PATH (optional)
echo ""
if [ "$AUTO_YES" != "1" ]; then
    read -p "Add vp-tools + viepilot to PATH? (creates symlink in /usr/local/bin) (y/n) " -n 1 -r
    echo
else
    REPLY=$([ "$ADD_PATH_CHOICE" = "1" ] && echo "y" || echo "n")
fi
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -w "/usr/local/bin" ]; then
        ln -sf "$VIEPILOT_DIR/bin/vp-tools.cjs" "/usr/local/bin/vp-tools"
        ln -sf "$VIEPILOT_DIR/bin/viepilot.cjs" "/usr/local/bin/viepilot"
        echo "    ✓ vp-tools + viepilot added to PATH"
    else
        echo -e "${YELLOW}    Note: Need sudo to create symlink${NC}"
        sudo ln -sf "$VIEPILOT_DIR/bin/vp-tools.cjs" "/usr/local/bin/vp-tools"
        sudo ln -sf "$VIEPILOT_DIR/bin/viepilot.cjs" "/usr/local/bin/viepilot"
        echo "    ✓ vp-tools + viepilot added to PATH"
    fi
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} INSTALLATION COMPLETE ✓${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Installed:"
echo "  - Skills: $CURSOR_SKILLS_DIR/vp-*"
echo "  - Workflows: $VIEPILOT_DIR/workflows/"
echo "  - Templates: $VIEPILOT_DIR/templates/"
echo "  - CLI: $VIEPILOT_DIR/bin/vp-tools.cjs"
echo ""
echo "Quick Start:"
echo "  1. Open your project in Cursor"
echo "  2. Run: /vp-brainstorm"
echo "  3. After brainstorm: /vp-crystallize"
echo "  4. Start coding: /vp-auto"
echo ""
echo "Documentation: $SCRIPT_DIR/docs/getting-started.md"
echo ""
