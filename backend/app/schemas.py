from pydantic import BaseModel, EmailStr
from typing import Optional,  Literal
from datetime import datetime
from app.models import SearchEngine, UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ProjectCreate(BaseModel):
    name: str
    url: str
    description: Optional[str] = None
    search_engine: SearchEngine = SearchEngine.GOOGLE
    target_region: Optional[str] = "global"
    language: Optional[str] = "en"
    is_paused: Optional[bool] = False
    email_alerts_enabled: Optional[bool] = True
    rank_check_frequency: Optional[str] = "weekly"

class ProjectOut(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    target_region: Optional[str] = None
    search_engine: Optional[SearchEngine] = None
    is_paused: Optional[bool] = None
    email_alerts_enabled: Optional[bool] = None
    rank_check_frequency: Optional[Literal["daily", "weekly", "monthly"]] = None


class ResendEmailSchema(BaseModel):
    email: EmailStr


class KeywordCreate(BaseModel):
    keyword: str
    tag: Optional[str] = None
    priority: Optional[int] = None
    is_paused: Optional[bool] = False

class KeywordUpdate(BaseModel):
    keyword: Optional[str] = None
    tag: Optional[str] = None
    priority: Optional[int] = None
    is_paused: Optional[bool] = None

class KeywordOut(KeywordCreate):
    id: int
    project_id: int
    added_at: datetime

    class Config:
        orm_mode = True

class TeamInviteCreate(BaseModel):
    email: EmailStr
    role: UserRole = UserRole.VIEWER

class TeamInviteOut(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    status: str
    created_at: datetime

    class Config:
        orm_mode = True

class TeamInviteUpdate(BaseModel):
    role: UserRole

class AcceptInviteRequest(BaseModel):
    token: str

class ProjectMemberUpdate(BaseModel):
    role: UserRole  

class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str

    class Config:
        orm_mode = True

class ProjectMemberOut(BaseModel):
    id: int
    role: UserRole
    user: UserOut

    class Config:
        orm_mode = True

class ProjectOutWithMembers(ProjectOut):
    members: list[ProjectMemberOut]

