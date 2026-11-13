from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_notifications_for_customer():
    # Headers simulate active persona Rahul Naik (demo-cust-1)
    response = client.get(
        "/api/v1/notifications",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert response.status_code == 200
    notifs = response.json()
    assert isinstance(notifs, list)
    assert len(notifs) >= 2
    # Verify categories exist
    categories = [n["category"] for n in notifs]
    assert any(c in categories for c in ["quotation", "milestone", "supplier_enquiry"])

def test_unread_count_and_mark_read():
    # 1. Get initial count
    res_count = client.get(
        "/api/v1/notifications/unread-count",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert res_count.status_code == 200
    initial_unread = res_count.json()["unread_count"]

    # 2. Get a notification to mark read
    res_list = client.get(
        "/api/v1/notifications?unread_only=true",
        headers={"X-User-Id": "demo-cust-1"}
    )
    unread_notifs = res_list.json()
    if unread_notifs:
        target_id = unread_notifs[0]["id"]
        res_read = client.patch(
            f"/api/v1/notifications/{target_id}/read",
            headers={"X-User-Id": "demo-cust-1"}
        )
        assert res_read.status_code == 200
        assert res_read.json()["is_read"] is True

        # 3. Check count reduced
        res_count_after = client.get(
            "/api/v1/notifications/unread-count",
            headers={"X-User-Id": "demo-cust-1"}
        )
        assert res_count_after.json()["unread_count"] == initial_unread - 1

def test_list_conversations_and_messages():
    # Customer persona Rahul Naik
    res_convs = client.get(
        "/api/v1/conversations",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert res_convs.status_code == 200
    convs = res_convs.json()
    assert len(convs) >= 2  # Customer has villa conv with Carlos and tiles conv with Sunil

    first_conv = convs[0]
    conv_id = first_conv["id"]

    # Fetch messages
    res_msgs = client.get(
        f"/api/v1/conversations/{conv_id}/messages",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert res_msgs.status_code == 200
    msgs = res_msgs.json()
    assert len(msgs) >= 1
    # Check is_outgoing flag
    for m in msgs:
        if m["sender_id"] == "demo-cust-1":
            assert m["is_outgoing"] is True
        else:
            assert m["is_outgoing"] is False

def test_send_message_and_notification_delivery():
    # Carlos sends message to Rahul in conv-cust-pro-1
    conv_id = "conv-cust-pro-1"
    content = "Automated test: Foundations curing is proceeding according to schedule."
    
    res_send = client.post(
        f"/api/v1/conversations/{conv_id}/messages",
        headers={"X-User-Id": "demo-prof-1"},
        json={"content": content, "message_type": "text"}
    )
    assert res_send.status_code == 200
    msg = res_send.json()
    assert msg["content"] == content
    assert msg["sender_id"] == "demo-prof-1"

    # Verify recipient Rahul (demo-cust-1) received a message notification
    res_notifs = client.get(
        "/api/v1/notifications?category=message",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert res_notifs.status_code == 200
    notifs = res_notifs.json()
    assert any("Foundations curing" in n["message"] for n in notifs)

def test_security_unauthorized_conversation_access():
    # Someone not in conv-cust-pro-1 (e.g. random user 'user-unauthorized')
    res = client.get(
        "/api/v1/conversations/conv-cust-pro-1/messages",
        headers={"X-User-Id": "user-unauthorized"}
    )
    assert res.status_code == 403
    assert "Security" in res.json()["detail"]

def test_empty_message_validation():
    res = client.post(
        "/api/v1/conversations/conv-cust-pro-1/messages",
        headers={"X-User-Id": "demo-cust-1"},
        json={"content": "   ", "message_type": "text"}
    )
    assert res.status_code == 400

def test_enquiry_event_triggers_notification_and_thread():
    # Professional Carlos submits an enquiry for a new project
    event_payload = {
        "project_id": "proj-new-goa-88",
        "project_title": "3,000 sq.ft Portuguese Villa in Candolim",
        "customer_id": "demo-cust-1",
        "professional_id": "demo-prof-1",
        "professional_name": "Carlos Fernandes",
        "pitch_message": "We have 14 years of restoration experience in Candolim.",
        "action": "submit"
    }
    res_event = client.post("/api/v1/events/enquiry", json=event_payload)
    assert res_event.status_code == 200
    assert res_event.json()["status"] == "enquiry_processed"

    # Check that Customer received the enquiry notification
    res_notif = client.get(
        "/api/v1/notifications?category=enquiry",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert res_notif.status_code == 200
    notifs = res_notif.json()
    assert any("Portuguese Villa in Candolim" in n["title"] or "Candolim" in n["message"] for n in notifs)

def test_quotation_event_triggers_notification():
    # Professional Carlos submits a quotation
    event_payload = {
        "quotation_id": "quote-candolim-1",
        "project_id": "proj-new-goa-88",
        "project_title": "3,000 sq.ft Portuguese Villa in Candolim",
        "customer_id": "demo-cust-1",
        "professional_id": "demo-prof-1",
        "professional_name": "Carlos Fernandes",
        "total_price": 5400000.0,
        "action": "submit"
    }
    res_event = client.post("/api/v1/events/quotation", json=event_payload)
    assert res_event.status_code == 200

    # Customer notification check
    res_notif = client.get(
        "/api/v1/notifications?category=quotation",
        headers={"X-User-Id": "demo-cust-1"}
    )
    assert res_notif.status_code == 200
    notifs = res_notif.json()
    assert any("Portuguese Villa in Candolim" in n["title"] or "5,400,000" in n["message"] for n in notifs)

def test_supplier_rfq_event_triggers_supplier_conversation():
    # Customer sends RFQ to Sunil Silva (Supplier)
    rfq_payload = {
        "product_id": "mat-1",
        "product_name": "UltraTech Weather Plus Cement (50kg bag)",
        "supplier_id": "demo-supp-1",
        "buyer_id": "demo-cust-1",
        "buyer_name": "Rahul Naik",
        "buyer_role": "customer",
        "quantity": 250,
        "notes": "Need delivery to site in Margao within 5 days."
    }
    res_rfq = client.post("/api/v1/events/supplier-rfq", json=rfq_payload)
    assert res_rfq.status_code == 200
    conv_id = res_rfq.json()["conversation_id"]

    # Verify Supplier (demo-supp-1) can see the conversation
    res_supplier_convs = client.get(
        "/api/v1/conversations",
        headers={"X-User-Id": "demo-supp-1"}
    )
    assert res_supplier_convs.status_code == 200
    supplier_convs = res_supplier_convs.json()
    assert any(c["id"] == conv_id for c in supplier_convs)

    # Verify Supplier has the notification
    res_supp_notif = client.get(
        "/api/v1/notifications?category=supplier_enquiry",
        headers={"X-User-Id": "demo-supp-1"}
    )
    assert res_supp_notif.status_code == 200
    assert any("UltraTech Weather Plus" in n["message"] for n in res_supp_notif.json())
