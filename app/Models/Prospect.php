<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Prospect extends Model
{
    use HasFactory;

    protected $table = 'prospects';

    protected $fillable = [
        'tenant_id',
        'company_name',
        'contact_name',
        'contact_email',
        'contact_role',
        'status',
        'blueprint_id',
        'current_step_order',
        'sent_without_correct_condition',
        'last_sent_at',
        'next_send_at',
        'notes',
        'stage',
        'country',
        'company_size',
        'source',
        'event',
    ];

    protected $casts = [
        'last_sent_at' => 'datetime',
        'next_send_at' => 'datetime',
        'company_size' => 'integer',
    ];

    /**
     * Get the blueprint assigned to this prospect.
     */
    public function blueprint(): BelongsTo
    {
        return $this->belongsTo(Blueprint::class, 'blueprint_id');
    }

    /**
     * Get the logs for steps sent to this prospect.
     */
    public function stepLogs(): HasMany
    {
        return $this->hasMany(ProspectStepLog::class, 'prospect_id');
    }

    /**
     * Get the automation instances for the prospect.
     */
    public function automationInstances(): HasMany
    {
        return $this->hasMany(AutomationInstance::class, 'prospect_id');
    }

    /**
     * Bootstrap the model and trigger automated event workflows.
     */
    protected static function booted()
    {
        static::created(function ($prospect) {
            $automation = Automation::where('name', 'Prospect Created Workflow')
                ->where('is_active', true)
                ->first();

            if ($automation) {
                $engine = new \App\Workflows\WorkflowEngine();
                $engine->start($automation, $prospect, [
                    'event' => 'prospect_created',
                    'created_at' => now()->toDateTimeString(),
                ]);
            }
        });

        static::updated(function ($prospect) {
            $automation = Automation::where('name', 'Prospect Updated Workflow')
                ->where('is_active', true)
                ->first();

            if ($automation) {
                $engine = new \App\Workflows\WorkflowEngine();
                $engine->start($automation, $prospect, [
                    'event' => 'prospect_updated',
                    'updated_at' => now()->toDateTimeString(),
                ]);
            }
        });
    }

    /**
     * Get the current step for the prospect.
     * Returns the blueprint step where step_order matches the prospect's current_step_order.
     */
    public function currentStep(): ?BlueprintStep
    {
        if (!$this->blueprint_id || !$this->blueprint) {
            return null;
        }

        return $this->blueprint->steps()
            ->where('step_order', $this->current_step_order)
            ->first();
    }

    /**
     * Accessor for currentStep.
     */
    public function getCurrentStepAttribute(): ?BlueprintStep
    {
        return $this->currentStep();
    }
}
