# Wave CRM to Enterprise Multi-Tenant Platform (Zoho-like Suite)
## Architectural & Implementation Blueprint for a Multi-Tenant, Encrypted Email CRM System

This report outlines the complete, production-grade architecture and step-by-step roadmap to convert the **Wave Laravel CRM** framework into a fully isolated, enterprise-scale **Multi-Tenant CRM Suite** (similar to Zoho CRM) with automatic landing page generation, robust email syncing (via Nylas v3), and enterprise data encryption ("inscript data" / column-level encryption).

---

## 1. Executive Summary & Strategy

To transform the current platform into an **All-In-One Enterprise CRM (similar to Zoho)**, we must evolve the core infrastructure across three pillars:

1. **Multi-Tenant System (Enterprise Isolation)**:
   - Separate every subscriber into an **Organization (Tenant)**.
   - Restrict database queries automatically so that Organization A can never access Organization B's data, even if an insecure query is written.
   - Enforce rigorous field-level encryption for sensitive business data (such as emails, API keys, contact details, and client notes).

2. **Email & Automation Engine (The Nylas Sync Backbone)**:
   - Provide a bidirectional email sync where connected IMAP/Gmail/Outlook accounts mirror metadata and message bodies into our local tenant-scoped database.
   - Implement an automated email campaign runner that triggers sequences, custom multi-step workflows, and auto-responders scoped to each organization's custom triggers.

3. **Landing Pages & Portal Suite (`afterme.com` and custom tenant pages)**:
   - Use `afterme.com` as the primary marketing home page, pricing matrix, and registration portal.
   - Dynamically route organization-specific landing pages and lead capture portals via subdomains (e.g., `tenant1.afterme.com`) or completely custom domains (e.g., `crm.clientcompany.com`).

---

## 2. Multi-Tenant Architecture & Data Isolation Design

When architecting a Zoho-like multi-tenant application, we have three database options:

| Strategy | Description | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **A. Separate Database per Tenant** | Every organization has its own database connection. | 100% data separation. Easiest backup strategy per client. | Highly complex schema migrations; high hosting resource overhead. | Good for highly sensitive government clients. |
| **B. Shared Database with Tenant Scoping** | All tenants share one database, but every table contains an `organization_id` foreign key. | Low hosting cost, incredibly easy schema migrations, instantly scalable. | Risk of data leak if a developer forgets to apply a tenant filter. | **Recommended for modern SaaS (e.g., Zoho, HubSpot, Salesforce).** |

### Robust Shared Database Isolation (Single DB with Global Scopes)

To eliminate the risk of data leaks in a shared database design, we implement **automatic tenant scoping** using Laravel's **Eloquent Global Scopes**. When a user logs in, their current `organization_id` is bound to the application lifecycle. Every query executed on a tenant-aware model is automatically scoped to that ID.

#### Implementation: `App\Traits\BelongsToOrganization.php`

```php
namespace App\Traits;

use App\Models\Organization;
use App\Scopes\OrganizationScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToOrganization
{
    /**
     * Boot the trait to apply the tenant global scope automatically.
     */
    protected static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope(new OrganizationScope);

        // Automatically assign the logged-in user's organization_id on model creation
        static::creating(function ($model) {
            if (auth()->check() && ! $model->organization_id) {
                $model->organization_id = auth()->user()->organization_id;
            }
        });
    }

    /**
     * Get the organization that owns this model.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'organization_id');
    }
}
```

#### Implementation: `App\Scopes\OrganizationScope.php`

```php
namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class OrganizationScope implements Scope
{
    /**
     * Apply the scope to a given Eloquent query builder.
     */
    public function apply(Builder $builder, Model $model): void
    {
        // If a user is authenticated, isolate queries to their organization
        if (auth()->check() && auth()->user()->organization_id) {
            $builder->where($model->getTable() . '.organization_id', auth()->user()->organization_id);
        }
    }
}
```

By adding `use BelongsToOrganization;` to any model (e.g., `Lead`, `Prospect`, `EmailMessage`, `Template`), the application enforces complete, unbreakable logical isolation!

