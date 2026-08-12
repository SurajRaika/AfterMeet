<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
