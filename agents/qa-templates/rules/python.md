# Python QA Reference

## Completeness patterns
- `pass` as the only statement in a view/handler/service function
- `raise NotImplementedError` in concrete class (not abstract base)
- Django view returning `HttpResponse('')` or `JsonResponse({})`
- FastAPI endpoint function body is `...` (Ellipsis) or `return {}`
- Celery task with empty body

## Security patterns
- Server-side template injection: `render_template_string(f"Hello {user.name}")`
- `pickle.loads(user_data)` — arbitrary code execution
- `subprocess.call(f"cmd {user_input}", shell=True)` — shell injection
- Django: `MyModel.objects.raw(f"SELECT ... {user_val}")` — SQL injection
- SQLAlchemy: `db.execute(text(f"... {user_val}"))` — SQL injection
- `DEBUG = True` not guarded by environment variable
- `SECRET_KEY` hardcoded in settings.py instead of `os.environ['SECRET_KEY']`
- `@login_required` missing on views that modify data
- CORS: `CORS_ALLOWED_ORIGINS = ['*']` on mutation endpoints

## Performance patterns
- Django ORM: `for obj in queryset: obj.related_field.name` (N+1, missing select_related)
- `.count()` then separate iteration (two DB round trips, use `len()` or annotate)
- Missing `.only()` or `.defer()` for large model queries selecting unused fields
- Synchronous `requests.get()` in Django async view (use httpx with await)
- Missing `@cache_page` or `django_cache` on expensive idempotent views
- Loading entire queryset into memory: `list(Model.objects.all())`

## Context patterns
- `import *` from non-dunder modules
- `print()` in production code (use logging module)
- Bare `except:` catching BaseException (too broad)
- Missing `__all__` in public API modules
- Hardcoded file paths (`/tmp/myapp/...` instead of `tempfile` or env config)
