# AGENTS.md

## Build/Test Commands
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript
- `npm test` - Run all tests with Vitest
- `npm test -- src/test/api.test.ts` - Run a single test file
- `npm test -- -t "test name"` - Run tests matching a pattern

## Code Style
- **Imports**: Use relative imports with `.js` extensions (ESM requirement). Named exports preferred.
- **Types**: Interfaces use PascalCase (e.g., `Page`, `ValidationError`). Enable strict mode.
- **Naming**: camelCase for variables, functions, files. PascalCase for interfaces/types.
- **Error handling**: Return `{ error: string }` JSON with appropriate HTTP status codes. Validation functions return `ValidationError | null`.

## Project Structure
- `src/routes/` - Hono route handlers
- `src/middleware/` - Request middleware (rate limiting)
- `src/storage/` - LMDB database layer
- `src/utils/` - Validation, etag utilities
- `src/test/` - Vitest test files (excluded from build)

## Key Patterns
- Framework: Hono (lightweight web framework)
- Database: LMDB key-value store
- Config: Centralized in `config.ts` with env var fallbacks
- Global error handler logs and returns 500 for unhandled errors
