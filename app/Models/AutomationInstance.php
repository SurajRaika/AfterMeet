<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AutomationInstance extends Model
{
    use HasFactory;

    protected $table = 'automation_instances';

    protected $fillable = [
        'automation_id',
        'prospect_id',
        'status', // 'active', 'paused', 'completed', 'failed'
        'current_node',
        'started_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
    ];

    /**
     * Get the parent automation definition.
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class, 'automation_id');
    }

    /**
     * Get the associated prospect.
     */
    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    /**
     * Get the step/run execution logs for this instance.
     */
    public function runs(): HasMany
    {
        return $this->hasMany(AutomationRun::class, 'instance_id');
    }
}
