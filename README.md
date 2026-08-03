# QuickBasket — Quick-Commerce Price Comparator

Compare grocery prices across **Blinkit**, **Zepto**, and **Swiggy Instamart** in real time, for a single item or a full shopping list — and find out whether it's cheaper to buy everything from one app or split your list across platforms.

🔗 **Live demo:** [quickbasket-q8i78uves-sakshishirke412-2825s-projects.vercel.app](https://quickbasket-q8i78uves-sakshishirke412-2825s-projects.vercel.app/)

> Built as a personal/portfolio project to solve a genuinely annoying everyday problem: figuring out which quick-commerce app actually has the best price, especially once delivery fees are factored in.

---

## The Problem

Blinkit, Zepto, and Instamart all sell largely the same products but at different prices, with no easy way to compare them side by side. Manually checking three apps for a 5-item grocery list is tedious — and the "cheapest item price" isn't even the full picture once you account for delivery fees and free-delivery thresholds.

## What It Does

- Search for a single item or add a full shopping list
- Enter your pincode to get location-accurate pricing
- See a side-by-side price comparison across all three platforms
- Get a recommendation: buy everything from one platform vs. split across platforms — with total cost (items + delivery) calculated for each option
- Matches the *same* product across platforms even when naming differs (e.g. "Amul Taaza 500ml" vs "Amul Taaza Milk 500 ml")

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React (Next.js) + Tailwind CSS |
| Backend | Python, FastAPI |
| Scraping | Playwright (headless browser automation) |
| Product matching | rapidfuzz (fuzzy string matching) |
| Caching | Redis (in-memory dict fallback for local dev) |
| Storage | SQLite (product snapshots) |
| Deployment | Vercel |

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

**Flow:** user submits items + pincode → backend fires parallel scrape requests to all three platforms → raw results get normalized and fuzzy-matched into unified product entries → optimizer computes cheapest single-platform total and cheapest split-across-platforms total (including delivery fees) → frontend displays both.

---

## Key Technical Challenges Solved

1. **No public APIs** — prices are scraped via headless browser automation (Playwright), since these platforms render prices client-side and require a delivery location to be set first.
2. **Cross-platform product matching** — the same product is named differently on every app. Solved using fuzzy string matching (rapidfuzz) after normalizing brand names, quantities, and units.
3. **Apples-to-apples pricing** — pack sizes differ across platforms, so all prices are converted to a per-unit basis (₹/litre, ₹/kg) before comparison.
4. **Cost optimization** — the app doesn't just show the cheapest item price; it solves for cheapest *total* cost, factoring in each platform's delivery fee and free-delivery threshold.

---

## Screenshots

<!-- Add 2-3 screenshots or a short GIF here once you have them — e.g. the search screen, the comparison table, and the "best option" recommendation. This is often the first thing recruiters look at. -->

```
[ screenshot: item search + pincode entry ]
[ screenshot: price comparison table ]
[ screenshot: cheapest option recommendation ]
```

---

## Getting Started

> Want to try it without setup? Use the [live demo](https://quickbasket-q8i78uves-sakshishirke412-2825s-projects.vercel.app/) instead.

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (optional — falls back to in-memory cache if not running)

### Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # on Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
uvicorn main:app --reload
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000`.

### Environment variables
Create a `.env` file in `/backend`:
```
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=300
```

---

## Project Structure

```
.
├── backend/
│   ├── main.py                 # FastAPI app entrypoint
│   ├── scrapers/
│   │   ├── base.py             # common scraper interface
│   │   ├── blinkit.py
│   │   ├── zepto.py
│   │   └── instamart.py
│   ├── matching/
│   │   └── matcher.py          # fuzzy matching + unit normalization
│   ├── optimizer/
│   │   └── cost_optimizer.py   # single-platform vs split cost logic
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   └── package.json
└── README.md
```

---

## Roadmap

- [x] Phase 1: Single-platform scraper (Blinkit)
- [ ] Phase 2: Zepto + Instamart scrapers
- [ ] Phase 3: Cross-platform product matching
- [ ] Phase 4: Cost optimization (single vs split)
- [ ] Phase 5: Frontend UI
- [ ] Stretch: caching layer, out-of-stock handling, price-history tracking

---

## Notes on Scraping

This project scrapes publicly viewable pricing data for personal/educational purposes only. No login-gated content is accessed, and requests are rate-limited to avoid excessive load on the target sites. Selectors may break if the underlying platforms change their site structure — this is a known limitation of scraping-based approaches.

---

## License

MIT — feel free to fork and build on this.
