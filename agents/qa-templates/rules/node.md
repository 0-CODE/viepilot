# Node.js / JavaScript QA Reference

## Completeness patterns
- Express/Fastify route handler missing `res.send()` or `res.json()` (no response sent)
- `async` function body has no `await` (async keyword forgotten or unnecessary)
- `next()` called in middleware without handling the error case
- `module.exports` missing from file that should export
- Callback-style functions never calling `cb(null, result)` or `cb(err)`

## Security patterns
- `eval()` / `new Function(str)` with any variable string input
- Prototype pollution: `obj[req.body.key] = req.body.value` without key sanitization
- `child_process.exec(userInput)` without sanitization (shell injection)
- JWT verified with `algorithms: ['none']` or missing algorithm check
- `Access-Control-Allow-Origin: *` on mutation endpoints (POST/PUT/DELETE)
- Missing `helmet()` middleware in Express app setup
- `serialize-javascript` or `JSON.stringify(userObj)` injected directly into HTML
- Password stored with MD5/SHA1 instead of bcrypt/argon2

## Performance patterns
- `fs.readFileSync` / `fs.writeFileSync` inside route handler (blocks event loop)
- `require()` inside a function body (synchronous, slow on first call)
- `Promise.all` not used when multiple independent async calls in same handler
- Missing `compression()` middleware for large JSON/HTML responses
- `setInterval` created per request (no cleanup → memory leak)
- `.filter().map().reduce()` chain on large array on every request (no memoization/caching)
- Missing connection pool limit for DB (default = unlimited → connection exhaustion under load)

## Context patterns
- `console.log()` in production code (use structured logger like pino/winston)
- `process.env.X` used without validation or .env.example entry
- `__dirname + '/path'` instead of `path.join(__dirname, 'path')`
- Circular require: A → B → A (silent in Node.js, causes initialization bugs)
- `catch (err) {}` with empty body (swallowed errors)
