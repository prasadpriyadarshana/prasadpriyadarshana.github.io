# Chat Agent Setup Guide

This guide walks you through deploying the portfolio chat agent. Total time: ~10 minutes.

## Architecture

```
[Your Portfolio]  →  [Cloudflare Worker]  →  [Google Gemini API]
   (frontend)         (free, hides key)       (free tier, no expiry)
```

---

## Step 1: Get a Google Gemini API Key

1. Go to: https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select any Google Cloud project (or create one — it's free)
5. Copy the API key — you'll need it in Step 3

> **Free tier limits:** 15 requests/minute, 1 million tokens/day. No credit card required. No expiry.

---

## Step 2: Set Up Cloudflare Account & Deploy Worker

### 2a. Create a Cloudflare account (if you don't have one)

1. Go to: https://dash.cloudflare.com/sign-up
2. Create a free account (no credit card needed)

### 2b. Install Node.js (if not already installed)

Download from: https://nodejs.org (LTS version recommended)

### 2c. Deploy the Worker

Open a terminal in the `chat-worker` folder and run:

```bash
# Install dependencies
npm install

# Login to Cloudflare (opens browser)
npx wrangler login

# Deploy the worker
npx wrangler deploy
```

After deploying, you'll see output like:
```
Published prasad-portfolio-chat (0.5 sec)
  https://prasad-portfolio-chat.YOUR_SUBDOMAIN.workers.dev
```

**Copy that URL** — you'll need it in Step 4.

---

## Step 3: Add Your Gemini API Key as a Secret

Run this command in the `chat-worker` folder:

```bash
npx wrangler secret put GEMINI_API_KEY
```

When prompted, paste your Gemini API key from Step 1 and press Enter.

> This stores the key securely in Cloudflare — it's never exposed in your code or frontend.

---

## Step 4: Update the Frontend Widget URL

Open `chat-widget.js` in your portfolio root folder and update line 9:

```javascript
// Replace this:
const WORKER_URL = 'https://prasad-portfolio-chat.YOUR_SUBDOMAIN.workers.dev';

// With your actual deployed URL from Step 2c:
const WORKER_URL = 'https://prasad-portfolio-chat.your-actual-subdomain.workers.dev';
```

---

## Step 5: Test It

1. Open your portfolio in a browser
2. Click the blue chat bubble in the bottom-right corner
3. Ask something like "What certifications does Prasad have?"
4. You should get a response from the AI within 1-3 seconds

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Unable to connect" error | Check WORKER_URL in chat-widget.js matches your deployed URL |
| "I'm having trouble connecting" | Verify GEMINI_API_KEY secret was set correctly: `npx wrangler secret list` |
| CORS error in console | The worker already handles CORS — make sure you're calling the correct URL |
| No chat bubble appears | Check browser console for JS errors — ensure chat-widget.js and chat-widget.css are loaded |

---

## Customization

### Change the AI personality
Edit the `SYSTEM_PROMPT` in `chat-worker/src/worker.js` to adjust tone, add new info, or change behavior.

### Add more portfolio content
Update the system prompt with new projects, skills, or articles as you add them.

### Change suggestion chips
Edit the `chat-suggestions` section in `chat-widget.js` to change the quick-action buttons.

### Redeploy after changes
```bash
cd chat-worker
npx wrangler deploy
```

---

## Costs

| Service | Cost | Limits |
|---------|------|--------|
| Google Gemini API | Free | 15 req/min, 1M tokens/day |
| Cloudflare Workers | Free | 100,000 requests/day |
| **Total** | **$0/month** | More than enough for a portfolio |

---

## Files Overview

```
chat-worker/
├── wrangler.toml          # Cloudflare Worker config
├── package.json           # Node dependencies
└── src/
    └── worker.js          # Worker code (system prompt + Gemini API proxy)

portfolio root/
├── chat-widget.js         # Frontend chat widget logic
└── chat-widget.css        # Chat widget styles
```
