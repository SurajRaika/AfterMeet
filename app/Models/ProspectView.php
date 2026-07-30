<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProspectView extends Model
{
    use HasFactory;

    protected $table = 'prospect_views';

    protected $fillable = [
        'tenant_id',
        'name',
        'filters',
        'sort_field',
        'sort_order',
    ];

    protected $casts = [
        'filters' => 'array',
    ];
}
