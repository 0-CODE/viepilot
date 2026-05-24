# Go QA Reference

## Completeness patterns
- Interface method implemented with `panic("not implemented")`
- HTTP handler writing nothing to `http.ResponseWriter` (no w.Write or w.Header)
- `// TODO:` comment inside handler or service function body
- Struct implementing interface but method body is empty `{}`

## Security patterns
- SQL injection: `fmt.Sprintf("SELECT ... WHERE id = %s", userID)` (use `?` placeholders)
- `html/template` bypassed with `template.HTML(userInput)` (unescaped HTML injection)
- `exec.Command(userCmd, userArgs...)` without validation (OS command injection)
- Goroutine started without context → no cancellation if parent request completes
- JWT: `jwt.ParseWithClaims` without checking `alg` header against allowed list
- Sensitive data logged via `log.Printf("%+v", structWithSecrets)`

## Performance patterns
- Goroutine leak: goroutine started in request handler without `ctx.Done()` select
- Unbuffered channel used for high-frequency event passing (back-pressure, deadlock risk)
- `sync.Mutex` on hot read path — use `sync.RWMutex` if reads dominate
- `http.Client` created per request instead of package-level reusable variable
- `database/sql` Rows not deferred-closed (connection leak)
- Missing `GOMAXPROCS` set for CPU-bound workloads on multi-core machines

## Context patterns
- `_ = err` discarding errors from important operations
- Missing `defer cancel()` after `context.WithTimeout` or `context.WithDeadline`
- `log.Fatal` called outside `main()` (bypasses `defer` cleanup)
- Exported function with unexported return type (breaks godoc)
