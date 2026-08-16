# aftermeet io - Laravel Production Integration Guide

This guide is a blueprint for converting your React/Tailwind/TypeScript prototype into a production-grade enterprise software application using **Laravel** as the backend.

---

## 1. Architectural Strategy: SPA vs. Inertia.js vs. Livewire

Your first core decision is how the frontend and backend should interact. Since you already have a highly polished, fully functioning React/TypeScript workspace with intricate subviews, here is a detailed breakdown of your options:

### Option A: Inertia.js (Highly Recommended)
Inertia allows you to use your existing React frontend while keeping Laravel as the controller and routing engine. It acts as a bridge so you do not need to build a custom REST API or deal with complex SPA routing, CORS, and JWT authentication.

*   **How it works:** Laravel handles the routing (`web.php`). A controller queries data from the database and returns `Inertia::render('MyTasksView', ['tasks' => $tasks])`. Inertia automatically passes this data as standard React props to your component.
*   **Pros:**
    *   **95% Code Reuse:** You keep this exact React SPA structure, component design, and state handlers.
    *   **Zero API Boilerplate:** No need to write separate API route files, API controllers, serialize JSON responses, or manage separate client-side state fetching libraries (like Axios or React Query) for initialization.
    *   **Standard Laravel Auth:** You can use standard Laravel sessions, cookies, and middleware (e.g., Laravel Breeze/Jetstream) for security.
    *   **Instant SEO & Security:** Routing is defined in secure PHP files.
*   **Cons:**
    *   Tight coupling of frontend and backend inside a single repo.

### Option B: Decoupled Single-Page Application (existing React SPA + Laravel REST API)
In this architecture, your React SPA is hosted separately (e.g., Vercel, Netlify, or AWS S3/CloudFront) and communicates with Laravel over a stateless REST API using CORS and Token Authentication (Laravel Sanctum).

*   **How it works:** React has its own routing (e.g., React Router). It triggers `fetch()` requests to `https://api.aftermeet.io/api/...`. Laravel responds with JSON.
*   **Pros:**
    *   Complete separation of concerns.
    *   You can easily replace the web interface or build a mobile app pointing to the exact same API.
*   **Cons:**
    *   Double routing boilerplate: You have to define routes in both React and Laravel.
    *   Complex authentication setup (handling Sanctum CSRF cookies or local storage JWT tokens securely).
    *   CORS configuration issues.

### Option C: Laravel Livewire (Blade + PHP)
Livewire is a PHP-centric full-stack framework. You write HTML-like blade templates with custom PHP components.

*   **How it works:** All state and interactive functions are defined in PHP classes. Clicking a button runs a PHP method via AJAX.
*   **Pros:**
    *   Pure PHP development, no React, Webpack/Vite config, or JS state management required.
*   **Cons:**
    *   **Zero Code Reuse:** You would have to **throw away 100% of your React component files** and rewrite every form, table, sidebar, and drawer in Blade templates and AlpineJS.
    *   Slower UI transitions since every click/event must round-trip to the server.

---

## 2. Our Architecture Recommendation: React + Inertia.js

**We strongly recommend using Inertia.js with React** for this CRM prototype.
Because your layout has complex React states, drawer toggles, and live-updated workspaces (like the Spend Management desk and costing modules), rebuilding this in Livewire would be extremely tedious. Using Inertia.js lets you keep all React code as-is, while giving you the simplicity of monolithic Laravel development.

### How to set up Inertia.js with your current code:
1.  **Install Inertia on Laravel:**
    ```bash
    composer require inertiajs/inertia-laravel
    ```
2.  **Install Inertia on React:**
    ```bash
    bun add @inertiajs/react
    ```
3.  **Define Laravel Controllers:**
    ```php
    use Inertia\Inertia;

    class TaskController extends Controller {
        public function index() {
            return Inertia::render('MyTasksView', [
                'tasks' => Task::with('comments')->get(),
                'currentUser' => auth()->user()
            ]);
        }
    }
    ```

---

## 3. Implementation of Mock APIs & Seamless Integration

We have created a clean central API client layer under `src/services/apiClient.ts`.
This client is designed to facilitate a zero-friction transition to production.

### Mock Client Layout
```typescript
export const API_CONFIG = {
  useMock: true, // Switch to false to target real production endpoints!
  baseURL: '/api',
};
```

When you transition to a decoupled SPA, change `useMock` to `false` and specify your Laravel endpoint in `baseURL`. If you are using Inertia, you will replace client-side `apiClient` queries with standard Inertia page requests (`router.post()`, `router.put()`), keeping the API object models identical.

---

## 4. Real-Time Sync: Handling Live Change Events (Decided Architecture)

**Architecture Decision:** We will use **WebSockets** via **Laravel Echo** and **Laravel Reverb (or Pusher/Soketi)** to handle multi-user concurrent updates.

### Scenario: Concurrent Stage Updates
If User A changes the stage of a Prospect or Enquiry, Laravel handles the update in the database, then dispatches a **Broadcast Event** over WebSockets. User B's browser (React frontend) listens to this event in real-time, receives the updated data, and merges it into their React state (`prospects`, `enquiries`, etc.). Because React components re-render automatically when state updates, **User B's UI reflects the stage change instantly without requiring a page reload**.

### A. How Laravel Dispatches the Stage Update Event
When a prospect's status is changed, Laravel broadcasts the event:

```php
namespace App\Events;

use App\Models\Prospect;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProspectStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $prospect;

    public function __construct(Prospect $prospect)
    {
        $this->prospect = $prospect;
    }

    public function broadcastOn()
    {
        return new Channel('prospects-pipeline');
    }
}
```

### B. How React Listens and Multi-User UI Updates Live
By installing `laravel-echo` and `pusher-js` (`bun add laravel-echo pusher-js`), we listen to this channel in `src/hooks/useCRMState.ts`:

```typescript
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb', // Laravel Reverb server
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    forceTLS: false,
    disableStats: true,
});

// Inside useCRMState():
useEffect(() => {
  // Listen for prospects stage updates
  const channel = echo.channel('prospects-pipeline')
    .listen('.ProspectStatusUpdated', (event: { prospect: Prospect }) => {
      // Dynamic merge live-changed prospect state. React automatically updates current UI!
      setProspects(prev =>
        prev.map(p => p.id === event.prospect.id ? event.prospect : p)
      );
      triggerToast(`Prospect ${event.prospect.companyName} status changed to ${event.prospect.status} live!`);
    });

  return () => {
    channel.stopListening('.ProspectStatusUpdated');
  };
}, []);
```

This live sync model applies across all modules (Tasks, Costing request stages, Spend Claims, and Prospects), keeping all active concurrent users completely synchronized in real-time.

---

## 5. Security Gates & Middleware

We have successfully bypassed the passcode verification screen (`AM-2026`) in `src/App.tsx`.
For your production launch, secure authorization should be shifted to Laravel's native mechanisms:

1.  **Authentication Middleware:** Protect all routes using Laravel's standard `'auth'` middleware in `web.php` or `api.php`.
2.  **Role-Based Access Control (RBAC):** Use Laravel **Gates** or **Policies** to secure sensitive departments (e.g., HR, Presidential Overview). When rendering with Inertia, you can pass permissions as user-session properties, which React can inspect in `checkPermissions()`:
    ```php
    return Inertia::render('Workspace', [
        'permissions' => [
            'can_access_hr' => Gate::allows('access-hr'),
            'can_access_president' => Gate::allows('access-president')
        ]
    ]);
    ```

This ensures maximum security, maintainability, and clean separation of concerns!
