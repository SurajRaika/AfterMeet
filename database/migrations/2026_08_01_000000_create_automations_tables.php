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
        // 1. Automations table
        Schema::create('automations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('name');
            $table->string('type')->default('trigger'); // 'trigger' or 'action'
            $table->text('workflow_definition')->nullable(); // JSON configuration of the graph/nodes
            $table->boolean('is_active')->default(false);
            $table->boolean('is_template')->default(false);
            $table->timestamps();
        });

        // 2. Automation Instances table
        Schema::create('automation_instances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('automation_id');
            $table->unsignedBigInteger('prospect_id');
            $table->string('status')->default('active'); // 'active', 'paused', 'completed', 'failed'
            $table->string('current_node')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamps();

            $table->foreign('automation_id')->references('id')->on('automations')->onDelete('cascade');
            $table->foreign('prospect_id')->references('id')->on('prospects')->onDelete('cascade');
        });

        // 3. Automation Runs (Logs) table
        Schema::create('automation_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instance_id');
            $table->string('node_id');
            $table->text('input_payload')->nullable(); // JSON
            $table->text('output_payload')->nullable(); // JSON
            $table->string('status'); // 'success', 'failed', 'running', 'pending'
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('instance_id')->references('id')->on('automation_instances')->onDelete('cascade');
        });

        // 4. Add user_unsubscribed to prospects table
        Schema::table('prospects', function (Blueprint $table) {
            $table->boolean('user_unsubscribed')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn('user_unsubscribed');
        });

        Schema::dropIfExists('automation_runs');
        Schema::dropIfExists('automation_instances');
        Schema::dropIfExists('automations');
    }
};