---

## 3. Data Encryption & Security ("Inscript Data" / At-Rest Encryption)

Enterprise clients require sensitive data to be encrypted at rest ("inscript"). We protect database records using **Envelope Encryption** or Laravel's native **Encrypted Casts**.

If an attacker breaches the database server, they will only see unreadable ciphertext for the encrypted columns.

### Encrypted Casts in Laravel
We encrypt sensitive fields on-the-fly when writing to the database, and decrypt them automatically when reading:

```php
namespace App\Models;

use App\Traits\BelongsToOrganization;
use Illuminate\Database\Eloquent\Model;

class Prospect extends Model
{
    use BelongsToOrganization;

    protected $casts = [
        'first_name' => 'encrypted',
        'last_name' => 'encrypted',
        'email' => 'encrypted',
        'phone' => 'encrypted',
        'social_security_number' => 'encrypted',
        'notes' => 'encrypted',
    ];
}
```

### High-Performance Searching over Encrypted Data
Standard encryption is randomized, meaning `WHERE email = 'client@example.com'` will fail because the ciphertext changes every time. To fix this, we generate a secure **blind index** (using a cryptographically hashed value of the plaintext) and store it in a secondary database column (e.g., `email_bindex`).

#### Code Implementation for Searchable Encrypted Fields:
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class Prospect extends Model
{
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            if ($model->isDirty('email')) {
                // Generate a consistent, deterministic hash for fast queries
                $model->email_bindex = hash_hmac('sha256', $model->email, config('app.key'));
            }
        });
    }

    /**
     * Scope to find a prospect by their encrypted email address.
     */
    public function scopeWhereEmail($query, $plainEmail)
    {
        $hashed = hash_hmac('sha256', $plainEmail, config('app.key'));
        return $query->where('email_bindex', $hashed);
    }
}
```

---

## 4. Multi-Tenant Custom Domains & Dynamic Landing Pages

Each organization on your platform gets their own landing page (to capture leads) and customer portal.
- **Main Portal Home**: `afterme.com` (Marketing, sign up, billing, and docs).
- **Subdomain Routing**: `https://{tenant_slug}.afterme.com` (Redirects to organization landing pages / client login).
- **Custom Domains**: `https://crm.clientbrand.com` (Mapped via reverse proxy like Cloudflare or Caddy).

### Mappings and Middleware for Dynamic Domain Parsing

To handle this cleanly in Laravel, we register a middleware that reads the incoming host header, resolves the organization, and sets it as the active tenant.

```php
namespace App\Http\Middleware;

use Closure;
use App\Models\Organization;
use Illuminate\Http\Request;

class TenantDomainMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $host = $request->getHost();
        $mainDomain = config('app.main_domain', 'afterme.com');

        $organization = null;

        if ($host !== $mainDomain && str_ends_with($host, '.' . $mainDomain)) {
            // 1. Subdomain resolution (e.g. tenant1.afterme.com)
            $subdomain = str_replace('.' . $mainDomain, '', $host);
            $organization = Organization::where('slug', $subdomain)->first();
        } else if ($host !== $mainDomain) {
            // 2. Custom external domain resolution (e.g. crm.clientbrand.com)
            $organization = Organization::where('custom_domain', $host)->first();
        }

        if ($organization) {
            // Bind active organization to current request container
            app()->instance(Organization::class, $organization);

            // Set user context
            config(['app.active_tenant_id' => $organization->id]);
        }

        return $next($request);
    }
}
```

### Dynamic Landing Page Engine
Once the tenant is identified, the landing page layout and color scheme can be loaded dynamically from the organization's settings table:

