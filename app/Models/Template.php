<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Template extends Model
{
    use HasFactory;

    protected $table = 'templates';

    protected $fillable = [
        'tenant_id',
        'name',
        'subject',
        'body',
    ];

    /**
     * Get the blueprint steps that use this template.
     */
    public function blueprintSteps(): HasMany
    {
        return $this->hasMany(BlueprintStep::class, 'template_id');
    }

    /**
     * Render the template placeholders against the given prospect.
     * Supports {{company_name}}, {{contact_name}}, {{contact_email}}, {{contact_role}}.
     */
    public static function renderString(string $string, Prospect $prospect): string
    {
        $variables = [
            'company_name' => $prospect->company_name,
            'contact_name' => $prospect->contact_name,
            'contact_email' => $prospect->contact_email,
            'contact_role' => $prospect->contact_role ?? '',
        ];

        foreach ($variables as $key => $value) {
            $string = str_replace('{{' . $key . '}}', $value ?? '', $string);
            $string = str_replace('{{ ' . $key . ' }}', $value ?? '', $string);
        }

        return $string;
    }
}
