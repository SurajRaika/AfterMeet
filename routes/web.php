<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

use Wave\Facades\Wave;
use App\Http\Controllers\NylasController;
use App\Http\Controllers\NylasWebhookController;
use App\Http\Controllers\ProspectController;
use App\Http\Controllers\ProspectImportController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\BlueprintController;

// Webhook endpoint for Nylas (without CSRF, and open to the internet)
Route::match(['get', 'post'], 'webhooks/nylas', [NylasWebhookController::class, 'handle'])
    ->name('webhooks.nylas');

// Wave routes
Wave::routes();

Route::get('temp-login', function() {
    auth()->loginUsingId(1);
    return redirect()->route('templates.create');
});

Route::middleware('auth')->group(function () {
    Route::get('nylas/connect', [NylasController::class, 'connect'])->name('nylas.connect');
    Route::get('nylas/callback', [NylasController::class, 'callback'])->name('nylas.callback');
    Route::delete('nylas/disconnect/{id}', [NylasController::class, 'disconnect'])->name('nylas.disconnect');

    // Dashboard Prospect and Blueprint Foundation
    Route::prefix('dashboard')->group(function () {
        Route::get('prospects/{id}/timeline', [ProspectController::class, 'timeline'])->name('prospects.timeline');

        Route::resource('prospects', ProspectController::class)->names([
            'index' => 'prospects.index',
            'create' => 'prospects.create',
            'store' => 'prospects.store',
            'edit' => 'prospects.edit',
            'update' => 'prospects.update',
            'destroy' => 'prospects.destroy',
        ])->except(['show']);

        Route::get('prospects/import', [ProspectImportController::class, 'show'])->name('prospects.import.show');
        Route::post('prospects/import', [ProspectImportController::class, 'import'])->name('prospects.import');
        Route::post('prospects/import/upload', [ProspectImportController::class, 'upload'])->name('prospects.import.upload');
        Route::post('prospects/import/process', [ProspectImportController::class, 'process'])->name('prospects.import.process');
        Route::get('prospects/import/sample', [ProspectImportController::class, 'downloadSample'])->name('prospects.import.sample');
        Route::post('prospects/{id}/send-next-step', [ProspectController::class, 'sendNextStep'])->name('prospects.send-next-step');
        Route::post('prospects/views', [ProspectController::class, 'storeView'])->name('prospects.views.store');
        Route::delete('prospects/views/{id}', [ProspectController::class, 'destroyView'])->name('prospects.views.destroy');
        Route::post('prospects/{id}/update-stage', [ProspectController::class, 'updateStage'])->name('prospects.update-stage');

        Route::post('templates/generate-ai', [TemplateController::class, 'generateAi'])->name('templates.generate-ai');

        Route::resource('templates', TemplateController::class)->names([
            'index' => 'templates.index',
            'create' => 'templates.create',
            'store' => 'templates.store',
            'edit' => 'templates.edit',
            'update' => 'templates.update',
            'destroy' => 'templates.destroy',
        ])->except(['show']);

        Route::get('templates/{id}/preview', [TemplateController::class, 'preview'])->name('templates.preview');

        Route::resource('blueprints', BlueprintController::class)->names([
            'index' => 'blueprints.index',
            'create' => 'blueprints.create',
            'store' => 'blueprints.store',
            'edit' => 'blueprints.edit',
            'update' => 'blueprints.update',
            'destroy' => 'blueprints.destroy',
        ])->except(['show']);

        // Automation Execution Engine Routes
        Route::get('automations', [\App\Http\Controllers\AutomationController::class, 'index'])->name('automations.index');
        Route::post('automations/{id}/toggle', [\App\Http\Controllers\AutomationController::class, 'toggle'])->name('automations.toggle');
        Route::post('automations/{id}/trigger', [\App\Http\Controllers\AutomationController::class, 'trigger'])->name('automations.trigger');
        Route::get('automations/{id}/runs', [\App\Http\Controllers\AutomationController::class, 'runs'])->name('automations.runs');
        Route::post('automations/seed-defaults', [\App\Http\Controllers\AutomationController::class, 'seedDefaults'])->name('automations.seed-defaults');
        Route::delete('automations/{id}', [\App\Http\Controllers\AutomationController::class, 'destroy'])->name('automations.destroy');
        Route::get('automations/{id}/configure', [\App\Http\Controllers\AutomationController::class, 'configure'])->name('automations.configure');
        Route::post('automations/{id}/configure', [\App\Http\Controllers\AutomationController::class, 'updateConfig'])->name('automations.update-config');
    });
});
