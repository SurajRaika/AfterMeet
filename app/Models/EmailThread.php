<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailThread extends Model
{
    use HasFactory;

    protected $table = 'email_threads';

    protected $fillable = [
        'nylas_thread_id',
        'nylas_account_id',
        'subject',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the Nylas Account that owns the thread.
     */
    public function nylasAccount(): BelongsTo
    {
        return $this->belongsTo(NylasAccount::class, 'nylas_account_id');
    }

    /**
     * Get the messages in this thread.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(EmailMessage::class, 'email_thread_id');
    }
}
