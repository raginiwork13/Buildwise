from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.schemas import NotificationResponse, NotificationStats
from app.services.notification_service import notification_service
from app.auth import get_current_user_id

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    category: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0,
    user_id: str = Depends(get_current_user_id)
):
    """Retrieve notifications for the authenticated persona, sorted newest first."""
    cat_val = category if isinstance(category, str) else None
    unread_val = bool(unread_only) if not hasattr(unread_only, 'default') else False
    lim_val = int(limit) if not hasattr(limit, 'default') else 50
    off_val = int(offset) if not hasattr(offset, 'default') else 0

    return notification_service.get_user_notifications(
        user_id=user_id,
        category=cat_val,
        unread_only=unread_val,
        limit=lim_val,
        offset=off_val
    )

@router.get("/unread-count")
def get_unread_count(user_id: str = Depends(get_current_user_id)):
    """Retrieve total unread notification count for the active header bell badge."""
    count = notification_service.get_unread_count(user_id)
    return {"user_id": user_id, "unread_count": count}

@router.get("/stats", response_model=NotificationStats)
def get_notification_stats(user_id: str = Depends(get_current_user_id)):
    """Retrieve category-wise notification metrics for the notification center."""
    return notification_service.get_stats(user_id)

@router.patch("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Mark a specific notification as read."""
    updated = notification_service.mark_as_read(notification_id, user_id)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Notification not found or unauthorized"
        )
    return updated

@router.post("/mark-all-read")
def mark_all_notifications_read(user_id: str = Depends(get_current_user_id)):
    """Mark all unread notifications for this user as read."""
    count = notification_service.mark_all_as_read(user_id)
    return {"status": "ok", "marked_read_count": count}

@router.delete("/{notification_id}")
def dismiss_notification(
    notification_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Dismiss a notification from the user's feed."""
    success = notification_service.dismiss_notification(notification_id, user_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Notification not found or unauthorized"
        )
    return {"status": "dismissed", "id": notification_id}
