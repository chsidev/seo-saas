from abc import ABC, abstractmethod
import os

class BaseScraper(ABC):
    def __init__(self, keyword: str, region: str = "global", device: str = "desktop"):
        self.username = os.getenv('OXYLABS_USER')
        self.password = os.getenv('OXYLABS_PASSWORD')
        self.proxies = {
            'http': f"http://{self.username}:{self.password}@unblock.oxylabs.io:60000",
            'https': f"https://{self.username}:{self.password}@unblock.oxylabs.io:60000",
        }
        self.keyword = keyword
        self.region = region
        self.device = device.lower()

    @abstractmethod
    def scrape(self) -> list[dict]:
        """Method to perform the scraping operation."""
        pass

    @abstractmethod
    def parse(self, html: str) -> list[dict]:
        """Method to parse the HTML content and extract relevant data."""
        pass

    @abstractmethod
    def build_url(self) -> str:
        """Method to build the URL for the scraping request."""
        pass

    def get_country_code(self):
        return self.region if len(self.region) == 2 else "United States"
    