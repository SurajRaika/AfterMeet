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
        // 1. Workflows Table
        Schema::create('workflows', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('trigger_type')->default('manual'); // 'manual', 'prospect_created', etc.
            $table->json('graph'); // Stores the nodes and edges array
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Workflow Runs Table
        Schema::create('workflow_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->unsignedBigInteger('workflow_id');
            $table->unsignedBigInteger('prospect_id')->nullable();
            $table->string('status')->default('pending'); // 'pending', 'running', 'completed', 'failed'
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('workflow_id')->references('id')->on('workflows')->onDelete('cascade');
        });

        // 3. Workflow Step Runs Table
        Schema::create('workflow_step_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('workflow_run_id');
            $table->string('node_id');
            $table->string('node_type');
            $table->string('status')->default('pending'); // 'pending', 'running', 'completed', 'failed'
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('workflow_run_id')->references('id')->on('workflow_runs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workflow_step_runs');
        Schema::dropIfExists('workflow_runs');
        Schema::dropIfExists('workflows');
    }
};
