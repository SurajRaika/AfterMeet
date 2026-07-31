<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workflow extends Model
{
    use HasFactory;

    protected $table = 'workflows';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'trigger_type',
        'graph',
        'is_active',
    ];

    protected $casts = [
        'graph' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the runs associated with the workflow.
     */
    public function runs(): HasMany
    {
        return $this->hasMany(WorkflowRun::class, 'workflow_id');
    }
}
