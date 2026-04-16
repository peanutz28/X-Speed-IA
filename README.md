# X-Speed-IA

Wharton Hack-AI-thon submission.

## Repository Structure

- `apps/web` - Existing luxury property-manager dashboard (React + Vite).
- `apps/mobile` - New mobile app workspace (Expo + React Native).
- `app` - Python review-intelligence backend API.

## Run Apps From Repo Root

- Web dashboard: `npm run web`
- Mobile app (Expo dev server): `npm run mobile`
- Mobile iOS: `npm run mobile:ios`
- Mobile Android: `npm run mobile:android`

## Review Intelligence Backend

The Python backend ingests guest reviews, generates Cerebras review tags, runs
local sentiment analysis, extracts deduplicated actionable items with OpenAI,
tracks hidden-gem amenities, and updates listing copy when actionable items are
resolved.

When a review is submitted, the backend:

1. Stores review metadata: profile photo, user name, content, date, and property.
2. Sends the review to Cerebras to generate one review tag:
   - `Couples`
   - `Business Professionals`
   - `Solos`
   - `Families`
3. Runs deterministic local sentiment analysis and recent-review detection.
4. Saves the combined analysis directly on the review record.
5. Sends the review to OpenAI to extract actionable items.
6. Deduplicates actionable items and links each review with a stable `link_tag`.
7. Tracks whether actionable items are open or resolved.
8. If the frontend sends an `amenities` list, uses Cerebras to detect mentioned
   amenities and tracks the single rarest hidden-gem amenity in a separate DB.
9. When an actionable item is resolved, OpenAI can rewrite the current listing
   to reflect the resolved improvement and return the updated listing.

If Cerebras rate-limits review tag generation, the app automatically falls back
to OpenAI for that tag-generation step. Other Cerebras errors still fail fast so
configuration or auth issues are visible.

## Backend Data Storage

- `reviews.db` stores `reviews`, `actionable_items`, and `review_actionable_links`.
- `hidden_gems.db` stores `processed_reviews`, `amenities`, and
  `review_amenity_mentions`.
- Hidden-gem status is computed globally across all processed reviews. Only one
  amenity is marked `hidden_gem=true`: the rarest amenity mentioned in less than
  5% of all processed reviews.

## Backend Config

Put real keys in `.env.local` in the project root:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

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

The app loads `.env` first and then `.env.local`. Values in `.env.local`
override `.env`, so `.env.local` is the recommended place for real keys.

## Run Backend

```bash
mkdir -p data
python3 -m app.server
```

Local backend base URL:

```text
http://127.0.0.1:8000
```

## Backend API

Frontend notes:

- All request and response bodies are JSON.
- CORS is enabled through `CORS_ALLOWED_ORIGIN`.
- Browser preflight requests are supported with `OPTIONS`.

### `GET /health`

```json
{
  "status": "ok",
  "service": "x-speed-ia-review-api"
}
```

### `POST /reviews`

Creates a review, generates review analysis, extracts actionable items,
deduplicates them, tracks hidden-gem amenities, and returns linked canonical
records.

```json
{
  "user_name": "Jane Doe",
  "user_profile_photo_url": "https://example.com/jane.jpg",
  "content": "The room was clean but the shower knob was broken and breakfast could be extended to 11am.",
  "review_date": "2026-04-15",
  "property_name": "Downtown Suites",
  "amenities": ["WiFi", "Breakfast", "Parking", "Rooftop pool", "Shower"]
}
```

### `GET /actionable-items`

Returns all canonical actionable items and the reviews linked to them.

### `POST /actionable-items/{id}/resolve`

Marks an actionable item as resolved. If `current_listing` is included, OpenAI
rewrites the listing to include the resolved improvement and the API returns the
updated listing for the frontend.

```json
{
  "resolution_notes": "Maintenance replaced the shower hardware on April 15.",
  "current_listing": "Stay in a clean downtown suite with breakfast available each morning."
}
```

Example response with listing update:

```json
{
  "actionable_item": {
    "id": 1,
    "canonical_text": "Repair broken shower knob",
    "status": "resolved",
    "listing_update_text": "Stay in a clean downtown suite with updated shower hardware and breakfast available each morning."
  },
  "updated_listing": "Stay in a clean downtown suite with updated shower hardware and breakfast available each morning."
}
```
