from fastapi import Depends, HTTPException, status, Cookie, Request
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app import models
from app.database import get_db
import os

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "supersecret")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(request: Request, db: Session = Depends(get_db)) -> models.User:
    token = request.cookies.get("auth-token")

    if not token:
        print(" No token in cookies")
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        print("✅ JWT decoded:", user_id)
        if user_id is None:
            return None
    except JWTError as e:
        print(" JWT Error:", e)
        return None

    user = db.query(models.User).filter(models.User.id == int(user_id)).first()
    if user is None:
        print(" No user found in DB")
        return None
    
    return user
