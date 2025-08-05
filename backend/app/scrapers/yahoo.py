import requests, os, certifi, urllib3
from bs4 import BeautifulSoup
from .base import BaseScraper

urllib3.disable_warnings()

class YahooScraper(BaseScraper):
    def build_url(self, offset: int = 0) -> str:
        q = self.keyword.replace(" ", "+")
        return f"https://search.yahoo.com/search?p={q}&b={offset + 1}"

    def scrape(self) -> str:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "x-oxylabs-geo-location": "US"
        }

        print("[*] Sending request via Oxylabs Web Unblocker...")
        html_parts = []
        for offset in range(0, 100, 10):  
            response = requests.get(
                self.build_url(offset),
                headers=headers,
                proxies=self.proxies,
                timeout=30,
                verify=False,
            )
            response.raise_for_status()
            html_parts.append(response.text)
        return "\n".join(html_parts)

    def parse(self, html: str) -> list[dict]:
        soup = BeautifulSoup(html, "html.parser")
        results = []
        for i, result in enumerate(soup.select("div.dd.algo.algo-sr")):
            link = result.select_one("a")
            title = result.select_one("h3")
            snippet = result.select_one(".compText p")
            if not (title and link): continue
            results.append({
                "position": i + 1,
                "url": link["href"],
                "title": title.get_text(strip=True),
                "snippet": snippet.get_text(strip=True) if snippet else "",
            })
        return results
