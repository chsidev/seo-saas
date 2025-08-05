from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project
from app.tasks.scraper import run_rank_tracking_task
from app.dependencies import get_current_user
from app.schemas import ScrapeRequest
from starlette.status import HTTP_202_ACCEPTED

router = APIRouter(prefix="/projects", tags=["Scraper"])

@router.post("/{project_id}/scrape", status_code=HTTP_202_ACCEPTED)
def trigger_scrape(project_id: int, payload: ScrapeRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    run_rank_tracking_task.delay(
        project_id=project.id,
        search_engines=payload.search_engines,
        region=payload.region,
        device=payload.device
    )

    return {"message": "Rank tracking started"}
