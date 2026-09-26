"""QuickBasket Scraper Microservice (FastAPI).

Provides high-performance price comparison endpoints across Blinkit, Zepto, and Instamart.
"""

from __future__ import annotations

import asyncio
import os
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models import Platform, ProductResult, SearchRequest, SearchResponse
from scrapers import SCRAPERS
from scrapers.base import is_live_mode

app = FastAPI(
    title="QuickBasket Scraper Microservice",
    description="FastAPI service comparing grocery prices across Blinkit, Zepto, and Instamart.",
    version="1.0.0",
)

# Allow local Next.js frontends to query directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "service": "QuickBasket Scraper Microservice",
        "version": "1.0.0",
        "platforms": [p.value for p in Platform],
        "mode": "live" if is_live_mode() else "mock",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "mode": "live" if is_live_mode() else "mock",
    }


@app.post("/search", response_model=SearchResponse)
async def search(req: SearchRequest):
    """Search for a product query across requested platforms (defaults to all)."""
    target_platforms = req.platforms or list(Platform)
    selected_scrapers = [SCRAPERS[p] for p in target_platforms if p in SCRAPERS]

    if not selected_scrapers:
        raise HTTPException(status_code=400, detail="No valid platforms specified.")

    async def _run_search(scraper) -> List[ProductResult]:
        try:
            return await scraper.search(req.query, req.pincode)
        except Exception:
            return []

    results_nested = await asyncio.gather(*[_run_search(s) for s in selected_scrapers])
    flat_results: List[ProductResult] = [item for sublist in results_nested for item in sublist]

    return SearchResponse(
        query=req.query,
        pincode=req.pincode,
        results=flat_results,
        mode="live" if is_live_mode() else "mock",
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

