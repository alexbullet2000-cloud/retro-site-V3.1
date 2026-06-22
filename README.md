# Retro Personal Homepage

This project is a simple Web 1.0 style personal homepage built with:
- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js + Express
- External data: Steam API and Discord Lanyard (all sensitive keys stay on the server)

## Features
- Retro homepage layout inspired by 2005 personal sites
- Avatar section and boxed content
- Visitor counter persisted on the server
- Steam profile integration with live current-game updates when `STEAM_API_KEY` is set
- Discord presence integration

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file using the sample:
   ```bash
   cp .env.example .env
   ```
3. Fill in your values:
   - `STEAM_API_KEY`
   - `STEAM_ID`
   - `DISCORD_USER_ID`

### Steam live updates
The Steam panel refreshes in the browser every 15 seconds. To show the current game reliably, create a `.env` file and set `STEAM_API_KEY`; without it, Steam only exposes limited public profile data and the game/hours can look stale.

## Run locally
```bash
npm start
```

Then open:
```text
http://localhost:3000
```

## Deploy
You can deploy this app to services such as Render, Railway, Fly.io, or Vercel (with a small adapter if needed). This repo includes a `render.yaml` file for Render.

### Render
1. Push this project to a GitHub repository.
2. Open Render and create a new Web Service from that repository.
3. Use these commands:
   ```bash
   npm install
   npm start
   ```
4. Add these environment variables in Render:
   - `STEAM_API_KEY`
   - `STEAM_ID`
   - `DISCORD_USER_ID`
5. Deploy the service and open the generated `.onrender.com` URL.

On Render's free plan, the service can sleep after some idle time and wake up again on the next visit. For always-on hosting, use a paid web service plan.
