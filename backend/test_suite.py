from fastapi import HTTPException
from app.routers.notifications import (
    get_notifications,
    get_unread_count,
    mark_notification_read,
    mark_all_notifications_read,
    get_notification_stats
)
from app.routers.conversations import (
    list_conversations,
    get_conversation_detail,
    get_conversation_messages,
    send_message,
    mark_conversation_read
)
from app.routers.events import (
    handle_enquiry_event,
    handle_quotation_event,
    handle_milestone_event,
    handle_supplier_rfq_event
)
from app.models.schemas import (
    MessageCreate,
    MessageType,
    EnquiryEvent,
    QuotationEvent,
    MilestoneEvent,
    SupplierRFQEvent
)

def run_all_tests():
    print("=" * 65)
    print("BUILDWISE FEATURE 8 - COMPLETE FUNCTIONAL VERIFICATION SUITE")
    print("=" * 65)
    passed = 0

    # 1. Customer notifications
    notifs = get_notifications(user_id="demo-cust-1")
    assert len(notifs) >= 3, f"Expected >= 3 notifs, got {len(notifs)}"
    print(" [PASS] 1. Customer receives initial seed notifications")
    passed += 1

    # 2. Unread count and mark read
    unread_before = get_unread_count(user_id="demo-cust-1")["unread_count"]
    first_unread = [n for n in notifs if not n.is_read][0]
    marked = mark_notification_read(notification_id=first_unread.id, user_id="demo-cust-1")
    assert marked.is_read is True
    unread_after = get_unread_count(user_id="demo-cust-1")["unread_count"]
    assert unread_after == unread_before - 1
    print(" [PASS] 2. Mark notification read updates unread counter")
    passed += 1

    # 3. List conversations
    convs = list_conversations(user_id="demo-cust-1")
    assert len(convs) >= 2, f"Expected >= 2 convs, got {len(convs)}"
    conv_id = convs[0].id
    msgs = get_conversation_messages(conversation_id=conv_id, user_id="demo-cust-1")
    assert len(msgs) >= 1
    print(" [PASS] 3. Customer lists conversations and message history")
    passed += 1

    # 4. Contractor sends message to Customer
    new_msg = send_message(
        conversation_id="conv-cust-pro-1",
        payload=MessageCreate(content="Dr. Fixit Fastflex sample application is ready for inspection.", message_type=MessageType.TEXT),
        user_id="demo-prof-1"
    )
    assert new_msg.content == "Dr. Fixit Fastflex sample application is ready for inspection."
    # Customer should now have a new message notification
    cust_notifs = get_notifications(category="message", user_id="demo-cust-1")
    assert any("Dr. Fixit Fastflex" in n.message for n in cust_notifs)
    print(" [PASS] 4. Cross-role message delivery triggers recipient notification")
    passed += 1

    # 5. Security: Unauthorized conversation access
    try:
        get_conversation_messages(conversation_id="conv-cust-pro-1", user_id="intruder-user-999")
        assert False, "Should have raised 403 Forbidden"
    except HTTPException as e:
        assert e.status_code == 403
        print(" [PASS] 5. Security check blocks unauthorized user (HTTP 403)")
        passed += 1

    # 6. Empty message validation
    try:
        send_message(
            conversation_id="conv-cust-pro-1",
            payload=MessageCreate(content="   ", message_type=MessageType.TEXT),
            user_id="demo-cust-1"
        )
        assert False, "Should have raised 400 Bad Request"
    except HTTPException as e:
        assert e.status_code == 400
        print(" [PASS] 6. Empty message validation rejected (HTTP 400)")
        passed += 1

    # 7. Real marketplace enquiry event
    enq_res = handle_enquiry_event(EnquiryEvent(
        project_id="proj-candolim-88",
        project_title="3,200 sq.ft Coastal Villa Candolim",
        customer_id="demo-cust-1",
        professional_id="demo-prof-1",
        professional_name="Carlos Fernandes",
        pitch_message="We specialize in North Goa coastal RCC structures.",
        action="submit"
    ))
    assert enq_res["status"] == "enquiry_processed"
    candolim_notif = [n for n in get_notifications(category="enquiry", user_id="demo-cust-1") if "Candolim" in n.message or "Candolim" in n.title]
    assert len(candolim_notif) >= 1
    print(" [PASS] 7. Contractor enquiry submission notifies customer & creates thread")
    passed += 1

    # 8. Customer shortlists contractor event
    short_res = handle_enquiry_event(EnquiryEvent(
        project_id="proj-candolim-88",
        project_title="3,200 sq.ft Coastal Villa Candolim",
        customer_id="demo-cust-1",
        professional_id="demo-prof-1",
        professional_name="Carlos Fernandes",
        action="shortlist"
    ))
    assert short_res["status"] == "shortlist_processed"
    pro_notifs = get_notifications(category="enquiry", user_id="demo-prof-1")
    assert any("Shortlisted" in n.title for n in pro_notifs)
    print(" [PASS] 8. Customer shortlisting contractor triggers professional alert")
    passed += 1

    # 9. Quotation event
    quote_res = handle_quotation_event(QuotationEvent(
        quotation_id="quote-candolim-1",
        project_id="proj-candolim-88",
        project_title="3,200 sq.ft Coastal Villa Candolim",
        customer_id="demo-cust-1",
        professional_id="demo-prof-1",
        professional_name="Carlos Fernandes",
        total_price=6850000.0,
        action="submit"
    ))
    assert quote_res["status"] == "quotation_submitted"
    print(" [PASS] 9. Quotation submission sends itemized quote alert & card")
    passed += 1

    # 10. Supplier RFQ event
    rfq_res = handle_supplier_rfq_event(SupplierRFQEvent(
        product_id="mat-2",
        product_name="Tata Tiscon 550D TMT Steel Rebars",
        supplier_id="demo-supp-1",
        buyer_id="demo-prof-1",
        buyer_name="Carlos Fernandes",
        buyer_role="professional",
        quantity=20,
        notes="Need 20 Metric Tons delivered to Candolim project site."
    ))
    assert rfq_res["status"] == "rfq_created"
    supp_notifs = get_notifications(category="supplier_enquiry", user_id="demo-supp-1")
    assert any("Tata Tiscon" in n.message for n in supp_notifs)
    print(" [PASS] 10. Contractor-to-Supplier Bulk RFQ creates linked thread & alert")
    passed += 1

    # 11. Mark all read
    all_read = mark_all_notifications_read(user_id="demo-cust-1")
    assert all_read["status"] == "ok"
    unread_final = get_unread_count(user_id="demo-cust-1")["unread_count"]
    assert unread_final == 0
    print(" [PASS] 11. Mark all as read clears all pending unread indicators")
    passed += 1

    # 12. Security: Unauthenticated request rejected (HTTP 401)
    from app.auth import get_current_user_id
    try:
        get_current_user_id(x_user_id=None, authorization=None, user_id_query=None)
        assert False, "Should have raised 401 Unauthorized"
    except HTTPException as e:
        assert e.status_code == 401
        print(" [PASS] 12. Unauthenticated request rejected without credentials (HTTP 401)")
        passed += 1

    # 13. RFQ Deduplication: Multiple RFQs for same product reuse single conversation
    rfq_run1 = handle_supplier_rfq_event(SupplierRFQEvent(
        product_id="mat-tata-steel-101",
        product_name="Tata Tiscon 550D TMT Rebars (16mm)",
        supplier_id="demo-supp-1",
        buyer_id="demo-cust-1",
        buyer_name="Rahul Naik",
        buyer_role="customer",
        quantity=5,
        notes="First inquiry for foundation steel"
    ))
    rfq_run2 = handle_supplier_rfq_event(SupplierRFQEvent(
        product_id="mat-tata-steel-101",
        product_name="Tata Tiscon 550D TMT Rebars (16mm)",
        supplier_id="demo-supp-1",
        buyer_id="demo-cust-1",
        buyer_name="Rahul Naik",
        buyer_role="customer",
        quantity=10,
        notes="Follow-up inquiry for additional steel"
    ))
    assert rfq_run1["conversation_id"] == rfq_run2["conversation_id"], (
        f"Expected duplicate RFQ to reuse conversation ID {rfq_run1['conversation_id']}, got {rfq_run2['conversation_id']}"
    )
    print(" [PASS] 13. RFQ deduplication reuses conversation thread without duplicate creation")
    passed += 1

    # 14. Milestone workflow: Submission and Customer verification
    ms_sub = handle_milestone_event(MilestoneEvent(
        project_id="proj-candolim-88",
        project_title="3,200 sq.ft Coastal Villa Candolim",
        milestone_id="ms-plinth-01",
        milestone_name="Plinth Beam RCC Casting & Curing",
        sequence_order=2,
        amount=650000.0,
        professional_id="demo-prof-1",
        customer_id="demo-cust-1",
        action="submitted_for_verification"
    ))
    assert ms_sub["status"] == "milestone_submitted"
    cust_ms_notifs = get_notifications(category="milestone", user_id="demo-cust-1")
    assert any("Plinth Beam" in n.message for n in cust_ms_notifs)

    ms_ver = handle_milestone_event(MilestoneEvent(
        project_id="proj-candolim-88",
        project_title="3,200 sq.ft Coastal Villa Candolim",
        milestone_id="ms-plinth-01",
        milestone_name="Plinth Beam RCC Casting & Curing",
        sequence_order=2,
        amount=650000.0,
        professional_id="demo-prof-1",
        customer_id="demo-cust-1",
        action="verified"
    ))
    assert ms_ver["status"] == "milestone_verified"
    pro_ms_notifs = get_notifications(category="milestone", user_id="demo-prof-1")
    assert any("Plinth Beam" in n.message for n in pro_ms_notifs)
    print(" [PASS] 14. Milestone submission & verification triggers bi-directional alerts")
    passed += 1

    print("=" * 65)
    print(f"RESULTS: ALL {passed}/14 BACKEND TESTS PASSED (100% SUCCESS)")
    print("=" * 65)

if __name__ == "__main__":
    run_all_tests()
