# TRUMP AI Vercel Deploy

Use Vercel if Render asks for payment.

1. Go to `https://vercel.com`.
2. Sign in with GitHub.
3. Click **Add New** or **New Project**.
4. Import the `VKAUTOMATE/trump-ai` repository.
5. Keep the framework as **Other** if Vercel asks.
6. Leave build settings mostly blank/default:

   - **Build Command:** leave empty
   - **Output Directory:** leave empty
   - **Install Command:** `npm install`

7. Add environment variables:

   - `OPENAI_API_KEY` = your OpenAI key
   - `OPENAI_MODEL` = `gpt-5.4-mini`
   - `ALPHA_VANTAGE_API_KEY` = optional

8. Click **Deploy**.
9. Copy your Vercel URL.
10. If you keep GitHub Pages as the frontend, paste the Vercel URL into TRUMP AI Settings under **Backend API URL**.

Test these after deploy:

- `/api/health`
- `/api/live/sports?league=NBA`
- `/api/live/news`
- `/api/live/economics`
- `/api/live/politics`
