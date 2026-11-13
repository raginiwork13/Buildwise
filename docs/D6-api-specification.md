# Deliverable 6: API Specification — BuildWise

> [!NOTE]
> All API endpoints are prefixed with `/api/v1`. Authentication uses standard HTTP Bearer tokens (Supabase JWT). Requests and responses use strict JSON payloads validated by **Pydantic v2**.

---

## 1. Authentication & User Profiles Module

| Method | Endpoint | Description | Request Body | Response (200/201) | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new user with designated role | `{"email": "str", "password": "str", "full_name": "str", "role": "customer\|professional\|supplier", "phone": "str"}` | `{"user_id": "uuid", "token": "jwt", "role": "str"}` | Public |
| `POST` | `/auth/login` | Authenticate user & return JWT session | `{"email": "str", "password": "str"}` | `{"user_id": "uuid", "token": "jwt", "role": "str"}` | Public |
| `GET` | `/auth/me` | Fetch authenticated user session & profile | Header: `Bearer <token>` | `{"profile": UserProfileSchema}` | All Authenticated |
| `PUT` | `/profiles/professional/me` | Update professional business profile | ProfessionalUpdateSchema | `{"status": "updated", "profile": {...}}` | Professional |
| `PUT` | `/profiles/supplier/me` | Update supplier catalog & delivery zones | SupplierUpdateSchema | `{"status": "updated", "profile": {...}}` | Supplier |

---

## 2. Professional Discovery & Search Module

| Method | Endpoint | Description | Query Parameters | Response | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/professionals/search` | Search & filter vetted professionals | `category`, `district`, `min_exp`, `budget_tier`, `rating`, `page`, `limit` | `{"items": [ProfessionalCardSchema], "total": int}` | Public / All |
| `GET` | `/professionals/{id}` | Retrieve public professional profile & portfolio | Path parameter: `id: uuid` | `{"profile": ProfessionalDetailSchema, "portfolio": [...]}` | Public / All |
| `GET` | `/professionals/{id}/reviews` | Fetch verified reviews for professional | Path parameter: `id: uuid` | `{"reviews": [ReviewSchema], "avg_rating": float}` | Public / All |

---

## 3. Project Posting & Lead Management Module

| Method | Endpoint | Description | Request Body | Response | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/projects` | Create draft construction project | ProjectCreateSchema | `{"project_id": "uuid", "status": "draft"}` | Customer |
| `PUT` | `/projects/{id}` | Update project scope / specifications | ProjectUpdateSchema | `{"status": "updated", "project": {...}}` | Customer (Owner) |
| `POST` | `/projects/{id}/publish` | Transition project from draft to published | None | `{"status": "published", "notified_contractors": int}` | Customer (Owner) |
| `GET` | `/projects/my-projects` | List customer's active & completed projects | Query: `status` | `{"projects": [ProjectListSchema]}` | Customer |
| `GET` | `/projects/marketplace` | Browse published construction opportunities | Query: `district`, `category`, `min_budget` | `{"items": [ProjectLeadSchema], "total": int}` | Professional |
| `POST` | `/projects/{id}/enquire` | Express interest in project (deducts 10 credits) | `{"pitch_message": "str"}` | `{"enquiry_id": "uuid", "remaining_credits": int}` | Professional |
| `GET` | `/projects/{id}/enquiries` | View all contractor proposals for project | Path: `id: uuid` | `{"enquiries": [EnquiryDetailSchema]}` | Customer (Owner) |
| `PATCH` | `/projects/{id}/enquiries/{enq_id}/shortlist` | Shortlist contractor for formal quotation | None | `{"status": "shortlisted"}` | Customer (Owner) |

---

## 4. Quotations & Structured Comparison Module

