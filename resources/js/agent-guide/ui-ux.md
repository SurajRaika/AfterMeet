# aftermeet io - UI/UX Guidelines & Agent Guide

This document serves as the official UI/UX design directive for the **aftermeet io Enterprise Operations Platform** prototype. All future AI agents and human developer contributors **must** strictly adhere to these architectural design rules to preserve the application's unified interface philosophy.

---

## 1. Core UI/UX Philosophy: The VS Code IDE Paradigm
The aftermeet io platform is **directly and totally inspired by modern code editors like Visual Studio Code (VS Code)**.

### Why this design paradigm?
1. **Developer-Class Efficiency**: VS Code is the gold standard for high-density, focus-first workflows. Enterprise operators managing supply chain logs, financial requests, and custom queries require exactly the same tier of space-efficiency, multi-tasking density, and speed.
2. **Flat & Structural Ergonomics**: Standard consumer CRMs suffer from bloated white space, large buttons, and heavy rounded card components. aftermeet io is built as an "editor of operations" — favoring sharp flat borders (`border-neutral-200`), ultra-compact text scaling (`text-[10px]` to `text-[12px]`), monospaced details, and sharp corners (`rounded-none`).
3. **Keyboard-First Operations**: Navigating, launching modules, searching deals, and executing system parameters should always be doable directly from the keyboard without needing mouse point-and-clicks.

---

## 2. Standard VS Code-Style Layout Architecture
Any newly added layouts, screens, or sub-modules must orient themselves inside the established visual shell:

```
+---------------------------------------------------------------------------------+
|  [H] HEADER: Actions Toggle, Search Trigger, Quick Shortcuts Bar  [Switch User] |
+-----+---------------------------------------------------------------------------+
| [A] | [S] SIDEBAR / EXPLORER               | [E] EDITOR / WORKSPACE VIEWPORT   |
|     |                                      |                                   |
| [C] | Collapsible Tree Lists of:           | Tab/Grid View (ModuleDeskView)    |
| [T] | - Simulated Crew Profile Switcher    | Toggle Table vs Kanban Board      |
| [I] | - Workspace Tools (Tasks, Mail)      | Rule-based custom views builder   |
| [V] | - Spend Management Sub-desks         | Detailed transaction panels       |
| [I] | - Sales Front-End Active Modules     |                                   |
| [T] | - Operations Back-End Desks          |                                   |
| [Y] | - Departmental KPIs                  |                                   |
|     | - Presidential Executive Desk        |                                   |
| [B] |                                      |                                   |
| [A] |                                      +-----------------------------------+
| [R] |                                      | [C] TASK CHAT COLLAB DRAWER       |
|     |                                      | Right-docked contextual chat thread|
+-----+--------------------------------------+-----------------------------------+
| [ST] STATUS BAR: Environment Status, Active Crew Profile, Shortcuts Guide      |
+---------------------------------------------------------------------------------+
```

### A. Activity Bar & Sidebar
- **Purpose**: Mimics the left activity icons strip and collapsible file tree.
- **Rules**:
  - The simulated user identity is dynamically selected at the top of the Sidebar (`Sidebar.tsx`) as a role credential selector.
  - Sidebar links should display active badges/counters (` personalTasks.length`) and permission status locks (`Active` vs `Locked 🔒`).

### B. Header Bar
- **Purpose**: Houses quick shortcut buttons for launching key search modes.
- **Rules**:
  - Displays buttons with explicit keyboard tips (e.g. `Press Ctrl+K to Search` or `Press Ctrl+Shift+K for Actions`).

### C. Workspace Editor Viewport (Main Screen)
- **Purpose**: The focal panel where operations data is inspected or created.
- **Rules**:
  - Favor flexible tabular lists and Kanban grids that can toggle instantly with zero flicker.
  - Utilize `<ModuleDeskView>` to maintain unified look-and-feel across all list interfaces.

