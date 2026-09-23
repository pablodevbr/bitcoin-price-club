<div align="center">
<img width="1024" height="267" alt="Bitcoin Price Club Telegram Banner" src="/scratch/test_telegram_card.png" onerror="this.src='https://bitcoinprice.club/api/og'" />
</div>

# ₿ Bitcoin Price Club

**Bitcoin Price Club** ([bitcoinprice.club](https://bitcoinprice.club)) is a real-time cryptocurrency dashboard and automated market intelligence engine. It combines raw financial data, Satoshi purchasing power calculations, AI-powered sentiment analysis (Google Gemini), dynamic OpenGraph/Telegram social card generation, and automated daily broadcasts to Telegram.

---

## 🚀 Features

* **Real-time Market Tracking:** Live Bitcoin price (USD), 24h percentage variation, and interactive 24-hour sparkline trend charts.
* **Satoshi Purchasing Power:** Live calculation of how many Satoshis $1.00 USD buys today (`100,000,000 / Price`).
* **AI Market Commentary:** Context-aware 2-3 sentence market sentiment analysis in English powered by **Google Gemini 2.5 Flash Lite** (with intelligent contextual fallback).
* **Modular Prompt Management:** Prompt templates organized in `/prompts` with dynamic variable interpolation (`{{price}}`, `{{change24h}}`, `{{sats}}`).
* **Resilient Multi-Provider Crypto Fetching:** Failover architecture using **CoinGecko** as primary source with automatic fallback to **Binance Public API**.
* **High-Performance Telegram Card Generator (`/api/og`):** Generates **1024 x 267px** cards on-the-fly using `@resvg/resvg-js` (Rust-powered vector rendering in <2ms). Engineered specifically for Telegram chat preview containers:
  * **In-Chat Preview (Before Click):** Center stage (x: 260–764) remains 100% visible and centered (3D Bitcoin Medallion, massive spot price, and Telegram pill badge).
  * **Full Lightbox View (After Click):** Tapping the image reveals the creative side wings with 3D tilted gold coins, volatility/momentum arrows, 24h delta capsule, and Satoshi purchasing power metrics.
* **Automated Telegram Broadcasts:** Scheduled daily execution at `00:00 UTC` via Vercel Cron (`/api/cron/daily-update`) and instant manual dispatches via `npm run broadcast`.
* **Vercel KV / Upstash Redis Caching:** Persists and serves daily market snapshots with zero cold-start latency.
* **One-Click Sharing to X (Twitter):** Pre-formatted share intent with live metrics, AI summary quotes, and hashtags.
* **Theme Switching:** Sleek dark/light mode with high-contrast luxury crypto aesthetics.

---

## 🛠️ Architecture & Tech Stack

```
├── api/
│   ├── cron/
│   │   └── daily-update.ts   # Vercel Cron route: fetches market, AI insight, caches in KV, notifies Telegram
│   ├── og.ts                 # Dynamic 1024x267px Telegram card generator (PNG & SVG via @resvg/resvg-js)
│   └── snapshot.ts           # REST endpoint serving latest cached KV snapshot with live fallback
├── lib/
│   ├── crypto.ts             # CoinGecko & Binance fetcher, Satoshi conversions, sparkline history
│   ├── ai.ts                 # Google Gemini GenAI SDK caller with prompt template interpolation & English fallback
│   ├── kv.ts                 # Upstash Redis / Vercel KV snapshot storage and retrieval
│   └── telegram.ts           # Telegram Bot API client (direct Buffer multipart upload & public URL broadcast)
├── prompts/
│   ├── market-insight.ts     # TypeScript-exported English prompt template for universal ESM/Vite support
│   └── market-insight.md     # Markdown reference template
├── scripts/
│   └── test_telegram_send.ts # Standalone TypeScript broadcast runner (used by npm run broadcast)
├── components/               # UI components (PriceCard, SatoshiCard, MarketChart, AiInsight, ShareButton)
├── types.ts                  # Unified data contracts across frontend, APIs, and background jobs
└── vercel.json               # Cron schedule (00:00 UTC) & main branch deployment filter
```

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
* **Serverless Backend:** Vercel Serverless Functions (Node.js runtime).
* **AI Engine:** Google GenAI SDK (`@google/genai` - `gemini-2.5-flash-lite`).
* **Database / Cache:** Vercel KV / Upstash Redis (`@upstash/redis`).
* **Image Engine:** `@resvg/resvg-js` for vector SVG-to-PNG rendering.
* **Telegram Integration:** Direct Telegram Bot API with multipart photo buffer upload and HTML caption formatting.
* **Analytics:** `@vercel/speed-insights` & `@vercel/analytics`.

---

## 📡 API Endpoints & Usage

### 1. Dynamic Telegram & Social Card (`/api/og`)
Generates a 1024x267px social/Telegram card image in PNG or SVG.

* **Method:** `GET`
* **Path:** `/api/og`
* **Query Parameters (Optional):**
  * `price`: Custom Bitcoin price in USD (e.g., `86500`).
  * `change`: 24h percentage change (e.g., `2.85` or `-1.40`).
  * `sats`: Satoshis per USD (e.g., `1156`).
  * `channel`: Telegram channel handle (e.g., `@bitcoinpriceclub`).
  * `format`: Image format — `png` (default) or `svg`.

**Examples:**
```http
# Automatic mode (fetches real-time price or latest KV cache)
GET https://bitcoinprice.club/api/og

# Custom parameters with channel handle
GET https://bitcoinprice.club/api/og?price=86500&change=-0.33&sats=1160&channel=@bitcoinpriceclub

# Razor-sharp vector SVG format
GET https://bitcoinprice.club/api/og?format=svg
```

**Card Composition (1024 x 267 px):**
```
┌─────────────────────────┬───────────────────────────────┬─────────────────────────┐
│       LEFT WING         │         CENTER STAGE          │       RIGHT WING        │
│    (x: 0 → 260px)       │       (x: 260 → 764px)        │    (x: 764 → 1024px)    │
│                         │                               │                         │
│  [REVEALED ON CLICK]    │    [VISIBLE BEFORE CLICK]     │  [REVEALED ON CLICK]    │
│                         │                               │                         │
│ • 3D Floating Gold Coin │ • 3D Bitcoin Club Medallion   │ • 3D Floating Gold Coin │
│ • 3D Volatility Arrow   │ • Massive Bold Spot Price     │ • 3D Bullish Pump Arrow │
│ • Dynamic 24h Delta Pill│   ("$86,500")                 │ • "BITCOIN PRICE CLUB"  │
│ • "POWERED BY GEMINI AI"│ • Telegram Pill Badge         │ • Satoshi Power Badge   │
│ • "21M HARD CAP"        │   ("✈ @bitcoinpriceclub")     │   ("⚡ 1,160 SATS / $1") │
└─────────────────────────┴───────────────────────────────┴─────────────────────────┘
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
    "priceUsd": 86340.20,
    "change24h": -0.37,
    "satoshisPerDollar": 1158,
    "summary": "Bitcoin is navigating a healthy technical consolidation trading at $86,340.20 USD...",
    "updatedAt": "2026-09-22T00:00:00.000Z"
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
3. Generates analytical commentary in English via Google Gemini (or contextual fallback).
4. Persists the consolidated snapshot into Vercel KV.
5. Dispatches the 1024x267 photo card and formatted caption to the Telegram channel (`@bitcoinpriceclub`).

**Response Example (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "priceUsd": 86340.20,
    "change24h": -0.37,
    "satoshisPerDollar": 1158,
    "summary": "Bitcoin is navigating a healthy technical consolidation...",
    "updatedAt": "2026-09-22T00:00:00.000Z"
  },
  "telegram": {
    "ok": true,
    "messageId": 7
  }
}
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI (Optional: falls back gracefully if omitted)
GEMINI_API_KEY=your_gemini_api_key

# Telegram Bot Integration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHANNEL_ID=@your_channel_or_chat_id
TELEGRAM_CHANNEL_HANDLE=@your_channel_or_chat_id

# Vercel Cron Secret (Secures /api/cron/daily-update)
CRON_SECRET=your_random_secure_secret

# Vercel KV / Upstash Redis
KV_REST_API_URL=https://your-database.upstash.io
KV_REST_API_TOKEN=your_upstash_rest_token
```

> **Note:** If `KV_REST_API_*` or `GEMINI_API_KEY` are omitted during local development, the application gracefully handles fallbacks without crashing.

---

## 💻 Local Development & CLI

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run Vite development server with built-in API dev middleware:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the live dashboard. The dev server includes middleware to execute `/api/og` and `/api/snapshot` directly.

3. **Manual Telegram Broadcast (CLI):**
   Dispatch an updated card and AI market insight to the Telegram channel at any time:
   ```bash
   npm run broadcast
   ```

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
