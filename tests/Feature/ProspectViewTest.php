<?php

use App\Models\Prospect;
use App\Models\ProspectView;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'user_' . uniqid() . '_' . rand(1000, 9999) . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('auto-creates default views on listing and seeds mock prospects', function () {
    $this->actingAs($this->user);

    // Initial state: no views, no prospects
    expect(ProspectView::count())->toBe(0);
    expect(Prospect::count())->toBe(0);

    $response = $this->get(route('prospects.index'));

    $response->assertStatus(200);

    // Default views should have been auto-created
    $this->assertDatabaseHas('prospect_views', [
        'name' => 'High Value Leads',
    ]);
    $this->assertDatabaseHas('prospect_views', [
        'name' => 'Trade Show Contacts',
    ]);

    // Default mock prospects should have been seeded
    $this->assertDatabaseHas('prospects', [
        'contact_name' => 'John Doe',
        'stage' => 'Engaged',
        'country' => 'USA',
    ]);
    $this->assertDatabaseHas('prospects', [
        'contact_name' => 'Sven Gustafsson',
        'stage' => 'New',
        'source' => 'Event',
        'event' => 'Canton Fair',
    ]);
});

it('can create a new custom saved view', function () {
    $this->actingAs($this->user);

    $response = $this->post(route('prospects.views.store'), [
        'name' => 'Sweden Large Companies',
        'filters' => [
            ['column' => 'country', 'operator' => '=', 'value' => 'Sweden'],
            ['column' => 'company_size', 'operator' => '>', 'value' => '50'],
        ],
        'sort_by' => 'company_size',
        'sort_direction' => 'desc',
        'visibility' => 'private',
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('prospect_views', [
        'name' => 'Sweden Large Companies',
        'sort_by' => 'company_size',
        'sort_direction' => 'desc',
        'visibility' => 'private',
    ]);

    $view = ProspectView::where('name', 'Sweden Large Companies')->first();
    expect($view->filters)->toHaveCount(2);
    expect($view->filters[0]['column'])->toBe('country');
    expect($view->filters[1]['value'])->toBe('50');
});

it('correctly filters prospects by selected saved view', function () {
    $this->actingAs($this->user);

    // Initial load creates views and seeds mock prospects:
    // John Doe (Engaged, USA, size 150)
    // Sven Gustafsson (New, Sweden, size 45, source: Event, event: Canton Fair)
    // Sarah Connor (Researching, USA, size 80)
    $this->get(route('prospects.index'));

    $highValueView = ProspectView::where('name', 'High Value Leads')->first();
    $tradeShowView = ProspectView::where('name', 'Trade Show Contacts')->first();

    // 1. Check High Value Leads view
    $response = $this->get(route('prospects.index', ['view' => $highValueView->id]));
    $response->assertStatus(200);
    // Should see John Doe (matches Engaged + USA + Size > 100)
    $response->assertSee('John Doe');
    // Should not see Sven Gustafsson or Sarah Connor
    $response->assertDontSee('Sven Gustafsson');
    $response->assertDontSee('Sarah Connor');

    // 2. Check Trade Show Contacts view
    $response = $this->get(route('prospects.index', ['view' => $tradeShowView->id]));
    $response->assertStatus(200);
    // Should see Sven Gustafsson
    $response->assertSee('Sven Gustafsson');
    // Should not see John Doe or Sarah Connor
    $response->assertDontSee('John Doe');
    $response->assertDontSee('Sarah Connor');
});

it('can delete a custom saved view', function () {
    $this->actingAs($this->user);

    $view = ProspectView::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Temporary View',
        'filters' => [['column' => 'stage', 'operator' => '=', 'value' => 'New']],
    ]);

    $response = $this->delete(route('prospects.views.destroy', $view->id));

    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseMissing('prospect_views', [
        'id' => $view->id,
    ]);
});

it('can dynamically update a prospect stage via update stage endpoint', function () {
    $this->actingAs($this->user);

    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john.smith@acme.com',
        'stage' => 'New',
        'status' => 'new',
    ]);

    $response = $this->post(route('prospects.update-stage', $prospect->id), [
        'stage' => 'Contacted',
    ]);

    $response->assertJson(['success' => true]);

    $prospect->refresh();
    expect($prospect->stage)->toBe('Contacted');
});
