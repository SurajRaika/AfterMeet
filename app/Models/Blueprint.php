<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Blueprint extends Model
{
    use HasFactory;

    protected $table = 'blueprints';

    protected $fillable = [
        'tenant_id',
        'name',
        'description',
        'max_attempts',
    ];

    /**
     * Get the steps associated with the blueprint, ordered by step_order.
     */
    public function steps(): HasMany
    {
        return $this->hasMany(BlueprintStep::class, 'blueprint_id')->orderBy('step_order');
    }

    /**
     * Get the prospects assigned to this blueprint.
     */
    public function prospects(): HasMany
    {
        return $this->hasMany(Prospect::class, 'blueprint_id');
    }
}