| Method | Endpoint | Description | Request Body | Response | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/quotations` | Submit itemized quotation for project | QuotationCreateSchema (breakdown, items, timeline) | `{"quotation_id": "uuid", "status": "submitted"}` | Professional (Shortlisted) |
| `GET` | `/projects/{id}/quotations` | List all submitted quotations for comparison | Path: `id: uuid` | `{"quotations": [QuotationSummarySchema]}` | Customer (Owner) |
| `GET` | `/projects/{id}/quotations/compare` | Structured side-by-side comparison table | Path: `id: uuid` | `{"comparison_matrix": ComparisonMatrixSchema}` | Customer (Owner) |
| `POST` | `/quotations/{id}/accept` | Accept quotation & award contract | None | `{"status": "accepted", "project_status": "in_progress"}` | Customer (Owner) |

---

## 5. Material Supplier Marketplace Module

| Method | Endpoint | Description | Request / Query | Response | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/suppliers/products` | Browse construction materials catalog | `category`, `district`, `min_price`, `max_price` | `{"products": [ProductSchema]}` | Public / All |
| `POST` | `/suppliers/products` | List new building material item | ProductCreateSchema | `{"product_id": "uuid"}` | Supplier |
| `POST` | `/suppliers/rfq` | Submit Request For Quotation to supplier | RFQCreateSchema | `{"rfq_id": "uuid", "status": "sent"}` | Customer, Professional |

---

## 6. Project Progress & Workspace Module

| Method | Endpoint | Description | Request Body | Response | Allowed Roles |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/progress/{project_id}` | Fetch milestone timeline, updates & expenses | Path: `project_id: uuid` | `{"milestones": [...], "updates": [...], "expenses": [...]}` | Project Stakeholders |
| `POST` | `/progress/{project_id}/updates` | Post site log update with photo URLs | ProgressUpdateSchema | `{"update_id": "uuid"}` | Selected Professional |
| `PATCH` | `/progress/milestones/{milestone_id}/complete` | Mark milestone complete for verification | None | `{"status": "completed"}` | Selected Professional |
| `PATCH` | `/progress/milestones/{milestone_id}/verify` | Approve milestone & authorize payout | None | `{"status": "verified_by_customer"}` | Customer (Owner) |

---

## 7. Independent AI Services Endpoints

| Method | Endpoint | Description | Request Body | Response | Fallback Mode |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/ai/requirement-analyzer/analyze` | Parse natural language requirements | `{"raw_text": "str"}` | `{"specifications": StructuredSpecSchema, "missing_fields": [...]}` | Interactive manual form |
| `POST` | `/ai/cost-estimator/estimate` | Deterministic ML regression cost prediction | `{"district": "str", "area_sqft": float, "floors": int, "tier": "str"}` | `{"estimated_total": float, "per_sqft": float, "breakdown": {...}, "range": [min, max]}` | Regional Goa benchmark rule-of-thumb |
| `POST` | `/ai/budget-optimizer/optimize` | Value-engineering cost reduction alternatives | `{"target_budget": float, "current_estimate": float, "specifications": {...}}` | `{"savings_opportunities": [OptimizationItemSchema], "achievable_budget": float}` | Standard value-engineering tip list |
| `POST` | `/ai/quotation-audit/upload-and-analyze` | Async upload & audit of PDF/Excel quote | Multipart file (`application/pdf`) | `{"job_id": "uuid", "status": "processing"}` | Manual line-item entry |
| `GET` | `/ai/quotation-audit/jobs/{job_id}` | Poll background quotation OCR/audit status | Path: `job_id: uuid` | `{"status": "completed\|failed", "extracted_data": {...}}` | N/A |
| `GET` | `/ai/demand-prediction/forecast` | Regional trade & material demand forecast | Query: `district`, `horizon_months` | `{"high_demand_categories": [...], "underserved_areas": [...]}` | Historical volume charts |

---

## 8. Commercial & Admin Governance Endpoints

| Method | Endpoint | Description | Allowed Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/business/lead-credits/balance` | Get contractor lead wallet balance | Professional |
| `POST` | `/business/lead-credits/purchase` | Simulate credit pack purchase (e.g. 50 credits = ₹1,500) | Professional |
| `GET` | `/admin/analytics/overview` | Platform KPI overview (GMV, commissions, user growth) | Admin |
| `PATCH` | `/admin/professionals/{id}/verify` | Approve contractor license & grant verified badge | Admin |
| `GET` | `/admin/revenue-dashboard` | Comprehensive monetization analytics | Admin |
