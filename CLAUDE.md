# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

Use comments sparingly. Only comment complex code.

## Commands

```bash
npm run dev          # Start dev server with Turbopack on :3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run all Vitest tests
npm run setup        # Install deps, generate Prisma client, run migrations
npm run db:reset     # Force reset database
```

To run a single test file:
```bash
npx vitest run src/lib/__tests__/file-system.test.ts
```

## Environment

Copy `.env.example` to `.env`. `ANTHROPIC_API_KEY` is optional — if absent, the app uses a MockLanguageModel that generates demo components without API calls.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in natural language; Claude generates them via tool calls that manipulate an in-memory virtual file system. The preview renders via a sandboxed iframe with client-side Babel.

### Data Flow

```
User chat input
  → ChatProvider (Vercel AI SDK useChat)
  → POST /api/chat
  → Claude (claude-haiku-4-5) with str_replace_editor + file_manager tools
  → FileSystemContext processes tool call results
  → VirtualFileSystem (in-memory, no disk I/O)
  → CodeEditor (Monaco) + PreviewFrame (iframe)
  → onFinish: serialize chat + VFS to Prisma (SQLite)
```

### Key Modules

- **`src/lib/file-system.ts`** — `VirtualFileSystem` class: tree structure with Map-based indexing, text editor commands (`view`, `str_replace`, `insert`), serialization to/from Prisma JSON.
- **`src/lib/contexts/`** — Two React contexts: `ChatContext` (AI integration, message state) and `FileSystemContext` (VFS state, tool call processing).
- **`src/lib/tools/`** — AI tool definitions passed to Claude: `str_replace_editor` (view/create/edit files) and `file_manager` (rename/delete).
- **`src/lib/transform/jsx-transformer.ts`** — `createPreviewHTML()` generates a full HTML document with embedded React, Babel standalone, and an import map so the preview iframe can run JSX with `@/` path aliases.
- **`src/lib/provider.ts`** — `getLanguageModel()` returns the real Anthropic model if `ANTHROPIC_API_KEY` is set, otherwise returns a `MockLanguageModel` that simulates agentic tool-call workflows.
- **`src/lib/prompts/generation.tsx`** — System prompt that instructs Claude to use Tailwind CSS, create `App.jsx` as the entry point, and import with `@/` aliases.
- **`src/actions/`** — Next.js Server Actions for project CRUD and auth (sign up, sign in, sign out, get user).

### Preview System

The preview renders in a sandboxed iframe. `createPreviewHTML()` injects an import map that maps `@/` aliases to blob URLs of the virtual files, and uses `@babel/standalone` to compile JSX at runtime. The iframe reloads whenever the file system changes.

### Auth

JWT sessions in httpOnly cookies (7-day expiry). Bcrypt for passwords. Anonymous users (no auth required) have projects stored without a `userId`; they can be revisited via URL.

### Project Persistence

On `onFinish` (after each AI response), the full chat message array and serialized VFS are written to the `Project` table via Prisma. Projects load this state when navigating to `/:projectId`.

### Path Aliases

`@/*` maps to `src/*` (configured in `tsconfig.json` and Next.js).

### Database Schema

The database schema is defined in `prisma/schema.prisma`. Reference it whenever you need to understand the structure of the data stored in the database.
