# QuickBasket — Quick-Commerce Price Comparator

Compare grocery prices across **Blinkit**, **Zepto**, and **Swiggy Instamart** — for a single item or a full shopping list — and find out whether it's cheaper to buy everything from one app or split your list across platforms.

🔗 **Live demo:** [quickbasket-q8i78uves-sakshishirke412-2825s-projects.vercel.app](https://quickbasket-q8i78uves-sakshishirke412-2825s-projects.vercel.app/)

> Built as a personal/portfolio project to solve a genuinely annoying everyday problem: figuring out which quick-commerce app actually has the best price, especially once delivery fees are factored in.

---

## The Problem

Blinkit, Zepto, and Instamart all sell largely the same products but at different prices, with no easy way to compare them side by side. Manually checking three apps for a 5-item grocery list is tedious — and "cheapest item price" isn't the full picture once you account for delivery fees and free-delivery thresholds.

---

## Project Status

This project is under active development. Current state, phase by phase:

- [x] **Phase 1 — Blinkit scraper**: pulls live pricing via headless browser automation
- [ ] **Phase 2 — Zepto + Instamart scrapers**
- [ ] **Phase 3 — Cross-platform product matching** (fuzzy matching across differently-named products)
- [ ] **Phase 4 — Cost optimizer** (single-platform vs. split-across-platforms, including delivery fees)
- [ ] **Phase 5 — Frontend UI** wired up to live backend data
- [ ] Stretch: caching layer, out-of-stock handling, price-history tracking

> ⚠️ Update the checkboxes above as each phase is completed — the "What It Does" and "Key Technical Challenges Solved" sections below describe the **target** functionality, some of which is still in progress.

---

## What It Does (Target Functionality)

- Search for a single item or add a full shopping list
- Enter your pincode to get location-accurate pricing
- See a side-by-side price comparison across all three platforms
- Get a recommendation: buy everything from one platform vs. split across platforms — with total cost (items + delivery) calculated for each option
- Match the *same* product across platforms even when naming differs (e.g. "Amul Taaza 500ml" vs "Amul Taaza Milk 500 ml")

---

## Tech Stack

| Layer            | Tech                                          |
| ---------------- | ---------------------------------------------- |
| Frontend         | React (Next.js) + Tailwind CSS                |
| Backend          | Python, FastAPI                               |
| Scraping         | Playwright (headless browser automation)      |
| Product matching | rapidfuzz (fuzzy string matching)             |
| Caching          | Redis (in-memory dict fallback for local dev) |
| Storage          | SQLite (product snapshots)                    |
| Deployment       | Vercel                                        |

---

## Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│   Frontend   │─────▶│   FastAPI Backend │─────▶│  Platform Scrapers   │
│ (Next.js UI) │      │   /compare route  │      │ Blinkit / Zepto /    │
└─────────────┘      └──────────────────┘      │ Instamart (Playwright)│
                              │                  └─────────────────────┘
                              ▼
                    ┌───────────────────┐
                    │  Product Matcher   │
                    │ (fuzzy match +     │
                    │  unit normalization)│
                    └───────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │  Cost Optimizer    │
                    │ (single-platform vs│
                    │  split, + delivery) │
                    └───────────────────┘
```

**Flow:** user submits items + pincode → backend fires parallel scrape requests to available platform scrapers → raw results get normalized and fuzzy-matched into unified product entries → optimizer computes cheapest single-platform total and cheapest split-across-platforms total (including delivery fees) → frontend displays both.

---

## Key Technical Challenges

1. **No public APIs** — prices are scraped via headless browser automation (Playwright), since these platforms render prices client-side and require a delivery location to be set first.
2. **Cross-platform product matching** — the same product is named differently on every app. Approach: fuzzy string matching (rapidfuzz) after normalizing brand names, quantities, and units.
3. **Apples-to-apples pricing** — pack sizes differ across platforms, so prices need to be converted to a per-unit basis (₹/litre, ₹/kg) before comparison.
4. **Cost optimization** — the goal isn't just the cheapest item price, but the cheapest *total* cost, factoring in each platform's delivery fee and free-delivery threshold.

---

## Getting Started

> Want to try it without setup? Use the [live demo](https://quickbasket-q8i78uves-sakshishirke412-2825s-projects.vercel.app/) instead.

### Prerequisites

- Python 3.10+
- Node.js 18+
- Redis (optional — falls back to in-memory cache if not running)

### Backend setup

```bash
cd scraper-service
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload
```

### Frontend setup

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables

Create a `.env` file in `/scraper-service`:

```
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300
```

---

## Project Structure

```
.
├── app/                 # Next.js app directory (routes, pages)
├── components/          # React components
├── lib/                 # Shared frontend utilities
├── public/              # Static assets
├── scraper-service/     # Python/FastAPI backend + scrapers
│   ├── main.py           # FastAPI app entrypoint
│   ├── scrapers/          # Per-platform scraper implementations
│   ├── matching/          # Fuzzy matching + unit normalization
│   └── optimizer/         # Single-platform vs. split cost logic
├── components.json
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
└── README.md
```

> Note: this structure reflects the actual repo layout. Update the `scraper-service/` subfolders above if the internal organization changes.

---

## Notes on Scraping

This project scrapes publicly viewable pricing data for personal/educational purposes only. No login-gated content is accessed, and requests are rate-limited to avoid excessive load on the target sites. Selectors may break if the underlying platforms change their site structure — this is a known limitation of scraping-based approaches.

---

## License

MIT — feel free to fork and build on this.
