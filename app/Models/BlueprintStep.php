<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlueprintStep extends Model
{
    use HasFactory;

    protected $table = 'blueprint_steps';

    protected $fillable = [
        'blueprint_id',
        'step_order',
        'template_id',
        'wait_days',
    ];

    /**
     * Get the blueprint this step belongs to.
     */
    public function blueprint(): BelongsTo
    {
        return $this->belongsTo(Blueprint::class, 'blueprint_id');
    }

    /**
     * Get the template used in this step.
     */
    public function template(): BelongsTo
    {
        return $this->belongsTo(Template::class, 'template_id');
    }
}
