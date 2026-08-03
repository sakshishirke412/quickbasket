"""Base scraper abstraction.

Every platform scraper implements `search()`. In MOCK mode it returns
representative data so the whole stack is runnable without hitting real,
bot-protected sites. In LIVE mode it drives a Playwright browser through the
real flow (set location by pincode -> search -> parse product cards).

Set the environment variable ``SCRAPER_MODE=live`` to attempt real scraping.
Live scraping of Blinkit/Zepto/Instamart is location-gated and aggressively
bot-protected, so run it locally (never on serverless) and expect to update
selectors as the sites change.
"""

from __future__ import annotations

import abc
import os
from typing import List

from models import Platform, ProductResult


def is_live_mode() -> bool:
    return os.getenv("SCRAPER_MODE", "mock").strip().lower() == "live"


class BaseScraper(abc.ABC):
    platform: Platform
    #: base URL of the platform's web app, used by the Playwright flow
    base_url: str

    async def search(self, query: str, pincode: str) -> List[ProductResult]:
        if is_live_mode():
            return await self.search_live(query, pincode)
        return self.search_mock(query, pincode)

    # --- mock -------------------------------------------------------------
    @abc.abstractmethod
    def search_mock(self, query: str, pincode: str) -> List[ProductResult]:
        """Return representative offline data for local development."""

    # --- live (Playwright) ------------------------------------------------
    async def search_live(self, query: str, pincode: str) -> List[ProductResult]:
        """Drive a real browser. Override `set_location` / `parse_cards`.

        The generic flow is the same across platforms; only the selectors and
        the location-setting UX differ, so subclasses override those hooks.
        """
        from playwright.async_api import async_playwright

        results: List[ProductResult] = []
        async with async_playwright() as pw:
            browser = await pw.chromium.launch(headless=True)
            context = await browser.new_context(
                locale="en-IN",
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/124.0 Safari/537.36"
                ),
            )
            page = await context.new_page()
            try:
                await page.goto(self.base_url, wait_until="domcontentloaded")
                await self.set_location(page, pincode)
                await self.perform_search(page, query)
                results = await self.parse_cards(page, query)
            finally:
                await context.close()
                await browser.close()
        return results

    async def set_location(self, page, pincode: str) -> None:  # noqa: ANN001
        raise NotImplementedError(
            f"{self.platform.value}: implement set_location() with the site's "
            "current location-picker selectors."
        )

    async def perform_search(self, page, query: str) -> None:  # noqa: ANN001
        raise NotImplementedError(
            f"{self.platform.value}: implement perform_search() with the site's "
            "current search-box selectors."
        )

    async def parse_cards(self, page, query: str) -> List[ProductResult]:  # noqa: ANN001
        raise NotImplementedError(
            f"{self.platform.value}: implement parse_cards() to read product "
            "cards into ProductResult objects."
        )
