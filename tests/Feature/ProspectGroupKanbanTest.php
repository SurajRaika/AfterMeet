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

it('can CRUD custom saved views', function () {
    $this->actingAs($this->user);

    // 1. Create a Saved View
    $response = $this->post(route('prospect-views.store'), [
        'name' => 'High Value Leads',
        'filters' => [
            [
                'field' => 'company_name',
                'operator' => 'like',
                'value' => 'Acme'
            ],
            [
                'field' => 'status',
                'operator' => '=',
                'value' => 'new'
            ]
        ],
        'sort_field' => 'company_name',
        'sort_order' => 'asc',
    ]);

    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseHas('prospect_views', [
        'name' => 'High Value Leads',
        'sort_field' => 'company_name',
        'sort_order' => 'asc',
    ]);

    $view = ProspectView::first();
    expect($view->filters)->toHaveCount(2);
    expect($view->filters[0]['field'])->toBe('company_name');

    // 2. Edit / Update the Saved View
    $response = $this->put(route('prospect-views.update', $view->id), [
        'name' => 'Acme New Leads',
        'filters' => [
            [
                'field' => 'company_name',
                'operator' => '=',
                'value' => 'Acme Corp'
            ]
        ],
        'sort_field' => 'created_at',
        'sort_order' => 'desc',
    ]);

    $response->assertRedirect(route('prospects.index', ['view_id' => $view->id]));
    $this->assertDatabaseHas('prospect_views', [
        'id' => $view->id,
        'name' => 'Acme New Leads',
        'sort_field' => 'created_at',
        'sort_order' => 'desc',
    ]);

    // 3. Delete/Destroy the Saved View
    $response = $this->delete(route('prospect-views.destroy', $view->id));
    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseMissing('prospect_views', [
        'id' => $view->id,
    ]);
});

it('filters prospects dynamically using the active saved view', function () {
    $this->actingAs($this->user);
    $tenantId = $this->user->organization_id ?? $this->user->id;

    // Create prospects
    $matchProspect = Prospect::create([
        'tenant_id' => $tenantId,
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john@acme.com',
        'status' => 'new',
    ]);

    $otherProspect = Prospect::create([
        'tenant_id' => $tenantId,
        'company_name' => 'Hooli',
        'contact_name' => 'Gavin Belson',
        'contact_email' => 'gavin@hooli.com',
        'status' => 'active',
    ]);

    // Create a view that filters status = 'new' AND company_name contains 'Acme'
    $view = ProspectView::create([
        'tenant_id' => $tenantId,
        'name' => 'Acme New Leads',
        'filters' => [
            ['field' => 'status', 'operator' => '=', 'value' => 'new'],
            ['field' => 'company_name', 'operator' => 'like', 'value' => 'Acme']
        ]
    ]);

    // Fetch prospects list with active view
    $response = $this->get(route('prospects.index', ['view_id' => $view->id]));
    $response->assertStatus(200);

    // Verify only the matching prospect is returned
    $response->assertSee('John Smith');
    $response->assertSee('Acme Corp');
    $response->assertDontSee('Gavin Belson');
    $response->assertDontSee('Hooli');
});

it('can update prospect status via ajax endpoint with tenant isolation', function () {
    $this->actingAs($this->user);
    $tenantId = $this->user->organization_id ?? $this->user->id;

    $prospect = Prospect::create([
        'tenant_id' => $tenantId,
        'company_name' => 'Hooli',
        'contact_name' => 'Gavin Belson',
        'contact_email' => 'gavin@hooli.xyz',
        'status' => 'new',
    ]);

    // Make AJAX call to update status to qualified
    $response = $this->post(route('prospects.update-status', $prospect->id), [
        'status' => 'qualified'
    ], ['Accept' => 'application/json']);

    $response->assertStatus(200);
    $response->assertJson(['success' => true]);

    $prospect->refresh();
    expect($prospect->status)->toBe('qualified');

    // Now verify tenant protection: another user cannot update it
    $otherUser = User::factory()->create();
    $this->actingAs($otherUser);

    $response = $this->post(route('prospects.update-status', $prospect->id), [
        'status' => 'active'
    ], ['Accept' => 'application/json']);

    $response->assertStatus(404); // Should not find prospect since it is scoped to tenant
});
