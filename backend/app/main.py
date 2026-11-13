from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.routers import professionals, suppliers, admin, media

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="BuildWise - AI-Powered Construction Marketplace API"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for local uploads fallback
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/api/v1/media/files", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(professionals.router, prefix=settings.API_PREFIX)
app.include_router(suppliers.router, prefix=settings.API_PREFIX)
app.include_router(admin.router, prefix=settings.API_PREFIX)
app.include_router(media.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": "ok"
    }
