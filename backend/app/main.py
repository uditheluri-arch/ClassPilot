from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, student, faculty, academic, exams, assignments

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="ClassPilot - Smart Academic Management System Backend API. Tagline: Learning. Managing. Growing.",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(student.router)
app.include_router(faculty.router)
app.include_router(academic.router)
app.include_router(exams.router)
app.include_router(assignments.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "step": "Step 2 - Complete Academic Management"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "docs_url": "/docs",
        "health_check": "/health"
    }
