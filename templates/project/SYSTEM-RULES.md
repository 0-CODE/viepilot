# {{PROJECT_NAME}} - System Rules

## Table of Contents
1. [Architecture Rules](#architecture_rules)
2. [Coding Rules](#coding_rules)
3. [Comment Standards](#comment_standards)
4. [Versioning](#versioning)
5. [Git Conventions](#git_conventions)
6. [Changelog Standards](#changelog_standards)
7. [Contributor Standards](#contributor_standards)
8. [Quality Gates](#quality_gates)
9. [Forbidden Patterns](#do_not)

---

<architecture_rules>
## Architecture Rules

### Layer Structure
```
src/main/java/{{PACKAGE_PATH}}/
├── controller/    # REST/GraphQL endpoints
├── service/       # Business logic
├── mapper/        # Data access (MyBatis/JPA)
├── model/         # Entities, DTOs
├── config/        # Spring configs
└── util/          # Helpers
```

### Dependency Rules
- Controller → Service (never reverse)
- Service → Mapper/Repository (never reverse)
- No circular dependencies between modules

### Service Boundaries
{{SERVICE_BOUNDARIES}}
</architecture_rules>

<coding_rules>
## Coding Rules

### General
- Follow project naming conventions
- Use meaningful variable/method names
- Keep methods small (< 30 lines preferred)
- Single responsibility principle

### Language Specific
{{LANGUAGE_SPECIFIC_RULES}}

### Testing
- Unit tests for all service methods
- Integration tests for API endpoints
- Test naming: `should_expectedBehavior_when_condition()`
- Minimum coverage: {{COVERAGE_THRESHOLD}}%
</coding_rules>

<comment_standards>
## Comment Standards

### Philosophy
> "Code tells you HOW, comments tell you WHY"

### Good Comments ✅

#### 1. Explain WHY (Intent/Rationale)
```java
// ✅ GOOD: Explains why this specific value
// Use 5-second timeout because external API may have latency spikes.
// Tested with production data showing 3-4s avg response.
private static final int API_TIMEOUT_MS = 5000;
```

#### 2. Explain Business Rules
```java
// ✅ GOOD: Documents business rule
// Orders over $1000 require manager approval per company policy.
// See POLICY-2024-03 for details.
if (order.getTotal() > 1000) {
    requireManagerApproval(order);
}
```

#### 3. Warn About Non-Obvious Behavior
```java
// ✅ GOOD: Warning about side effect
// WARNING: This method also updates the cache.
// Do not call in read-only contexts.
public Data fetchData(String id) {
    updateCache(id); // Side effect
    return repository.findById(id);
}
```

#### 4. Document Workarounds/Hacks
```java
// ✅ GOOD: Explains temporary workaround
// HACK: Library X has bug with null values.
// Using empty string as workaround until v2.0 release.
// Tracking issue: https://github.com/lib/x/issues/123
// TODO: Remove after upgrading to v2.0
private String sanitize(String input) {
    return input == null ? "" : input;
}
```

#### 5. Explain Complex Algorithms
```java
// ✅ GOOD: Explains the algorithm
/**
 * Calculates discount using tiered pricing:
 * - 0-100 units: no discount
 * - 101-500 units: 10% discount
 * - 500+ units: 20% discount
 * 
 * @see PricingPolicy for tier definitions
 */
public BigDecimal calculateDiscount(int quantity) {
    // Implementation
}
```

### Bad Comments ❌

#### 1. Stating the Obvious
```java
// ❌ BAD: Obvious from code
// Increment counter
counter++;

// Get the user
User user = userRepository.findById(id);
```

#### 2. Commented-Out Code
```java
// ❌ BAD: Delete dead code, use git history
public void process() {
    // oldMethod();
    // if (flag) { doSomething(); }
    newMethod();
}
```

#### 3. Journal/Changelog Comments
```java
// ❌ BAD: Use git history
/**
 * Change history:
 * 2024-01-01: Created by John
 * 2024-01-15: Fixed bug - Jane
 */
```

#### 4. Noise Comments
```java
// ❌ BAD: Adds no value
/**
 * Default constructor.
 */
public MyClass() {}

/**
 * Gets the id.
 * @return the id
 */
public Long getId() { return id; }
```

#### 5. Misleading Comments
```java
// ❌ BAD: Comment lies about what method does
// Returns the user (but actually modifies database!)
public User getUser(Long id) {
    User user = repository.find(id);
    user.setLastAccess(now()); // Not mentioned in comment!
    repository.save(user);
    return user;
}
```

### TODO/FIXME Format
```java
// TODO(username): Brief description - TICKET-123
// FIXME: Description of bug - TICKET-456
// HACK: Temporary workaround - remove after TICKET-789
// WARNING: Important caution
// NOTE: Important context
```

### Comment Language
- Code comments: English
- Commit messages: English
</comment_standards>

<versioning>
## Semantic Versioning

Format: `MAJOR.MINOR.PATCH[-PRERELEASE]`

| Bump | When | Example |
|------|------|---------|
| MAJOR | Breaking changes | 1.x.x → 2.0.0 |
| MINOR | New features (backward compatible) | 1.1.x → 1.2.0 |
| PATCH | Bug fixes (backward compatible) | 1.1.1 → 1.1.2 |

### Pre-release Labels
- `alpha` : Feature incomplete
- `beta` : Feature complete, may have bugs
- `rc` : Release candidate

### Version Bump Triggers
```yaml
patch:
  - Bug fix
  - Documentation update
  - Dependency patch

minor:
  - New feature
  - New API endpoint
  - Deprecation (not removal)

major:
  - Breaking API change
  - Removed feature
  - Breaking schema change
```

Reference: https://semver.org/
</versioning>

<git_conventions>
## Git Conventions

### Commit Message Format
```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types
| Type | Description | Version |
|------|-------------|---------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation | - |
| `style` | Formatting | - |
| `refactor` | Code change, no feature/fix | - |
| `perf` | Performance | PATCH |
| `test` | Tests | - |
| `build` | Build system | - |
| `ci` | CI config | - |
| `chore` | Maintenance | - |

### Scopes
{{GIT_SCOPES}}

### Breaking Changes
```
feat(api)!: change endpoint response format

BREAKING CHANGE: Response now includes nested object
```

### Examples
```bash
feat(user): add email verification
fix(auth): resolve token expiration issue
docs(readme): update installation steps
refactor(service): extract validation logic
```

Reference: https://www.conventionalcommits.org/
</git_conventions>

<changelog_standards>
## Changelog Standards

Format: [Keep a Changelog](https://keepachangelog.com/)

### Categories (in order)
1. **Added** - New features
2. **Changed** - Changes in existing functionality
3. **Deprecated** - Soon-to-be removed features
4. **Removed** - Removed features
5. **Fixed** - Bug fixes
6. **Security** - Vulnerability fixes

### Entry Format
```markdown
- Brief description ([#123](link))
```

### Auto-update Mapping
```yaml
feat → Added
fix → Fixed
BREAKING CHANGE → Changed
deprecate → Deprecated
remove → Removed
security → Security
```
</changelog_standards>

<contributor_standards>
## Contributor Standards

### Attribution
- All contributors in CONTRIBUTORS.md
- Commit co-authors for pair programming
- Release notes credit

### Contribution Types
| Emoji | Type |
|-------|------|
| 💻 | Code |
| 📖 | Documentation |
| 🐛 | Bug Reports |
| 💡 | Ideas |
| 🔍 | Review |
| 🧪 | Testing |
</contributor_standards>

<quality_gates>
## Quality Gates

### Task Completion
- [ ] All acceptance criteria met
- [ ] Automated tests pass
- [ ] No lint errors
- [ ] Code review (for L/XL tasks)

### Phase Completion
- [ ] All tasks done or skipped (with reason)
- [ ] Phase verification pass
- [ ] No active blockers
- [ ] Documentation updated

### Milestone Completion
- [ ] All phases complete
- [ ] E2E tests pass
- [ ] Security scan clean
- [ ] Documentation complete
</quality_gates>

<do_not>
## Forbidden Patterns

### Code
- ❌ Do NOT hardcode credentials
- ❌ Do NOT catch generic Exception
- ❌ Do NOT use Thread.sleep() in production
- ❌ Do NOT ignore compiler warnings
- ❌ Do NOT commit commented-out code

### Architecture
{{FORBIDDEN_ARCHITECTURE_PATTERNS}}

### Security
- ❌ Do NOT log sensitive data
- ❌ Do NOT store plain-text passwords
- ❌ Do NOT expose internal IDs in APIs
- ❌ Do NOT trust user input without validation
</do_not>
