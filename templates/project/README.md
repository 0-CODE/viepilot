# {{PROJECT_NAME}}

**{{PROJECT_DESCRIPTION}}**

[![Version](https://img.shields.io/badge/version-{{VERSION}}-blue.svg)](CHANGELOG.md)
[![License: {{LICENSE}}](https://img.shields.io/badge/License-{{LICENSE}}-green.svg)](LICENSE)
[![Built with ViePilot](https://img.shields.io/badge/Built%20with-ViePilot-purple.svg)](https://github.com/0-CODE/viepilot)

{{PROJECT_DESCRIPTION_LONG}}

---

## Quy mô dự án / Project Scale

| Chỉ số / Metric | Giá trị / Value |
|-----------------|-----------------|
| Total LOC | **{{TOTAL_LOC}}** (nguồn chính; không gồm `node_modules`, `vendor`) |
| Version | {{VERSION}} |
| Phases | {{PHASE_COUNT}} |
| Status | {{STATUS}} |
| Started | {{INCEPTION_YEAR}} |

> Metric `Total LOC` có thể được refresh tự động bằng `npm run readme:sync` (dùng `cloc`; nếu thiếu `cloc` script sẽ fallback an toàn).

### Phân bổ / Breakdown

| Thành phần / Component | LOC | Số lượng / Count | Mô tả / Description |
|------------------------|-----|------------------|---------------------|
{{BREAKDOWN_TABLE}}

---

## Độ hoàn thiện / Completion Status

```
Tổng thể / Overall:  {{COMPLETION_BAR}}  {{COMPLETION_PERCENT}}%
```

| Lĩnh vực / Area | Trạng thái | Chi tiết |
|-----------------|------------|----------|
{{COMPLETION_TABLE}}

---

## Tính năng / Features

{{FEATURES_LIST}}

---

## Tech Stack

| Layer | Technology |
|-------|------------|
{{TECH_STACK_TABLE}}

---

## Standards / Tiêu chuẩn

| Standard | Specification | Usage |
|----------|---------------|-------|
{{STANDARDS_TABLE}}

---

## Bắt đầu nhanh / Quick Start

### Prerequisites / Yêu cầu

{{PREREQUISITES}}

### Installation / Cài đặt

```bash
# Clone repository
git clone {{REPOSITORY_URL}}
cd {{ARTIFACT_ID}}

# Install dependencies
{{INSTALL_COMMAND}}

# Setup environment
cp .env.example .env

# Run
{{RUN_COMMAND}}
```

### Using Makefile (if available)

```bash
make setup    # Setup environment
make dev      # Start development
make test     # Run tests
make build    # Build for production
make help     # Show all commands
```

---

## Sử dụng / Usage

{{USAGE_SECTION}}

---

## Cấu trúc dự án / Project Structure

```
{{ARTIFACT_ID}}/
├── {{PROJECT_STRUCTURE}}
```

---

## Development / Phát triển

### Development Workflow

Dự án này được phát triển với [ViePilot](https://github.com/0-CODE/viepilot) framework.

```bash
# Xem tiến độ / Check progress
/vp-status

# Tiếp tục phát triển / Continue development
/vp-auto

# Thêm feature mới / Add new feature
/vp-request --feature

# Report bug
/vp-request --bug
```

### Current Progress

```
{{PROGRESS_BAR}}
```

Xem chi tiết tại / See details at: [.viepilot/TRACKER.md](.viepilot/TRACKER.md)

---

## API Documentation / Tài liệu API

{{API_DOCS_SECTION}}

---

## Testing / Kiểm thử

```bash
# Run all tests
{{TEST_COMMAND}}

# Run specific tests
{{TEST_SPECIFIC_COMMAND}}
```

---

## Deployment / Triển khai

{{DEPLOYMENT_SECTION}}

---

## Tài liệu / Documentation

| Tài liệu / Document | Nội dung / Content |
|---------------------|-------------------|
| [Architecture](.viepilot/ARCHITECTURE.md) | Kiến trúc hệ thống / System architecture |
| [API Reference](docs/api/) | Tài liệu API / API documentation |
| [Developer Guide](docs/dev/) | Hướng dẫn phát triển / Developer guide |
| [CHANGELOG](CHANGELOG.md) | Lịch sử thay đổi / Version history |
| [CONTRIBUTING](CONTRIBUTING.md) | Hướng dẫn đóng góp / How to contribute |

---

## Roadmap

{{ROADMAP_SUMMARY}}

Xem chi tiết tại / See details at: [.viepilot/ROADMAP.md](.viepilot/ROADMAP.md)

---

## Đóng góp / Contributing

Chúng tôi hoan nghênh mọi đóng góp! / We welcome contributions!

Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết chi tiết.

---

## Bảo mật / Security

Để báo cáo lỗ hổng bảo mật, vui lòng xem [SECURITY.md](SECURITY.md).

To report security vulnerabilities, please see [SECURITY.md](SECURITY.md).

---

## Team / Đội ngũ

### Maintainers

| Name | Role | Contact |
|------|------|---------|
| {{LEAD_DEVELOPER_NAME}} | Project Lead | [@{{LEAD_DEVELOPER_GITHUB}}](https://github.com/{{LEAD_DEVELOPER_GITHUB}}) |

### Contributors

Xem danh sách đầy đủ tại / See full list at: [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

## License / Giấy phép

{{LICENSE}} License - Xem [LICENSE](LICENSE) để biết chi tiết.

---

## Acknowledgments / Ghi nhận

- Built with [ViePilot](https://github.com/0-CODE/viepilot) - Autonomous Vibe Coding Framework
{{ACKNOWLEDGMENTS}}

---

<p align="center">
  <strong>{{PROJECT_NAME}}</strong>
  <br>
  {{TAGLINE}}
  <br><br>
  Copyright © {{INCEPTION_YEAR}} {{ORGANIZATION_NAME}}
</p>
