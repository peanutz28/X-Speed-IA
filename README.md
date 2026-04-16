# X-Speed-IA

Wharton Hack-AI-thon submission: an Expedia-style property operations suite with:
- `apps/web`: property manager dashboard (React + Vite)
- `apps/mobile`: traveler-facing mobile app (Expo + React Native)
- `app`: Python review-intelligence API

## Stack

### Frontend
- **Web:** React 19 + Vite (`apps/web`)
- **Mobile:** Expo SDK 54 + Expo Router + React Native 0.81 (`apps/mobile`)
- **UI libs (mobile):**
  - `expo-image`
  - `expo-linear-gradient`
  - `expo-av` (voice notes)
  - `react-native-reanimated`
  - `react-native-gesture-handler`
  - `@expo-google-fonts/poppins`

### Backend
- **Python HTTP API** using standard library `http.server` (`app/server.py`)
- **Storage:** SQLite
  - `data/reviews.db`
  - `data/hidden_gems.db`
- **AI providers:**
  - OpenAI (actionable extraction, matching, listing rewrite)
  - Cerebras (review tag generation + amenity mention extraction)
  - Fallback: if Cerebras rate-limits, review tagging falls back to OpenAI

### Monorepo
- npm workspaces (`apps/web`, `apps/mobile`)
- Root scripts orchestrate both apps
- React version alignment pinned at root (`react`, `react-dom` 19.1.0)

## Repository Layout

- `apps/web`: Vite web dashboard
- `apps/mobile`: Expo mobile app
- `app`: review intelligence backend
- `data`: SQLite DB files (created locally at runtime)

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- Python 3.10+
- iOS Simulator / Android Emulator (optional)
- Expo Go app for QR testing (optional)

## Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```bash
OPENAI_API_KEY="your-openai-key"
CEREBRAS_API_KEY="your-cerebras-key"
OPENAI_MODEL="gpt-4.1-mini"
CEREBRAS_MODEL="gpt-oss-120b"
REVIEW_DB_PATH="./data/reviews.db"
HIDDEN_GEM_DB_PATH="./data/hidden_gems.db"
REVIEW_APP_HOST="127.0.0.1"
REVIEW_APP_PORT="8000"
CORS_ALLOWED_ORIGIN="*"
```

Config loading behavior:
- `.env` loads first
- `.env.local` overrides `.env`

## How To Run

Run commands from repo root:

```bash
cd /Users/peanutz/Documents/GitHub/X-Speed-IA
```

### Web app

```bash
npm run web
```

### Mobile app

```bash
npm run mobile
```

Useful mobile variants:

```bash
npm run mobile:tunnel   # QR across networks
npm run mobile:ios
npm run mobile:android
npm run mobile:web
```

### Backend API

```bash
mkdir -p data
python3 -m app.server
```

Backend base URL:

```text
http://127.0.0.1:8000
```

## Developer Workflow

1. Start backend (`python3 -m app.server`)
2. Start web (`npm run web`) and/or mobile (`npm run mobile:tunnel`)
3. Build UI flow in `apps/mobile/app/*` or `apps/web/src/*`
4. Wire API calls to backend endpoints
5. Validate DB side effects (`data/*.db`)
6. Run type/lint checks before commit

Recommended checks:

```bash
npm run web:build
npm run --workspace apps/mobile lint
cd apps/mobile && npx tsc --noEmit
```

## Mobile Router Workflow

Key routes:
- Tabs:
  - `apps/mobile/app/(tabs)/index.tsx`
  - `apps/mobile/app/(tabs)/trips.tsx`
  - `apps/mobile/app/(tabs)/profile.tsx`
- Details:
  - `apps/mobile/app/trip/[tripId].tsx`
  - `apps/mobile/app/stay/[stayId].tsx`
- Review flow:
  - `apps/mobile/app/review/[stayId]/index.tsx`
  - `apps/mobile/app/review/[stayId]/followup.tsx`

Shared components:
- `apps/mobile/components/luxury-header.tsx`
- `apps/mobile/components/ai-mic-button.tsx`

Mock domain data:
- `apps/mobile/data/travel.ts`

## Monorepo/Expo Notes

This repo includes monorepo-specific Expo hardening:

- `apps/mobile/metro.config.js`
  - workspace `watchFolders`
  - `nodeModulesPaths`
  - forced single React copy via `extraNodeModules`

- `apps/mobile/scripts/fix-expo-router-ctx.js`
  - postinstall patch fallback for Expo Router env inlining issues in hoisted setups

If bundling fails with `EXPO_ROUTER_APP_ROOT` errors:
1. reinstall dependencies
2. ensure `EXPO_ROUTER_APP_ROOT=./app` is present in scripts
3. rerun postinstall patch
4. clear Expo cache (`expo start --clear`)

## Backend API Workflow

All JSON; CORS and `OPTIONS` preflight supported.

- `GET /health`
- `POST /reviews`
  - stores review
  - generates tag
  - runs local sentiment logic
  - extracts + dedupes actionables
  - optionally analyzes amenity mentions
- `GET /actionable-items`
- `POST /actionable-items/{id}/resolve`
  - resolves item
  - optional listing rewrite if `current_listing` provided

## AI Models Used (Current)

From `app/config.py` defaults:
- `OPENAI_MODEL`: `gpt-4.1-mini`
- `CEREBRAS_MODEL`: `gpt-oss-120b`

Runtime behavior:
- **Cerebras**: primary for review tags and amenity mention extraction
- **OpenAI**: actionable extraction, dedupe matching, listing rewrite
- **Fallback**: OpenAI handles review tags only if Cerebras returns rate-limit

## AI Cost Guidance

### Important
Model pricing changes frequently. Treat this section as planning guidance, not billing truth.

Use official pricing pages before launch:
- OpenAI pricing: [platform.openai.com/pricing](https://platform.openai.com/pricing)
- Cerebras pricing: [cerebras.ai](https://www.cerebras.ai/) (and your account billing page)

### Cost drivers in this codebase
- `POST /reviews` can trigger multiple model calls:
  - 1x review tag generation
  - 1x actionable extraction
  - `N`x dedupe/match calls (depends on existing item count)
  - optional amenity mention extraction
- `POST /actionable-items/{id}/resolve` with `current_listing` adds another generation call

### Practical budgeting workflow
1. Log prompt + completion token counts per endpoint
2. Add per-request cost estimates in server logs
3. Set daily budget alerts with provider dashboards
4. Cache repeated classification/matching where possible
5. Keep prompts concise and deterministic

## Known Gaps / Next Steps

- Mobile and web are UI-rich and still partially mock-data driven
- Add a shared typed API client between frontend and backend
- Add auth and user scoping
- Add automated tests for review processing and swipe/follow-up flow
- Add production deploy docs (Vercel + EAS + backend hosting)
