<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProspectStepLog extends Model
{
    use HasFactory;

    protected $table = 'prospect_step_logs';

    protected $fillable = [
        'prospect_id',
        'blueprint_step_id',
        'sent_at',
        'message_id',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    /**
     * Get the prospect this log belongs to.
     */
    public function prospect(): BelongsTo
    {
        return $this->belongsTo(Prospect::class, 'prospect_id');
    }

    /**
     * Get the blueprint step associated with this log.
     */
    public function blueprintStep(): BelongsTo
    {
        return $this->belongsTo(BlueprintStep::class, 'blueprint_step_id');
    }
}
