<?php

use App\Models\Prospect;
use App\Models\User;
use App\Filament\Resources\Prospects\Pages\ListProspects;
use Livewire\Livewire;

beforeEach(function () {
    // Check if user already exists
    $this->admin = User::where('email', 'admin@admin.com')->first();
    if (!$this->admin) {
        $this->admin = User::factory()->create([
            'email' => 'admin@admin.com',
        ]);
    }
});

it('can list prospects and show both views', function () {
    $prospect = Prospect::create([
        'name' => 'John Doe',
        'company_name' => 'Test Corp',
        'stage' => 'New',
    ]);

    Livewire::actingAs($this->admin)
        ->test(ListProspects::class)
        ->assertSet('viewMode', 'kanban')
        ->call('changeViewMode', 'table')
        ->assertSet('viewMode', 'table')
        ->assertSee('John Doe')
        ->assertSee('Test Corp');
});

it('can change prospect stage', function () {
    $prospect = Prospect::create([
        'name' => 'John Doe',
        'company_name' => 'Test Corp',
        'stage' => 'New',
    ]);

    Livewire::actingAs($this->admin)
        ->test(ListProspects::class)
        ->call('updateProspectStage', $prospect->id, 'Contacted', 2)
        ->assertStatus(200);

    expect($prospect->fresh()->stage)->toBe('Contacted');
    expect($prospect->fresh()->sort_order)->toBe(2);
});
