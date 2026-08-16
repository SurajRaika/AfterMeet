# aftermeet io Enterprise - Frontend Architecture Map & Directory Layout

This document provides a comprehensive blueprint of the frontend architecture for the **aftermeet io Enterprise Operations Platform** prototype. It outlines the codebase layout, core state orchestration, component taxonomy, routing paradigm, and universal layout modules.

---

## 1. System Technology Stack
The prototype is built with a high-performance modern web stack designed for rapid development, type safety, and real-time feel:
- **Runtime & Package Manager**: [Bun](https://bun.sh/) — powering lightning-fast package installation, TypeScript executing, and developer workflows.
- **Build Tool**: [Vite](https://vite.dev/) — rapid-start dev server and highly optimized production builds.
- **Frontend Framework**: [React 18 / 19](https://react.dev/) — utilized with declarative state-driven views and structural compositions.
- **Language**: [TypeScript](https://www.typescriptlang.org/) — strict type enforcement for enterprise-grade data structures (enquiries, claims, emails, tasks, HR metrics).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) — modern CSS compilation with fully declarative utility-first grid and utility systems.
- **Table Engine**: [@tanstack/react-table (v8)](https://tanstack.com/table) — lightweight, headless, fully customizable sorting, pagination, and visibility controls.
- **Icons Pack**: [Lucide React](https://lucide.dev/) — crisp vector symbols matching clean IDE designs.

---

## 2. Directory Taxonomy & File Structures
Below is the organizational structure of the `src/` directory:

```
src/
├── components/                  # UI Presentation & Control Components
│   ├── views/                   # Workspace-Specific Viewports (Active Views)
│   │   ├── Dashboards.tsx       # Department-level analytics & approval queues
│   │   ├── EnquiryDetailView.tsx # Deep inspection tab/workspace of active enquiries
│   │   ├── MyTasksView.tsx      # Unified operator checklist / tasks queue
│   │   ├── OpsComplianceView.tsx# Operations compliance registry and quarantine audits
│   │   ├── OpsCostingView.tsx   # Sourcing / terminal price analysis desk
│   │   ├── OpsHRView.tsx        # HR employee records & onboarding tracker
│   │   ├── OpsLogisticsView.tsx # Cargo, container, and shipping bookings desk
│   │   ├── OpsSamplingView.tsx  # Physical sample tracking and courier waybills
│   │   ├── PersonalMailboxView.tsx # Custom multi-folder mailbox client workspace
│   │   ├── PresidentialOverviewView.tsx # Global administrative telemetry dashboard
│   │   ├── RestrictedView.tsx   # Security authorization denial screen
│   │   ├── SalesContractsView.tsx# Sales document and signature tracking submodule
│   │   ├── SalesPOsView.tsx     # Purchase orders ledger view
│   │   ├── SalesProspectsView.tsx# Lead list with Gemini-powered AI outreach assistant
│   │   ├── SalesQuotationsView.tsx # Pricing quotes database view
│   │   ├── SalesSamplingView.tsx # Sales-side client sample logs
│   │   ├── SalesTrackerView.tsx # Primary pipeline overview with Kanban Board
│   │   ├── SalesVendorsView.tsx # Vendor approval audits logs
│   │   └── SpendManagementView.tsx # Multi-tab Expense Request & Claim workspace
│   │
│   ├── CommandPalette.tsx       # VS Code-like global Ctrl+K / Ctrl+Shift+K search & action bar
│   ├── Header.tsx               # Workspace top navigation, action buttons, & status triggers
│   ├── Sidebar.tsx              # Crew switcher + Primary activity navigation tree
│   ├── ModuleDeskView.tsx       # Reusable, generic Table/Kanban wrapper component
│   ├── TaskChatDrawer.tsx       # Right-docked contextual chat & group tagging workspace
│   └── Toast.tsx                # Contextual confirmation alerts pop-up component
│
├── constants/                   # Static Mock Datasets & Initial State Configurations
│   └── initialData.ts           # Standardized, pre-linked company datasets
│
├── hooks/                       # Custom State Hooks
│   └── useCRMState.ts           # CENTRAL STATE ENGINE & WORKFLOW HANDLERS
│
├── services/                    # Simulated API Layer
│   └── apiClient.ts             # Abstracted mock endpoints ready for Laravel integration
│
├── types/                       # Static Type Definitions
│   └── crm.ts                   # Type-safe model contracts (User, Enquiry, Task, Expense, etc.)
│
├── App.tsx                      # Root component handling Boot screen, Security clearance, & main layout
├── index.css                    # Entry style definitions importing Tailwind CSS
├── main.tsx                     # React application mounting entrypoint
└── vite-env.d.ts                # Build environmental declarations
```

---

## 3. Core State Orchestration (`useCRMState.ts`)
The aftermeet io platform follows a **Single Source of Truth** architecture. State is orchestrated globally within `src/hooks/useCRMState.ts` and provided down to individual workspace views.

### A. State Slices Managed
1. **User Identity & Security (`currentUser`)**:
   - Tracks the active simulated member of the enterprise (e.g., Executive CEO, Costing Head, Accounting Head).
2. **Operational Entities**:
   - `enquiries`: Full record list of Active Deals.
   - `expenses`: Ledger containing spend requests, corporate claims, and voucher files.
   - `tasks`: Complete checklist database including core action items, sub-tasks, and internal requests.
   - `emails`: Conversation store representing incoming/outgoing client and team mail.
   - `hrEmployees`: Roster of workforce personnel including checklist parameters and training modules.
   - `prospects` & `campaigns`: Marketing outbound leads and status categories.
3. **Active UI / Navigation Registers**:
   - `currentView`: Workspace routing string (e.g., `'sales-tracker'`, `'ops-costing'`, `'spend-overview'`).
   - `selectedEnquiryId`: Tracks which specific enquiry has active focus in detail viewports.
   - `activeTab`: Nested workspace detail focus tracker (e.g., `'Overview'`, `'Costing'`, `'Sampling'`).
   - `activeTaskId`: Selected task for contextual chat drawer comments.
4. **Search / Filter Parameters**:
   - `searchQuery` (CRM deals), `emailSearchQuery` (mailbox), custom localStorage filters (custom views).

### B. Asynchronous Data Handshake
Upon mount, `useCRMState` executes an asynchronous fetch simulation:
```typescript
useEffect(() => {
  const loadInitialData = async () => {
    try {
      const [
        loadedEnquiries,
        loadedExpenses,
        loadedTasks,
        loadedEmails,
        loadedHrEmployees,
        loadedProspects,
        loadedCampaigns,
        loadedCustomViews,
      ] = await Promise.all([
        apiClient.enquiries.list(),
        apiClient.expenses.list(),
        apiClient.tasks.list(),
        apiClient.emails.list(),
        apiClient.hrEmployees.list(),
        apiClient.prospects.list(),
        apiClient.campaigns.list(),
        apiClient.customViews.list(),
      ]);
      setEnquiries(loadedEnquiries);
      // ... state updater dispatchers
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };
  loadInitialData();
}, []);
```
This asynchronous architecture ensures that the entire frontend is decoupled from local constants and directly prepared for standard backend/API integrations (like Laravel controllers or Inertia.js hydration).

### C. Permission Gatekeeping (`checkPermissions`)
Before activating any workspace viewport, the state hub routes navigation clicks through a strict authorization gate:
```typescript
const checkPermissions = (targetView: string): boolean => {
  if (currentUser.isPresident || currentUser.isAdmin) return true;
  if (targetView === 'personal-email') return true;

  // Departmental restriction rules
  if (['sales-tracker', 'sales-prospects', ...].includes(targetView)) {
    return currentUser.department === 'Sales';
  }
  if (targetView === 'ops-costing') return currentUser.department === 'Costing';
  // ...
  return true;
};
```
If a user lacks permission, they are seamlessly routed to a custom `RestrictedView` displaying clearance error notifications.

---

## 4. Routing Paradigm (Custom Workspace Router)
To maintain a high-efficiency VS Code-style workspace, standard URL-based routers (such as `react-router-dom`) are deliberately bypassed. Instead, views are managed as **Activity/Workspace States** within React memory.

### Benefits of Custom Workspace Routing:
- **Instant Workspace Swapping**: Switching views is instantaneous with zero HTTP roundtrips or page flickering.
- **Unified Global Context**: Since states live in a single tree, switching from the 'Logistics Desk' to the 'Personal Mailbox' does not destroy pending forms, draft compositions, or active searches.
- **Modal and Panel Cohesion**: The Command Palette (`CommandPalette.tsx`) can trigger navigation clicks, load profiles, search deals, and open emails seamlessly because it shares the identical state context.

---

## 5. Universal Workspace Component: `<ModuleDeskView>`
To avoid boilerplate duplication, aftermeet io implements a highly customizable generic workspace view wrapper: `src/components/ModuleDeskView.tsx`. This component handles the bulk of list tracking and board management.

### Key Capabilities:
1. **Dual-Display Modes**: Instant toggle between standard Tanstack Grid **Table** and visual **Kanban Board** views.
2. **Rule-Based Custom Views**: A dynamic builder panel allows operators to save custom filtering constraints (e.g., `Priority equals High`, `Status not_equals Completed`). Saved filters are persisted on a per-module basis in browser `localStorage`.
3. **Native HTML5 Drag and Drop**: Reorders items and synchronizes states instantly across Kanban columns using standard DOM events:
   - `onDragStart` captures the target item identifier.
   - `onDrop` invokes the specific state handler (e.g. `onUpdateStatus`) to synchronize state in the global hook.
4. ** Tanstack Table Integration**: Built-in column visibility lists, paginated record navigation, and column sort parameters.
5. **KPI Metrics Cards**: Displays modular totals, critical priorities count, and averages directly above data lists.

---

## 6. Global Command Palette Interaction System
Modeled directly after VS Code's Command Palette, the `src/components/CommandPalette.tsx` component serves as the central launcher:

- **Global Search Mode (`Ctrl+K` / `Cmd+K`)**: Searches dynamically across enquiries, tasks, emails, prospects, and expenses in a single search result list.
- **Action/Command Mode (`Ctrl+Shift+K` or prepending `>`)**: Runs administrative operations (e.g. swap profile, compose emails, navigate to active desks, run system diagnostic).
- **Ergonomics**: Supports fully keyboard-driven navigation (Arrow keys to choose, Enter to run, Escape to discard, Tab to change modes) with automatic scroll-to-view support.

---

## 7. Future Laravel Integration Pathway
The abstracted design of `apiClient.ts` mirrors typical database/API structures. In a unified production deployment:
1. **Laravel Controllers**: Will expose standardized routes matching `apiClient` structures (e.g., `/api/enquiries`, `/api/expenses`).
2. **Inertia.js Hydration**: Instead of setting React states from simulated timeouts, Laravel controllers will directly pass server-side models as props into `App.tsx` upon page requests, preserving instantaneous React rendering with secure server-side databases.
3. **Shared Models**: Type-safe definitions in `src/types/crm.ts` can map 1-to-1 with Eloquent models, ensuring full data contract consistency.
