<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Automation extends Model
{
    use HasFactory;

    protected $table = 'automations';

    protected $fillable = [
        'tenant_id',
        'name',
        'type',
        'workflow_definition',
        'is_active',
        'is_template',
    ];

    protected $casts = [
        'workflow_definition' => 'array',
        'is_active' => 'boolean',
        'is_template' => 'boolean',
    ];

    /**
     * Get the active instances of this automation.
     */
    public function instances(): HasMany
    {
        return $this->hasMany(AutomationInstance::class, 'automation_id');
    }

    /**
     * Duplicate this automation.
     */
    public function duplicate(string $newName = null): self
    {
        $clone = $this->replicate();
        $clone->name = $newName ?: $this->name . ' (Copy)';
        $clone->is_active = false; // default copy to inactive
        $clone->is_template = false; // clone is a custom workflow
        $clone->save();

        return $clone;
    }
}
