# TRUMP AI Backend Deploy

## Easiest Option: Render

Use Render for the backend because it can run `server.js` directly from GitHub.

1. Go to `https://render.com`
2. Sign in with GitHub.
3. Click **New +**.
4. Choose **Web Service**.
5. Connect the `VKAUTOMATE/trump-ai` repository.
6. Use these settings:

   - **Name:** `trump-ai-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

7. Add environment variables:

   - `OPENAI_API_KEY` = your OpenAI key
   - `OPENAI_MODEL` = `gpt-5.4-mini`
   - `ALPHA_VANTAGE_API_KEY` = optional market API key

8. Click **Deploy Web Service**.
9. Copy the Render URL, for example:

   `https://trump-ai-backend.onrender.com`

10. Open TRUMP AI, go to **Settings**, paste that URL into **Backend API URL**, then click **Save Settings**.

## Test URLs

After Render deploys, test:

- `/api/health`
- `/api/live/sports?league=NBA`
- `/api/live/news`
- `/api/live/economics`
- `/api/live/politics`

Example:

`https://trump-ai-backend.onrender.com/api/health`

## Important

GitHub Pages can host the frontend, but it cannot run `server.js`. The backend must run on Render, Vercel, Netlify, Railway, or another server platform.
