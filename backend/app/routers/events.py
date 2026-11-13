from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    EnquiryEvent,
    QuotationEvent,
    MilestoneEvent,
    SupplierRFQEvent,
    NotificationCreate,
    NotificationCategory,
    MessageType
)
from app.services.notification_service import notification_service
from app.services.messaging_service import messaging_service
from app.auth import get_profile_info

router = APIRouter(prefix="/events", tags=["Marketplace Action Events"])

@router.post("/enquiry")
def handle_enquiry_event(event: EnquiryEvent):
    """
    Connects Enquiry actions (Submission, Shortlisting, Rejection)
    directly to notifications and chat threads.
    """
    pro_profile = get_profile_info(event.professional_id)
    cust_profile = get_profile_info(event.customer_id)

    if event.action == "submit":
        # 1. Notify Customer
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.customer_id,
                title=f"New Project Proposal from {event.professional_name}",
                message=f"{event.professional_name} expressed interest in '{event.project_title}': \"{event.pitch_message or 'Submitted enquiry with 10 credits deducted.'}\"",
                category=NotificationCategory.ENQUIRY,
                action_url=f"/project/{event.project_id}/enquiries",
                metadata={
                    "project_id": event.project_id,
                    "professional_id": event.professional_id,
                    "pitch_message": event.pitch_message
                }
            )
        )

        # 2. Open / update conversation thread with pitch
        messaging_service.create_or_get_conversation(
            creator_id=event.professional_id,
            participant_ids=[event.customer_id],
            project_id=event.project_id,
            context_type="project",
            context_title=event.project_title,
            title=f"{event.professional_name} & {cust_profile['full_name']}",
            initial_message=event.pitch_message or f"Hello, I have submitted my formal expression of interest for {event.project_title}."
        )

        return {"status": "enquiry_processed", "notified_user": event.customer_id}

    elif event.action == "shortlist":
        # 1. Notify Professional
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.professional_id,
                title=f"Shortlisted for {event.project_title}!",
                message=f"Congratulations! {cust_profile['full_name']} has shortlisted you for '{event.project_title}'. You can now submit your formal itemized quotation.",
                category=NotificationCategory.ENQUIRY,
                action_url=f"/project/{event.project_id}/quotation-create",
                metadata={
                    "project_id": event.project_id,
                    "customer_id": event.customer_id
                }
            )
        )

        # 2. Post system message to conversation
        conv = messaging_service.create_or_get_conversation(
            creator_id=event.customer_id,
            participant_ids=[event.professional_id],
            project_id=event.project_id,
            context_type="project",
            context_title=event.project_title
        )
        messaging_service.send_message(
            conversation_id=conv.id,
            sender_id=event.customer_id,
            content=f"⭐ {cust_profile['full_name']} shortlisted {event.professional_name} for formal quotation.",
            message_type=MessageType.SYSTEM
        )

        return {"status": "shortlist_processed", "notified_user": event.professional_id}

    elif event.action == "decline":
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.professional_id,
                title=f"Enquiry Update: {event.project_title}",
                message=f"The property owner has declined your proposal for '{event.project_title}'.",
                category=NotificationCategory.ENQUIRY,
                action_url=f"/project/{event.project_id}",
                metadata={"project_id": event.project_id}
            )
        )
        return {"status": "decline_processed", "notified_user": event.professional_id}

    raise HTTPException(status_code=400, detail=f"Unsupported enquiry action: {event.action}")


