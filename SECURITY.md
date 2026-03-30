# Security Policy / Chính sách bảo mật

## Supported Versions / Phiên bản được hỗ trợ

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Reporting a Vulnerability / Báo cáo lỗ hổng

### English

If you discover a security vulnerability within ViePilot, please follow these steps:

1. **Do NOT** create a public GitHub issue
2. Email the security team at: security@creps.vn
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fixes (optional)

We will respond within **48 hours** and work with you to:
- Confirm the vulnerability
- Develop a fix
- Coordinate disclosure

### Tiếng Việt

Nếu bạn phát hiện lỗ hổng bảo mật trong ViePilot, vui lòng làm theo các bước sau:

1. **KHÔNG** tạo issue công khai trên GitHub
2. Gửi email đến đội bảo mật: security@creps.vn
3. Bao gồm:
   - Mô tả lỗ hổng
   - Các bước tái hiện
   - Tác động tiềm năng
   - Đề xuất sửa lỗi (nếu có)

Chúng tôi sẽ phản hồi trong vòng **48 giờ** và làm việc với bạn để:
- Xác nhận lỗ hổng
- Phát triển bản vá
- Phối hợp công bố

## Security Best Practices / Thực hành bảo mật

When using ViePilot, follow these security practices:

### For Generated Projects

1. **Never commit secrets**
   - Use `.env` files (gitignored)
   - Use secret management tools
   - ViePilot's SYSTEM-RULES.md includes forbidden patterns for secrets

2. **Review generated code**
   - ViePilot generates code based on your specifications
   - Always review before deploying to production

3. **Keep dependencies updated**
   - Regularly update dependencies
   - Use security scanning tools

### For ViePilot Itself

1. **Verify installation source**
   - Only install from official repository
   - Verify checksums if available

2. **Review skill files**
   - Skills execute workflows on your system
   - Review any custom skills before using

3. **Protect state files**
   - `.viepilot/` may contain sensitive project info
   - Consider gitignoring sensitive sections

## Security Features / Tính năng bảo mật

ViePilot includes these security-related features:

| Feature | Description |
|---------|-------------|
| **SYSTEM-RULES.md** | Includes security rules and forbidden patterns |
| **Comment Standards** | Guidelines to avoid logging sensitive data |
| **Git Conventions** | No secrets in commit messages |
| **Quality Gates** | Security checks before deployment |

## Acknowledgments / Ghi nhận

We thank the following individuals for responsibly disclosing security issues:

- (No reports yet)

---

Thank you for helping keep ViePilot secure! / Cảm ơn bạn đã giúp ViePilot an toàn!
