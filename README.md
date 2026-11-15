# 🧶 Yarnie

A cozy companion app for knitters and crocheters, built with React Native + Expo (TypeScript).

## Features (v0.1)

| Tab | What it does |
| --- | --- |
| 🔢 **Counter** | Pattern tracker: follows which step you're on and which repeat (e.g. step 5 of 8, repeat 3 of 28), with undo, jump-to-step and your choice of counting style. Plus a stitch counter and a quick row count. |
| 🧶 **Projects** | Track makes as planned / in progress / finished, link a pattern and yarn, keep notes. |
| 📖 **Patterns** | Save patterns with their repeating steps, number of repeats, craft, difficulty, link and notes. Searchable. |
| 🧺 **Stash** | Inventory your yarn by brand, colorway, weight and fiber, with quick +/− skein counts. |

All data is stored on the device with AsyncStorage. No account or server is needed.

## Running it (no laptop needed)

Every push to `main` publishes the app to Expo through GitHub Actions.

1. Open the latest run in the repo's **Actions** tab and copy the `exp://` link from its summary, or
2. on **expo.dev** open **yarnie** → **Updates** → tap the newest one → **Open in Expo Go**.

Pull requests get their own preview link in a PR comment, so you can test changes before merging.

One-time setup: the repo needs an `EXPO_TOKEN` secret (Settings → Secrets and variables → Actions), and
`app.json` needs the expo.dev project ID in `updates.url` and `extra.eas.projectId`.

## Project structure

```
index.ts                   # Entry point
App.tsx                    # Tab navigation + providers
src/
  theme.ts                 # Colors, spacing, radius
  types.ts                 # Project, Pattern, Yarn models
  store.tsx                # App state (context + reducer), saved to AsyncStorage
  components/
    ui.tsx                 # Card, Button, Tag, Fab, EmptyState
    FormModal.tsx          # Reusable add/edit bottom sheet
  screens/
    CounterScreen.tsx
    ProjectsScreen.tsx
    PatternsScreen.tsx
    StashScreen.tsx
```

## Ideas for next steps

- Project photos (`expo-image-picker`)
- Haptic feedback on counter taps (`expo-haptics`) and keep-screen-awake while counting
- Multiple named counters per project (e.g. repeats, decreases)
- PDF pattern viewer with row highlighting
- App icon + splash screen featuring a Yarnie mascot
- Cloud sync / accounts
