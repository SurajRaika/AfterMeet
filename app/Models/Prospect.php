<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prospect extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'company_name',
        'job_title',
        'email',
        'phone',
        'linkedin_url',
        'website',
        'country',
        'industry',
        'stage',
        'source',
        'owner_id',
        'notes',
        'last_contacted_at',
        'next_follow_up_at',
        'sort_order',
        'converted_to_enquiry_id',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'last_contacted_at' => 'datetime',
        'next_follow_up_at' => 'datetime',
        'sort_order' => 'integer',
    ];

    /**
     * Get the owner of the prospect.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
