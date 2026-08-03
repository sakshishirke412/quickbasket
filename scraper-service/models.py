"""Data contracts shared with the Next.js app.

These mirror the TypeScript `ProductResult` / `Scraper` types in
`lib/scrapers/types.ts` so the FastAPI service is a drop-in real backend:
the Next.js `HttpScraper` (see `lib/scrapers/index.ts`) can POST to
`/search` and consume `ProductResult[]` without any transformation.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class Platform(str, Enum):
    blinkit = "blinkit"
    zepto = "zepto"
    instamart = "instamart"


class Unit(str, Enum):
    g = "g"
    kg = "kg"
    ml = "ml"
    l = "l"
    pc = "pc"


class ProductResult(BaseModel):
    """One product as returned by a platform search. Matches the TS interface."""

    platform: Platform
    productId: str
    name: str
    brand: str = ""
    price: float = Field(ge=0, description="current selling price in INR")
    mrp: float = Field(ge=0, description="listed MRP in INR (>= price)")
    quantity: float = Field(gt=0, description="numeric pack size, e.g. 500 for '500 g'")
    unit: Unit
    inStock: bool = True
    etaMinutes: int = Field(ge=0, description="delivery ETA in minutes")
    imageUrl: Optional[str] = None


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, description="e.g. 'Milk'")
    pincode: str = Field(pattern=r"^\d{6}$", description="6-digit Indian pincode")
    platforms: Optional[List[Platform]] = Field(
        default=None, description="restrict to a subset of platforms; defaults to all"
    )


class SearchResponse(BaseModel):
    query: str
    pincode: str
    results: List[ProductResult]
    mode: str = Field(description="'mock' or 'live'")
