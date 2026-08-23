<div align="center">
<img width="1200" height="475" alt="Bitcoin Banner" src="https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=1200&q=80" />
</div>

# Bitcoin Price Club

**Bitcoin Price Club** is a modern, real-time dashboard that combines raw financial data with AI-powered analysis. It tracks Bitcoin's performance while providing witty, "financial guru" style commentary using Google's Gemini AI.

## 🚀 Features

*   **Real-time Tracking:** Live Bitcoin price (USD) and 24h change percentage.
*   **AI Market Insights:** Integrated with **Google Gemini** to generate unique, context-aware market commentary based on price action.
*   **Resilient Data Fetching:** Implements a failover strategy using **CoinGecko** (primary) and **Binance** (fallback) to ensure high availability.
*   **Satoshi Conversion:** Real-time calculation of Satoshis per USD.
*   **Interactive Charts:** Visualizes the 24-hour price trend using Recharts.
*   **Modern UI:** Fully responsive design with toggleable **Dark/Light mode**.

## 🛠️ Tech Stack

*   **Framework:** React 19 + Vite
*   **Styling:** Tailwind CSS
*   **AI:** Google GenAI SDK (Gemini 2.5 Flash Lite)
*   **Prompt Management:** Markdown files (`prompts/`) with dynamic variable interpolation
*   **Charts:** Recharts
*   **Icons:** Lucide React

## 🧠 AI Prompts Customization

All AI prompts are stored as modular Markdown files in the `prompts/` directory:
*   `prompts/market-insight.md`: Controls the personality and guidelines for market insights. Uses placeholders `{{price}}` and `{{change24h}}`.

You can freely customize the markdown files to tune the AI persona, style, and language.

## 💻 Getting Started

Follow these steps to run the project locally.

### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm or yarn

### Installation

1. Install dependencies:
   ```bash
   `npm install`
   ```

2. Configure Environment:
   Create a `.env.local` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
   > You can get an API key from Google AI Studio.

3. Run the development server:
   ```bash
   `npm run dev`
   ```

Open http://localhost:3000 to view the app.
