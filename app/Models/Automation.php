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
        'name',
        'type',
        'workflow_definition',
        'is_active',
    ];

    protected $casts = [
        'workflow_definition' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Get the instances for the automation.
     */
    public function instances(): HasMany
    {
        return $this->hasMany(AutomationInstance::class, 'automation_id');
    }
}
