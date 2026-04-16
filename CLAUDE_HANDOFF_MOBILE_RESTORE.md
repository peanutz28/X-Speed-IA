# Claude Handoff: Mobile App Restore

## Repository State
- Restored commit: `581e3d9`
- Commit title: `Add mobile app screens, Expedia theming, review swipe flow, and AI mic button`
- Current branch: `main`
- Note: There is an untracked `vercel.json` in working tree.

## What was restored
This restore brings back the full Expo mobile app implementation (tabs, trip/stay flows, review swipe flow, animated AI mic component, mock data, theme, monorepo config, and router/metro fixes).

## Exact files in restored commit
1. `apps/mobile/app.json`
2. `apps/mobile/app/(tabs)/_layout.tsx`
3. `apps/mobile/app/(tabs)/index.tsx`
4. `apps/mobile/app/(tabs)/profile.tsx`
5. `apps/mobile/app/(tabs)/trips.tsx`
6. `apps/mobile/app/_layout.tsx`
7. `apps/mobile/app/review/[stayId]/followup.tsx`
8. `apps/mobile/app/review/[stayId]/index.tsx`
9. `apps/mobile/app/stay/[stayId].tsx`
10. `apps/mobile/app/trip/[tripId].tsx`
11. `apps/mobile/babel.config.js`
12. `apps/mobile/components/ai-mic-button.tsx`
13. `apps/mobile/components/luxury-header.tsx`
14. `apps/mobile/constants/theme.ts`
15. `apps/mobile/data/travel.ts`
16. `apps/mobile/metro.config.js`
17. `apps/mobile/package.json`
18. `apps/mobile/scripts/fix-expo-router-ctx.js`
19. `apps/web/package.json`
20. `b_EQCkjCDtIBo/.next/trace`
21. `package-lock.json`
22. `package.json`

## Monorepo / run commands
- Root workspace scripts (`package.json`):
  - `npm run web`
  - `npm run web:build`
  - `npm run mobile`
  - `npm run mobile:ios`
  - `npm run mobile:android`
  - `npm run mobile:web`
  - `npm run mobile:tunnel`

- Mobile scripts (`apps/mobile/package.json`):
  - `start`: `EXPO_ROUTER_APP_ROOT=./app expo start`
  - `start:tunnel`: `EXPO_ROUTER_APP_ROOT=./app expo start --tunnel`
  - `start:lan`: `EXPO_ROUTER_APP_ROOT=./app expo start --lan`
  - `ios` / `android` / `web` similarly pin `EXPO_ROUTER_APP_ROOT=./app`

## Mobile feature map
- `apps/mobile/app/(tabs)/index.tsx`
  - Home screen (greeting, categories, recent searches, recently viewed properties, recent stays).
- `apps/mobile/app/(tabs)/trips.tsx`
  - Trip list with hero cards and stats.
- `apps/mobile/app/trip/[tripId].tsx`
  - Trip detail with segmented tabs (Itinerary/Bookings/Saves), bookings carousel, stays/activities/cars.
- `apps/mobile/app/stay/[stayId].tsx`
  - Stay detail with reservation details, special instructions, pricing accordion, CTA into review flow.
- `apps/mobile/app/review/[stayId]/index.tsx`
  - Swipe cards (`like`/`dislike`/`na`) with animated gesture handling and bottom actions.
- `apps/mobile/app/review/[stayId]/followup.tsx`
  - Follow-up question flow for disliked categories.

## Shared UI components
- `apps/mobile/components/luxury-header.tsx`
  - Header with branding/avatar/back support.
- `apps/mobile/components/ai-mic-button.tsx`
  - Animated "AI orb" mic button + Expo AV recording handling.

## Theme + typography
- `apps/mobile/constants/theme.ts`
  - Central palette object (`Luxury`), compatibility palette, `Fonts` map (Poppins), nav/tab colors.

## Mock data + media
- `apps/mobile/data/travel.ts`
  - Unsplash URL map (`IMG`)
  - Domain data:
    - `TRIPS`
    - `STAYS`
    - `RECENT_SEARCHES`
    - `VIEWED_PROPERTIES`
    - `RECENT_STAYS_HOME`
    - `REVIEW_CATEGORIES`
    - `FOLLOWUP_OPTIONS`
  - helper lookups:
    - `getTrip(id)`
    - `getStay(id)`
    - `getStayForReview(stayId)`

## Infra / bundler fixes included
- `apps/mobile/metro.config.js`
  - monorepo `watchFolders` + `nodeModulesPaths`.
- `apps/mobile/babel.config.js`
  - `babel-preset-expo` + `react-native-reanimated/plugin`.
- `apps/mobile/scripts/fix-expo-router-ctx.js`
  - postinstall patch fallback for Expo Router `_ctx` env inlining issues.

## Why this commit exists
- Recovered from:
  - React version mismatch issues in monorepo
  - Expo Router `_ctx` env var bundling issues
  - mobile UI implementation across all requested screens
  - swipe review interaction and voice-note UI scaffolding

## If Claude needs full source quickly
- Use this commit hash as source of truth: `581e3d9`
- One-liner to inspect all restored changes:
  - `git show --name-status 581e3d9`
- Full patch export (for copy/paste transfer):
  - `git format-patch -1 581e3d9 --stdout > mobile-restore.patch`

## Suggested prompt to give Claude
Use this prompt verbatim:

> You are taking over a React Native Expo monorepo at commit `581e3d9`. Read `CLAUDE_HANDOFF_MOBILE_RESTORE.md` first. Treat the listed files as the restored baseline and continue implementation from there. Do not regress bundler fixes (`metro.config.js`, `babel.config.js`, `fix-expo-router-ctx.js`). Prioritize mobile flow polish, review flow correctness, and production hardening.

