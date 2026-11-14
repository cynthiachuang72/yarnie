# Yarnie — notes for Claude

Yarnie is a cozy React Native + Expo (TypeScript) app for knitters and crocheters.
The owner works on it entirely from her phone, so:

- Explain changes in plain language and keep replies short.
- Commit and push finished changes to the repo so they show up on GitHub.
- She tests in Expo Go. Pushing to `main` publishes an Expo update via `.github/workflows/publish-update.yml`; PRs get a preview link comment. Only use packages that work in Expo Go (no custom native code).
- Expo SDK 58. After a push, the workflow may commit a lockfile update (`[skip ci]`), so pull before the next change.

## Structure
- `App.tsx` — bottom tabs (Counter, Projects, Patterns, Stash) and providers
- `src/store.tsx` — app state (context + reducer), persisted with AsyncStorage
- `src/types.ts` — Project, Pattern, Yarn models
- `src/theme.ts` — colors (berry pink, sage, peach), spacing, radius
- `src/components/` — shared UI (`ui.tsx`) and the reusable add/edit sheet (`FormModal.tsx`)
- `src/screens/` — one file per tab

## Conventions
- Keep everything on-device (no backend) unless asked.
- Use theme values instead of hard-coded colors.
- The app supports both knitting and crochet — never assume one craft.
- Run `npm run typecheck` before committing when dependencies are installed.
