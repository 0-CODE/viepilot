# ViePilot Makefile
# Developer commands for installation and management

.PHONY: help install update uninstall clean test validate

# Default target
help:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo " ViePilot - Makefile Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo " Installation:"
	@echo "   make install     Cài đặt ViePilot / Install ViePilot"
	@echo "   make update      Cập nhật từ repo / Update from repo"
	@echo "   make uninstall   Gỡ cài đặt / Uninstall"
	@echo ""
	@echo " Development:"
	@echo "   make validate    Kiểm tra cấu trúc / Validate structure"
	@echo "   make test        Chạy tests / Run tests"
	@echo "   make clean       Dọn dẹp / Clean temp files"
	@echo ""
	@echo " Info:"
	@echo "   make stats       Thống kê dự án / Project statistics"
	@echo "   make version     Hiển thị version / Show version"
	@echo "   make help        Hiển thị help này / Show this help"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

# Installation paths
CURSOR_SKILLS := $(HOME)/.cursor/skills
VIEPILOT_DIR := $(HOME)/.cursor/viepilot

# Install ViePilot
install:
	@echo "Installing ViePilot..."
	@mkdir -p $(CURSOR_SKILLS)
	@mkdir -p $(VIEPILOT_DIR)/workflows
	@mkdir -p $(VIEPILOT_DIR)/templates/project
	@mkdir -p $(VIEPILOT_DIR)/templates/phase
	@mkdir -p $(VIEPILOT_DIR)/bin
	@cp -r skills/* $(CURSOR_SKILLS)/
	@cp -r workflows/* $(VIEPILOT_DIR)/workflows/
	@cp -r templates/project/* $(VIEPILOT_DIR)/templates/project/
	@cp -r templates/phase/* $(VIEPILOT_DIR)/templates/phase/
	@cp bin/vp-tools.cjs $(VIEPILOT_DIR)/bin/
	@chmod +x $(VIEPILOT_DIR)/bin/vp-tools.cjs
	@echo ""
	@echo "✓ ViePilot installed successfully!"
	@echo ""
	@echo "  Skills: $(CURSOR_SKILLS)/vp-*"
	@echo "  Workflows: $(VIEPILOT_DIR)/workflows/"
	@echo "  Templates: $(VIEPILOT_DIR)/templates/"
	@echo "  CLI: $(VIEPILOT_DIR)/bin/vp-tools.cjs"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. Open project in Cursor"
	@echo "  2. Run: /vp-brainstorm"
	@echo ""

# Update from repo
update:
	@echo "Updating ViePilot..."
	@git pull origin main
	@$(MAKE) install
	@echo "✓ ViePilot updated!"

# Uninstall
uninstall:
	@echo "Uninstalling ViePilot..."
	@rm -rf $(CURSOR_SKILLS)/vp-*
	@rm -rf $(VIEPILOT_DIR)
	@echo "✓ ViePilot uninstalled!"

# Validate structure
validate:
	@echo "Validating ViePilot structure..."
	@echo ""
	@echo "Skills:"
	@for skill in skills/vp-*/SKILL.md; do \
		if [ -f "$$skill" ]; then \
			echo "  ✓ $$skill"; \
		else \
			echo "  ✗ $$skill MISSING"; \
		fi \
	done
	@echo ""
	@echo "Workflows:"
	@for wf in workflows/*.md; do \
		if [ -f "$$wf" ]; then \
			echo "  ✓ $$wf"; \
		else \
			echo "  ✗ $$wf MISSING"; \
		fi \
	done
	@echo ""
	@echo "Templates:"
	@for tpl in templates/project/*.md templates/phase/*.md; do \
		if [ -f "$$tpl" ]; then \
			echo "  ✓ $$tpl"; \
		else \
			echo "  ✗ $$tpl MISSING"; \
		fi \
	done
	@echo ""
	@echo "✓ Validation complete!"

# Run tests (placeholder)
test:
	@echo "Running ViePilot tests..."
	@echo "  (Test framework coming soon)"

# Clean temp files
clean:
	@echo "Cleaning temp files..."
	@find . -name "*.tmp" -delete
	@find . -name ".DS_Store" -delete
	@echo "✓ Cleaned!"

# Project statistics
stats:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo " ViePilot Statistics"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo " Skills:      $$(ls -d skills/vp-*/ 2>/dev/null | wc -l | tr -d ' ')"
	@echo " Workflows:   $$(ls workflows/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo " Templates:   $$(ls templates/**/*.md 2>/dev/null | wc -l | tr -d ' ')"
	@echo " Total LOC:   $$(find . -name '*.md' -o -name '*.cjs' -o -name '*.sh' | xargs wc -l 2>/dev/null | tail -1 | awk '{print $$1}')"
	@echo " Total Files: $$(find . -type f -name '*.md' -o -name '*.cjs' -o -name '*.sh' | wc -l | tr -d ' ')"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

# Show version
version:
	@echo "ViePilot v0.1.0"