@router.post("/quotation")
def handle_quotation_event(event: QuotationEvent):
    """
    Connects Quotation actions (Submission, Revision, Acceptance, Rejection)
    directly to notifications and chat threads.
    """
    pro_profile = get_profile_info(event.professional_id)
    cust_profile = get_profile_info(event.customer_id)

    if event.action == "submit":
        # 1. Notify Customer
        formatted_price = f"₹{event.total_price:,.2f}" if event.total_price > 100000 else f"₹{event.total_price} Lakhs"
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.customer_id,
                title=f"New Quotation Submitted by {event.professional_name}",
                message=f"{event.professional_name} submitted an itemized quotation of {formatted_price} for '{event.project_title}'.",
                category=NotificationCategory.QUOTATION,
                action_url=f"/project/{event.project_id}/quotations/compare",
                metadata={
                    "quotation_id": event.quotation_id,
                    "project_id": event.project_id,
                    "total_price": event.total_price
                }
            )
        )

        # 2. Attach quote link card to conversation thread
        conv = messaging_service.create_or_get_conversation(
            creator_id=event.professional_id,
            participant_ids=[event.customer_id],
            project_id=event.project_id,
            context_type="project",
            context_title=event.project_title
        )
        messaging_service.send_message(
            conversation_id=conv.id,
            sender_id=event.professional_id,
            content=f"I have submitted our formal itemized quotation of {formatted_price} for your review.",
            message_type=MessageType.QUOTATION_LINK,
            metadata={"quotation_id": event.quotation_id, "amount": event.total_price}
        )

        return {"status": "quotation_submitted", "notified_user": event.customer_id}

    elif event.action == "accept":
        # 1. Notify Professional
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.professional_id,
                title="Contract Awarded! Quotation Accepted",
                message=f"🎉 Excellent news! {cust_profile['full_name']} accepted your quotation for '{event.project_title}'. The project has transitioned to In Progress.",
                category=NotificationCategory.QUOTATION,
                action_url=f"/project/{event.project_id}/workspace",
                metadata={
                    "quotation_id": event.quotation_id,
                    "project_id": event.project_id
                }
            )
        )

        # 2. Post celebratory system update in conversation
        conv = messaging_service.create_or_get_conversation(
            creator_id=event.customer_id,
            participant_ids=[event.professional_id],
            project_id=event.project_id,
            context_type="project",
            context_title=event.project_title
        )
        messaging_service.send_message(
            conversation_id=conv.id,
            sender_id=event.customer_id,
            content=f"🎉 Contract Officially Awarded to {event.professional_name}! Milestone schedule initiated.",
            message_type=MessageType.SYSTEM
        )

        return {"status": "quotation_accepted", "notified_user": event.professional_id}

    elif event.action == "reject":
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.professional_id,
                title=f"Quotation Status: {event.project_title}",
                message=f"{cust_profile['full_name']} did not select your quotation for '{event.project_title}'.",
                category=NotificationCategory.QUOTATION,
                action_url=f"/project/{event.project_id}",
                metadata={"quotation_id": event.quotation_id}
            )
        )
        return {"status": "quotation_rejected", "notified_user": event.professional_id}

    raise HTTPException(status_code=400, detail=f"Unsupported quotation action: {event.action}")


@router.post("/milestone")
def handle_milestone_event(event: MilestoneEvent):
    """
    Connects Milestone completions and Customer approvals
    directly to notifications and workspace updates.
    """
    cust_profile = get_profile_info(event.customer_id)
    pro_profile = get_profile_info(event.professional_id)

    if event.action == "submitted_for_verification":
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.customer_id,
                title=f"Milestone {event.sequence_order} Ready for Inspection",
                message=f"{pro_profile['company_name'] or pro_profile['full_name']} posted site updates for '{event.milestone_name}' ({event.project_title}). Review photos to verify payout release.",
                category=NotificationCategory.MILESTONE,
                action_url=f"/project/{event.project_id}/workspace",
                metadata={
                    "project_id": event.project_id,
                    "milestone_name": event.milestone_name,
                    "sequence_order": event.sequence_order
                }
            )
        )
        return {"status": "milestone_submitted", "notified_user": event.customer_id}

    elif event.action == "verified":
        notification_service.create_notification(
            NotificationCreate(
                user_id=event.professional_id,
                title=f"Milestone {event.sequence_order} Verified & Approved",
                message=f"✓ {cust_profile['full_name']} verified Milestone {event.sequence_order}: '{event.milestone_name}'. Staged disbursement of ₹{event.amount:,.2f} authorized.",
                category=NotificationCategory.MILESTONE,
                action_url=f"/project/{event.project_id}/workspace",
                metadata={
                    "project_id": event.project_id,
                    "milestone_name": event.milestone_name,
                    "sequence_order": event.sequence_order,
                    "amount": event.amount
                }
            )
        )
        return {"status": "milestone_verified", "notified_user": event.professional_id}

    raise HTTPException(status_code=400, detail=f"Unsupported milestone action: {event.action}")


@router.post("/supplier-rfq")
def handle_supplier_rfq_event(event: SupplierRFQEvent):
    """
    Connects Material Inquiries & RFQs directly to Supplier communication.
    Creates a dedicated product-linked conversation and notifies the supplier.
    """
    buyer_profile = get_profile_info(event.buyer_id)
    supplier_profile = get_profile_info(event.supplier_id)

    # 1. Create product-linked conversation between buyer and supplier
    conv = messaging_service.create_or_get_conversation(
        creator_id=event.buyer_id,
        participant_ids=[event.supplier_id],
        product_id=event.product_id,
        context_type="product_rfq",
        context_title=f"{event.product_name} (Qty: {event.quantity})",
        title=f"{supplier_profile.get('company_name') or supplier_profile['full_name']}",
        initial_message=event.notes or f"Hello, I would like to request bulk wholesale rates and delivery terms for {event.quantity} units of {event.product_name}."
    )

    # 2. Notify Supplier
    notification_service.create_notification(
        NotificationCreate(
            user_id=event.supplier_id,
            title=f"New Bulk Material RFQ from {event.buyer_name}",
            message=f"{event.buyer_name} ({event.buyer_role}) submitted an RFQ for {event.quantity} units of {event.product_name}.",
            category=NotificationCategory.SUPPLIER_ENQUIRY,
            action_url="/messages",
            metadata={
                "product_id": event.product_id,
                "product_name": event.product_name,
                "quantity": event.quantity,
                "conversation_id": conv.id
            }
        )
    )

    return {"status": "rfq_created", "conversation_id": conv.id, "notified_user": event.supplier_id}
