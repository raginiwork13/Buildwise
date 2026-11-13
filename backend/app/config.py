import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "BuildWise API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    
    # Supabase credentials (Service-role key for backend only, never exposed to frontend)
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_KEY", ""))
    
    # Storage upload directories / local fallback
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    
    # Storage bucket names
    BUCKET_PROFILE_IMAGES: str = "profile-images"
    BUCKET_PORTFOLIO_MEDIA: str = "portfolio-media"
    BUCKET_PRODUCT_MEDIA: str = "product-media"
    BUCKET_PROF_DOCS: str = "professional-documents"
    BUCKET_VERIF_DOCS: str = "verification-documents"
    
    # Google AI Studio / Gemini API Key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

settings = Settings()
