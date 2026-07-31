<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowRun extends Model
{
    use HasFactory;

    protected $table = 'workflow_runs';

    protected $fillable = [
        'tenant_id',
        'workflow_id',
        'prospect_id',
        'status',
        'input',
        'output',
        'error_message',
    ];

    protected $casts = [
        'input' => 'array',
        'output' => 'array',
    ];

    /**
     * Get the workflow.
     */
    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class, 'workflow_id');
    }

    /**
     * Get the prospect.
     */
    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    /**
     * Get the step runs.
     */
    public function stepRuns(): HasMany
    {
        return $this->hasMany(WorkflowStepRun::class, 'workflow_run_id');
    }
}