```html
<!-- resources/views/tenant-landing.blade.php -->
<!DOCTYPE html>
<html lang="en">
<head>
    <title>{{ $organization->name }} | Portal</title>
    <!-- Dynamic custom styling injected by the organization -->
    <style>
        :root {
            --primary-color: {{ $organization->getSetting('primary_color', '#3B82F6') }};
            --secondary-color: {{ $organization->getSetting('secondary_color', '#1E3A8A') }};
        }
        .btn-tenant {
            background-color: var(--primary-color);
            color: white;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
    <div class="max-w-4xl mx-auto py-12 px-6">
        <header class="text-center mb-12">
            @if($organization->logo)
                <img src="{{ Storage::url($organization->logo) }}" alt="Logo" class="mx-auto h-16 mb-4">
            @else
                <h1 class="text-3xl font-extrabold">{{ $organization->name }}</h1>
            @endif
            <p class="text-gray-600 mt-2">{{ $organization->getSetting('landing_headline', 'Welcome to our Customer Portal') }}</p>
        </header>

        <!-- Dynamic Lead Capture Form -->
        <div class="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
            <h2 class="text-xl font-bold mb-6 text-center">Get in Touch</h2>
            <form action="{{ route('tenant.leads.store', $organization->id) }}" method="POST">
                @csrf
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Name</label>
                    <input type="text" name="name" class="w-full border-gray-300 rounded-md" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" name="email" class="w-full border-gray-300 rounded-md" required>
                </div>
                <button type="submit" class="w-full btn-tenant py-2 rounded-md font-bold transition">Submit Request</button>
            </form>
        </div>
    </div>
</body>
</html>
```

---

## 5. Multi-Tenant Email & Automation Suite (Zoho CRM Equivalence)

A flagship feature of Zoho CRM is its integrated **Email & Automated Marketing Suite**. By leveraging **Nylas v3** as a secure routing abstraction, we build real-time mailbox syncing and multi-step campaign automations natively inside our multi-tenant application.

### A. Nylas v3 Email Sync Engine (Tenant-Isolated)
Each tenant organization connects their corporate mailboxes (Gmail, Office 365, IMAP) via OAuth.
- We map each Nylas connected account to its owning `organization_id`.
- The webhook listener receives updates, calculates signature integrity, decodes compressed data, and schedules sync jobs scoped to the correct organization.

```
┌──────────────────┐               ┌─────────────────────┐               ┌───────────────────┐
│  Nylas Webhook   │  1. Event     │  Webhook Controller │  2. Dispatch  │  SyncNewEmailJob  │
│  (Cloud Event)   │──────────────>│ (Verify Signature)  │──────────────>│ (Isolated context)│
└──────────────────┘               └─────────────────────┘               └───────────────────┘
                                                                                   │
                                                                                   │ 3. Save Cache
                                                                                   ▼
                                                                         ┌───────────────────┐
                                                                         │ Database (Single) │
                                                                         │ (Tenant Scoped)   │
                                                                         └───────────────────┘
```

#### Multi-Tenant Webhook Processing Logic:
```php
namespace App\Http\Controllers;

use App\Models\NylasAccount;
use App\Jobs\SyncNewEmailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NylasWebhookController extends Controller
{
    public function handle(Request $request)
    {
        // 1. Handshake response (GET request challenge)
        if ($request->isMethod('get') && $request->has('challenge')) {
            return response($request->query('challenge'), 200)->header('Content-Type', 'text/plain');
        }

        // 2. Validate Secure X-Nylas-Signature Header
        $signature = $request->header('X-Nylas-Signature');
        $rawPayload = $request->getContent();

        if (hash_hmac('sha256', $rawPayload, config('services.nylas.webhook_secret')) !== $signature) {
            return response()->json(['error' => 'Invalid signature'], 401);
        }

        $payload = json_decode($rawPayload, true);
        $eventData = $payload['data'] ?? [];
        $grantId = $eventData['grant_id'] ?? null;
        $messageId = $eventData['object']['id'] ?? null;

        if ($grantId && $messageId) {
            // Find corresponding account to retrieve Organization tenant context
            $account = NylasAccount::where('nylas_grant_id', $grantId)->first();

            if ($account) {
                // Dispatch isolated sync job bound to the organization
                SyncNewEmailJob::dispatch($account->organization_id, $account->id, $messageId);
            }
        }

        return response()->json(['status' => 'success'], 200);
    }
}
```

