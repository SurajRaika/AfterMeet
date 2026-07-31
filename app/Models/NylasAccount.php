<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NylasAccount extends Model
{
    use HasFactory;

    protected $table = 'nylas_accounts';

    protected $fillable = [
        'user_id',
        'grant_id',
        'email',
        'is_syncing',
    ];

    protected $casts = [
        'is_syncing' => 'boolean',
    ];

    /**
     * Get the user that owns the Nylas account.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the messages synchronized under this account.
     */
    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EmailMessage::class, 'nylas_account_id');
    }

    /**
     * Get the threads synchronized under this account.
     */
    public function threads(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(EmailThread::class, 'nylas_account_id');
    }
}
