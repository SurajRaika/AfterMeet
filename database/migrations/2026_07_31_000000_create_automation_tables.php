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
        Schema::create('automations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type')->default('trigger'); // trigger/action
            $table->json('workflow_definition');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('automation_instances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('automation_id');
            $table->unsignedBigInteger('prospect_id');
            $table->string('status')->default('active'); // active, paused, completed, failed
            $table->string('current_node')->nullable();
            $table->timestamp('started_at')->useCurrent();
            $table->timestamps();

            $table->foreign('automation_id')
                ->references('id')
                ->on('automations')
                ->onDelete('cascade');

            $table->foreign('prospect_id')
                ->references('id')
                ->on('prospects')
                ->onDelete('cascade');
        });

        Schema::create('automation_runs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('instance_id');
            $table->string('node_id');
            $table->json('input_payload')->nullable();
            $table->json('output_payload')->nullable();
            $table->string('status')->default('success'); // success, failed, delayed/paused
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->foreign('instance_id')
                ->references('id')
                ->on('automation_instances')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('automation_runs');
        Schema::dropIfExists('automation_instances');
        Schema::dropIfExists('automations');
    }
};
