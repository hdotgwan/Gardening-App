# Plot & Petal

An iPhone-friendly gardening journal that turns natural-language notes into plant care guidance and reminders. It also includes a touch-draggable garden planner, a daily task view and a small plant library.

## Features

- Recognises French beans, tomatoes, lavender and lettuce in journal notes
- Shows light, watering, soil, spacing, harvest and common-problem guidance
- Creates watering, care and harvest reminders from planting entries
- Saves journal entries, reminders and garden layouts in Cloudflare D1
- Provides a touch-friendly visual garden planner
- Requests browser notification permission from an explicit user action
- Responsive layout designed primarily for iPhone

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