---

### B. Dynamic Email Campaign & Automation Engine
Automations represent sequential actions triggered by client interactions (e.g., Lead Created, Contact Tagged, or Email Opened). We establish an extensible blueprinting engine where users define custom email automation rules.

#### Schema Design for Email Sequences

```
                    ┌─────────────────┐
                    │    Campaign     │
                    └─────────────────┘
                             │ 1
                             │
                             │ *
                    ┌─────────────────┐
                    │  SequenceStep   │
                    └─────────────────┘
                             │ 1
                             │
                             │ *
                    ┌─────────────────┐
                    │ ProspectTrigger │
                    └─────────────────┘
```

```php
// Migration for Multi-Step Workflows
Schema::create('campaign_sequences', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('organization_id')->index();
    $table->string('name');
    $table->boolean('is_active')->default(false);
    $table->timestamps();

    $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
});

Schema::create('sequence_steps', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('campaign_sequence_id');
    $table->integer('step_number'); // Step sequence (1, 2, 3...)
    $table->integer('delay_days')->default(0); // Delay before execution
    $table->string('subject_template');
    $table->longText('body_template'); // Rich text template with placeholders (e.g. {{ first_name }})
    $table->timestamps();

    $table->foreign('campaign_sequence_id')->references('id')->on('campaign_sequences')->onDelete('cascade');
});

Schema::create('prospect_workflow_logs', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('organization_id')->index();
    $table->unsignedBigInteger('prospect_id');
    $table->unsignedBigInteger('sequence_step_id');
    $table->string('status')->default('scheduled'); // scheduled, sent, failed
    $table->timestamp('scheduled_for');
    $table->timestamp('executed_at')->nullable();
    $table->timestamps();

    $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
});
```

#### Automation Dispatcher Job
A daemon cron job (running every minute) queries scheduled tasks, resolves dynamic template placeholders, and routes emails through the connected organization mailbox:

```php
namespace App\Jobs;

use App\Models\ProspectWorkflowLog;
use App\Services\NylasEmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessScheduledWorkflows implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(NylasEmailService $nylasService)
    {
        $now = now();
        // Load pending workflow steps
        $pendingLogs = ProspectWorkflowLog::with(['prospect', 'step', 'organization'])
            ->where('status', 'scheduled')
            ->where('scheduled_for', '<=', $now)
            ->limit(100)
            ->get();

        foreach ($pendingLogs as $log) {
            $prospect = $log->prospect;
            $step = $log->step;
            $organization = $log->organization;

            // Resolve connected Nylas Account for organization
            $nylasAccount = $organization->nylasAccounts()->where('is_syncing', true)->first();

            if (! $nylasAccount) {
                $log->update(['status' => 'failed_no_mailbox']);
                continue;
            }

            // Compile template with custom fields
            $compiledSubject = str_replace('{{ first_name }}', $prospect->first_name, $step->subject_template);
            $compiledBody = str_replace('{{ first_name }}', $prospect->first_name, $step->body_template);

            try {
                // Send email through Nylas
                $nylasService->sendMessage($nylasAccount->nylas_grant_id, [
                    'to' => [['email' => $prospect->email, 'name' => $prospect->name]],
                    'subject' => $compiledSubject,
                    'body' => $compiledBody,
                ]);

                $log->update([
                    'status' => 'sent',
                    'executed_at' => now(),
                ]);

                // Check and schedule subsequent step
                $this->scheduleNextStep($prospect, $step);

            } catch (\Exception $e) {
                $log->update(['status' => 'failed']);
            }
        }
    }

    protected function scheduleNextStep($prospect, $currentStep)
    {
        $nextStep = \App\Models\SequenceStep::where('campaign_sequence_id', $currentStep->campaign_sequence_id)
            ->where('step_number', $currentStep->step_number + 1)
            ->first();

        if ($nextStep) {
            ProspectWorkflowLog::create([
                'organization_id' => $prospect->organization_id,
                'prospect_id' => $prospect->id,
                'sequence_step_id' => $nextStep->id,
                'status' => 'scheduled',
                'scheduled_for' => now()->addDays($nextStep->delay_days),
            ]);
        }
    }
}
```

