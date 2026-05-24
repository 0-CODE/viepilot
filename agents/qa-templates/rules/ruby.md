# Ruby / Rails QA Reference

## Completeness patterns
- `raise NotImplementedError` in concrete service object (not abstract interface)
- Rails controller action with empty body or `render nothing: true`
- Missing implementation of `call` in service objects that define it in the interface
- Sidekiq worker `perform` method with `# TODO: implement`

## Security patterns
- `eval(user_input)` — arbitrary code execution
- `send(params[:method_name])` without strict allow-list check
- Strong parameters: `params.permit!` (permits everything — always specify fields)
- SQL injection: `User.where("name = '#{params[:name]}'")`
- Missing `before_action :authenticate_user!` (Devise) on controllers modifying data
- `Marshal.load(user_data)` — deserialization RCE
- `SECRET_KEY_BASE` hardcoded in `secrets.yml` or `credentials.yml.enc` committed without rotation

## Performance patterns
- N+1: `@posts.each { |p| p.author.name }` without `includes(:author)`
- Missing `.select(:id, :name)` on queries where only subset of columns needed
- `after_save` / `after_create` callback doing HTTP call or heavy computation synchronously
- `ActiveRecord::Base.connection.execute` in loop (N round trips)
- Missing `counter_cache: true` on frequently-counted associations

## Context patterns
- `puts` / `p` left in production code (use Rails logger: `Rails.logger.info`)
- `rescue Exception` — catches too broadly (use `StandardError`)
- `binding.pry` or `byebug` left in production code
- Non-idiomatic: `if x == nil` instead of `if x.nil?`
