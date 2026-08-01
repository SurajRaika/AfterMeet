<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationRun extends Model
{
    use HasFactory;

    protected $table = 'automation_runs';

    protected $fillable = [
        'instance_id',
        'node_id',
        'input_payload',
        'output_payload',
        'status',
        'error_message',
    ];

    protected $casts = [
        'input_payload' => 'array',
        'output_payload' => 'array',
    ];

    /**
     * Get the automation instance that owns the run log.
     */
    public function instance(): BelongsTo
    {
        return $this->belongsTo(AutomationInstance::class, 'instance_id');
    }
}
