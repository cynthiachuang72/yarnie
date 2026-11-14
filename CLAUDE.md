# Yarnie — notes for Claude

Yarnie is a cozy React Native + Expo (TypeScript) app for knitters and crocheters.
The owner works on it entirely from her phone, so:

- Explain changes in plain language and keep replies short.
- Commit and push finished changes to the repo so they show up on GitHub.
- She tests with the Expo Go app; mention when a change needs a new package (`npx expo install <pkg>`).

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
