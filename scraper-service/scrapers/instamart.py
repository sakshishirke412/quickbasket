"""Swiggy Instamart platform scraper implementation."""

from __future__ import annotations

import logging
from typing import List

from models import Platform, ProductResult, Unit
from scrapers.base import BaseScraper

logger = logging.getLogger("quickbasket.scrapers.instamart")

SAMPLE_CATALOG: List[dict] = [
    {"name": "Amul Taaza Toned Milk", "brand": "Amul", "price": 33.0, "mrp": 34.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 13, "keywords": ["milk", "amul", "toned", "doodh"]},
    {"name": "Mother Dairy Full Cream Milk", "brand": "Mother Dairy", "price": 46.0, "mrp": 47.0, "quantity": 500.0, "unit": Unit.ml, "etaMinutes": 13, "keywords": ["milk", "full", "cream", "mother"]},
    {"name": "Amul Masti Dahi Curd", "brand": "Amul", "price": 26.0, "mrp": 30.0, "quantity": 400.0, "unit": Unit.g, "etaMinutes": 13, "keywords": ["curd", "dahi", "yogurt", "amul"], "inStock": False},
    {"name": "Amul Salted Butter", "brand": "Amul", "price": 57.0, "mrp": 62.0, "quantity": 100.0, "unit": Unit.g, "etaMinutes": 13, "keywords": ["butter", "amul", "makhan"]},
    {"name": "Britannia Whole Wheat Bread", "brand": "Britannia", "price": 52.0, "mrp": 60.0, "quantity": 400.0, "unit": Unit.g, "etaMinutes": 14, "keywords": ["bread", "britannia", "wheat", "pav"]},
    {"name": "Farm Eggs (Pack of 12)", "brand": "Eggoz", "price": 149.0, "mrp": 168.0, "quantity": 12.0, "unit": Unit.pc, "etaMinutes": 16, "keywords": ["eggs", "egg", "anda", "pack"]},
    {"name": "Fresh Banana", "brand": "Instamart", "price": 36.0, "mrp": 45.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 15, "keywords": ["banana", "bananas", "kela"]},
    {"name": "Fresh Onion", "brand": "Instamart", "price": 35.0, "mrp": 42.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 17, "keywords": ["onion", "onions", "pyaaz", "kanda"]},
    {"name": "Fresh Tomato", "brand": "Instamart", "price": 27.0, "mrp": 33.0, "quantity": 500.0, "unit": Unit.g, "etaMinutes": 17, "keywords": ["tomato", "tomatoes", "tamatar"]},
    {"name": "Fresh Potato", "brand": "Instamart", "price": 36.0, "mrp": 45.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 17, "keywords": ["potato", "potatoes", "aloo", "alu", "batata"]},
    {"name": "Pillsbury Chakki Fresh Atta", "brand": "Pillsbury", "price": 65.0, "mrp": 72.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 14, "keywords": ["atta", "flour", "wheat", "pillsbury"]},
    {"name": "Tata Salt", "brand": "Tata", "price": 29.0, "mrp": 30.0, "quantity": 1.0, "unit": Unit.kg, "etaMinutes": 14, "keywords": ["salt", "tata", "namak"]},
    {"name": "Fortune Sunflower Oil", "brand": "Fortune", "price": 152.0, "mrp": 175.0, "quantity": 1.0, "unit": Unit.l, "etaMinutes": 17, "keywords": ["oil", "sunflower", "fortune", "tel"]},
    {"name": "Maggi 2-Minute Masala Noodles", "brand": "Nestle", "price": 14.0, "mrp": 14.0, "quantity": 70.0, "unit": Unit.g, "etaMinutes": 12, "keywords": ["maggi", "noodles", "nestle"]},
    {"name": "Nescafe Classic Coffee", "brand": "Nescafe", "price": 149.0, "mrp": 160.0, "quantity": 50.0, "unit": Unit.g, "etaMinutes": 14, "keywords": ["coffee", "nescafe"]},
    {"name": "Thums Up Soft Drink", "brand": "Thums Up", "price": 39.0, "mrp": 40.0, "quantity": 750.0, "unit": Unit.ml, "etaMinutes": 12, "keywords": ["thums", "up", "coke", "drink"]},
]


class InstamartScraper(BaseScraper):
    platform = Platform.instamart
    base_url = "https://www.swiggy.com/instamart"

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
                        productId=f"instamart-{i}-{q[:6]}",
                        name=item["name"],
                        brand=item["brand"],
                        price=item["price"],
                        mrp=item["mrp"],
                        quantity=item["quantity"],
                        unit=item["unit"],
                        inStock=item.get("inStock", True),
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
                    f"https://www.swiggy.com/dapi/restaurants/search/v3?lat=18.9220&lng=72.8347&str={query}",
                    headers=headers,
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = []
                    for item in data.get("data", {}).get("suggestions", []):
                        results.append(
                            ProductResult(
                                platform=self.platform,
                                productId=str(item.get("id")),
                                name=item.get("text", "Product"),
                                brand="",
                                price=50.0,
                                mrp=55.0,
                                quantity=1.0,
                                unit=Unit.pc,
                                inStock=True,
                                etaMinutes=15,
                            )
                        )
                    if results:
                        return results
        except Exception as e:
            logger.warning(f"Instamart live search error: {e}. Falling back to mock catalog.")

        return self.search_mock(query, pincode)

