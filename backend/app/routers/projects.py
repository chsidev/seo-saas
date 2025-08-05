from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(tags=["Projects"])

@router.post("/")
def create_project(data: schemas.ProjectCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = models.Project(
        name=data.name,
        url=data.url,
        description=data.description,
        search_engine=data.search_engine,
        target_region=data.target_region,
        language=data.language,
        owner_id=user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

# @router.get("/")
# def list_projects(db: Session = Depends(get_db), user=Depends(get_current_user)):
#     projects = db.query(models.Project).filter(models.Project.owner_id == user.id).all()
#     result = []
#     for p in projects:
#         keyword_count = db.query(models.Keyword).filter(models.Keyword.project_id == p.id).count()
#         result.append({
#             "id": p.id,
#             "name": p.name,
#             "url": p.url,
#             "description": p.description,
#             "is_paused": p.is_paused,
#             "language": p.language,
#             "target_region": p.target_region,
#             "search_engine": p.search_engine,
#             "created_at": p.created_at,
#             "updated_at": p.updated_at,
#             "keywords": keyword_count,
#         })
#     return result
@router.get("/")
def list_projects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    owned_projects = db.query(models.Project).filter(models.Project.owner_id == user.id).all()
    member_links = db.query(models.ProjectMember).options(joinedload(models.ProjectMember.project)).filter(models.ProjectMember.user_id == user.id).all()
    member_projects = [m.project for m in member_links if m.project.owner_id != user.id]

    all_projects = owned_projects + member_projects

    result = []
    for p in all_projects:
        keyword_count = db.query(models.Keyword).filter(models.Keyword.project_id == p.id).count()
        member_count = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == p.id).count()
        role = "owner" if p.owner_id == user.id else next((m.role for m in member_links if m.project_id == p.id), "viewer")
        result.append({
            "id": p.id,
            "name": p.name,
            "url": p.url,
            "description": p.description,
            "is_paused": p.is_paused,
            "language": p.language,
            "target_region": p.target_region,
            "search_engine": p.search_engine,
            "created_at": p.created_at,
            "updated_at": p.updated_at,
            "keywords": keyword_count,
            "members": member_count + 1,  # +1 for owner
            "role": role
        })
    return result

# def get_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
#     project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == user.id).first()
#     if not project:
#         raise HTTPException(status_code=404, detail="Not found")
#     return project
@router.get("/{project_id}", response_model=schemas.ProjectDetailOut)
def get_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Not found")

    is_owner = project.owner_id == user.id    
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first()
    # is_member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first()

    if not is_owner and not member:
        raise HTTPException(status_code=403, detail="Not authorized")

    # return project
    return {
        "id": project.id,
        "name": project.name,
        "url": project.url,
        "description": project.description,
        "is_paused": project.is_paused,
        "language": project.language,
        "target_region": project.target_region,
        "search_engine": project.search_engine,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "role": "owner" if is_owner else member.role if member else "viewer"
    }

@router.patch("/{project_id}")
def partial_update_project(project_id: int, data: schemas.ProjectUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Not found")
    
    is_owner = project.owner_id == user.id
    member = db.query(models.ProjectMember).filter_by(project_id=project_id, user_id=user.id).first()

    if not is_owner and not (member and member.role == "editor"):
        raise HTTPException(status_code=403, detail="You are not allowed to edit this project")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_id == user.id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(project)
    db.commit()
    return {"detail": "Deleted"}
