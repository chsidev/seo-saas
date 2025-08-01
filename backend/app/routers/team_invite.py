from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import get_db
from app.email import send_team_invite_email
from app.dependencies import get_current_user
import secrets

router = APIRouter(prefix="/invites", tags=["TeamInvites"])


# ---------- Invite a team member ----------
@router.post("/projects/{project_id}/invite", response_model=schemas.TeamInviteOut)
def send_team_invite(project_id: int, invite: schemas.TeamInviteCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()

    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You are not the project owner")

    # Prevent duplicate invites
    existing = db.query(models.TeamInvite).filter_by(project_id=project_id, email=invite.email, status="pending").first()
    if existing:
        raise HTTPException(status_code=400, detail="Invite already sent to this email")

    token = secrets.token_urlsafe(24)
    new_invite = models.TeamInvite(
        project_id=project_id,
        inviter_id=user.id,
        email=invite.email,
        role=invite.role,
        token=token,
        status="pending"
    )
    db.add(new_invite)
    db.commit()
    db.refresh(new_invite)

    send_team_invite_email(to_email=invite.email, token=token, project_name=project.name)

    return new_invite

# ---------- Get list of invites for a project ----------
@router.get("/projects/{project_id}", response_model=list[schemas.TeamInviteOut])
def get_invites(project_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    project = db.query(models.Project).filter_by(id=project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    invites = db.query(models.TeamInvite).filter(models.TeamInvite.project_id == project_id).all()
    return invites

# ---------- Resend invite ----------
@router.post("/resend/{invite_id}")
def resend_invite(invite_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invite = db.query(models.TeamInvite).filter(models.TeamInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    project = db.query(models.Project).filter(models.Project.id == invite.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    if invite.status == "accepted":
        raise HTTPException(status_code=400, detail="Cannot resend accepted invite")

    send_team_invite_email(to_email=invite.email, token=invite.token, project_name=project.name)
    return {"message": "Invite resent successfully"}

# ---------- Update invite role ----------
@router.patch("/{invite_id}", response_model=schemas.TeamInviteOut)
def update_invite_role(invite_id: int, update: schemas.TeamInviteUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invite = db.query(models.TeamInvite).filter(models.TeamInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    project = db.query(models.Project).filter(models.Project.id == invite.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    invite.role = update.role
    db.commit()
    db.refresh(invite)
    return invite

# ---------- Delete invite ----------
@router.delete("/{invite_id}")
def delete_invite(invite_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invite = db.query(models.TeamInvite).filter(models.TeamInvite.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    project = db.query(models.Project).filter(models.Project.id == invite.project_id).first()
    if not project or project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(invite)
    db.commit()
    return {"message": "Invite removed"}

# ---------- Decline invite (by user) ----------
@router.post("/decline")
def decline_invite(req: schemas.AcceptInviteRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invite = db.query(models.TeamInvite).filter_by(token=req.token, email=user.email).first()
    if not invite or invite.status != "pending":
        raise HTTPException(status_code=404, detail="Invalid invite")

    invite.status = "declined"
    db.commit()
    return {"message": "Invite declined"}

# ---------- Accept Invite ----------
@router.post("/accept")
def accept_team_invite(req: schemas.AcceptInviteRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    invite = db.query(models.TeamInvite).filter(models.TeamInvite.token == req.token).first()
    print(f"Accepting invite: {invite.email}, user: {user.email}")

    if not invite or invite.status != "pending":
        raise HTTPException(status_code=404, detail="Invalid or expired invite")

    if invite.email != user.email:
        raise HTTPException(status_code=403, detail="This invite was not sent to your email")

    # Add user as project member if not already
    existing = db.query(models.ProjectMember).filter_by(project_id=invite.project_id, user_id=user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already a member of this project")

    new_member = models.ProjectMember(
        project_id=invite.project_id,
        user_id=user.id,
        role=invite.role
    )
    invite.status = "accepted"
    db.add(new_member)
    db.delete(invite)
    db.commit()

    return {"message": "You have joined the project successfully"}

# ---------- Get invite info (for user) ----------
# @router.get("/info")
# def get_invite_info(token: str, db: Session = Depends(get_db)):
#     invite = db.query(models.TeamInvite).filter_by(token=token).first()
#     if not invite or invite.status != "pending":
#         raise HTTPException(status_code=404, detail="Invite not found")

#     project = db.query(models.Project).filter_by(id=invite.project_id).first()

#     return {
#         "project_name": project.name,
#         "email": invite.email,
#         "role": invite.role,
#         "status": invite.status
#     }
@router.get("/info")
def get_invite_info(token: str, db: Session = Depends(get_db)):
    invite = db.query(models.TeamInvite).filter_by(token=token).first()
    if not invite or invite.status != "pending":
        raise HTTPException(status_code=404, detail="Invite not found")

    project = db.query(models.Project).filter_by(id=invite.project_id).first()
    inviter = db.query(models.User).filter_by(id=invite.inviter_id).first()  

    return {
        "id": invite.id,
        "email": invite.email,
        "role": invite.role,
        "status": invite.status,
        "project": {
            "id": project.id,
            "name": project.name
        },
        "inviter": {
            "name": inviter.name,
            "email": inviter.email
        }
    }
