from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.permissions import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/users")
def list_all_users(admin=Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "email": u.email, "role": u.system_role, "status": u.subscription_status} for u in users]

@router.post("/make-admin/{user_id}")
def promote_user(user_id: int, admin=Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    user.system_role = "admin"
    db.commit()
    return {"message": f"{user.email} promoted to admin"}
