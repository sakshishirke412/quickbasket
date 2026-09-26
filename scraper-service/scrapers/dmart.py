"""DMart Ready platform scraper implementation."""

from __future__ import annotations

import logging
from typing import List

from models import Platform, ProductResult, Unit
from scrapers.base import BaseScraper

logger = logging.getLogger("quickbasket.scrapers.dmart")

SAMPLE_CATALOG: List[dict] = [
    {"name": "Amul Taaza Toned Milk (500 ml)", "brand": "Amul", "price": 26.0, "mrp": 28.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 1440, "keywords": ["milk", "amul", "toned", "doodh"]},
    {"name": "Amul Gold Full Cream Milk (500 ml)", "brand": "Amul", "price": 33.0, "mrp": 35.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 1440, "keywords": ["milk", "amul", "full", "cream", "gold"]},
    {"name": "Mother Dairy Toned Milk (1 L)", "brand": "Mother Dairy", "price": 51.0, "mrp": 56.0, "quantity": 1.0, "unit": Unit.l, "etaMinutes": 1440, "keywords": ["milk", "mother dairy", "toned", "1l"]},
    {"name": "Amul Salted Butter (100 g)", "brand": "Amul", "price": 53.0, "mrp": 60.0, "quantity": 100.0, "unit": Unit.g, "etaMinutes": 1440, "keywords": ["butter", "amul", "makhan"]},
    {"name": "Britannia Whole Wheat Bread (400 g)", "brand": "Britannia", "price": 47.0, "mrp": 55.0, "quantity": 400.0, "unit": Unit.g, "etaMinutes": 1440, "keywords": ["bread", "britannia", "brown", "wheat"]},
    {"name": "Aashirvaad Shudh Chakki Atta (5 kg)", "brand": "Aashirvaad", "price": 224.0, "mrp": 275.0, "quantity": 5.0, "unit": Unit.kg, "etaMinutes": 1440, "keywords": ["atta", "flour", "wheat", "aashirvaad"]},
    {"name": "Fortune Sunlite Refined Sunflower Oil (1 L)", "brand": "Fortune", "price": 132.0, "mrp": 165.0, "quantity": 1.0, "unit": Unit.l, "etaMinutes": 1440, "keywords": ["oil", "sunflower", "fortune", "tel"]},
    {"name": "India Gate Basmati Rice Feast Rozzana (5 kg)", "brand": "India Gate", "price": 418.0, "mrp": 580.0, "quantity": 5.0, "unit": Unit.kg, "etaMinutes": 1440, "keywords": ["rice", "basmati", "india gate"]},
    {"name": "Tata Salt Vacuum Evaporated (1 kg)", "brand": "Tata", "price": 25.0, "mrp": 28.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 1440, "keywords": ["salt", "tata", "namak"]},
    {"name": "Tata Sampann Toor Dal (1 kg)", "brand": "Tata Sampann", "price": 158.0, "mrp": 210.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 1440, "keywords": ["toor dal", "dal", "tata sampann"]},
    {"name": "Madhur Pure Sugar (1 kg)", "brand": "Madhur", "price": 47.0, "mrp": 60.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 1440, "keywords": ["sugar", "madhur", "chini"]},
    {"name": "Maggi 2-Minute Masala Noodles Pack of 4 (280 g)", "brand": "Nestle Maggi", "price": 49.0, "mrp": 56.0, "quantity": 280.0, "unit": Unit.g, "etaMinutes": 1440, "keywords": ["maggi", "noodles", "nestle"]},
    {"name": "Red Label Tea (500 g)", "brand": "Red Label", "price": 214.0, "mrp": 270.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 1440, "keywords": ["tea", "chai", "red label"]},
]


class DMartScraper(BaseScraper):
    platform = Platform.dmart
    base_url = "https://www.dmart.in"

    def search_mock(self, query: str, pincode: str) -> List[ProductResult]:
        q = query.lower().strip()
        tokens = [t for t in q.split() if t]
        matched: List[ProductResult] = []

        for i, item in enumerate(SAMPLE_CATALOG):
            name = item["name"].lower()
            brand = item["brand"].lower()
            keywords = item["keywords"]

            score = 0
            for t in tokens:
                if any(t in k for k in keywords) or t in name or t in brand:
                    score += 1

            if score > 0 or not tokens:
                term = item["name"].replace(" ", "+")
                matched.append(
                    ProductResult(
                        platform=self.platform,
                        productId=f"dmart-{i}-{q[:6]}",
                        name=item["name"],
                        brand=item["brand"],
                        price=item["price"],
                        mrp=item["mrp"],
                        quantity=item["quantity"],
                        unit=item["unit"],
                        inStock=True,
                        etaMinutes=item["etaMinutes"],
                        productUrl=f"https://www.dmart.in/search?searchTerm={term}",
                    )
                )

        return matched

    async def search_live(self, query: str, pincode: str) -> List[ProductResult]:
        logger.info("DMart live scraping not configured; falling back to mock")
        return self.search_mock(query, pincode)
