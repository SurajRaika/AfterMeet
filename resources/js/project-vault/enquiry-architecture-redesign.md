# Enquiry System Architecture & Multi-Channel Restructure Specification

## Executive Overview
The **aftermeet io Enterprise Operations Platform** uses a **Shared Spine + Plug-in Branch** architecture to manage multi-channel B2B sales operations.

In standard CRMs, a single pipeline or deal object is forced across all sales processes. While this works for simple SaaS or standard commerce, it breaks down in complex industrial trade where distinct sales motions (e.g., Export Sales vs. Government Tenders vs. Retail Listings) possess fundamentally incompatible data models, stage workflows, and owning departments.

To solve this without fracturing systemic cohesion, aftermeet io implements:
1. **Universal Enquiry Spine (`enquiries`)**: A single, global identity table providing universal IDs, baseline customer metadata, and generic status tracking for executive dashboards and cross-departmental downstream links (Costing, Logistics, Sampling, Compliance, Tasks, Documents).
2. **Channel-Specific Branch Tables (`enquiry_*_details`)**: Dedicated extension tables storing unique custom attributes (e.g., Earnest Money Deposit [EMD] for Tenders vs. Incoterms for Export).
3. **Dual Viewport Hierarchy**:
   - **Global Enquiry Directory**: Cross-departmental single source of truth (Table, Custom Views, Executive Analytics) over ALL channels. (EXCLUDES Kanban to prevent stage mismatch).
   - **Departmental Enquiry Workspaces**: Specialized working environments (e.g., Export Sales Enquiry) equipped with channel-specific Kanban pipelines, custom forms, and department filtering.

---

## 1. Database Schema & Data Modeling

### A. Universal Core Spine (`enquiries` table)
Every enquiry across every department writes its foundational identity to the shared spine:

