# Polymorphic Task & Request Engine Architecture

This document defines the architectural blueprint for the polymorphic **Task and Request Engine** in aftermeet.io.

---

## 1. Executive Summary

In enterprise workflows, tasks and departmental requests need to attach dynamically to a wide variety of entities (Enquiries, Expenses, Contracts, Quotations, Sampling records, or standalone user items).

Rather than creating separate relational tables or adding dozens of nullable foreign key columns for every entity type, aftermeet.io uses a single **Polymorphic Task & Request Engine**.

---

## 2. The Problem with Direct Foreign Keys

The naive approach to linking tasks to different entities is adding foreign key columns for each entity to the `tasks` table:

```sql
-- Naive / anti-pattern approach
CREATE TABLE tasks (
    id INT PRIMARY KEY,
    title VARCHAR(255),
    enquiry_id INT NULL,
    expense_id INT NULL,
    contract_id INT NULL,
    quotation_id INT NULL,
    sampling_id INT NULL
    -- Every new module forces schema changes and adds another nullable column
);
```

### Disadvantages of the Naive Approach
1. **Database Bloat:** Most foreign key columns are `NULL` for any given row.
2. **Maintenance Overhead:** Every time a new module or entity is added, database migrations must be altered or appended to add a new `*_id` foreign key.
3. **Repeated Logic:** Frontend and backend code must write `if/else` checks for every foreign key column (`if ($task->enquiry_id) ... else if ($task->expense_id) ...`).

---

## 3. The Polymorphic Solution

Instead of separate columns for each entity, the table stores two generic columns:
1. `related_type` (String) → Identifies the target model name (e.g., `"App\Models\Enquiry"`, `"App\Models\Expense"`, `"App\Models\Contract"`, or `NULL` for standalone tasks).
2. `related_id` (Big Integer) → Stores the primary key ID of the target record (or `NULL` for standalone tasks).

```sql
-- Polymorphic schema
CREATE TABLE tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(32) DEFAULT 'task', -- 'task' or 'request'

    -- Polymorphic relationship columns
    related_type VARCHAR(255) NULL,
    related_id BIGINT NULL,

    -- Assignment & Handoffs
    assigned_to_user_id BIGINT NULL,
    assigned_to_department_id BIGINT NULL,
    source_department_id BIGINT NULL,

    -- Metadata
    priority VARCHAR(32) DEFAULT 'medium',
    due_date TIMESTAMP NULL,
    status VARCHAR(32) DEFAULT 'pending',

    -- Structured response for requests
    response_payload JSON NULL,

    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,

    INDEX tasks_related_index (related_type, related_id)
);
```

---

## 4. Laravel Native Implementation (`morphTo` / `morphMany`)

Laravel provides built-in support for polymorphic relationships through `morphTo()` and `morphMany()`.

### A. Task Model (`Task.php`)
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Task extends Model
{
    protected $fillable = [
        'title',
        'type',
        'related_type',
        'related_id',
        'assigned_to_user_id',
        'assigned_to_department_id',
        'source_department_id',
        'priority',
        'due_date',
        'status',
        'response_payload'
    ];

    /**
     * Get the parent related model (Enquiry, Expense, Contract, etc.).
     */
    public function related(): MorphTo
    {
        return $this->morphTo();
    }
}
```

### B. Attached Models (Enquiry, Expense, Contract)
```php
// Enquiry.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Enquiry extends Model
{
    public function tasks(): MorphMany
    {
        return $this->morphMany(Task::class, 'related');
    }
}

// Expense.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Expense extends Model
{
    public function tasks(): MorphMany
    {
        return $this->morphMany(Task::class, 'related');
    }
}

// Contract.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Contract extends Model
{
    public function tasks(): MorphMany
    {
        return $this->morphMany(Task::class, 'related');
    }
}
```

---

## 5. Unifying "Task" and "Request" into One Engine

Tasks and Department Requests share almost identical functional requirements:

| Feature / Attribute | Task | Department Request |
|---|---|---|
| **Assignment Target** | Person or Department | Department (or Person) |
| **Priority Level** | Low / Medium / High / Urgent | Low / Medium / High / Urgent |
| **Due Date** | Explicit date/time | Implied or explicit date/time |
| **Comments & Activity** | Threaded comments, drawers | Threaded comments, drawers |
| **Attachment** | Attached to record or standalone | Attached to record or standalone |
| **Source Origin** | Creator / User | `source_department_id` |
| **Response Lifecycle** | Complete / Incomplete | Accepted → In Progress → Returned / Completed |

### Unified Engine Advantages
By consolidating Tasks and Requests into a single polymorphic table and engine:
- **Zero Redundancy:** A single API controller (`TaskController`), drawer UI (`TaskChatDrawer`), and WebSocket channel structure manages both standard user tasks and inter-departmental requests.
- **Flexibility:** A standard task can easily be converted into or escalated as a department request by populating `source_department_id` and setting `type = 'request'`.
- **Reusable Workspaces:** Every department workspace (Costing, Sampling, Logistics, HR, Compliance) and sub-view reuses the same underlying data structures and real-time event mechanisms without needing custom database tables for each department.
