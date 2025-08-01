from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Text, Float, JSON, Enum, Table, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base
import enum


# -------------------------------
# ENUMS
# -------------------------------
class SystemRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPPORT = "support"

class UserRole(str, enum.Enum):
    OWNER = "owner"
    EDITOR = "editor"
    VIEWER = "viewer"

class SearchEngine(str, enum.Enum):
    GOOGLE = "Google"
    BING = "Bing"
    YAHOO = "Yahoo"

class DeviceType(str, enum.Enum):
    DESKTOP = "desktop"
    MOBILE = "mobile"

# -------------------------------
# USER MODEL
# -------------------------------
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    name = Column(String)
    is_verified = Column(Boolean, default=False)

    system_role = Column(Enum(SystemRole), default=SystemRole.USER)
    
    recurring_id = Column(String, nullable=True)
    subscription_plan = Column(String, default="starter")  
    subscription_status = Column(String, default="trial")  
    subscription_expires_at = Column(DateTime(timezone=True))
    billing_method = Column(String, default="myfatoorah")  
    subscription_interval = Column(String, default="monthly")  

    billing_history = relationship("BillingHistory", back_populates="user")
    projects = relationship("Project", back_populates="owner")
    team_memberships = relationship("ProjectMember", back_populates="user")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    trial_ends_at = Column(DateTime(timezone=True))


# -------------------------------
# PROJECT MODEL
# -------------------------------
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    search_engine = Column(Enum(SearchEngine), default=SearchEngine.GOOGLE)
    target_region = Column(String, default="global")
    language = Column(String, default="en")
    is_paused = Column(Boolean, default=False)
    email_alerts_enabled = Column(Boolean, default=True)

    rank_check_frequency = Column(String, default="weekly")
    
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="projects")
    keywords = relationship("Keyword", back_populates="project", cascade="all, delete")
    audits = relationship("SiteAudit", back_populates="project", cascade="all, delete")
    backlinks = relationship("Backlink", back_populates="project", cascade="all, delete")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete")
    invites = relationship("TeamInvite", back_populates="project", cascade="all, delete")

class BillingHistory(Base):
    __tablename__ = "billing_history"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    status = Column(String)  # e.g. "paid", "failed"
    plan = Column(String)
    provider = Column(String)  # "stripe" or "myfatoorah"
    date = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="billing_history")


# -------------------------------
# TEAM MEMBERSHIP MODEL
# -------------------------------
class ProjectMember(Base):
    __tablename__ = "project_members"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(Enum(UserRole), default=UserRole.EDITOR)

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="team_memberships")

    __table_args__ = (UniqueConstraint("project_id", "user_id", name="unique_project_user"),)

# -------------------------------
#  TEAM INVITE MODEL
# -------------------------------
class TeamInvite(Base):
    __tablename__ = "team_invites"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    inviter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email = Column(String, nullable=False, index=True)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    status = Column(String, default="pending") 
    token = Column(String, unique=True, index=True)
    created_at = Column(DateTime(timezone=True), default=func.now())

    project = relationship("Project", back_populates="invites")


# -------------------------------
# KEYWORDS MODEL
# -------------------------------
class Keyword(Base):
    __tablename__ = "keywords"
    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String, index=True, nullable=False)
    
    tag = Column(String, nullable=True)
    priority = Column(Integer, nullable=True)
    is_paused = Column(Boolean, default=False)

    last_checked = Column(DateTime)
    added_at = Column(DateTime, default=datetime.utcnow)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)

    project = relationship("Project", back_populates="keywords")
    rankings = relationship("KeywordRanking", back_populates="keyword")


# -------------------------------
# RANK TRACKING HISTORY
# -------------------------------
class KeywordRanking(Base):
    __tablename__ = "keyword_rankings"
    id = Column(Integer, primary_key=True)
    keyword_id = Column(Integer, ForeignKey("keywords.id"))
    search_engine = Column(Enum(SearchEngine))
    region = Column(String)  # e.g. "UAE"
    device = Column(Enum(DeviceType), default=DeviceType.DESKTOP)
    position = Column(Integer)
    title = Column(String)
    url = Column(String)
    snippet = Column(Text)
    checked_at = Column(DateTime, server_default=func.now())

    keyword = relationship("Keyword", back_populates="rankings")


# -------------------------------
# SITE AUDIT RESULT
# -------------------------------
class SiteAudit(Base):
    __tablename__ = "site_audits"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    url = Column(String)
    audit_type = Column(String)  # "lighthouse" or "custom"
    passed = Column(Boolean)
    score = Column(Float)
    details = Column(JSON)
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="audits")


# -------------------------------
# BACKLINKS
# -------------------------------
class Backlink(Base):
    __tablename__ = "backlinks"
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    anchor_text = Column(String)
    referring_url = Column(String)
    referring_domain = Column(String)
    dofollow = Column(Boolean)
    http_status = Column(Integer)
    context = Column(String)  # e.g. "footer", "body"
    ip_address = Column(String)
    discovered_at = Column(DateTime, server_default=func.now())

    project = relationship("Project", back_populates="backlinks")