### D. Global Command Palette (`CommandPalette.tsx`)
- **Purpose**: Serves as the central navigation, action launcher, and entity searcher.
- **Rules**:
  - **Search Mode**: Searches across deals, tasks, expenses, prospects, and emails dynamically.
  - **Action Mode** (prefixed by `>`): Triggers operations, navigates to desks, swaps simulated user profiles, or launches modal builders.
  - **Accessibility**: Must maintain closure on background overlay click, closure on `Escape` keypress, keyboard index focus scrolling (`ArrowUp`/`ArrowDown`), and mode-swapping on `Tab` keypress.

---

## 3. Mandatory Requirement: Switchable Themes Ecosystem
To fully realize the VS Code-inspired vision, future iterations **must support custom theme switching**.

### How Theme Switching Must Be Built:
Future agents or developers implementing themes should follow this specific blueprint:

1. **Theme CSS Variables**:
   In `src/index.css` (or a dedicated styles module), define theme variables mapping to VS Code design tokens:
   ```css
   :root [data-theme="light-vs"] {
     --vscode-editor-bg: #f3f3f3;
     --vscode-editor-fg: #333333;
     --vscode-sidebar-bg: #e8e8e8;
     --vscode-sidebar-border: #dbdbdb;
     --vscode-accent: #007acc;
     --vscode-accent-fg: #ffffff;
   }

   :root [data-theme="dark-plus"] {
     --vscode-editor-bg: #1e1e1e;
     --vscode-editor-fg: #d4d4d4;
     --vscode-sidebar-bg: #252526;
     --vscode-sidebar-border: #3c3c3c;
     --vscode-accent: #0e639c;
     --vscode-accent-fg: #ffffff;
   }

   :root [data-theme="monokai"] {
     --vscode-editor-bg: #272822;
     --vscode-editor-fg: #f8f8f2;
     --vscode-sidebar-bg: #1e1f1c;
     --vscode-sidebar-border: #3e3d32;
     --vscode-accent: #a6e22e;
     --vscode-accent-fg: #272822;
   }
   ```

2. **Tailwind Class Binding**:
   Tailwind utility classes must consume these variables directly (e.g. `bg-[var(--vscode-editor-bg)]`, `text-[var(--vscode-editor-fg)]`, or configured as theme colors inside `vite.config.ts` or `tailwind.config.js`).

3. **Global Theme State & Persistence**:
   - Store the active theme token in global state (within `useCRMState.ts` or a standalone context).
   - Persist the selected theme token inside browser `localStorage` under the key: `aftermeet_vscode_theme` so it remains locked upon reload.
   - Inject the theme attribute on mount: `document.documentElement.setAttribute('data-theme', theme)`.

4. **Command Palette & Sidebar Launcher Integration**:
   - Provide a command in the Command Palette Action mode: `Preferences: Color Theme`.
   - Selecting this action should list available themes (e.g., `VS Code Light`, `VS Code Dark+`, `Monokai`, `Solarized Dark`, `Github Dark`, `High Contrast`).
   - Clicking a theme updates the global theme state and document attributes in real-time.

---

## 4. Design Guidelines Checklist for Future Agents
When implementing new screens, inputs, or interactive grids:
- [ ] **No Overly Rounded Elements**: Use sharp corners (`rounded-none` or `rounded-xs`). Absolutely no pill-shaped tags or heavy bubbles unless representing an explicit external system integration (like standard email avatar circles).
- [ ] **High Information Density**: Keep padding compact (`p-1.5`, `p-2`). Fit as many data points as safely readable on a 1080p screen.
- [ ] **Strict Visual Hierarchies**: Use uppercase labels with tiny text (`text-[8.5px] font-bold text-neutral-400 tracking-wider`) for titles, headers, and metadata tags.
- [ ] **Unified Borders**: Always use simple solid neutral lines (`border border-neutral-200`) instead of heavy shadows or three-dimensional mock elements.
- [ ] **Consistent Typography**: Use monospace font families (`font-mono`) for numerical values, IDs (e.g., `ENQ-2026-0012`), and system commands. Use crisp clean sans-serif styles (`font-sans`) for general lists and descriptions.
