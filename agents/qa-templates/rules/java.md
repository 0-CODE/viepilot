# Java / Spring Boot QA Reference

## Completeness patterns
- `@Override` method with empty body or only `super.method()` call
- Custom annotation `@NotImplemented` on service methods
- `// TODO: implement` inside `@Service` or `@Repository` method body
- Spring `@RestController` method returning `null` or `ResponseEntity.noContent()`
- `throw new UnsupportedOperationException("not yet implemented")` in production code

## Security patterns
- OGNL injection in Thymeleaf: `th:action="${userInput}"` (use `@{}`  syntax)
- XXE: `DocumentBuilderFactory.newInstance()` without `setFeature(DISALLOW_DOCTYPE, true)`
- SQL injection: `em.createNativeQuery("SELECT ... WHERE id = " + userId)`
- Insecure Java deserialization: `ObjectInputStream.readObject(untrustedStream)`
- Missing `@PreAuthorize` or `@Secured` on service/controller methods modifying data
- `BCryptPasswordEncoder(4)` — strength below 10 is too fast for production
- Credentials in `application.properties` not using `${ENV_VAR:default}` syntax

## Performance patterns
- Hibernate N+1: `@OneToMany` without `@EntityGraph` or `FetchType.LAZY` + join fetch
- `@Transactional` on read-only methods without `readOnly = true`
- Missing `@Async` on long-running service methods called synchronously from controller
- No `@Cacheable` on expensive pure-read service methods
- HikariCP not configured (`spring.datasource.hikari.maximum-pool-size` missing)
- `entityManager.flush()` inside loop (N DB round trips)

## Context patterns
- `System.out.println()` in production code (use SLF4J: `log.info(...)`)
- `catch (Exception e) {}` swallowing exceptions silently
- Missing `@Slf4j` or `private static final Logger log = ...` declaration
- `@Autowired` on fields (prefer constructor injection for testability)
