from fastapi import Depends, HTTPException
from app.dependencies import get_current_user
from app.models import SystemRole

def require_admin(user=Depends(get_current_user)):
    if user.system_role != SystemRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
