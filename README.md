<div align="center">
<img width="1200" height="475" alt="Bitcoin Banner" src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80" />
</div>

# ₿ Bitcoin Price Club

**Bitcoin Price Club** ([bitcoinprice.club](https://bitcoinprice.club)) is a real-time cryptocurrency dashboard and automated market intelligence engine. It combines raw financial data, Satoshi purchasing power calculations, AI-powered sentiment analysis (Google Gemini), dynamic OpenGraph social card generation, and automated daily broadcasts to Telegram.

---

## 🚀 Features

* **Real-time Market Tracking:** Live Bitcoin price (USD), 24h percentage variation, and interactive 24-hour sparkline trend charts.
* **Satoshi Purchasing Power:** Live calculation of how many Satoshis $1.00 USD buys today (`100,000,000 / Price`).
* **AI Market Commentary:** Context-aware 2-3 sentence market sentiment analysis powered by **Google Gemini 2.5 Flash Lite**.
* **Modular Prompt Management:** Prompt templates organized in `/prompts` with dynamic variable interpolation (`{{price}}`, `{{change24h}}`, `{{sats}}`).
* **Resilient Multi-Provider Crypto Fetching:** Failover architecture using **CoinGecko** as primary source with automatic fallback to **Binance Public API**.
* **High-Performance OpenGraph Cards (`/api/og`):** Generates 1200x630px high-contrast social cards on-the-fly using `@resvg/resvg-js` (Rust-powered vector rendering in <2ms).
* **Vercel KV / Upstash Redis Caching:** Persists and serves daily market snapshots with zero cold-start latency.
* **Automated Cron Jobs (`/api/cron/daily-update`):** Daily automated execution at `00:00 UTC` to capture market snapshots and broadcast updates to Telegram channels.
* **One-Click Sharing to X (Twitter):** Pre-formatted share intent with live metrics, AI summary quotes, and hashtags.
* **Theme Switching:** Sleek dark/light mode with high-contrast luxury crypto aesthetics.

---

## 🛠️ Architecture & Tech Stack

```
├── api/
│   ├── cron/
│   │   └── daily-update.ts   # Vercel Cron route: fetches market, AI insight, caches in KV, notifies Telegram
│   ├── og.ts                 # Dynamic 1200x630px OG/social card generator (PNG & SVG via @resvg/resvg-js)
│   └── snapshot.ts           # REST endpoint serving latest cached KV snapshot with live fallback
├── lib/
│   ├── crypto.ts             # CoinGecko & Binance fetcher, Satoshi conversions, sparkline history
│   ├── ai.ts                 # Google Gemini GenAI SDK caller with prompt template interpolation
│   ├── kv.ts                 # Upstash Redis / Vercel KV snapshot storage and retrieval
│   └── telegram.ts           # Telegram Bot API client (photo broadcast with formatted HTML captions)
├── prompts/
│   ├── market-insight.ts     # TypeScript-exported prompt template for universal ESM/Vite support
│   └── market-insight.md     # Markdown reference template
├── components/               # UI components (PriceCard, SatoshiCard, MarketChart, AiInsight, ShareButton)
├── types.ts                  # Unified data contracts across frontend, APIs, and background jobs
└── vercel.json               # Cron schedule (00:00 UTC) & main branch deployment filter
```

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
* **Serverless Backend:** Vercel Serverless Functions (Node.js runtime).
* **AI Engine:** Google GenAI SDK (`@google/genai` - `gemini-2.5-flash-lite`).
* **Database / Cache:** Vercel KV / Upstash Redis (`@upstash/redis`).
* **Image Engine:** `@resvg/resvg-js` for vector SVG-to-PNG rendering.
* **Analytics:** `@vercel/speed-insights` & `@vercel/analytics`.

---

## 📡 API Endpoints & Usage

### 1. Dynamic Social Card (`/api/og`)
Generates a 1200x630px social card image.

* **Method:** `GET`
* **Path:** `/api/og`
* **Query Parameters (Optional):**
  * `price`: Custom Bitcoin price in USD (e.g., `96500.00`).
  * `change`: 24h percentage change (e.g., `2.85` or `-1.40`).
  * `sats`: Satoshis per USD (e.g., `1036`).
  * `summary`: Custom AI quote or market commentary.
  * `format`: Image format — `png` (default) or `svg`.

**Examples:**
```http
# Automatic mode (fetches real-time price or latest KV cache)
GET https://bitcoinprice.club/api/og

# Custom parameters
GET https://bitcoinprice.club/api/og?price=98500.00&change=3.45&sats=1015&summary=Bitcoin+maintains+strong+consolidation.

# Vector SVG format
GET https://bitcoinprice.club/api/og?format=svg
```

---

### 2. Daily Snapshot (`/api/snapshot`)
Retrieves the latest market data and AI sentiment snapshot from Vercel KV cache with live market fallback.

* **Method:** `GET`
* **Path:** `/api/snapshot`

**Response Example (`200 OK`):**
```json
{
  "source": "kv_cache",
  "data": {
    "priceUsd": 96540.20,
    "change24h": 2.45,
    "satoshisPerDollar": 1035,
    "summary": "Bitcoin demonstrates disciplined consolidation above key support levels...",
    "updatedAt": "2026-09-01T00:00:00.000Z"
  }
}
```

---

### 3. Automated Daily Cron (`/api/cron/daily-update`)
Triggered automatically every day at `00:00 UTC` by Vercel Cron.

* **Method:** `GET`
* **Path:** `/api/cron/daily-update`
* **Headers:** `Authorization: Bearer <CRON_SECRET>`

**Execution Flow:**
1. Validates the `Authorization` header against `CRON_SECRET`.
2. Fetches live Bitcoin market data (CoinGecko with Binance fallback).
3. Generates analytical commentary via Google Gemini.
4. Persists the consolidated snapshot into Vercel KV.
5. Dispatches a photo card and formatted caption to the Telegram channel.

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "priceUsd": 96540.20,
    "change24h": 2.45,
    "satoshisPerDollar": 1035,
    "summary": "Bitcoin continues to build structural strength as on-chain accumulation deepens.",
    "updatedAt": "2026-09-01T00:00:00.000Z"
  },
  "telegram": {
    "ok": true,
    "messageId": 1284
  }
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Telegram Bot Integration (Optional for local development)
TELEGRAM_BOT_TOKEN=your_botfather_token
TELEGRAM_CHANNEL_ID=@your_channel_or_chat_id

# Vercel Cron Secret (Secures /api/cron/daily-update)
CRON_SECRET=your_random_secure_secret

# Vercel KV / Upstash Redis
KV_REST_API_URL=https://your-database.upstash.io
KV_REST_API_TOKEN=your_upstash_rest_token
```

> **Note:** If `KV_REST_API_*` or `TELEGRAM_*` variables are omitted or placeholders during local development, the application gracefully skips those steps without crashing or throwing errors.

---

## 💻 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Vite development server (SPA only):**
   ```bash
   npm run dev
   ```

3. **Run full Vercel environment with Serverless APIs:**
   ```bash
   npx vercel dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to test frontend, `/api/og`, `/api/snapshot`, and `/api/cron/daily-update`.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🚢 Deployment & CI/CD

The repository is configured with [`vercel.json`](file:///c:/Users/pablo/Documents/DEV/MyProjects/bitcoin-price-club/vercel.json):
* **Branch Policy:** `ignoreCommand` ensures automated production deployments only trigger on pushes to the `main` branch. Development branches (`dev`, `feature/*`) bypass automatic builds.
* **Cron Schedule:** Automated daily execution scheduled at `0 0 * * *` (00:00 UTC).

---

## 📄 License

MIT © [Bitcoin Price Club](https://bitcoinprice.club)
