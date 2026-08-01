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
        'status',
        'current_node',
        'started_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
    ];

    /**
     * Get the automation that owns the instance.
     */
    public function automation(): BelongsTo
    {
        return $this->belongsTo(Automation::class, 'automation_id');
    }

    /**
     * Get the prospect associated with this instance.
     */
    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    /**
     * Get the runs/logs for the instance.
     */
    public function runs(): HasMany
    {
        return $this->hasMany(AutomationRun::class, 'instance_id');
    }
}
