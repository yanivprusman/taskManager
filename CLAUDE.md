# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev

```bash
d startApp --app taskManager    # Start via daemon (do NOT use npm run dev directly)
d restartApp --app taskManager  # Restart after config changes
d getPort --key taskManager-dev # Get assigned dev port
npm run build                   # Production build (sets NODE_ENV=production)
npm run lint                    # ESLint (no Prettier configured)
```

## Architecture

Next.js 16 App Router with React 19, TypeScript (strict), and Tailwind CSS 4. No database — all data is persisted through the automateLinux daemon's key-value store via Unix socket.

### Data Storage (daemon KV)

- **Boards index**: `taskManager:boards` — array of `{id, name, createdAt}`
- **Board data**: `taskManager:board:{boardId}` — contains columns and tasks
- **Legacy key**: `taskManager:data` — auto-migrated to new structure on first load

All reads/writes go through `lib/daemon-connection.ts` using commands: `upsertEntry`, `getEntry`, `deleteEntry`, `showEntriesByPrefix`, `deleteEntriesByPrefix`.

### Socket Communication

Two Unix sockets in `/run/automatelinux/`:
- `automatelinux-daemon.sock` — main daemon socket
- `automatelinux-api.sock` — API socket (optional, used as fallback)

Messages are newline-delimited JSON. The connection module handles reconnection and request/response correlation.

## Code Style

- Path alias: `@/*` maps to project root
- Tailwind CSS 4 (uses `@import "tailwindcss"` syntax, not v3 `@tailwind` directives)
- No test framework configured
- No Prettier — only ESLint with `next/core-web-vitals` and `next/typescript`

## External Dependencies

- `@claudecontrol/feedback-lib` — feedback/issue widget (bind-mounted from `/opt/dev/addnewfeature/lib/feedback-lib/`)
- `@addnewfeature/feedback-lib-launcher` — feedback launcher (workspace package)

These are local workspace packages, not npm registry packages. Do not `npm install` them.
