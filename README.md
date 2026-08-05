# Plot & Petal

An iPhone-friendly gardening journal that turns natural-language notes into plant care guidance and reminders. It also includes a touch-draggable garden planner, a daily task view and a small plant library.

## Features

- Starts clean for every new session with no assumed plants or demo jobs
- Recognises a broad built-in set of common garden plants in journal notes
- Shows light, watering, soil, spacing, harvest and common-problem guidance
- Creates watering, care and harvest reminders from planting entries
- Understands general timed jobs such as `water the flower bed tomorrow at 19:00` without requiring a plant
- Saves journal entries, reminders and garden layouts in Cloudflare D1
- Provides a measured touch-friendly planner with unlimited features, dimensions, shapes, orientation and dynamic layout advice
- Loads local current weather only after the user grants location permission
- Includes 24 detailed common garden plants and optional global Trefle catalogue search
- Supports live prefix and typo-tolerant plant search, including soil preferences when the source records them
- Requests browser notification permission from an explicit user action
- Responsive layout designed primarily for iPhone

## Optional global plant catalogue

The app works without another account and includes a detailed starter catalogue. To search Trefle's much larger global botanical catalogue:

1. Create a free account at `https://trefle.io` and copy your personal access token.
2. In Cloudflare, open the `plot-and-petal` Worker.
3. Open **Settings → Variables and Secrets**.
4. Add an encrypted secret named `TREFLE_TOKEN` and paste the token as its value.
5. Redeploy the Worker.

The token is read only by the server route and is never sent to the browser.

## Weather data

Current conditions use the non-commercial Open-Meteo API after the visitor grants location access. Weather data is provided by Open-Meteo under CC BY 4.0; attribution is included in the interface.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local address shown in the terminal.

To create a production build:

```bash
npm run build
```

## Upload to GitHub

Extract the ZIP, create an empty GitHub repository, then run:

```bash
git init
git add .
git commit -m "Initial Plot & Petal app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

## Publishing

This is a full-stack Cloudflare-compatible app, not a static GitHub Pages site. GitHub stores the source; deploy it to a service that can run the server and provide the declared D1 database binding.

The logical database binding is `DB` in `.openai/hosting.json`. The initial schema migration is included in `drizzle/0000_plot_and_petal.sql`.

## Project structure

- `app/page.tsx` — interactive mobile interface
- `app/globals.css` — responsive visual design
- `app/api/` — journal and garden-plan endpoints
- `db/schema.ts` — persistent data model
- `drizzle/` — initial database migration
- `public/og.png` — social sharing artwork

## Notification note

The current version requests notification permission and generates reminder records. Reliable background push notifications on iPhone require a web-push service, a service worker and an installed home-screen web app; those production delivery pieces are not yet configured.
