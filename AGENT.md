# AGENTS.md — Frontend (Next.js + React)

> Cross-tool agent rules. Read by Antigravity, Cursor, Claude Code, and Codex.
> This file governs the **frontend repo only**. The backend (Django + DRF) lives in a separate repo with its own AGENTS.md and owns the API contract.

---

## Tech Stack
- Framework: Next.js (App Router) + React 18+
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS (adjust if project uses CSS Modules / styled-components)
- Data fetching: fetch / TanStack Query (adjust to project)
- API types: generated from the backend's OpenAPI schema (see API Integration)
- Tooling: ESLint, Prettier, TypeScript compiler
- Testing: Vitest/Jest + React Testing Library; Playwright for E2E (if used)

## Commands
- Install deps: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`
- Lint + format: `npm run lint -- --fix && npx prettier --write .`
- Type check: `npx tsc --noEmit`
- Run tests: `npm test`
- Regenerate API types from backend schema: `npm run gen:api` (see API Integration)

---

## Code Quality
- TypeScript `strict: true`. **No `any`** — use `unknown` + narrowing, or proper types.
- Format with Prettier; lint with ESLint. Do not hand-format or disable rules without a comment justifying it.
- Function components + hooks only. No class components.
- One component per file; co-locate component-specific styles/tests. Split files over ~250 lines.
- Props must have an explicit TypeScript interface/type. No untyped props.
- Keep components presentational where possible; push data fetching/logic into hooks (`use*`) or server components.
- Use the App Router correctly: mark client components with `"use client"` only when needed (state, effects, browser APIs). Default to server components.
- No dead code, no `console.log` left in committed code (use a logger or remove).
- DRY: extract shared UI into reusable components; extract shared logic into hooks/utils.

## Security
- **Never put secrets in client code.** Only `NEXT_PUBLIC_*` vars reach the browser — never prefix a secret with `NEXT_PUBLIC_`.
- Server-only secrets stay in server components / route handlers / server actions, never imported into client bundles.
- **Never read or print `.env` contents.**
- Prevent XSS: never use `dangerouslySetInnerHTML` with unsanitized input; sanitize any HTML you must render.
- Validate and type all API responses before use — don't assume the shape; handle malformed data.
- Don't store sensitive tokens in `localStorage` if avoidable; prefer httpOnly cookies set by the backend.
- Keep dependencies updated; avoid unmaintained packages. Treat `npm audit` criticals seriously.
- Escape/encode user-generated content shown in the UI.

## API Integration (stay in sync with the backend)
- The backend repo owns the API contract and publishes an OpenAPI schema (`schema.yml`).
- **Generate types from that schema** rather than hand-writing them (e.g. `openapi-typescript` → `src/types/api.ts`). Re-run `npm run gen:api` whenever the backend contract changes.
- All API calls go through a single typed API client/layer (e.g. `src/lib/api/`). No scattered raw `fetch` calls in components.
- Every request and response is typed against the generated API types — no `any` responses.
- Handle all states explicitly in the UI: loading, success, empty, and error (map backend error codes 400/401/403/404/422/500 to user-friendly messages).
- Read the API base URL from env (`NEXT_PUBLIC_API_URL`); never hardcode hosts.
- When the backend reports a contract change, update the affected types, API client function, and UI in the same change.

## Code Documentation
- TSDoc/JSDoc on exported components, hooks, and utility functions (purpose, params, return).
- Document non-obvious props with comments in the interface.
- Comment *why*, not *what*.
- Keep `README.md` current: setup, env vars (names only), run/build/test commands.
- Maintain `.env.example` listing every required env var by name with placeholder values.

## Accessibility & UX (since design is largely done)
- Use semantic HTML and proper ARIA where needed; all interactive elements keyboard-accessible.
- Images need `alt`; form inputs need associated labels.
- Don't regress the existing design — match established components, tokens, and spacing.

## Testing
- Test components for rendering + key interactions (React Testing Library).
- Test custom hooks and the API client layer (mock network).
- Cover loading/error/empty states, not just the happy path.
- Tests must pass, `tsc --noEmit` must be clean, and lint must pass before a task is done.

## Git Conventions
- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `style:`.
- Never commit directly to `main`. Branch pattern: `type/short-description`.
- One logical change per commit. Never commit `.env*` (except `.env.example`) or build artifacts.

## Agent Behavior & Guardrails
- Before starting, list every file you intend to create or modify.
- If a change touches more than ~5 files, pause and confirm the plan first.
- Ask for approval before destructive shell commands (rm, force push).
- **When the backend API contract changes**, update the generated types, the API client, and the consuming components together — never leave the frontend calling a stale shape.
- After a multi-step task, summarize changes in 3–5 bullets and flag anything that depends on a backend change still being deployed.