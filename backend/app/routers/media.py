from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import os
import uuid
import shutil
from app.config import settings

router = APIRouter(prefix="/media", tags=["media"])

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]
ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"]
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    bucket: str = Form("portfolio-media"),
    is_private: bool = Form(False)
):
    # Validate bucket
    valid_buckets = [
        settings.BUCKET_PROFILE_IMAGES,
        settings.BUCKET_PORTFOLIO_MEDIA,
        settings.BUCKET_PRODUCT_MEDIA,
        settings.BUCKET_PROF_DOCS,
        settings.BUCKET_VERIF_DOCS
    ]
    if bucket not in valid_buckets:
        bucket = settings.BUCKET_PORTFOLIO_MEDIA

    # Check file size & content type
    content_type = file.content_type or ""
    if is_private or "document" in bucket:
        if content_type not in ALLOWED_DOC_TYPES and not content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Only PDF and image documents are accepted")
    else:
        if content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP images are allowed")

    # Local fallback storage path
    bucket_dir = os.path.join(settings.UPLOAD_DIR, bucket)
    os.makedirs(bucket_dir, exist_ok=True)

    file_ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    unique_name = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(bucket_dir, unique_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # In production with live Supabase credentials, upload to Supabase Storage
    # For hackathon demonstration, serve locally or via static route
    file_url = f"/api/v1/media/files/{bucket}/{unique_name}"

    return {
        "file_name": file.filename,
        "bucket": bucket,
        "file_url": file_url,
        "is_private": is_private
    }

