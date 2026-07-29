<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmailMessage extends Model
{
    use HasFactory;

    protected $table = 'email_messages';

    protected $fillable = [
        'nylas_message_id',
        'email_thread_id',
        'nylas_account_id',
        'from_email',
        'from_name',
        'to',
        'cc',
        'bcc',
        'subject',
        'body_snippet',
        'body_html',
        'crm_contact_id',
        'is_read',
        'is_draft',
        'received_at',
    ];

    protected $casts = [
        'to' => 'array',
        'cc' => 'array',
        'bcc' => 'array',
        'is_read' => 'boolean',
        'is_draft' => 'boolean',
        'received_at' => 'datetime',
    ];

    /**
     * Get the thread that owns the message.
     */
    public function thread(): BelongsTo
    {
        return $this->belongsTo(EmailThread::class, 'email_thread_id');
    }

    /**
     * Get the Nylas Account that owns the message.
     */
    public function nylasAccount(): BelongsTo
    {
        return $this->belongsTo(NylasAccount::class, 'nylas_account_id');
    }

    /**
     * Get the attachments for this message.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(EmailAttachment::class, 'email_message_id');
    }
}
