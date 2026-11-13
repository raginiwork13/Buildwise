import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from fastapi import HTTPException, status
from app.models.schemas import (
    MessageType,
    ParticipantInfo,
    MessageResponse,
    ConversationResponse,
    NotificationCategory,
    NotificationCreate
)
from app.services.websocket_manager import ws_manager
from app.auth import get_profile_info

class MessagingService:
    def __init__(self):
        # In-memory stores with full schema compatibility
        self._conversations: Dict[str, dict] = {}
        self._participants: Dict[str, Dict[str, dict]] = {} # conversation_id -> {user_id: participant_dict}
        self._messages: Dict[str, List[dict]] = {} # conversation_id -> list of message_dict
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Seeds realistic cross-role conversations: Customer-Contractor, Contractor-Supplier, Customer-Supplier."""
        now = datetime.now(timezone.utc)

        # 1. Customer (Rahul) <-> Contractor (Carlos) regarding Margao Villa
        conv1_id = "conv-cust-pro-1"
        self._conversations[conv1_id] = {
            "id": conv1_id,
            "context_type": "project",
            "project_id": "proj-margao-1",
            "product_id": None,
            "context_title": "2,400 sq.ft Luxury Villa Margao",
            "title": "Carlos Fernandes (Fernandes & Sons)",
            "created_by": "demo-cust-1",
            "last_message_preview": "I have uploaded the Revised Rev 2 quotation with the updated waterproofing warranty terms.",
            "last_message_at": now,
            "created_at": now,
            "updated_at": now
        }

        self._participants[conv1_id] = {
            "demo-cust-1": {
                "user_id": "demo-cust-1",
                "role": "customer",
                "last_read_at": datetime.fromtimestamp(now.timestamp() - 3600, tz=timezone.utc),
                "is_pinned": True
            },
            "demo-prof-1": {
                "user_id": "demo-prof-1",
                "role": "professional",
                "last_read_at": now,
                "is_pinned": True
            }
        }

        self._messages[conv1_id] = [
            {
                "id": "msg-101",
                "conversation_id": conv1_id,
                "sender_id": "demo-cust-1",
                "content": "Hi Carlos, I reviewed your initial quotation. The civil rates look reasonable, but can you detail the waterproofing specifications for the coastal monsoon climate?",
                "message_type": MessageType.TEXT,
                "metadata": {},
                "created_at": datetime.fromtimestamp(now.timestamp() - 7200, tz=timezone.utc)
            },
            {
                "id": "msg-102",
                "conversation_id": conv1_id,
                "sender_id": "demo-prof-1",
                "content": "Hello Rahul! Absolutely. For coastal Margao properties, we apply Dr. Fixit Fastflex 2-component polymer waterproof coating followed by protective screed. It carries a 10-year warranty.",
                "message_type": MessageType.TEXT,
                "metadata": {},
                "created_at": datetime.fromtimestamp(now.timestamp() - 5400, tz=timezone.utc)
            },
            {
                "id": "msg-103",
                "conversation_id": conv1_id,
                "sender_id": "demo-prof-1",
                "content": "I have uploaded the Revised Rev 2 quotation with the updated waterproofing warranty terms.",
                "message_type": MessageType.QUOTATION_LINK,
                "metadata": {
                    "quotation_id": "quote-cf-102",
                    "amount": 4850000,
                    "version": 2
                },
                "created_at": now
            }
        ]

        # 2. Contractor (Carlos) <-> Supplier (Sunil) regarding TMT Steel RFQ
        conv2_id = "conv-pro-supp-1"
        self._conversations[conv2_id] = {
            "id": conv2_id,
            "context_type": "product_rfq",
            "project_id": "proj-margao-1",
            "product_id": "mat-2",
            "context_title": "Tata Tiscon 550D TMT Steel (15 MT)",
            "title": "Sunil Silva (Mandovi Building Supplies)",
            "created_by": "demo-prof-1",
            "last_message_preview": "We can dispatch 15 tons from Verna stockyard by Thursday at ₹62,000/ton.",
            "last_message_at": now,
            "created_at": now,
            "updated_at": now
        }

        self._participants[conv2_id] = {
            "demo-prof-1": {
                "user_id": "demo-prof-1",
                "role": "professional",
                "last_read_at": now,
                "is_pinned": False
            },
            "demo-supp-1": {
                "user_id": "demo-supp-1",
                "role": "supplier",
                "last_read_at": now,
                "is_pinned": False
            }
        }

        self._messages[conv2_id] = [
            {
                "id": "msg-201",
                "conversation_id": conv2_id,
                "sender_id": "demo-prof-1",
                "content": "Sunil, I need 15 Metric Tons of Tata Tiscon 550D (12mm and 16mm) for our Margao Villa foundation. What is your best wholesale delivery rate?",
                "message_type": MessageType.TEXT,
                "metadata": {"product_id": "mat-2"},
                "created_at": datetime.fromtimestamp(now.timestamp() - 3600, tz=timezone.utc)
            },
            {
                "id": "msg-202",
                "conversation_id": conv2_id,
                "sender_id": "demo-supp-1",
                "content": "We can dispatch 15 tons from Verna stockyard by Thursday at ₹62,000/ton. Includes delivery to Margao site and mill test certificates.",
                "message_type": MessageType.PRODUCT_RFQ,
                "metadata": {"unit_price": 62000, "unit": "metric ton", "quantity": 15},
                "created_at": now
            }
        ]

        # 3. Customer (Rahul) <-> Supplier (Sunil) regarding direct Tiles Enquiry
        conv3_id = "conv-cust-supp-1"
        self._conversations[conv3_id] = {
            "id": conv3_id,
            "context_type": "product_rfq",
            "project_id": "proj-margao-1",
            "product_id": "mat-4",
            "context_title": "Kajaria Vitrified Floor Tiles (800x1200mm)",
            "title": "Sunil Silva (Mandovi Building Supplies)",
            "created_by": "demo-cust-1",
            "last_message_preview": "Yes, we have 3,000 sq.ft in stock in the Matte Sand finish.",
            "last_message_at": datetime.fromtimestamp(now.timestamp() - 1800, tz=timezone.utc),
            "created_at": datetime.fromtimestamp(now.timestamp() - 3600, tz=timezone.utc),
            "updated_at": now
        }

        self._participants[conv3_id] = {
            "demo-cust-1": {
                "user_id": "demo-cust-1",
                "role": "customer",
                "last_read_at": now,
                "is_pinned": False
            },
            "demo-supp-1": {
                "user_id": "demo-supp-1",
                "role": "supplier",
                "last_read_at": datetime.fromtimestamp(now.timestamp() - 1800, tz=timezone.utc),
                "is_pinned": False
            }
        }

        self._messages[conv3_id] = [
            {
                "id": "msg-301",
                "conversation_id": conv3_id,
                "sender_id": "demo-cust-1",
                "content": "Hi Sunil, do you have sample pieces available for the Kajaria 800x1200mm matte floor tiles?",
                "message_type": MessageType.TEXT,
                "metadata": {},
                "created_at": datetime.fromtimestamp(now.timestamp() - 3600, tz=timezone.utc)
            },
            {
                "id": "msg-302",
                "conversation_id": conv3_id,
                "sender_id": "demo-supp-1",
                "content": "Yes, we have 3,000 sq.ft in stock in the Matte Sand finish. You can visit our Verna showroom or I can courier tile swatches to your Margao address.",
                "message_type": MessageType.TEXT,
                "metadata": {},
                "created_at": datetime.fromtimestamp(now.timestamp() - 1800, tz=timezone.utc)
            }
        ]

    def _format_conversation(self, conv: dict, current_user_id: str) -> ConversationResponse:
        conv_id = conv["id"]
        parts_dict = self._participants.get(conv_id, {})
        messages = self._messages.get(conv_id, [])

        # Calculate unread count for current user
        user_part = parts_dict.get(current_user_id)
        unread = 0
        if user_part:
            last_read = user_part.get("last_read_at", datetime.min.replace(tzinfo=timezone.utc))
            unread = sum(1 for m in messages if m["sender_id"] != current_user_id and m["created_at"] > last_read)

        # Build participant info list
        participants_info: List[ParticipantInfo] = []
        other_party_name = None
        for uid, p in parts_dict.items():
            profile = get_profile_info(uid)
            p_info = ParticipantInfo(
                user_id=uid,
                full_name=profile["full_name"],
                role=profile["role"],
                company_name=profile.get("company_name"),
                avatar_url=profile.get("avatar_url"),
                last_read_at=p.get("last_read_at", datetime.now(timezone.utc)),
                is_pinned=p.get("is_pinned", False)
            )
            participants_info.append(p_info)
            if uid != current_user_id:
                other_party_name = profile.get("company_name") or profile["full_name"]

        display_title = conv.get("context_title") or conv.get("title") or other_party_name or "Conversation"

        return ConversationResponse(
            id=conv["id"],
            project_id=conv.get("project_id"),
            project_title=conv.get("context_title"),
            title=display_title,
            created_by=conv["created_by"],
            participants=participants_info,
            last_message_preview=conv.get("last_message_preview"),
            last_message_at=conv.get("last_message_at", conv["created_at"]),
            unread_count=unread,
            created_at=conv["created_at"]
        )

    def get_user_conversations(self, user_id: str, search: Optional[str] = None) -> List[ConversationResponse]:
        results = []
        for conv_id, conv in self._conversations.items():
            parts = self._participants.get(conv_id, {})
            if user_id in parts:
                formatted = self._format_conversation(conv, user_id)
                if search:
                    q = search.lower()
                    if (q in formatted.title.lower() or 
                        (formatted.last_message_preview and q in formatted.last_message_preview.lower()) or
                        (formatted.project_title and q in formatted.project_title.lower())):
                        results.append(formatted)
                else:
                    results.append(formatted)

        # Sort descending by last_message_at
        results.sort(key=lambda x: x.last_message_at, reverse=True)
        return results

    def get_conversation(self, conversation_id: str, user_id: str) -> ConversationResponse:
        conv = self._conversations.get(conversation_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        parts = self._participants.get(conversation_id, {})
        if user_id not in parts:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Security: You are not an authorized participant in this conversation."
            )

        return self._format_conversation(conv, user_id)

    def get_messages(self, conversation_id: str, user_id: str) -> List[MessageResponse]:
        conv = self._conversations.get(conversation_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        parts = self._participants.get(conversation_id, {})
        if user_id not in parts:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail="Security: You are not authorized to view messages in this conversation."
            )

        raw_msgs = self._messages.get(conversation_id, [])
        formatted: List[MessageResponse] = []
        for m in raw_msgs:
            sender_profile = get_profile_info(m["sender_id"])
            formatted.append(MessageResponse(
                id=m["id"],
                conversation_id=conversation_id,
                sender_id=m["sender_id"],
                sender_name=sender_profile["full_name"],
                sender_role=sender_profile["role"],
                content=m["content"],
                message_type=m.get("message_type", MessageType.TEXT),
                metadata=m.get("metadata", {}),
                created_at=m["created_at"],
                is_outgoing=(m["sender_id"] == user_id)
            ))
        return formatted

    def send_message(
        self,
        conversation_id: str,
        sender_id: str,
        content: str,
        message_type: MessageType = MessageType.TEXT,
        metadata: Optional[dict] = None
    ) -> MessageResponse:
        conv = self._conversations.get(conversation_id)
        if not conv:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

        parts = self._participants.get(conversation_id, {})
        if sender_id not in parts:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security: Only confirmed participants can send messages."
            )

        now = datetime.now(timezone.utc)
        msg_id = f"msg-{uuid.uuid4().hex[:12]}"
        msg_record = {
            "id": msg_id,
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "content": content,
            "message_type": message_type,
            "metadata": metadata or {},
            "created_at": now
        }

        if conversation_id not in self._messages:
            self._messages[conversation_id] = []
        self._messages[conversation_id].append(msg_record)

        # Update conversation preview and timestamp
        conv["last_message_preview"] = content[:120]
        conv["last_message_at"] = now
        conv["updated_at"] = now

        # Update sender's last_read_at
        if sender_id in parts:
            parts[sender_id]["last_read_at"] = now

        sender_profile = get_profile_info(sender_id)
        response_data = MessageResponse(
            id=msg_id,
            conversation_id=conversation_id,
            sender_id=sender_id,
            sender_name=sender_profile["full_name"],
            sender_role=sender_profile["role"],
            content=content,
            message_type=message_type,
            metadata=metadata or {},
            created_at=now,
            is_outgoing=True
        )

        # Real-time WebSocket broadcasting to all participants
        participant_ids = list(parts.keys())
        ws_manager.broadcast_sync(
            user_ids=participant_ids,
            event_type="message_new",
            data={
                "message": response_data.model_dump(mode="json"),
                "conversation_id": conversation_id
            }
        )

        # Also trigger notification to other participants
        from app.services.notification_service import notification_service
        for recipient_id in participant_ids:
            if recipient_id != sender_id:
                notif_title = f"New message from {sender_profile['full_name']}"
                if conv.get("context_title"):
                    notif_title += f" ({conv['context_title']})"

                notification_service.create_notification(
                    NotificationCreate(
                        user_id=recipient_id,
                        title=notif_title,
                        message=content[:100] + ("..." if len(content) > 100 else ""),
                        category=NotificationCategory.MESSAGE,
                        action_url="/messages",
                        metadata={
                            "conversation_id": conversation_id,
                            "sender_id": sender_id,
                            "sender_name": sender_profile["full_name"]
                        }
                    )
                )

        return response_data

    def create_or_get_conversation(
        self,
        creator_id: str,
        participant_ids: list[str],
        project_id: Optional[str] = None,
        product_id: Optional[str] = None,
        context_type: str = "general",
        context_title: Optional[str] = None,
        title: Optional[str] = None,
        initial_message: Optional[str] = None
    ) -> ConversationResponse:
        all_participants = set(participant_ids)
        all_participants.add(creator_id)

        # Check if conversation already exists with this context and participants
        for conv_id, conv in self._conversations.items():
            existing_parts = set(self._participants.get(conv_id, {}).keys())
            if existing_parts == all_participants:
                # Same participants. Check context match
                if project_id and conv.get("project_id") == project_id:
                    if initial_message:
                        self.send_message(conv_id, creator_id, initial_message)
                    return self._format_conversation(conv, creator_id)
                elif product_id and conv.get("product_id") == product_id:
                    if initial_message:
                        self.send_message(conv_id, creator_id, initial_message)
                    return self._format_conversation(conv, creator_id)
                elif not project_id and not product_id and not conv.get("project_id") and not conv.get("product_id"):
                    if initial_message:
                        self.send_message(conv_id, creator_id, initial_message)
                    return self._format_conversation(conv, creator_id)

        # Create new conversation
        now = datetime.now(timezone.utc)
        conv_id = f"conv-{uuid.uuid4().hex[:12]}"
        new_conv = {
            "id": conv_id,
            "context_type": context_type,
            "project_id": project_id,
            "product_id": product_id,
            "context_title": context_title,
            "title": title,
            "created_by": creator_id,
            "last_message_preview": initial_message[:100] if initial_message else "Conversation started",
            "last_message_at": now,
            "created_at": now,
            "updated_at": now
        }
        self._conversations[conv_id] = new_conv

        parts_map = {}
        for uid in all_participants:
            profile = get_profile_info(uid)
            parts_map[uid] = {
                "user_id": uid,
                "role": profile["role"],
                "last_read_at": now,
                "is_pinned": False
            }
        self._participants[conv_id] = parts_map
        self._messages[conv_id] = []

        if initial_message:
            self.send_message(conv_id, creator_id, initial_message)

        formatted = self._format_conversation(new_conv, creator_id)

        # Notify participants of new conversation
        ws_manager.broadcast_sync(
            user_ids=list(all_participants),
            event_type="conversation_new",
            data=formatted.model_dump(mode="json")
        )

        return formatted

    def mark_conversation_read(self, conversation_id: str, user_id: str) -> bool:
        parts = self._participants.get(conversation_id, {})
        if user_id in parts:
            now = datetime.now(timezone.utc)
            parts[user_id]["last_read_at"] = now
            ws_manager.send_to_user_sync(
                user_id=user_id,
                event_type="conversation_read",
                data={"conversation_id": conversation_id, "last_read_at": now.isoformat()}
            )
            return True
        return False

messaging_service = MessagingService()
