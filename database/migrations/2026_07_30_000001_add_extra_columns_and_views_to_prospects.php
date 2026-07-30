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
        // Add extra columns to prospects table
        Schema::table('prospects', function (Blueprint $table) {
            $table->string('stage')->default('New');
            $table->string('country')->nullable();
            $table->integer('company_size')->nullable();
            $table->string('source')->nullable();
            $table->string('event')->nullable();
        });

        // Create prospect_views table
        Schema::create('prospect_views', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tenant_id')->nullable();
            $table->string('name');
            $table->json('filters');
            $table->string('sort_by')->nullable();
            $table->string('sort_direction')->nullable();
            $table->string('visibility')->default('private');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prospect_views');

        Schema::table('prospects', function (Blueprint $table) {
            $table->dropColumn(['stage', 'country', 'company_size', 'source', 'event']);
        });
    }
};
