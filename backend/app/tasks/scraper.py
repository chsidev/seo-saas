# tasks/scraper.py
# from celery import shared_task
from app.celery_worker import celery_app
from app.database import get_db
from app.models import Project, Keyword, KeywordRanking, SearchEngine, DeviceType
from app.scrapers.google import GoogleScraper
from app.scrapers.bing import BingScraper
from app.scrapers.yahoo import YahooScraper
from sqlalchemy.orm import Session


# @shared_task
@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def run_rank_tracking_task(project_id: int, search_engines: list[str], region: str, device: str):
    db: Session = next(get_db())
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        print(f"[!] Project {project_id} not found.")
        return

    print(f"[*] Starting rank tracking for Project {project_id}: '{project.name}'")

    for keyword in project.keywords:
        for engine in search_engines:
            run_keyword_scrape.delay(
                keyword_id=keyword.id,
                project_id=project.id,
                engine=engine,
                region=region,
                device=device
            )

    print("[✓] All subtasks dispatched.")

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
# @shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, max_retries=3)
def run_keyword_scrape(keyword_id: int, project_id: int, engine: str, region: str, device: str):
    db: Session = next(get_db())
    keyword = db.query(Keyword).filter(Keyword.id == keyword_id).first()
    project = db.query(Project).filter(Project.id == project_id).first()

    if not keyword or not project:
        print(f"[!] Skipping task: invalid keyword {keyword_id} or project {project_id}")
        return
    
    scraper_cls = {
        "google": GoogleScraper,
        "bing": BingScraper,
        "yahoo": YahooScraper
    }.get(engine)

    if not scraper_cls:
        print(f"[!] Unsupported search engine: {engine}")
        return
    
    try:
        scraper = scraper_cls(keyword.name, region=region, device=device)
        html = scraper.scrape()
        results = scraper.parse(html)

        for result in results:
            if project.url in result["url"]:
                ranking = KeywordRanking(
                    keyword_id=keyword.id,
                    project_id=project.id,
                    search_engine=SearchEngine(engine.upper()),
                    region=region,
                    device=DeviceType(device.upper()),
                    position=result["position"],
                    url=result["url"],
                    title=result["title"],
                    snippet=result["snippet"]
                )
                db.add(ranking)
                db.commit()
                print(f"[✓] Recorded position {result['position']} for '{keyword.name}' on {engine}")
                break
        else:
            print(f"[x] Project URL not found in top 100 for '{keyword.name}' on {engine}")

    except Exception as e:
        print(f"[!] Error scraping {engine} for keyword '{keyword.name}': {str(e)}")
     

    # for keyword in project.keywords:
    #     for engine in search_engines:
    #         try:
    #             scraper = None
    #             if engine == "google":
    #                 scraper = GoogleScraper(keyword.name, region=region, device=device)
    #             elif engine == "bing":
    #                 scraper = BingScraper(keyword.name, region=region, device=device)
    #             elif engine == "yahoo":
    #                 scraper = YahooScraper(keyword.name, region=region, device=device)

    #             if scraper:
    #                 # scraper.set_target_url(project.url)
    #                 # scraper.set_proxies()  # Assumes you’ve implemented `set_proxies` in BaseScraper
    #                 html = scraper.scrape()
    #                 results = scraper.parse(html)

    #                 for result in results:
    #                     if project.url in result["url"]:
    #                         ranking = KeywordRanking(
    #                             keyword_id=keyword.id,
    #                             project_id=project.id,
    #                             search_engine=SearchEngine(engine.upper()),
    #                             region=region,
    #                             device=DeviceType(device.upper()),
    #                             position=result["position"],
    #                             url=result["url"],
    #                             title=result["title"],
    #                             snippet=result["snippet"]
    #                         )
    #                         db.add(ranking)
    #                         db.commit()
    #                         print(f"[+] Recorded position {result['position']} for '{keyword.name}' on {engine}")
    #                         break
    #         except Exception as e:
    #             print(f"[!] Error scraping {engine} for keyword '{keyword.name}': {str(e)}")

    # print("[✓] Rank tracking completed.")
