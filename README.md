# Clue AI Detective Game

AI-assisted mystery generator where players craft custom detective cases, gather visual evidence, and share interactive briefs. The app uses Google Gemini for story design, Replicate for image clues, and a sleek HeroUI/Tailwind interface to present each case like a briefing dossier.

## Features

- Dynamic case creation flow that guides users from suspect selection to final case summary
- Google Gemini prompt orchestration for story outlines, motives, alibis, and twist reveals
- Replicate-powered clue imagery plus a custom loader for asynchronous image jobs
- Persistent game saving via API routes and Drizzle schema ready for Neon/Postgres
- Dashboard, pricing, and docs pages for showcasing the product experience

## Tech Stack

- Next.js 14 (Pages Router) with TypeScript
- HeroUI v2, Tailwind CSS, Tailwind Variants, Framer Motion, next-themes
- Google Gemini + Replicate APIs for AI content and media
- Drizzle ORM with Neon/Postgres-ready migrations

## Getting Started

```bash
# install dependencies
npm install

# start dev server
npm run dev
```

Visit `http://localhost:3000` to open the experience. The create flow lives under `/play/create`.

## Environment Variables

Create a `.env.local` file with the following keys:

```
GEMINI_API_KEY=xxxxxxxx
REPLICATE_API_KEY=xxxxxxxx   # or REPLICATE_API_TOKEN
DATABASE_URL=postgres://user:pass@host/db    # used by Drizzle + Neon
```

Use `npm run test-env` (see `pages/api/testEnv.ts`) or hit `/api/testEnv` locally to verify that the keys are loaded before deploying.

## Available Scripts

- `npm run dev` – start Next.js locally
- `npm run build` – production build
- `npm run start` – serve the production build
- `npm run lint` – lint with eslint

## Deployment

The project is optimized for Vercel. Set the same environment variables in the Vercel dashboard, connect the GitHub repo, and enable automatic deployments from `main`. Neon/Postgres connection details should be stored as encrypted env vars.

## License

This project is released under the [MIT License](LICENSE).
