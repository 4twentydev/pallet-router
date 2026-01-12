# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router surface (routes, `layout.tsx`, `page.tsx`, `globals.css`) plus feature components in `app/components/` and server actions in `app/actions/`.
- `lib/` holds shared utilities (for example `lib/utils.ts`).
- `types/` defines shared TypeScript types for the domain (see `types/pallet.ts`).
- `data/` stores local data assets (current XLSX source files).
- `public/` contains static assets served at the root path.

## Build, Test, and Development Commands
- `pnpm install` installs dependencies (pnpm is the expected package manager).
- `pnpm dev` runs the local development server at `http://localhost:3000`.
- `pnpm build` creates the production build.
- `pnpm start` serves the production build locally.
- `pnpm lint` runs ESLint.

## Coding Style & Naming Conventions
- Use TypeScript (`.ts`/`.tsx`) with strict typing; prefer explicit types for shared data structures.
- Tailwind CSS 4 is the primary styling system. Follow the patterns in `STYLE_GUIDE.md` for spacing, typography, and component styling.
- Keep component file names kebab-case (for example `pallet-tracker.tsx`) and export PascalCase components.
- Use path aliases (`@/…`) instead of deep relative imports.

## Testing Guidelines
- No automated test framework is configured yet; rely on `pnpm lint` and manual checks in `pnpm dev`.
- If you add tests, follow the tooling you introduce and document new commands here.

## Commit & Pull Request Guidelines
- Git history currently only includes an initial commit, so no established convention exists. Use short, imperative messages (for example `Add pallet filters`).
- PRs should include a concise summary, steps to verify, and screenshots for UI changes. Link related issues when applicable.

## UI & Design System Notes
- The design system is documented in `STYLE_GUIDE.md`; align new UI with its tokens, spacing, and component patterns.
