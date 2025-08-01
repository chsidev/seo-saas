import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, projects, keywords, billing, myfatoorah, admin, team_invite, members
from app.database import Base, engine

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

Base.metadata.create_all(bind=engine)

origins = list(filter(None, [
    os.getenv("BASE_URL"),
    "http://localhost:3000",
]))

app = FastAPI()

# CORS (allow frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(members.router, prefix="/api", tags=["ProjectMembers"])
app.include_router(team_invite.router, prefix="/api")
app.include_router(keywords.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(billing.router, prefix="/api/billing", tags=["Billings"])
app.include_router(myfatoorah.router, prefix="/api/myfatoorah", tags=["MyFatoorah"])

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )