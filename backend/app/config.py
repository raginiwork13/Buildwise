import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    APP_NAME: str = "BuildWise API"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "your-anon-or-service-key")
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]

settings = Settings()

