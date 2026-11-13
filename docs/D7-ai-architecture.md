# Deliverable 7: AI Architecture — BuildWise

> [!IMPORTANT]
> **Strict Architectural Mandate: Independent Models & Fault Isolation.**
> BuildWise rejects the single-monolithic-model antipattern. Each AI capability operates as an autonomous service with its own inference runtime, distinct input/output contracts, independent failure domains, and automated fallback logic. Failure of one AI component never impacts other AI features or core marketplace operations.

---

## 1. Multi-Model Topology & Failure Isolation

```mermaid
graph TB
    subgraph Gateway ["FastAPI Application Gateway"]
        RouteDispatcher["Request Dispatcher & RBAC"]
        CircuitBreaker["Circuit Breaker & Fallback Manager (3.5s Timeout)"]
    end

    subgraph Service1 ["AI Service 1: Requirement Analyzer"]
        S1_API["Prompt Orchestration API"]
        S1_Model["Gemini Flash / Open-Weights LLM"]
        S1_Guard["Pydantic JSON Schema Guard"]
    end

    subgraph Service2 ["AI Service 2: Construction Cost Estimator"]
        S2_API["Inference Engine API"]
        S2_Model["XGBoost / RandomForest Regressor (.joblib)"]
        S2_Data["Goa Regional Cost Matrix (2024–2026)"]
    end

    subgraph Service3 ["AI Service 3: Budget Optimizer"]
        S3_API["Value-Engineering Engine"]
        S3_Rules["Constraint Solver & Safety Rules"]
        S3_Catalog["Material Substitution Cost DB"]
    end

    subgraph Service4 ["AI Service 4: Quotation Intelligence"]
        S4_Queue["Async Job Queue (PostgreSQL / Polling)"]
        S4_OCR["PyMuPDF / PDFPlumber / Tesseract OCR"]
        S4_DocAI["Table & Line-Item Extractor"]
    end

    subgraph Service5 ["AI Service 5: Demand Prediction"]
        S5_API["Forecasting API (Admin Only)"]
        S5_Model["Prophet / SARIMAX Time-Series Pipeline"]
        S5_Store["Aggregated Historical Enquiries"]
    end

    RouteDispatcher --> CircuitBreaker
    CircuitBreaker -->|HTTP Sync| S1_API
    CircuitBreaker -->|In-Process / HTTP| S2_API
    CircuitBreaker -->|HTTP Sync| S3_API
    CircuitBreaker -->|Job Submit & Poll| S4_Queue
    CircuitBreaker -->|HTTP Sync| S5_API

    S1_API --> S1_Model --> S1_Guard
    S2_API --> S2_Data --> S2_Model
    S3_API --> S3_Rules --> S3_Catalog
    S4_Queue --> S4_OCR --> S4_DocAI
    S5_API --> S5_Store --> S5_Model
```

---

## 2. Deep Dive: The 5 Independent AI Services

### AI Service 1: Construction Requirement Analyzer
- **Purpose:** Converts conversational, unstructured customer descriptions into standardized project specification objects and identifies missing engineering details.
- **Input:** Raw text, e.g., *"I want to build a two-storey house in Margao with 4 bedrooms, modular kitchen, and parking for 2 cars. My budget is around ₹45 lakh."*
- **Technology & Pipeline:**
  1. Few-shot prompt template grounded in Indian construction norms.
  2. Strict Pydantic output validation schema: `{"project_type": str, "location": str, "built_up_area_sqft": Optional[float], "floors": int, "budget": float, "bedrooms": int, "special_features": [str], "missing_critical_info": [str]}`.
  3. Automatic follow-up query generator for missing parameters (e.g., plot dimensions, soil conditions).
- **Fallback:** Renders a clean 4-step wizard form allowing the customer to enter basic dimensions directly.

---

### AI Service 2: Construction Cost Estimator
- **Purpose:** Produces deterministic, validated construction cost projections per square foot, total budget estimates, and high-level component distributions.
- **Input Features:**
  - `district` (Categorical: North Goa, South Goa)
  - `built_up_area_sqft` (Continuous: 500 – 15,000)
  - `floors_count` (Integer: 1 – 5)
  - `project_type` (Categorical: New Construction, Renovation, Villa, Apartment)
  - `material_finish_tier` (Categorical: Economy, Standard, Premium, Luxury)
