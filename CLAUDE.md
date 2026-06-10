@AGENTS.md

## Commands

- `npm start` — Expo dev server (Expo Go / simulator)
- `npm run web` — web dev server; fastest visual iteration loop
- `npx tsx scripts/verify.ts` — validate data counts and Hebrew date logic; run after editing any file in `src/data/`
- No separate `tsc` step — TypeScript errors surface through the Expo/Metro dev server

## Architecture

**Spaced-review schedule**: each unit is reviewed in 4 sessions at offsets `{1:0, 2:1, 3:8, 4:38}` days from first study. All scheduling logic in `src/utils/schedule.ts` depends on this; don't change it.

**AsyncStorage schema**: two keys — `@settings` (array of `TrackConfig`) and `@progress` (`{trackId → {unitIndex → {session → true}}}`). A v1→v2 migration in `src/store/storage.ts` must remain intact.

**Hebrew calendar**: pure-JS Reingold-Dershowitz implementation in `src/utils/hebrewDate.ts`. No external calendar library.

## Code style

- All UI labels must be in Hebrew.
- RTL-first layout: `I18nManager.forceRTL(true)` runs at startup. Test any new layout in RTL — flex directions are reversed.

## Gotchas

- Web uses `localStorage`; native uses AsyncStorage. Always go through `src/store/storage.ts`, never access storage directly.
