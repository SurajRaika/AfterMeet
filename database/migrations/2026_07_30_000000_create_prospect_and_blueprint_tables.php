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
        // 1. Templates Table
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('name');
            $table->string('subject');
            $table->text('body');
            $table->timestamps();
        });

        // 2. Blueprints Table
        Schema::create('blueprints', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('max_attempts')->default(3);
            $table->timestamps();
        });

        // 3. Blueprint Steps Table
        Schema::create('blueprint_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('blueprint_id');
            $table->integer('step_order');
            $table->unsignedBigInteger('template_id')->nullable();
            $table->integer('wait_days');
            $table->timestamps();

            $table->foreign('blueprint_id')->references('id')->on('blueprints')->onDelete('cascade');
            $table->foreign('template_id')->references('id')->on('templates')->onDelete('set null');
        });

        // 4. Prospects Table
        Schema::create('prospects', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('company_name');
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_role')->nullable();
            $table->string('status')->default('new'); // enum-like string: 'new', 'active', 'qualified', 'junk', 'paused'
            $table->unsignedBigInteger('blueprint_id')->nullable();
            $table->integer('current_step_order')->default(0);
            $table->integer('sent_without_correct_condition')->default(0);
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamp('next_send_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('blueprint_id')->references('id')->on('blueprints')->onDelete('set null');
        });

        // 5. Prospect Step Logs Table
        Schema::create('prospect_step_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prospect_id');
            $table->unsignedBigInteger('blueprint_step_id');
            $table->timestamp('sent_at');
            $table->string('message_id')->nullable();
            $table->timestamps();

            $table->foreign('prospect_id')->references('id')->on('prospects')->onDelete('cascade');
            $table->foreign('blueprint_step_id')->references('id')->on('blueprint_steps')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prospect_step_logs');
        Schema::dropIfExists('prospects');
        Schema::dropIfExists('blueprint_steps');
        Schema::dropIfExists('blueprints');
        Schema::dropIfExists('templates');
    }
};
