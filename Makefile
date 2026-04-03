# ViePilot Makefile
# Developer commands for installation and management

.PHONY: help install dev-install update uninstall clean test validate

# Default target
help:
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo " ViePilot - Makefile Commands"
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""
	@echo " Installation:"
	@echo "   make install     Cài đặt (Node: bin/viepilot.cjs) / Install via Node CLI"
	@echo "   make dev-install Symlink skills từ repo / Dev install (VIEPILOT_SYMLINK_SKILLS)"
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

# Install ViePilot (Node installer — same engine as npx viepilot install)
install:
	@echo "Installing ViePilot (node bin/viepilot.cjs)..."
	@node bin/viepilot.cjs install --target cursor-agent --yes
	@echo ""
	@echo "Quick Start:"
	@echo "  1. Open project in Cursor"
	@echo "  2. Run: /vp-brainstorm"
	@echo ""

# Dev: symlink skills to this repo (live edits)
dev-install:
	@echo "Dev install (symlink skills)..."
	@VIEPILOT_SYMLINK_SKILLS=1 node bin/viepilot.cjs install --target cursor-agent --yes
	@echo ""
	@echo "✓ Skills under ~/.cursor/skills/vp-* point at repo; re-run after workflow/template changes."
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
	@node bin/viepilot.cjs uninstall --target all --yes
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
	@echo " Total LOC:   $$(find . -name '*.md' -o -name '*.cjs' | xargs wc -l 2>/dev/null | tail -1 | awk '{print $$1}')"
	@echo " Total Files: $$(find . -type f \( -name '*.md' -o -name '*.cjs' \) | wc -l | tr -d ' ')"
	@echo ""
	@echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
	@echo ""

# Show version
version:
	@echo "ViePilot v0.1.0"
