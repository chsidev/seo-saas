from app.utils import verify_password, hash_password
from app.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/users", tags=["Users"])
@router.patch("/update")
def update_user(data: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    current_user.name = data.name
    db.commit()
    db.refresh(current_user)

    return {"message": "Profile updated successfully", "name": current_user.name}


@router.post("/change-password")
def change_password(data: schemas.ChangePassword, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    if not verify_password(data.currentPassword, current_user.password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password = hash_password(data.newPassword)
    db.commit()

    return {"message": "Password updated successfully"}

@router.delete("/delete-account")
def delete_account(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    db.delete(current_user)
    db.commit()

    # Clear auth cookie
    res = JSONResponse(content={"message": "Account deleted successfully"})
    res.delete_cookie("auth-token")

    return res