```sql
CREATE TABLE enquiries (
    id VARCHAR(64) PRIMARY KEY,                   -- Universal Enquiry ID (e.g. ENQ-2026-0012)
    sales_type VARCHAR(32) NOT NULL,              -- 'export' | 'tender' | 'distributor' | 'retail'
    customer_name VARCHAR(255) NOT NULL,          -- Client Firm, Distributor, or Govt Agency Name
    customer_contact VARCHAR(255) NOT NULL,       -- Primary Contact Person / Officer
    product VARCHAR(255) NOT NULL,                -- Product Specification / Commodity Requirement
    quantity VARCHAR(128) NOT NULL,               -- Quantity / Volume
    destination_port VARCHAR(255) NOT NULL,       -- Discharge Port or Delivery Terminal
    sales_owner_id VARCHAR(64) NOT NULL,          -- User ID of assigned Sales Rep / Tender Officer
    owning_department_id VARCHAR(64) NOT NULL,    -- 'Sales' | 'Tender' | 'Distributor Sales' | 'Retail Sales'
    status VARCHAR(32) NOT NULL DEFAULT 'open',  -- Coarse Generic Status: 'open' | 'in_progress' | 'won' | 'lost' | 'closed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### B. Channel-Specific Branch Tables

#### 1. Export Sales Details (`enquiry_export_details`)
```sql
CREATE TABLE enquiry_export_details (
    enquiry_id VARCHAR(64) PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
    destination_country VARCHAR(128) NOT NULL,
    incoterms VARCHAR(64) NOT NULL,               -- e.g., 'CIF Hamburg', 'FOB Nhava Sheva'
    shipping_details TEXT,                        -- Vessel preference, container type (FCL/LCL)
    export_stage VARCHAR(32) NOT NULL             -- 'enquiry' | 'costing' | 'quotation' | 'contract' | 'po' | 'shipped'
);
```

#### 2. Government Tender Details (`enquiry_tender_details`)
```sql
CREATE TABLE enquiry_tender_details (
    enquiry_id VARCHAR(64) PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
    portal_source VARCHAR(128) NOT NULL,          -- e.g., 'GEM Portal India', 'E-Procure'
    tender_number VARCHAR(128) NOT NULL,          -- Government Tender Tender No.
    emd_amount DECIMAL(15, 2) NOT NULL,           -- Earnest Money Deposit (EMD) Guarantee
    emd_status VARCHAR(32) NOT NULL,              -- 'Pending' | 'Submitted' | 'Refunded' | 'Forfeited'
    hod_approval_status VARCHAR(32) NOT NULL,     -- 'Pending Review' | 'Approved' | 'Rejected'
    submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    government_agency_name VARCHAR(255) NOT NULL,
    tender_stage VARCHAR(32) NOT NULL             -- 'identified' | 'emd_submitted' | 'technical_bid' | 'financial_bid' | 'awarded' | 'rejected'
);
```

#### 3. Distributor Sales Details (`enquiry_distributor_details`)
```sql
CREATE TABLE enquiry_distributor_details (
    enquiry_id VARCHAR(64) PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
    distributor_id VARCHAR(64),
    distributor_name VARCHAR(255) NOT NULL,
    territory VARCHAR(255) NOT NULL,              -- Assigned geography (e.g. DACH Region)
    distributor_stage VARCHAR(32) NOT NULL        -- 'lead' | 'sample_evaluation' | 'commercial_terms' | 'contract_signed' | 'reorder'
);
```

#### 4. Retail / Supermarket Details (`enquiry_retail_details`)
```sql
CREATE TABLE enquiry_retail_details (
    enquiry_id VARCHAR(64) PRIMARY KEY REFERENCES enquiries(id) ON DELETE CASCADE,
    retail_channel VARCHAR(128) NOT NULL,         -- e.g. 'Direct Supermarket', 'E-Commerce'
    end_customer_info TEXT,                       -- Number of retail outlets / stores
    retail_stage VARCHAR(32) NOT NULL             -- 'discovery' | 'audit' | 'listing_approved' | 'first_po' | 'recurring'
);
```

---

## 2. Generic Status vs Channel Pipeline Stages

To allow high-level executive reporting alongside precise departmental execution:

1. **Generic Status (`enquiries.status`)**:
   - Used globally across executive dashboards and presidential telemetries.
   - Values: `Open`, `Costing Phase`, `Internal Review`, `Customs Verification`, `Won`, `Lost`, `Closed`.
2. **Channel Pipeline Stage (`enquiry_*_details.*_stage`)**:
   - Used inside the department's working workspace Kanban board.
   - Allows Tender to track `EMD Submitted` or `Technical Bid` without corrupting Export Sales stages like `CIF Quotation` or `PO Issued`.

---

## 3. Module Hierarchy & View Matrix

| Module Name | Sales Type Scope | Views Included | Primary Audience | Key Characteristics |
| :--- | :--- | :--- | :--- | :--- |
| **Global Enquiry** | ALL (`export`, `tender`, `distributor`, `retail`) | Table View, Custom Views, KPI Dashboard, Detail Hub | Executive, Cross-Department, Audit & Search | **NO KANBAN**. Reference directory across channels. |
| **Sales Enquiry** | `export` only | Kanban, Table View, Custom Views, Dashboard, Detail Hub | Export Sales Dept | Working pipeline for international export deals. Template for future sales desks. |
| **(Future) Tender Enquiry** | `tender` only | Kanban, Table View, Custom Views, Dashboard, Detail Hub | Tender Department | Tracks GEM/Govt bids, EMD deposits, and technical/financial bid stages. |
| **(Future) Distributor Enquiry**| `distributor` only | Kanban, Table View, Custom Views, Dashboard, Detail Hub | Distributor Sales Dept | Manages territory distribution networks & recurring supply agreements. |
| **(Future) Retail Enquiry** | `retail` only | Kanban, Table View, Custom Views, Dashboard, Detail Hub | Retail Sales Dept | Manages supermarket SKU listing approvals & store volume orders. |

---

## 4. Downstream Polymorphic Contracts

All downstream operational departments attach directly to `enquiry_id` regardless of which `sales_type` generated the request:

- **Costing Desk (`costing_requests`)**: References `enquiry_id`. Calculates component costs (FOB sourcing, inland transport, packaging).
- **Sampling Desk (`sampling_requests`)**: References `enquiry_id`. Dispatches physical lab samples and waybills.
- **Logistics Desk (`logistics_requests`)**: References `enquiry_id`. Allocates ocean containers, vessel bookings, or truckloads.
- **Compliance Desk (`compliance_requests`)**: References `enquiry_id`. Performs quarantine audits, phytosanitary releases, and vendor verification.
- **Tasks & Internal Requests Engine**: Polymorphic links (`related_type = 'Enquiry'`, `related_id = enquiry_id`).
- **Spend Management**: Expense requests and claims reference `enquiry_id` for client entertainment or CRM expenses.

---

## 5. Frontend Implementation Architecture

In the React application:
- **`src/types/crm.ts`**: Defines type-safe interfaces (`SalesType`, `ExportDetails`, `TenderDetails`, `DistributorDetails`, `RetailDetails`, and `Enquiry`).
- **`src/components/views/GlobalEnquiryView.tsx`**: Implements Tanstack Table, channel filtering tabs, executive KPI cards, and custom view rules for global directory inspection.
- **`src/components/views/SalesTrackerView.tsx`**: Scoped as the "Sales Enquiry (Export Workspace)" with Kanban drag-and-drop, export filtering, and deal creation forms.
- **`src/components/views/EnquiryDetailView.tsx`**: Renders universal spine data plus a dynamic channel specifications card rendering Tender, Export, Distributor, or Retail parameters based on `activeEnquiry.sales_type`.
- **`src/components/Sidebar.tsx` & `src/components/CommandPalette.tsx`**: Expose instant navigation and search across Global Enquiry and Sales Enquiry.
