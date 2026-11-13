import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from app.models.schemas import (
    NotificationCategory,
    NotificationCreate,
    NotificationResponse,
    NotificationStats
)
from app.services.websocket_manager import ws_manager

class NotificationService:
    def __init__(self):
        # In-memory store fallback with persistent structure
        self._notifications: Dict[str, dict] = {}
        self._seed_initial_data()

    def _seed_initial_data(self):
        """Pre-seeds realistic Goan marketplace notifications for demo personas."""
        initial_seeds = [
            # Rahul Naik (Customer)
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo-cust-1",
                "title": "New Quotation Submitted",
                "message": "Carlos Fernandes (Fernandes & Sons) submitted an itemized quotation of ₹48.5 Lakhs for your Margao Villa.",
                "category": NotificationCategory.QUOTATION,
                "action_url": "/quotations/margin-villa",
                "metadata": {
                    "project_id": "proj-margao-1",
                    "project_title": "2,400 sq.ft Luxury Villa Margao",
                    "professional_name": "Carlos Fernandes",
                    "quotation_id": "quote-cf-101",
                    "amount": 4850000
                },
                "is_read": False,
                "is_dismissed": False,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo-cust-1",
                "title": "Site Milestone 2 Photo Log Uploaded",
                "message": "12 new high-res site photos were posted for Foundation Concrete Pouring by Carlos Fernandes.",
                "category": NotificationCategory.MILESTONE,
                "action_url": "/project/proj-margao-1/workspace",
                "metadata": {
                    "project_id": "proj-margao-1",
                    "milestone_name": "Foundation Concrete Pouring",
                    "sequence_order": 2,
                    "photos_count": 12
                },
                "is_read": False,
                "is_dismissed": False,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo-cust-1",
                "title": "Supplier RFQ Response Available",
                "message": "Mandovi Building Solutions replied with bulk pricing of ₹385/bag for UltraTech Weather Plus Cement.",
                "category": NotificationCategory.SUPPLIER_ENQUIRY,
                "action_url": "/materials",
                "metadata": {
                    "supplier_name": "Mandovi Building Solutions",
                    "product": "UltraTech Weather Plus Cement",
                    "unit_rate": 385
                },
                "is_read": True,
                "is_dismissed": False,
                "created_at": datetime.now(timezone.utc)
            },

            # Carlos Fernandes (Professional)
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo-prof-1",
                "title": "Project Lead Shortlisted!",
                "message": "Rahul Naik shortlisted your profile for the 2,400 sq.ft Margao Villa project. Prepare your formal quotation.",
                "category": NotificationCategory.ENQUIRY,
                "action_url": "/project/proj-margao-1/quotation-create",
                "metadata": {
                    "project_id": "proj-margao-1",
                    "project_title": "2,400 sq.ft Luxury Villa Margao",
                    "customer_name": "Rahul Naik"
                },
                "is_read": False,
                "is_dismissed": False,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo-prof-1",
                "title": "Customer Sent a Direct Message",
                "message": "Rahul Naik: 'Hi Carlos, can we review the foundation waterproofing specifications tomorrow?'",
                "category": NotificationCategory.MESSAGE,
                "action_url": "/messages",
                "metadata": {
                    "sender_name": "Rahul Naik",
                    "sender_id": "demo-cust-1"
                },
                "is_read": False,
                "is_dismissed": False,
                "created_at": datetime.now(timezone.utc)
            },

            # Sunil Silva (Supplier)
            {
                "id": str(uuid.uuid4()),
                "user_id": "demo-supp-1",
                "title": "New Bulk RFQ Received",
                "message": "Fernandes & Sons Civil Construction requested pricing for 15 Metric Tons of Tata Tiscon 550D TMT Steel.",
                "category": NotificationCategory.SUPPLIER_ENQUIRY,
                "action_url": "/messages",
                "metadata": {
                    "buyer_name": "Carlos Fernandes",
                    "buyer_role": "professional",
                    "product_name": "Tata Tiscon 550D TMT Steel",
                    "quantity": "15 MT"
                },
                "is_read": False,
                "is_dismissed": False,
                "created_at": datetime.now(timezone.utc)
            }
        ]

        for s in initial_seeds:
            self._notifications[s["id"]] = s

    def create_notification(self, payload: NotificationCreate) -> NotificationResponse:
        notif_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc)
        record = {
            "id": notif_id,
            "user_id": payload.user_id,
            "title": payload.title,
            "message": payload.message,
            "category": payload.category.value if hasattr(payload.category, 'value') else str(payload.category),
            "action_url": payload.action_url,
            "metadata": payload.metadata,
            "is_read": False,
            "is_dismissed": False,
            "created_at": created_at
        }
        self._notifications[notif_id] = record

        response = NotificationResponse(**record)

        # Broadcast live to connected browser WebSocket sessions
        ws_manager.send_to_user_sync(
            user_id=payload.user_id,
            event_type="notification_new",
            data=response.model_dump(mode="json")
        )

        return response

    def get_user_notifications(
        self,
        user_id: str,
        category: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> List[NotificationResponse]:
        try:
            limit = int(limit)
        except (ValueError, TypeError):
            limit = 50
        try:
            offset = int(offset)
        except (ValueError, TypeError):
            offset = 0

        results = [
            n for n in self._notifications.values()
            if n["user_id"] == user_id and not n.get("is_dismissed", False)
        ]

        if category and category != "all":
            results = [n for n in results if n["category"] == category]

        if unread_only:
            results = [n for n in results if not n["is_read"]]

        # Sort descending by creation date
        results.sort(key=lambda x: x["created_at"], reverse=True)

        sliced = results[offset : offset + limit]
        return [NotificationResponse(**r) for r in sliced]

    def get_unread_count(self, user_id: str) -> int:
        return sum(
            1 for n in self._notifications.values()
            if n["user_id"] == user_id and not n.get("is_read", False) and not n.get("is_dismissed", False)
        )

    def mark_as_read(self, notification_id: str, user_id: str) -> Optional[NotificationResponse]:
        notif = self._notifications.get(notification_id)
        if not notif or notif["user_id"] != user_id:
            return None

        notif["is_read"] = True
        response = NotificationResponse(**notif)

        ws_manager.send_to_user_sync(
            user_id=user_id,
            event_type="notification_read",
            data={"id": notification_id, "unread_count": self.get_unread_count(user_id)}
        )

        return response

    def mark_all_as_read(self, user_id: str) -> int:
        count = 0
        for notif in self._notifications.values():
            if notif["user_id"] == user_id and not notif["is_read"] and not notif.get("is_dismissed", False):
                notif["is_read"] = True
                count += 1

        ws_manager.send_to_user_sync(
            user_id=user_id,
            event_type="notification_all_read",
            data={"count": count, "unread_count": 0}
        )

        return count

    def dismiss_notification(self, notification_id: str, user_id: str) -> bool:
        notif = self._notifications.get(notification_id)
        if not notif or notif["user_id"] != user_id:
            return False

        notif["is_dismissed"] = True

        ws_manager.send_to_user_sync(
            user_id=user_id,
            event_type="notification_dismissed",
            data={"id": notification_id, "unread_count": self.get_unread_count(user_id)}
        )

        return True

    def get_stats(self, user_id: str) -> NotificationStats:
        user_notifs = [
            n for n in self._notifications.values()
            if n["user_id"] == user_id and not n.get("is_dismissed", False)
        ]
        total = len(user_notifs)
        unread = sum(1 for n in user_notifs if not n["is_read"])
        by_cat: Dict[str, int] = {}
        for n in user_notifs:
            cat = n["category"]
            by_cat[cat] = by_cat.get(cat, 0) + 1

        return NotificationStats(total=total, unread_count=unread, by_category=by_cat)

notification_service = NotificationService()
