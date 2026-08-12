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

// Webhook endpoint for Nylas (without CSRF, and open to the internet)
Route::match(['get', 'post'], 'webhooks/nylas', [NylasWebhookController::class, 'handle'])
    ->name('webhooks.nylas');

// Wave routes
Wave::routes();

Route::get('temp-login', function() {
    auth()->loginUsingId(1);
    return redirect()->route('prospects.index');
});

Route::middleware('auth')->group(function () {
    Route::get('nylas/connect', [NylasController::class, 'connect'])->name('nylas.connect');
    Route::get('nylas/callback', [NylasController::class, 'callback'])->name('nylas.callback');
    Route::delete('nylas/disconnect/{id}', [NylasController::class, 'disconnect'])->name('nylas.disconnect');

    // Dashboard Prospects
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
        Route::post('prospects/views', [ProspectController::class, 'storeView'])->name('prospects.views.store');
        Route::delete('prospects/views/{id}', [ProspectController::class, 'destroyView'])->name('prospects.views.destroy');
        Route::post('prospects/{id}/update-stage', [ProspectController::class, 'updateStage'])->name('prospects.update-stage');
    });
});
