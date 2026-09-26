from models import Platform
from scrapers.base import BaseScraper
from scrapers.blinkit import BlinkitScraper
from scrapers.zepto import ZeptoScraper
from scrapers.instamart import InstamartScraper
from scrapers.flipkart import FlipkartScraper
from scrapers.dmart import DMartScraper

SCRAPERS: dict[Platform, BaseScraper] = {
    Platform.blinkit: BlinkitScraper(),
    Platform.zepto: ZeptoScraper(),
    Platform.instamart: InstamartScraper(),
    Platform.flipkart: FlipkartScraper(),
    Platform.dmart: DMartScraper(),
}

__all__ = [
    "BaseScraper",
    "BlinkitScraper",
    "ZeptoScraper",
    "InstamartScraper",
    "FlipkartScraper",
    "DMartScraper",
    "SCRAPERS",
]

