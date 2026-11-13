# Deliverable 2: User Journey Diagrams — BuildWise

> [!NOTE]
> This document maps **all 6 core workflows** of the BuildWise AI-powered construction marketplace, plus the complete **project lifecycle state machine**. Each workflow is rendered as a Mermaid flowchart showing decision points, AI service interactions, and fallback paths.

---

## Table of Contents

1. [Workflow A — Customer Creates a Construction Project](#workflow-a--customer-creates-a-construction-project)
2. [Workflow B — Professional Discovers a Project](#workflow-b--professional-discovers-a-project)
3. [Workflow C — Quotation Submission & Comparison](#workflow-c--quotation-submission--comparison)
4. [Workflow D — Material Supplier Discovery](#workflow-d--material-supplier-discovery)
5. [Workflow E — Project Progress Management](#workflow-e--project-progress-management)
6. [Workflow F — Admin Marketplace Intelligence](#workflow-f--admin-marketplace-intelligence)
7. [Project Lifecycle State Machine](#project-lifecycle-state-machine)

---

## Workflow A — Customer Creates a Construction Project

This journey covers the end-to-end flow from a customer's initial idea through AI-assisted requirement analysis, cost estimation, and budget optimization to a published project listing.

```mermaid
flowchart TD
    A1["Customer logs in"] --> A2["Navigate to 'Create Project'"]
    A2 --> A3["Enter project basics\n(title, type, location, description)"]
    A3 --> A4["Upload reference documents\n(floor plans, sketches, PDFs)"]
    A4 --> A5{"Trigger AI\nRequirement Analyzer?"}

    A5 -- "Yes" --> A6["AI Requirement Analyzer\nparses documents & description"]
    A5 -- "No / Skip" --> A7["Manually define\nrequirements & scope"]

    A6 --> A6a{"AI Service\nAvailable?"}
    A6a -- "Yes" --> A8["AI returns structured\nrequirements list"]
    A6a -- "No (fallback)" --> A7

    A8 --> A9["Customer reviews &\nedits requirements"]
    A7 --> A9

    A9 --> A10["Save requirements\nto project"]
    A10 --> A11{"Request AI\nCost Estimation?"}

    A11 -- "Yes" --> A12["AI Cost Estimator\nanalyzes scope & location"]
    A11 -- "No / Skip" --> A13["Customer sets\nmanual budget range"]

    A12 --> A12a{"AI Service\nAvailable?"}
    A12a -- "Yes" --> A14["AI returns estimated\ncost breakdown"]
    A12a -- "No (fallback)" --> A13

    A14 --> A15["Customer reviews\ncost estimates"]
    A13 --> A15

    A15 --> A16{"Request AI\nBudget Optimization?"}
    A16 -- "Yes" --> A17["AI Budget Optimizer\nsuggests alternatives"]
    A16 -- "No / Skip" --> A19["Finalize budget"]

    A17 --> A17a{"AI Service\nAvailable?"}
    A17a -- "Yes" --> A18["AI returns optimization\nrecommendations\n(material swaps, phasing)"]
    A17a -- "No (fallback)" --> A19

    A18 --> A19
    A19 --> A20["Set project timeline\n& required services"]
    A20 --> A21["Review full\nproject summary"]
    A21 --> A22{"Publish or\nSave as Draft?"}
    A22 -- "Save Draft" --> A23["Project saved\nas DRAFT"]
    A22 -- "Publish" --> A24["Project status → PUBLISHED"]
    A24 --> A25["Notifications sent to\nmatching professionals"]
    A25 --> A26["Project visible in\nmarketplace search"]
```

---

## Workflow B — Professional Discovers a Project

This journey shows how a professional finds relevant projects, expresses interest, and becomes shortlisted.

```mermaid
flowchart TD
    B1["Professional logs in"] --> B2["View Dashboard\n(new matches, notifications)"]
    B2 --> B3{"Discovery\nMethod?"}

    B3 -- "Browse marketplace" --> B4["Search projects\n(filters: location, type,\nbudget, services needed)"]
    B3 -- "Notification alert" --> B5["Open notification\nfor matching project"]
    B3 -- "AI recommendations" --> B6["View AI-suggested\nproject matches"]

    B4 --> B7["View project\nlisting details"]
    B5 --> B7
    B6 --> B7

    B7 --> B8["Review project scope,\nrequirements, budget,\ntimeline, location"]
    B8 --> B9{"Interested in\nproject?"}

    B9 -- "No" --> B10["Return to search\nor dashboard"]
    B9 -- "Yes" --> B11{"Lead credits\navailable?"}

    B11 -- "No" --> B12["Prompt to purchase\nlead credits or\nupgrade subscription"]
    B12 --> B13{"Purchase\ncompleted?"}
    B13 -- "No" --> B10
    B13 -- "Yes" --> B14

    B11 -- "Yes" --> B14["Submit enquiry /\nexpress interest"]
    B14 --> B15["Lead credit deducted"]
    B15 --> B16["Enquiry recorded\nstatus: PENDING"]
    B16 --> B17["Customer receives\nenquiry notification"]
    B17 --> B18{"Customer\naction?"}

    B18 -- "Accept" --> B19["Professional added to\nshortlist"]
    B18 -- "Reject" --> B20["Professional notified\nof rejection"]
    B18 -- "No response" --> B21["Enquiry remains\nPENDING"]

    B19 --> B22["Professional invited\nto submit quotation"]
    B22 --> B23["Project status →\nRECEIVING_ENQUIRIES /\nSHORTLISTED"]
```

---

## Workflow C — Quotation Submission & Comparison

This journey covers how shortlisted professionals submit quotations and how the customer compares them — including AI-powered document analysis and intelligent comparison.

```mermaid
flowchart TD
    C1["Professional receives\ninvitation to quote"] --> C2["Open project details\n& requirements"]
    C2 --> C3["Prepare quotation\n(itemized costs,\ntimeline, approach)"]
    C3 --> C4["Upload supporting\ndocuments\n(proposals, certificates)"]
    C4 --> C5["Submit quotation"]
    C5 --> C6["Quotation status:\nSUBMITTED"]
    C6 --> C7["Customer notified\nof new quotation"]

    C7 --> C8["Customer opens\nquotation dashboard"]
    C8 --> C9["View all received\nquotations side-by-side"]

    C9 --> C10{"Trigger AI\nQuotation Analysis?"}
    C10 -- "No / Skip" --> C14["Manual review &\ncomparison"]

    C10 -- "Yes" --> C11["AI Quotation Comparison\nanalyzes all submissions"]
    C11 --> C11a{"AI Service\nAvailable?"}
    C11a -- "No (fallback)" --> C14

    C11a -- "Yes" --> C12["AI Document Analysis\nextracts key data from\nuploaded proposals"]
    C12 --> C13["AI returns comparison\nmatrix: price, scope\ncoverage, timeline,\nrisk flags, value score"]

    C13 --> C14
    C14 --> C15["Customer reviews\ncomparison results"]
    C15 --> C16{"Request\nrevision?"}

    C16 -- "Yes" --> C17["Send revision request\nto professional"]
    C17 --> C18["Professional submits\nrevised quotation\n(new version)"]
    C18 --> C6

    C16 -- "No" --> C19{"Select a\nprofessional?"}
    C19 -- "Not yet" --> C20["Continue receiving\nmore quotations"]
    C19 -- "Yes" --> C21["Select winning\nprofessional"]
    C21 --> C22["Project status →\nPROFESSIONAL_SELECTED"]
    C22 --> C23["Selected professional\nnotified"]
    C23 --> C24["Other professionals\nnotified of outcome"]
    C24 --> C25["Project transitions to\nIN_PROGRESS on start"]
```

---

## Workflow D — Material Supplier Discovery

This journey shows how customers and professionals find and engage with material suppliers through the BuildWise supplier marketplace.

```mermaid
flowchart TD
    D1["User logs in\n(Customer or Professional)"] --> D2["Navigate to\nSupplier Marketplace"]
    D2 --> D3["Search suppliers\n(filters: material type,\nlocation, price range,\nratings)"]
    D3 --> D4["Browse supplier\nprofiles & product\ncatalogs"]
    D4 --> D5["View product details\n(specs, pricing,\navailability, MOQ)"]
    D5 --> D6{"Interested in\nproduct?"}

    D6 -- "No" --> D7["Continue browsing"]
    D7 --> D3

    D6 -- "Yes" --> D8["Send supplier enquiry\n(quantity, delivery\nlocation, timeline)"]
    D8 --> D9["Supplier receives\nenquiry notification"]
    D9 --> D10{"Supplier\nresponds?"}

    D10 -- "Yes" --> D11["Supplier sends\nquote / availability"]
    D10 -- "No response" --> D12["User follows up\nor tries another\nsupplier"]
    D12 --> D3

    D11 --> D13["User reviews\nsupplier quote"]
    D13 --> D14{"Accept\nquote?"}

    D14 -- "No" --> D15["Negotiate or\nsearch alternatives"]
    D15 --> D3
    D14 -- "Yes" --> D16["Confirm supplier\norder / engagement"]
    D16 --> D17["Link supplier order\nto project (optional)"]
    D17 --> D18["Track delivery\nin project progress"]

    D4 --> D19{"AI Budget Optimizer\nrecommendations?"}
    D19 -- "Yes" --> D20["View AI-suggested\nalternative materials\n(cost-saving options)"]
    D20 --> D5
    D19 -- "No" --> D5
```

---

## Workflow E — Project Progress Management

This journey covers how customers and professionals collaborate to track milestones, updates, expenses, and documents throughout a project's lifecycle.

```mermaid
flowchart TD
    E1["Project status:\nIN_PROGRESS"] --> E2["Professional sets up\nproject milestones\n& timeline"]
    E2 --> E3["Dashboard shows\nproject progress overview"]

    E3 --> E4{"Action type?"}

    E4 -- "Post Update" --> E5["Professional posts\nprogress update\n(text, photos, videos)"]
    E5 --> E6["Customer notified\nof new update"]
    E6 --> E7["Customer reviews\nupdate & responds"]
    E7 --> E3

    E4 -- "Update Milestone" --> E8["Professional marks\nmilestone status\n(Not Started → In Progress\n→ Completed)"]
    E8 --> E9["Progress percentage\nautomatically recalculated"]
    E9 --> E10["Customer notified\nof milestone change"]
    E10 --> E3

    E4 -- "Log Expense" --> E11["Professional logs\nexpense\n(amount, category,\nreceipt upload)"]
    E11 --> E12["Running total\nupdated against budget"]
    E12 --> E13{"Budget\nexceeded?"}
    E13 -- "Yes" --> E14["Alert: Budget\noverrun warning\nsent to customer"]
    E13 -- "No" --> E3
    E14 --> E3

    E4 -- "Upload Document" --> E15["Upload project document\n(permit, inspection report,\nchange order)"]
    E15 --> E16["Document stored in\nproject document vault"]
    E16 --> E3

    E4 -- "Send Message" --> E17["Open project\nconversation thread"]
    E17 --> E18["Send message to\ncounterpart"]
    E18 --> E19["Recipient notified"]
    E19 --> E3

    E3 --> E20{"All milestones\ncompleted?"}
    E20 -- "No" --> E4
    E20 -- "Yes" --> E21["Professional marks\nproject as complete"]
    E21 --> E22["Customer confirms\ncompletion"]
    E22 --> E23["Project status →\nCOMPLETED"]
    E23 --> E24["Both parties prompted\nto leave reviews"]
```

---

## Workflow F — Admin Marketplace Intelligence

This journey shows how platform administrators use analytics dashboards and AI-powered demand prediction to manage and grow the BuildWise marketplace.

```mermaid
flowchart TD
    F1["Admin logs in"] --> F2["Admin Dashboard\nOverview"]
    F2 --> F3{"Admin\naction?"}

    F3 -- "User Management" --> F4["View / search users\n(customers, professionals,\nsuppliers)"]
    F4 --> F5["Verify professional\ncredentials &\ncertifications"]
    F5 --> F6["Approve / suspend /\nflag accounts"]
    F6 --> F2

    F3 -- "Content Moderation" --> F7["Review flagged\nreviews, projects,\nprofiles"]
    F7 --> F8["Moderate content\n(approve / remove /\nwarn user)"]
    F8 --> F2

    F3 -- "Revenue Analytics" --> F9["View revenue dashboard\n(subscriptions, lead credits,\ncommissions, promotions,\nadvertising)"]
    F9 --> F10["Drill into revenue\nstreams & trends"]
    F10 --> F2

    F3 -- "Marketplace Analytics" --> F11["View marketplace KPIs\n(projects posted, match rate,\nconversion rate, avg time\nto hire)"]
    F11 --> F12["Segment by location,\nservice type, budget range"]
    F12 --> F2

    F3 -- "AI Demand Prediction" --> F13["Open AI Demand\nPrediction Dashboard"]
    F13 --> F14{"AI Service\nAvailable?"}
    F14 -- "No (fallback)" --> F15["Show historical trends\n& static reports"]
    F14 -- "Yes" --> F16["AI Demand Prediction\nanalyzes historical data"]
    F16 --> F17["AI returns predictions:\n- Trending service categories\n- Emerging locations\n- Seasonal demand patterns\n- Supply gap alerts"]
    F17 --> F18["Admin reviews\npredictions"]
    F15 --> F18

    F18 --> F19{"Take action on\npredictions?"}
    F19 -- "Yes" --> F20["Adjust promotion strategies,\ntarget professional\nrecruitment,\nplan marketing campaigns"]
    F19 -- "No" --> F2
    F20 --> F2

    F3 -- "Subscription & Pricing" --> F21["Manage subscription plans\n& pricing tiers"]
    F21 --> F22["Configure lead credit\npricing & packages"]
    F22 --> F23["Set commission rates\n& promotion packages"]
    F23 --> F2
```

---

## Project Lifecycle State Machine

This state diagram shows every valid state transition for a BuildWise project, including the happy path and cancel/close states.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : Customer creates project

    DRAFT --> PUBLISHED : Customer publishes
    DRAFT --> CANCELLED : Customer cancels

    PUBLISHED --> RECEIVING_ENQUIRIES : First enquiry received
    PUBLISHED --> CLOSED : Customer closes\n(no interest / changed plans)
    PUBLISHED --> CANCELLED : Customer cancels

    RECEIVING_ENQUIRIES --> SHORTLISTED : Customer shortlists\nprofessional(s)
    RECEIVING_ENQUIRIES --> CLOSED : Customer closes\n(insufficient interest)
    RECEIVING_ENQUIRIES --> CANCELLED : Customer cancels

    SHORTLISTED --> PROFESSIONAL_SELECTED : Customer selects\nwinning professional
    SHORTLISTED --> RECEIVING_ENQUIRIES : Shortlist cleared /\nmore enquiries needed
    SHORTLISTED --> CLOSED : Customer closes
    SHORTLISTED --> CANCELLED : Customer cancels

    PROFESSIONAL_SELECTED --> IN_PROGRESS : Work begins
    PROFESSIONAL_SELECTED --> CLOSED : Agreement falls through
    PROFESSIONAL_SELECTED --> CANCELLED : Customer cancels

    IN_PROGRESS --> COMPLETED : All milestones done\n& customer confirms
    IN_PROGRESS --> ON_HOLD : Temporary pause\n(weather, permits, disputes)
    IN_PROGRESS --> CANCELLED : Mutual cancellation

    ON_HOLD --> IN_PROGRESS : Work resumes

    COMPLETED --> [*]
    CANCELLED --> [*]
    CLOSED --> [*]
```

### State Descriptions

| State | Description | Allowed Actions |
|---|---|---|
| **DRAFT** | Project created but not visible to professionals | Edit, upload, AI analysis, publish, cancel |
| **PUBLISHED** | Live in marketplace, visible to professionals | Receive enquiries, close, cancel |
| **RECEIVING_ENQUIRIES** | At least one professional has expressed interest | Review enquiries, shortlist, close, cancel |
| **SHORTLISTED** | Customer has shortlisted one or more professionals | Invite quotations, select professional, close, cancel |
| **PROFESSIONAL_SELECTED** | Winning professional chosen, pre-start phase | Finalize terms, begin work, close, cancel |
| **IN_PROGRESS** | Active construction / service delivery underway | Track progress, milestones, expenses, messages, hold, complete, cancel |
| **ON_HOLD** | Temporarily paused (awaiting permits, weather, etc.) | Resume, cancel |
| **COMPLETED** | All work finished and confirmed by customer | Leave reviews, archive |
| **CANCELLED** | Project cancelled at any stage | Archive, no further actions |
| **CLOSED** | Project closed without completion (lack of interest, changed plans) | Archive, no further actions |
