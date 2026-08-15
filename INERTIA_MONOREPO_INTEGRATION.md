# AfterMeet CRM - Inertia.js Monorepo Integration Report

## 1. Executive Summary

This report documents the integration of the React CRM prototype frontend into the Laravel Wave application codebase as an **Inertia.js Monorepo**.

By combining Laravel 12 on the backend with Inertia.js and React 19 (TypeScript) on the frontend, the application benefits from:
- A single unified repository (Monorepo) holding both backend models/controllers and frontend React pages/components.
- Server-driven SPA routing without full page reloads or complex client-side API state synchronization boilerplate.
- TypeScript support with strict type definitions for Prospects, Email Threads, Templates, and Blueprints.
- Automated asset bundling via Vite and Tailwind CSS.

---

## 2. Directory Structure (`resources/js/`)

The React frontend has been integrated directly under `resources/js/` with the following modular architecture:

```
resources/js/
├── app.tsx                 # Inertia client entry point & React bootstrapper
├── prototype.tsx           # Original React prototype top-level component export
├── Components/             # Reusable UI React Components
│   ├── Navbar.tsx          # Top header with search, notifications, and email sync trigger
│   ├── Sidebar.tsx         # Left sidebar navigation
│   ├── InboxView.tsx       # Email threads list and detailed message viewer with reply form
│   └── ProspectsBoard.tsx  # Prospect pipeline table with filtering and modal form
├── Pages/                  # Inertia Page Components
│   └── App.tsx             # Main CRM Application Layout & view switcher (Inbox, Prospects, etc.)
├── Hooks/                  # Custom React Hooks
│   └── useProspects.ts     # Hook for managing prospect pipeline state and filtering
├── Services/               # Frontend API service layer
│   └── api.ts              # Axios wrapper for prospect & email sync endpoints
├── Types/                  # TypeScript interface definitions
│   └── index.ts            # Prospect, EmailThread, EmailMessage, Template, Blueprint interfaces
└── Constants/              # Shared constants and badges
    └── index.ts            # Navigation items, prospect status badge styles
```

---

## 3. Configuration & Infrastructure Setup

### A. Composer & PHP Packages
- Installed `inertiajs/inertia-laravel` (`^3.3`).
- Generated and registered middleware `App\Http\Middleware\HandleInertiaRequests` in `bootstrap/app.php`.
- Created Root Inertia Blade template at `resources/views/app.blade.php`:
  ```blade
  <!DOCTYPE html>
  <html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>{{ config('app.name', 'Wave') }}</title>
      @viteReactRefresh
      @vite(['resources/js/app.tsx'])
      @inertiaHead
  </head>
  <body class="font-sans antialiased bg-gray-50 dark:bg-gray-900">
      @inertia
  </body>
  </html>
  ```
- Configured `config/inertia.php` page paths to include `resource_path('js/Pages')`.

### B. NPM Packages & Vite Configuration
- Installed `@inertiajs/react`, `@vitejs/plugin-react`, `lucide-react`, `typescript`, `@types/node`.
- Updated `vite.config.js` to include the React plugin and specify `'resources/js/app.tsx'` as an entry point:
  ```js
  import react from '@vitejs/plugin-react';

  export default defineConfig({
      plugins: [
          tailwindcss(),
          react(),
          laravel({
              input: ['resources/js/app.tsx', ...],
              refresh: ['resources/themes/**/*', 'resources/js/**/*'],
          }),
      ],
      resolve: {
          alias: {
              '@': path.resolve(__dirname, 'resources/js'),
          },
      },
  });
  ```
- Created `tsconfig.json` at root with path mapping `@/*` -> `resources/js/*`.

---

## 4. Route Integration

The Inertia application route is registered in `routes/web.php`:

```php
Route::get('/app-prototype', function () {
    return \Inertia\Inertia::render('App', [
        'user' => auth()->user() ? [
            'id' => auth()->user()->id,
            'name' => auth()->user()->name,
            'email' => auth()->user()->email,
        ] : null,
    ]);
})->name('app-prototype');
```

Users can access the full integrated React CRM interface by visiting `/app-prototype`.

---

## 5. Developer Workflow

### Running Local Development
To work on the frontend with hot module reloading (HMR):
```bash
npm run dev
# or
composer run dev
```

### Building Assets for Production
To bundle all assets (CSS and TypeScript / React chunks):
```bash
npm run build
```

### Running Automated Tests
To run backend and Inertia feature tests:
```bash
./vendor/bin/pest tests/Feature/InertiaMonorepoTest.php
```

---

## 6. Frontend Development Guidelines & Next Steps

1. **Creating New Inertia Pages:**
   - Add new page components under `resources/js/Pages/` (e.g. `resources/js/Pages/Prospects/Show.tsx`).
   - Render them from Laravel controllers using `Inertia::render('Prospects/Show', $props)`.

2. **Passing Shared Props:**
   - Modify `App\Http\Middleware\HandleInertiaRequests::share()` to pass global props (e.g. authenticated user info, active tenant info, notifications, flash messages).

3. **Inertia Form Submissions:**
   - Use `useForm` from `@inertiajs/react` for submitting forms directly to Laravel routes without manual API state syncing.
