<?php

use App\Models\Prospect;
use App\Models\ProspectView;
use App\Models\User;
use Livewire\Volt\Volt;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'user_livewire_' . uniqid() . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('can render the prospects board livewire component and support layout switching', function () {
    $this->actingAs($this->user);

    Volt::test('prospects-board')
        ->assertSee('Prospects')
        ->assertSee('Table')
        ->assertSee('Kanban')
        ->set('layout', 'kanban')
        ->assertSee('New')
        ->assertSee('Researching')
        ->set('layout', 'table')
        ->assertSee('All Statuses');
});

it('can update prospect stage dynamically via livewire without reload', function () {
    $this->actingAs($this->user);

    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john@acme.com',
        'stage' => 'New',
        'status' => 'new',
    ]);

    Volt::test('prospects-board')
        ->call('updateStage', $prospect->id, 'Contacted');

    $prospect->refresh();
    expect($prospect->stage)->toBe('Contacted');
});

it('can delete a prospect dynamically via livewire', function () {
    $this->actingAs($this->user);

    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john@acme.com',
        'stage' => 'New',
        'status' => 'new',
    ]);

    Volt::test('prospects-board')
        ->call('deleteProspect', $prospect->id);

    $this->assertDatabaseMissing('prospects', [
        'id' => $prospect->id,
    ]);
});

it('can delete a custom saved view dynamically via livewire', function () {
    $this->actingAs($this->user);

    $view = ProspectView::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Test View 123',
        'filters' => [['column' => 'stage', 'operator' => '=', 'value' => 'New']],
    ]);

    Volt::test('prospects-board')
        ->call('deleteView', $view->id);

    $this->assertDatabaseMissing('prospect_views', [
        'id' => $view->id,
    ]);
});
