from celery import Celery

celery_app = Celery(
    "seo_saas",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0",
)

celery_app.conf.task_routes = {
    "app.tasks.scrapper.*": {"queue": "scraper"},
}

@celery_app.task
def ping():
    return "pong"