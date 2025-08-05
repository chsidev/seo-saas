import requests, os, certifi, urllib3
from bs4 import BeautifulSoup
from .base import BaseScraper

urllib3.disable_warnings()

class BingScraper(BaseScraper):
    def build_url(self, offset: int = 0) -> str:
        q = self.keyword.replace(" ", "+")
        return f"https://www.bing.com/search?q={q}&count=50&first={offset}"

    def scrape(self) -> str:
        headers = {
            "User-Agent": "Mozilla/5.0",
            "x-oxylabs-geo-location": "US"
        }

        print("[*] Sending request via Oxylabs Web Unblocker...")
        html_parts = []
        for offset in range(0, 100, 50):  
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
        for i, result in enumerate(soup.select("li.b_algo")):
            link = result.select_one("a")
            title = result.select_one("h2")
            snippet = result.select_one(".b_caption p")
            if not (title and link): continue
            results.append({
                "position": i + 1,
                "url": link["href"],
                "title": title.get_text(strip=True),
                "snippet": snippet.get_text(strip=True) if snippet else "",
            })
        return results
