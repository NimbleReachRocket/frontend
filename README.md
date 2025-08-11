## Reach Rocket - GEO Portal

A Generative Engine Optimisation (GEO) portal built with Next.js 15 and Prisma.

### Local Development

1. Install deps: `npm i`
2. Copy env: `cp .env.example .env` and set values
3. Create DB schema: `npx prisma migrate dev --name init`
4. Start: `npm run dev`

### Deploying to Vercel

1. Provision a managed Postgres (Vercel Postgres, Neon, etc.)
2. In Vercel → Project → Settings → Environment Variables, add:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_BASE_URL` (e.g., your Vercel URL)
3. Build command: `npm run build`
4. Install command: `npm i`
5. Output directory: leave empty

The build runs `prisma generate` and `prisma db push` before `next build`.

