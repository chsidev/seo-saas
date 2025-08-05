from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/rankings", tags=["Keyword Rankings"])

@router.post("/", response_model=schemas.KeywordRankingOut)
def create_ranking(ranking: schemas.KeywordRankingCreate, db: Session = Depends(get_db)):
    db_ranking = models.KeywordRanking(**ranking.dict())
    db.add(db_ranking)
    db.commit()
    db.refresh(db_ranking)
    return db_ranking

@router.get("/project/{project_id}", response_model=list[schemas.KeywordRankingOut])
def get_rankings_by_project(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.KeywordRanking).filter(models.KeywordRanking.project_id == project_id).all()

@router.get("/keyword/{keyword_id}", response_model=list[schemas.KeywordRankingOut])
def get_rankings_by_keyword(keyword_id: int, db: Session = Depends(get_db)):
    return db.query(models.KeywordRanking).filter(models.KeywordRanking.keyword_id == keyword_id).all()

@router.delete("/{ranking_id}")
def delete_ranking(ranking_id: int, db: Session = Depends(get_db)):
    ranking = db.query(models.KeywordRanking).get(ranking_id)
    if not ranking:
        raise HTTPException(status_code=404, detail="Ranking not found")
    db.delete(ranking)
    db.commit()
    return {"detail": "Ranking deleted"}
