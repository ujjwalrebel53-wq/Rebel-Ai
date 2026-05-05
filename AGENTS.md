# Rebel AI — Agent Instructions

## Cursor Cloud specific instructions

### Overview

Rebel AI is a PHP backend + vanilla HTML/JS/CSS frontend AI chatbot assistant platform. There is no build step, no package manager, and no external dependencies to install. The PHP backend uses flat JSON files for storage (in a `data/` directory).

### Directory Structure for Dev Server

The PHP source files (`index.php`, `config.php`) at the repo root use `__DIR__`-relative paths that assume the directory layout documented in `README.md`:

- `api/index.php` — references `__DIR__ . '/../includes/config.php'`
- `includes/config.php` — references `__DIR__ . '/../data'`

To run the dev server, you must first create the proper directory structure:

```bash
mkdir -p api includes data
cp index.php api/index.php
cp config.php includes/config.php
# Pre-create empty JSON files so PHP's realpath() works on first run
for f in users.json sessions.json messages.json api_calls.json system_logs.json api_keys.json settings.json rate_limit.json admin_token.json; do
  [ -f "data/$f" ] || echo '[]' > "data/$f"
done
```

### Running the Dev Server

```bash
php -S 0.0.0.0:8000 router.php
```

The `router.php` file routes `/api/*` requests to `api/index.php` and serves static files (HTML, JS, CSS) from the document root. The frontend is then accessible at `http://localhost:8000`.

### Key Gotchas

- **Path traversal guard**: The `safeFilePath()` function in `config.php` uses `realpath()`, which returns `false` for non-existent files. The JSON data files must be pre-created (even as `[]`) before the first API call, otherwise all data operations silently fail.
- **No lint/test tooling**: This project has no automated tests, linter configuration, or build system. Validation is done manually via the browser and curl.
- **Default admin password**: `rebel@admin123` (see README.md).
- **Groq API key**: The AI chat feature requires a Groq API key hardcoded in `main.js`. Without it, chat responses will fail, but the rest of the app works.
- **Static files**: All frontend dependencies are loaded via CDN (Font Awesome, Google Fonts, EmailJS).
