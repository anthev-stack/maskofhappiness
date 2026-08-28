# maskofhappiness

Community events site: claim or buy tickets, listen to shared Spotify playlists.

## Run locally

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Admin

- Email: `admin@maskofhappiness.com`
- Password: `maskofhappiness`

Change these in `.env` and re-seed.

Placeholder Spotify playlists are on the homepage until you add your three in **Dashboard → Playlists**.
