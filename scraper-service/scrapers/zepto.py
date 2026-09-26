"""Zepto platform scraper implementation."""

from __future__ import annotations

import logging
from typing import List

from models import Platform, ProductResult, Unit
from scrapers.base import BaseScraper

logger = logging.getLogger("quickbasket.scrapers.zepto")

SAMPLE_CATALOG: List[dict] = [
    {"name": "Amul Taaza Toned Milk", "brand": "Amul", "price": 34.0, "mrp": 34.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 9, "keywords": ["milk", "amul", "toned", "doodh"]},
    {"name": "Amul Gold Full Cream Milk", "brand": "Amul", "price": 43.0, "mrp": 45.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 9, "keywords": ["milk", "amul", "full", "cream", "gold"]},
    {"name": "Amul Masti Dahi Curd", "brand": "Amul", "price": 28.0, "mrp": 30.0, "quantity": 400.0, "unit": Unit.g, "etaMinutes": 9, "keywords": ["curd", "dahi", "yogurt", "amul"]},
    {"name": "Amul Salted Butter", "brand": "Amul", "price": 56.0, "mrp": 62.0, "quantity": 100.0, "unit": Unit.g, "etaMinutes": 9, "keywords": ["butter", "amul", "makhan"]},
    {"name": "Britannia Brown Bread", "brand": "Britannia", "price": 48.0, "mrp": 55.0, "quantity": 350.0, "unit": Unit.g, "etaMinutes": 10, "keywords": ["bread", "britannia", "brown", "pav"]},
    {"name": "Fresh Eggs (Pack of 10)", "brand": "WellCurve", "price": 115.0, "mrp": 130.0, "quantity": 10.0, "unit": Unit.pc, "etaMinutes": 11, "keywords": ["eggs", "egg", "anda", "pack"]},
    {"name": "Fresh Banana", "brand": "Zepto", "price": 44.0, "mrp": 55.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 11, "keywords": ["banana", "bananas", "kela"]},
    {"name": "Fresh Onion", "brand": "Zepto", "price": 30.0, "mrp": 40.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 12, "keywords": ["onion", "onions", "pyaaz", "kanda"]},
    {"name": "Fresh Tomato", "brand": "Zepto", "price": 32.0, "mrp": 38.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 12, "keywords": ["tomato", "tomatoes", "tamatar"]},
    {"name": "Fresh Potato", "brand": "Zepto", "price": 32.0, "mrp": 40.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 12, "keywords": ["potato", "potatoes", "aloo", "alu", "batata"]},
    {"name": "Aashirvaad Superior MP Atta", "brand": "Aashirvaad", "price": 59.0, "mrp": 70.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 10, "keywords": ["atta", "flour", "wheat", "aashirvaad"]},
    {"name": "Tata Salt", "brand": "Tata", "price": 27.0, "mrp": 30.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 10, "keywords": ["salt", "tata", "namak"]},
    {"name": "Fortune Sunflower Oil", "brand": "Fortune", "price": 149.0, "mrp": 175.0, "quantity": 1.0, "unit": Unit.l, "etaMinutes": 13, "keywords": ["oil", "sunflower", "fortune", "tel"]},
    {"name": "Maggi Masala Noodles", "brand": "Nestle", "price": 13.0, "mrp": 14.0, "quantity": 70.0, "unit": Unit.g, "etaMinutes": 9, "keywords": ["maggi", "noodles", "nestle"]},
    {"name": "Bru Instant Coffee", "brand": "Bru", "price": 132.0, "mrp": 150.0, "quantity": 50.0, "unit": Unit.g, "etaMinutes": 10, "keywords": ["coffee", "bru"]},
    {"name": "Coca-Cola Soft Drink", "brand": "Coca-Cola", "price": 38.0, "mrp": 40.0, "quantity": 750.0, "unit": Unit.ml, "etaMinutes": 9, "keywords": ["coke", "coca", "cola", "soft", "drink"]},
]


class ZeptoScraper(BaseScraper):
    platform = Platform.zepto
    base_url = "https://www.zeptonow.com"

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
                matched.append(
                    ProductResult(
                        platform=self.platform,
                        productId=f"zepto-{i}-{q[:6]}",
                        name=item["name"],
                        brand=item["brand"],
                        price=item["price"],
                        mrp=item["mrp"],
                        quantity=item["quantity"],
                        unit=item["unit"],
                        inStock=True,
                        etaMinutes=item["etaMinutes"],
                    )
                )

        return matched

    async def search_live(self, query: str, pincode: str) -> List[ProductResult]:
        try:
            import httpx
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0",
                "Accept": "application/json",
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    f"https://www.zeptonow.com/api/v1/search?query={query}",
                    headers=headers,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = []
                    for item in data.get("products", []):
                        results.append(
                            ProductResult(
                                platform=self.platform,
                                productId=str(item.get("id")),
                                name=item.get("name", "Product"),
                                brand=item.get("brand", ""),
                                price=float(item.get("price", 0)),
                                mrp=float(item.get("mrp", 0)),
                                quantity=float(item.get("quantity", 1)),
                                unit=Unit.g,
                                inStock=True,
                                etaMinutes=10,
                            )
                        )
                    if results:
                        return results
        except Exception as e:
            logger.warning(f"Zepto live search error: {e}. Falling back to mock catalog.")

        return self.search_mock(query, pincode)