---

## 6. Complete Database Schema Configuration (The Enterprise Migrations)

To build a fully production-ready structure, execute the migrations below to prepare the database for tenant scoping.

### Step A: Creating base Organizations Table
```php
Schema::create('organizations', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique(); // For tenant subdomains: companyname.afterme.com
    $table->string('custom_domain')->nullable()->unique(); // For enterprise white-label domains
    $table->unsignedBigInteger('user_id'); // Primary administrator
    $table->json('settings')->nullable(); // Flexible JSON settings store (branding, default parameters)
    $table->timestamps();
});
```

### Step B: Migrating users to support organization bounds
```php
Schema::table('users', function (Blueprint $table) {
    $table->unsignedBigInteger('organization_id')->nullable()->after('id');
    $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('set null');
});
```

### Step C: Scoping all CRM elements (Leads, Contacts, Templates, and Integrations)
```php
Schema::create('crm_contacts', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('organization_id')->index();

    // Encrypted CRM Data (Searchable via blind indexes)
    $table->text('first_name');
    $table->text('last_name');
    $table->text('email');
    $table->string('email_bindex')->index(); // Blind Index hash
    $table->text('phone')->nullable();
    $table->string('status')->default('Lead'); // Lead, Contact, Account, Closed-Won

    $table->timestamps();
    $table->foreign('organization_id')->references('id')->on('organizations')->onDelete('cascade');
});
```

---

## 7. Migration & Conversion Implementation Roadmap

Converting your standard Wave installation into this enterprise model is best completed in **4 clean implementation phases**:

```
┌─────────────────────────────────┐
│ PHASE 1: Core Multi-Tenancy     │
│ - Run database migrations.      │
│ - Register global query scopes. │
│ - Map subdomains middleware.    │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ PHASE 2: Enterprise Encryption  │
│ - Bind encrypted attributes.    │
│ - Implement blind indexes.      │
│ - Build search utility scopes.  │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ PHASE 3: Nylas Email Alignment  │
│ - Tie Connected mailboxes to    │
│   tenant organizations.         │
│ - Implement cloud Event routes. │
└─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────┐
│ PHASE 4: Automation Engine      │
│ - Set sequences daemon job.     │
│ - Set templates dynamic builder.│
│ - Map subdomain landing pages.  │
└─────────────────────────────────┘
```

### Phase 1: Core Multi-Tenancy & Isolation setup
1. Run base migrations to establish organizations, domain mappings, and reference columns.
2. Configure dynamic sub-domain mapping middleware and register it inside `app/Http/Kernel.php` or `bootstrap/app.php`.
3. Apply `BelongsToOrganization` Eloquent trait to all critical CRM tables to lock query security globally.

### Phase 2: Enterprise Column Encryption
1. Add `encrypted` castings onto target columns (`email`, `phone`, `personal_data`) across models.
2. Build automated listener checks that trigger blind hash updates anytime search-bound elements are created or updated.

### Phase 3: Nylas Multi-Tenant Alignment
1. Modify `nylas_accounts` schema to add an `organization_id` constraint.
2. Update the webhook listener to look up account references dynamically, verify incoming secure signatures, and process sync payloads.

### Phase 4: Dynamic Landing Pages & sequences
1. Mount wild-card subdomain rules inside web routes to direct `*.afterme.com` requests into dynamic landing page layouts.
2. Build an automation daemon engine to query outstanding campaigns, render templates using dynamic placeholder tags, and queue secure email deliveries.

---

## 8. Conclusion & Strategic Recommendation

By converting **Wave CRM** to a Multi-Tenant model using a **Single Database with Global Scoping**, your system achieves optimal hosting costs, effortless scale, and standard schema updates while ensuring complete data isolation.

Pairing this with **Nylas v3** provides enterprise-grade email syncing, transforming the codebase into a robust, secure, and production-ready All-In-One CRM tool competitive with Zoho and HubSpot.
