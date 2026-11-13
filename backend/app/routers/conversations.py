from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from app.models.schemas import (
    ConversationResponse, 
    ConversationCreate, 
    MessageResponse, 
    MessageCreate
)
from app.services.messaging_service import messaging_service
from app.auth import get_current_user_id

router = APIRouter(prefix="/conversations", tags=["Conversations & Messaging"])

@router.get("", response_model=List[ConversationResponse])
def list_conversations(
    search: Optional[str] = None,
    user_id: str = Depends(get_current_user_id)
):
    """List all conversations for current user with unread counts and last message preview."""
    search_val = search if isinstance(search, str) else None
    return messaging_service.get_user_conversations(user_id=user_id, search=search_val)

@router.post("", response_model=ConversationResponse)
def create_or_get_conversation(
    payload: ConversationCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new conversation or open an existing thread with the specified participants."""
    return messaging_service.create_or_get_conversation(
        creator_id=user_id,
        participant_ids=payload.participant_ids,
        project_id=payload.project_id,
        title=payload.title,
        initial_message=payload.initial_message
    )

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation_detail(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Retrieve details and participants of a specific conversation."""
    return messaging_service.get_conversation(conversation_id=conversation_id, user_id=user_id)

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Retrieve full chronological message history for an authorized conversation."""
    return messaging_service.get_messages(conversation_id=conversation_id, user_id=user_id)

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
def send_message(
    conversation_id: str,
    payload: MessageCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Send a new message into a conversation with real-time broadcast and notification triggers."""
    if not payload.content or not payload.content.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content cannot be blank")

    return messaging_service.send_message(
        conversation_id=conversation_id,
        sender_id=user_id,
        content=payload.content.strip(),
        message_type=payload.message_type,
        metadata=payload.metadata
    )

@router.patch("/{conversation_id}/read")
def mark_conversation_read(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Update read timestamp for current user in the conversation."""
    success = messaging_service.mark_conversation_read(conversation_id=conversation_id, user_id=user_id)
    return {"status": "ok", "updated": success}
