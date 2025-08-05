import requests, os, urllib3
from bs4 import BeautifulSoup
from .base import BaseScraper

urllib3.disable_warnings()

class GoogleScraper(BaseScraper):
    def build_url(self) -> str:
        q = self.keyword.replace(" ", "+")
        return f"https://www.google.com/search?q={q}&hl=en&num=100"

    def scrape(self) -> str:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "x-oxylabs-geo-location": "United States"
        }

        print("[*] Sending request via Oxylabs Web Unblocker...")
        response = requests.get(
            self.build_url(),
            headers=headers,
            proxies=self.proxies,
            timeout=30,
            verify=False,
        )
        response.raise_for_status()
        return response.text

    def parse(self, html: str) -> list[dict]:
        soup = BeautifulSoup(html, "html.parser")
        results = []
        for i, result in enumerate(soup.select("div.tF2Cxc")):
            link = result.select_one("a")["href"]
            title = result.select_one("h3")
            snippet = result.select_one(".VwiC3b") or result.select_one(".IsZvec")
            if not (title and link): continue
            results.append({
                "position": i + 1,
                "url": link,
                "title": title.get_text(strip=True),
                "snippet": snippet.get_text(strip=True) if snippet else "",
            })
        return results
