<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('email_threads', function (Blueprint $table) {
            $table->id();
            $table->string('nylas_thread_id')->unique();
            $table->unsignedBigInteger('nylas_account_id');
            $table->string('subject')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->foreign('nylas_account_id')->references('id')->on('nylas_accounts')->onDelete('cascade');
        });

        Schema::create('email_messages', function (Blueprint $table) {
            $table->id();
            $table->string('nylas_message_id')->unique();
            $table->unsignedBigInteger('email_thread_id')->nullable();
            $table->unsignedBigInteger('nylas_account_id');

            // Sender
            $table->string('from_email');
            $table->string('from_name')->nullable();

            // Recipients (Stored as JSON for multiple recipients)
            $table->json('to');  // Array of ['email' => ..., 'name' => ...]
            $table->json('cc')->nullable();
            $table->json('bcc')->nullable();

            // Body Text
            $table->string('subject')->nullable();
            $table->text('body_snippet')->nullable(); // Short text overview for lists
            $table->longText('body_html')->nullable(); // Rich Text body content

            // CRM Contact/Lead Association (Optional)
            $table->unsignedBigInteger('crm_contact_id')->nullable(); // Automatically linked on ingestion

            // Metadata
            $table->boolean('is_read')->default(false);
            $table->boolean('is_draft')->default(false);
            $table->timestamp('received_at')->nullable();
            $table->timestamps();

            $table->foreign('email_thread_id')->references('id')->on('email_threads')->onDelete('set null');
            $table->foreign('nylas_account_id')->references('id')->on('nylas_accounts')->onDelete('cascade');
            $table->index('from_email');
        });

        Schema::create('email_attachments', function (Blueprint $table) {
            $table->id();
            $table->string('nylas_attachment_id')->unique();
            $table->unsignedBigInteger('email_message_id');
            $table->string('filename');
            $table->string('content_type');
            $table->bigInteger('size'); // file size in bytes
            $table->timestamps();

            $table->foreign('email_message_id')->references('id')->on('email_messages')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_attachments');
        Schema::dropIfExists('email_messages');
        Schema::dropIfExists('email_threads');
    }
};
