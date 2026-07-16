# Fuel Tracker

A personal nutrition app for a marathon runner: photograph a meal, get an
AI-estimated calorie/macro breakdown, edit it, and see it against daily
targets on a dashboard with a race countdown. Single user, no accounts, no
server — everything lives on your phone.

Full spec: this was built from the `FUELT1.MD` build brief (Part 1).

## Running it

This app was built and typechecked in a cloud sandbox, so it has **not been
opened in Expo Go yet** — that has to happen on your own machine, on the same
wifi network as your phone.

```
git clone https://github.com/khoschke/fuel-tracker
cd fuel-tracker
npm install
npx expo start
```

Scan the QR code with your iPhone's camera (or the Expo Go app on Android).
The app opens live; it refreshes automatically as the project changes.

## Setting up your Anthropic API key

The build brief suggested an environment variable, but Expo's current build
tooling actively blocks API-key-shaped values in the env vars React Native
bundles into the app (`EXPO_PUBLIC_*`), and any bundled env var is visible to
anyone who inspects the compiled app anyway. Instead:

1. Open the app, go to the **Settings** tab.
2. Paste your key from [console.anthropic.com](https://console.anthropic.com)
   into the **Anthropic API key** field and hit Save.
3. The key is stored using the device's secure storage (Keychain on iOS,
   encrypted storage on Android) — it never enters the JS bundle, never gets
   written to a file in this repo, and is never committed to git.

If you ever need to change it, just paste a new one in Settings and save.

## What's where

- `app/(tabs)/index.tsx` — Dashboard: race countdown, the four macro meters
  (carbs visually emphasised), the 7-day calorie chart, today's meals list,
  and the fuel reference card.
- `app/(tabs)/add-meal.tsx` — capture/pick a photo, choose meal type, add a
  note, get an editable AI estimate, confirm to save.
- `app/(tabs)/settings.tsx` — daily targets, race name/date, API key.
- `src/storage/` — the single storage layer (SQLite via `expo-sqlite`, plus
  the secure API-key store). Every screen goes through `src/storage/index.ts`
  — if this app ever grows a backend, this is the only layer that needs to
  change.
- `src/ai/` — `prompt.ts` (the exact estimation prompt), `config.ts` (the
  model name — swap it here), `estimateMeal.ts` (the API call + parsing).
- `src/components/` — `MacroMeter`, `WeeklyChart`, `RaceCountdown`,
  `FuelReferenceCard`, `MealListItem`.
- `src/theme/` — a light/dark colour palette, validated for colourblind-safe
  contrast.

## Data model

Matches Part 1 of the build brief: meals have date, meal type, description,
photo, calories/protein/carbs/fat, confidence, and a timestamp. Settings is a
single row: four targets plus race name/date. All numbers are rounded to
whole units everywhere they're displayed.

## Known v1 limitations (by design)

- No sodium estimation — it's a static reference card only (fluid, sodium,
  carbs per hour for long runs).
- No accounts, no cloud sync — this is the single-user personal build. See
  the original build brief for the client/coach roadmap.
- No automated test suite yet; verified via TypeScript (`npx tsc --noEmit`)
  and a full Metro/Hermes export (`npx expo export`), both clean. Feature
  behaviour (camera flow, AI estimate, dashboard math) should be checked by
  hand on a real device the first time you run it.
