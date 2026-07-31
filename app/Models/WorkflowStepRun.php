<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowStepRun extends Model
{
    use HasFactory;

    protected $table = 'workflow_step_runs';

    protected $fillable = [
        'workflow_run_id',
        'node_id',
        'node_type',
        'status',
        'input',
        'output',
        'error_message',
        'completed_at',
    ];

    protected $casts = [
        'input' => 'array',
        'output' => 'array',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the workflow run.
     */
    public function workflowRun(): BelongsTo
    {
        return $this->belongsTo(WorkflowRun::class, 'workflow_run_id');
    }
}
