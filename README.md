# 🧶 Yarnie

A cozy companion app for knitters and crocheters, built with React Native + Expo (TypeScript).

## Features (v0.1)

| Tab | What it does |
| --- | --- |
| 🔢 **Counter** | Big tap-friendly row counter plus a stitch counter. Pick a project to save the count with it, or use a quick count. |
| 🧶 **Projects** | Track makes as planned / in progress / finished, link a pattern and yarn, keep notes. |
| 📖 **Patterns** | Save patterns with craft, difficulty, link and notes. Searchable. |
| 🧺 **Stash** | Inventory your yarn by brand, colorway, weight and fiber, with quick +/− skein counts. |

All data is stored on the device with AsyncStorage. No account or server is needed.

## Getting started

You need [Node.js](https://nodejs.org) 20+ and the **Expo Go** app on your phone.

```bash
cd yarnie
npm install
npx expo install --fix   # align package versions with your installed Expo SDK
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS) to run Yarnie on your phone.

## Project structure

```
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