- **Model & Training:**
  - **Algorithm:** Tuned Gradient Boosting Regressor (`scikit-learn` / `xgboost`).
  - **Training Data:** Curated regional dataset of 1,200+ Goa & Western Coastal construction projects adjusted for current material indexes (cement, TMT steel, local laterite stone vs. fly-ash bricks).
  - **Evaluation Metrics:** Mean Absolute Percentage Error (MAPE) target < 6.5%, $R^2 > 0.92$.
- **Output:**
  - `estimated_total`: e.g., ₹42,50,000
  - `confidence_interval`: [₹40,20,000, ₹44,80,000] (never pretends precision down to single rupees)
  - `cost_per_sqft`: e.g., ₹2,125/sq.ft
  - `component_breakdown`: Civil & Structure (48%), Material finishes (24%), Labour (15%), MEP Services (8%), Approvals & Misc (5%).
- **Fallback:** Regional statutory rate lookup table with fallback disclaimer tag.

---

### AI Service 3: Budget Optimizer
- **Purpose:** Rescues over-budget projects by providing actionable value-engineering trade-offs without compromising structural or seismic safety.
- **Engineering Guardrails:** Structural elements (foundation depth, RCC pillar grades M25, rebar diameter Fe550D) are flagged as **NON-NEGOTIABLE** invariants.
- **Optimization Strategy:**
  1. Evaluates discretionary finishes: Flooring (Italian Marble → Glazed Vitrified Tiles saves ~₹180/sq.ft).
  2. Evaluates fenestration: Premium Teak wood frames → UPVC double-glazed profiles (saves ~15%).
  3. Evaluates project phasing: Postponing exterior landscaping or terrace solar pergola to Phase 2 (saves immediate cash outlays by ₹4,00,000).
- **Output:** Ranked list of trade-offs, itemized potential savings, and net impact on the target budget.

---

### AI Service 4: Quotation Intelligence (Document Audit & OCR)
- **Purpose:** Ingests heterogeneous contractor quotations (scanned PDFs, Excel spreadsheets, smartphone camera photos) and standardizes them into a normalized comparison schema.
- **Asynchronous Architecture:**
  1. Customer uploads document → saved to Supabase Storage.
  2. Record created in `quotation_analysis_jobs` with status `PENDING`.
  3. Background worker extracts text via `pdfplumber` (native PDF) or `pytesseract` (scanned images).
  4. Structured LLM parser maps extracted lines to standard categories (`civil_structure`, `finishing`, `labour`, `taxes`).
  5. Validation rule flags anomalies (e.g., missing GST, omitted plumbing rough-ins, unusually low steel quotes indicative of substandard gauge).
  6. Job status updated to `COMPLETED` or `FAILED`.
- **Confidence Scoring:** Every extracted field carries a confidence percentage; any field under 70% confidence is highlighted with an "Inspect Source Document" badge.

---

### AI Service 5: Marketplace Demand Prediction
- **Purpose:** Provides macro-level market intelligence to platform administrators and registered professionals.
- **Methodology:** Time-series analysis over rolling 30/60/90-day intervals tracking:
  - Inquiries per trade category by taluka/district (e.g., North Goa vs. South Goa).
  - Supply density (number of active contractors vs. published leads).
- **Output:** Identifies underserved market niches (e.g., *"South Goa has experienced a 42% rise in renovation RFQs, but listed interior designers have only grown by 4%"*).
- **Fallback:** When historical project volume in a sector is `< 20`, predictive trendlines are suppressed, and raw counts are shown with an *"Emerging Region — Low Sample Size"* indicator.

---

## 3. Asynchronous Job State Machine (DocAI)

```mermaid
stateDiagram-v2
    [*] --> PENDING: User uploads quotation PDF
    PENDING --> PROCESSING: Worker picks job from queue
    PROCESSING --> OCR_EXTRACTION: Parsing text / tables
    OCR_EXTRACTION --> SCHEMA_NORMALIZATION: Mapping to BOQ standard
    SCHEMA_NORMALIZATION --> VALIDATION_CHECK: Rule-based sanity check
    VALIDATION_CHECK --> COMPLETED: Extraction valid (Score >= 0.70)
    VALIDATION_CHECK --> COMPLETED_WITH_FLAGS: Low confidence items flagged
    PROCESSING --> FAILED: Parse error / unreadable scan
    FAILED --> [*]: User prompted for manual entry
    COMPLETED --> [*]: Displayed in comparison grid
```
