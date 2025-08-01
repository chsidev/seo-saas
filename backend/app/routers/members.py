from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/members", tags=["ProjectMembers"])

# ---------- Get accepted members of a project ----------
@router.get("/projects/{project_id}", response_model=list[schemas.ProjectMemberOut])
def get_project_members(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    members = db.query(models.ProjectMember).options(
        joinedload(models.ProjectMember.user)
    ).filter(
        models.ProjectMember.project_id == project_id
    ).all()

    return members

# ---------- Update a member's role ----------
@router.patch("/{member_id}", response_model=schemas.ProjectMemberOut)
def update_member_role(member_id: int, update: schemas.ProjectMemberUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    member = db.query(models.ProjectMember).filter(models.ProjectMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    project = db.query(models.Project).filter(models.Project.id == member.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    member.role = update.role
    db.commit()
    db.refresh(member)
    return member

# ---------- Remove a member ----------
@router.delete("/{member_id}")
def delete_member(member_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    member = db.query(models.ProjectMember).filter(models.ProjectMember.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    project = db.query(models.Project).filter(models.Project.id == member.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(member)
    db.commit()
    return {"message": "Member removed"}
