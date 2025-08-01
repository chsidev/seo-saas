from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/projects/{project_id}/keywords",
    tags=["Keywords"]
)

@router.get("/", response_model=list[schemas.KeywordOut])
def get_keywords(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.Keyword).filter(models.Keyword.project_id == project_id).all()

@router.post("/", response_model=schemas.KeywordOut)
def create_keyword(project_id: int, keyword_data: schemas.KeywordCreate, db: Session = Depends(get_db)):
    keyword = models.Keyword(**keyword_data.dict(), project_id=project_id)
    db.add(keyword)
    db.commit()
    db.refresh(keyword)
    return keyword

@router.delete("/{keyword_id}")
def delete_keyword(project_id: int, keyword_id: int, db: Session = Depends(get_db)):
    keyword = db.query(models.Keyword).filter_by(id=keyword_id, project_id=project_id).first()
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")
    db.delete(keyword)
    db.commit()
    return {"detail": "Keyword deleted"}

@router.patch("/{keyword_id}", response_model=schemas.KeywordUpdate)
def update_keyword(project_id: int, keyword_id: int, keyword_data: schemas.KeywordCreate, db: Session = Depends(get_db)):
    keyword = db.query(models.Keyword).filter_by(id=keyword_id, project_id=project_id).first()
    if not keyword:
        raise HTTPException(status_code=404, detail="Keyword not found")

    update_data = keyword_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(keyword, key, value)

    db.commit()
    db.refresh(keyword)
    return keyword
