# Deliverable 10: Implementation Roadmap — BuildWise

> [!NOTE]
> This roadmap structures the complete end-to-end implementation of BuildWise into eight logical, prioritized phases suited for rapid hackathon delivery while upholding enterprise-grade software standards.

---

## 1. Phased Development Roadmap Overview

```mermaid
gantt
    title BuildWise Phased Hackathon Implementation Roadmap
    dateFormat  X
    axisFormat %s hr

    section Foundation
    Phase 1: Project Setup, Landing & Auth           :active, p1, 0, 4
    section Marketplace Core
    Phase 2: Profiles, Search, Projects & Leads     :p2, 4, 9
    Phase 3: Quotation Engine & Comparison Grid     :p3, 9, 13
    section Ecosystem
    Phase 4: Supplier Marketplace & Progress Board   :p4, 13, 17
    section Intelligence
    Phase 5: 5 Independent AI Microservices         :p5, 17, 23
    section Commercialization
    Phase 6: Revenue, Credits, Subscriptions & Ads  :p6, 23, 27
    section Governance & Delivery
    Phase 7: Admin Intelligence & Demand Forecast   :p7, 27, 30
    Phase 8: End-to-End Testing, Polish & Demo Flow :p8, 30, 34
```

---

## 2. Phase Breakdown & Deliverables

### Phase 1: Project Setup, Landing Page & Dual-Persona Auth (Hours 0–4)
*Goal: Working monorepo with React+Tailwind SPA, FastAPI backend skeleton, and unified role-based authentication.*
- **Backend:** Initialize FastAPI with CORS, configuration loading, Supabase client initialization, base health route (`/health`).
- **Database:** Deploy foundational schema: `users`, `profiles`, `user_roles`. Configure initial Supabase Auth integration.
- **Frontend:** Initialize Vite + Tailwind CSS with BuildWise construction-themed design system (Deep Navy, Safety Slate, Construction Amber, Clean White).
- **Deliverables:**
  - Responsive Public Landing Page with Hero section, feature previews, and "How it works".
  - Unified Registration & Login modal/pages with dynamic role selection (Customer, Contractor, Architect, Supplier).
  - Protected route wrappers in React Router v6.

### Phase 2: Profiles, Search, Project Posting & Leads (Hours 4–9)
*Goal: Core customer-professional matchmaking loop.*
- **Backend:** CRUD routers for `professional_profiles`, `professional_services`, `projects`, and `project_enquiries`.
- **Database:** Tables for portfolios, certifications, and enquiry tracking.
- **Frontend:**
  - Professional Profile builder with portfolio gallery and service coverage tagging.
  - Professional Discovery Directory with filters (Goa regions, service category, budget rating).
  - Customer Project Creation Wizard (manual mode) with photo attachments.
  - Project Lead Discovery board for contractors with "Express Interest" action.

### Phase 3: Quotation Engine & Structured Comparison Grid (Hours 9–13)
*Goal: Transparent bidding and side-by-side cost analysis.*
- **Backend:** Quotation submission, itemized cost breakdown (materials, labour, logistics), and status transitions (`SUBMITTED`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).
- **Database:** `quotations`, `quotation_items`, `quotation_versions`.
- **Frontend:**
  - Contractor Quotation Builder with milestone schedules and itemized line items.
  - Customer Side-by-Side Quotation Comparison Grid highlighting cost variance, timeline discrepancies, and included/excluded guarantees.

### Phase 4: Material Supplier Marketplace & Project Progress Dashboard (Hours 13–17)
*Goal: Building material procurement and post-award project tracking.*
- **Backend:** Supplier catalog CRUD, product enquiry router, milestone tracking, and site progress updates.
- **Database:** `supplier_profiles`, `supplier_products`, `project_milestones`, `project_updates`, `project_expenses`.
- **Frontend:**
  - Supplier Marketplace with category browsing (Cement, Steel, Tiles, Electrical, Plumbing) and RFQ triggers.
  - Shared Project Progress Workspace for awarded contracts: timeline progress bars, milestone approvals, site photo logs, and expense tracker.

### Phase 5: Independent AI Services Integration (Hours 17–23)
*Goal: Activate all 5 standalone AI microservices with fault-isolated circuit breakers.*
- **AI-1 (Requirement Analyzer):** LLM prompt pipeline taking freeform Indian English/regional inputs and extracting validated JSON project specifications.
- **AI-2 (Cost Estimator):** Scikit-Learn/XGBoost model predicting cost per sq. ft. across standard/premium construction tiers in Goa.
- **AI-3 (Budget Optimizer):** Cost reduction heuristic engine suggesting value engineering swaps (e.g., vitrified tiles vs. imported marble).
- **AI-4 (Quotation Intelligence):** Background document ingestion pipeline parsing uploaded contractor PDFs/images into standardized line items.
- **AI-5 (Demand Prediction):** Regional time-series forecasting estimating upcoming demand spikes.
- **Resilience:** Circuit breaker wrappers ensuring mock/fallback responses if any AI service fails.

### Phase 6: Monetization, Subscriptions & Lead Credits (Hours 23–27)
*Goal: Working commercial engine.*
- **Backend:** Lead credit deduction logic, subscription tier enforcement, 2% transaction commission calculation on awarded contracts.
- **Frontend:**
  - Contractor Wallet & Credit purchase interface (simulated sandbox transactions).
  - Tiered Subscription pricing matrix (Free, Basic ₹299, Premium ₹799) with real-time feature gating.
  - Promoted listing badges in search results.

### Phase 7: Admin Governance & Demand Prediction Dashboard (Hours 27–30)
*Goal: Platform administration and market health monitoring.*
- **Backend:** Admin analytics aggregations, verification workflows, AI Demand endpoint.
- **Frontend:**
  - Administrative Control Center: Professional KYC verification, project moderation, platform revenue breakdown.
  - AI Regional Demand Heatmap / Bar Charts showing supply-demand gaps in Goa districts.

### Phase 8: Hardening, Edge-Case Verification & Hackathon Polish (Hours 30–34)
*Goal: Bulletproof demonstration readiness.*
- End-to-end automated sanity testing of all 6 user journeys.
- Demonstration seed data: 10 preloaded Goa contractors, 5 architects, 8 material vendors, and sample pre-extracted PDF quotes.
- Fallback verification: Disconnecting AI endpoints to prove graceful degradation.
