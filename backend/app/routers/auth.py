from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.orm import Session
from typing import Optional
from app import models, schemas, utils
from app.database import get_db
from app.dependencies import get_current_user
from app.email import send_verification_email
from app.schemas import ResendEmailSchema
from datetime import datetime, timedelta

import os

router = APIRouter(tags=["Auth"])

serializer = URLSafeTimedSerializer(os.getenv("JWT_SECRET_KEY", "supersecret"))

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed_pw = utils.hash_password(user.password)
    # new_user = models.User(email=user.email, password=hashed_pw, name=user.name)
    new_user = models.User(
        email=user.email,
        password=hashed_pw,
        name=user.name,
        subscription_plan="starter",
        billing_method="myfatoorah",
        trial_ends_at=datetime.utcnow() + timedelta(days=14)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = serializer.dumps(user.email, salt="email-verify")
    send_verification_email(user.email, token)

    return {"message": "Registration successful. Please check your email to verify."}

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        email = serializer.loads(token, salt="email-verify", max_age=3600)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    db.commit()

    return {"message": f"{email} verified successfully!"}

@router.post("/resend-verification")
def resend_verification(data: ResendEmailSchema, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    token = serializer.dumps(data.email, salt="email-verify")
    send_verification_email(data.email, token)

    return {"message": "Verification email resent"}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not utils.verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not db_user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first.")
    
    token = utils.create_access_token(data={"sub": str(db_user.id)})
    # return {
    #     "user": {
    #         "id": db_user.id,
    #         "email": db_user.email,
    #         "name": db_user.name,
    #         "is_verified": db_user.is_verified
    #     },
    #     "token": token
    # }
    response = JSONResponse(content={
        "user": {
            "id": db_user.id,
            "email": db_user.email,
            "name": db_user.name,
            "is_verified": db_user.is_verified
        }
    })
    response.set_cookie(
        key="auth-token",
        value=token,
        httponly=True,
        samesite="Lax",
        secure=False  # Set to True on production with HTTPS
    )
    return response

@router.get("/me")
def get_profile(request: Request, user: Optional[models.User] = Depends(get_current_user)):
    print("✅ Cookie:", request.cookies.get("auth-token"))
    
    if user is None:
        return JSONResponse(status_code=200, content=None)
    
    return {        
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "is_verified": user.is_verified,
        "subscription_plan": user.subscription_plan,
        "subscription_status": user.subscription_status,
        "trial_ends_at": user.trial_ends_at.isoformat() if user.trial_ends_at else None
    }

@router.post("/logout")
def logout(response: Response):
    response = JSONResponse(content={"message": "Logged out successfully."})
    response.delete_cookie(key="auth-token")
    return response