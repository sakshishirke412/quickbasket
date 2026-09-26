"""Blinkit platform scraper implementation."""

from __future__ import annotations

import logging
from typing import List

from models import Platform, ProductResult, Unit
from scrapers.base import BaseScraper

logger = logging.getLogger("quickbasket.scrapers.blinkit")

SAMPLE_CATALOG: List[dict] = [
    {"name": "Amul Taaza Toned Milk", "brand": "Amul", "price": 33.0, "mrp": 34.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 11, "keywords": ["milk", "amul", "toned", "doodh"]},
    {"name": "Amul Gold Full Cream Milk", "brand": "Amul", "price": 44.0, "mrp": 45.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 11, "keywords": ["milk", "amul", "full", "cream", "gold"]},
    {"name": "Amul Masti Dahi Curd", "brand": "Amul", "price": 27.0, "mrp": 30.0, "quantity": 400.0, "unit": Unit.g, "etaMinutes": 11, "keywords": ["curd", "dahi", "yogurt", "amul"]},
    {"name": "Amul Salted Butter", "brand": "Amul", "price": 58.0, "mrp": 62.0, "quantity": 100.0, "unit": Unit.g, "etaMinutes": 11, "keywords": ["butter", "amul", "makhan"]},
    {"name": "Britannia Whole Wheat Bread", "brand": "Britannia", "price": 55.0, "mrp": 60.0, "quantity": 400.0, "unit": Unit.g, "etaMinutes": 12, "keywords": ["bread", "britannia", "wheat", "pav"]},
    {"name": "Farm Fresh Eggs (Pack of 6)", "brand": "Licious", "price": 84.0, "mrp": 99.0, "quantity": 6.0, "unit": Unit.pc, "etaMinutes": 14, "keywords": ["eggs", "egg", "anda", "licious"]},
    {"name": "Fresh Robusta Banana", "brand": "Fresho", "price": 39.0, "mrp": 49.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 13, "keywords": ["banana", "bananas", "kela"]},
    {"name": "Fresh Onion", "brand": "Fresho", "price": 33.0, "mrp": 40.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 15, "keywords": ["onion", "onions", "pyaaz", "kanda"]},
    {"name": "Hybrid Fresh Tomato", "brand": "Fresho", "price": 29.0, "mrp": 35.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 15, "keywords": ["tomato", "tomatoes", "tamatar"]},
    {"name": "Fresh Potato", "brand": "Fresho", "price": 34.0, "mrp": 42.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 15, "keywords": ["potato", "potatoes", "aloo", "alu", "batata"]},
    {"name": "Aashirvaad Superior MP Atta", "brand": "Aashirvaad", "price": 62.0, "mrp": 70.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 12, "keywords": ["atta", "flour", "wheat", "aashirvaad"]},
    {"name": "Tata Salt", "brand": "Tata", "price": 28.0, "mrp": 30.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 12, "keywords": ["salt", "tata", "namak"]},
    {"name": "Fortune Sunflower Oil", "brand": "Fortune", "price": 155.0, "mrp": 175.0, "quantity": 1.0, "unit": Unit.l, "etaMinutes": 15, "keywords": ["oil", "sunflower", "fortune", "tel"]},
    {"name": "Maggi 2-Minute Masala Noodles", "brand": "Nestle", "price": 14.0, "mrp": 14.0, "quantity": 70.0, "unit": Unit.g, "etaMinutes": 10, "keywords": ["maggi", "noodles", "nestle"]},
    {"name": "Nescafe Classic Coffee", "brand": "Nescafe", "price": 145.0, "mrp": 160.0, "quantity": 50.0, "unit": Unit.g, "etaMinutes": 12, "keywords": ["coffee", "nescafe"]},
    {"name": "Coca-Cola Soft Drink", "brand": "Coca-Cola", "price": 40.0, "mrp": 40.0, "quantity": 750.0, "unit": Unit.ml, "etaMinutes": 10, "keywords": ["coke", "coca", "cola", "soft", "drink"]},
]


class BlinkitScraper(BaseScraper):
    platform = Platform.blinkit
    base_url = "https://blinkit.com"

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
                        productId=f"blinkit-{i}-{q[:6]}",
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
        # Live endpoint: attempted via lightweight API header or fallback to mock if rate-limited
        try:
            import httpx
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0",
                "Accept": "application/json",
            }
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    f"https://blinkit.com/v1/search?q={query}&pincode={pincode}",
                    headers=headers,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    # Parse products if available
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
                                etaMinutes=12,
                            )
                        )
                    if results:
                        return results
        except Exception as e:
            logger.warning(f"Blinkit live search error: {e}. Falling back to mock catalog.")

        return self.search_mock(query, pincode)

