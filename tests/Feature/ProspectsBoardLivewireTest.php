<?php

use App\Models\Blueprint;
use App\Models\BlueprintStep;
use App\Models\NylasAccount;
use App\Models\Prospect;
use App\Models\ProspectStepLog;
use App\Models\ProspectView;
use App\Models\Template;
use App\Models\User;
use Illuminate\Support\Facades\Http;
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

it('can manually trigger sendNextStep dynamically via livewire', function () {
    $this->actingAs($this->user);

    // 1. Connect Nylas Account
    NylasAccount::create([
        'user_id' => $this->user->id,
        'grant_id' => 'mock-grant-livewire',
        'email' => 'user@example.com',
    ]);

    // 2. Setup Blueprint
    $template = Template::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Intro',
        'subject' => 'Welcome {{contact_name}}',
        'body' => 'Hi {{contact_name}} of {{company_name}}!',
    ]);

    $blueprint = Blueprint::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Sequence Livewire',
    ]);

    BlueprintStep::create([
        'blueprint_id' => $blueprint->id,
        'step_order' => 0,
        'template_id' => $template->id,
        'wait_days' => 3,
    ]);

    // 3. Create Prospect
    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Hooli',
        'contact_name' => 'Gavin Belson',
        'contact_email' => 'gavin@hooli.xyz',
        'status' => 'new',
        'blueprint_id' => $blueprint->id,
        'current_step_order' => 0,
    ]);

    // Fake the Nylas sendMessage API call
    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-livewire/messages/send' => Http::response([
            'request_id' => 'mock-req-livewire',
            'data' => [
                'id' => 'nylas-msg-livewire-id',
                'subject' => 'Welcome Gavin Belson',
                'body' => 'Hi Gavin Belson of Hooli!',
            ]
        ], 200)
    ]);

    Volt::test('prospects-board')
        ->call('sendNextStep', $prospect->id)
        ->assertHasNoErrors();

    $prospect->refresh();
    expect($prospect->status)->toBe('active');
    expect($prospect->current_step_order)->toBe(1);
    expect($prospect->last_sent_at)->not->toBeNull();

    $this->assertDatabaseHas('prospect_step_logs', [
        'prospect_id' => $prospect->id,
        'message_id' => 'nylas-msg-livewire-id',
    ]);
});

it('can open start contacting modal and start sequence with assigned blueprint', function () {
    $this->actingAs($this->user);

    // Connect Nylas Account to prevent sendNextStep from throwing error during test
    NylasAccount::create([
        'user_id' => $this->user->id,
        'grant_id' => 'mock-grant-livewire',
        'email' => 'user@example.com',
    ]);

    $template = Template::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Intro',
        'subject' => 'Welcome {{contact_name}}',
        'body' => 'Hi {{contact_name}} of {{company_name}}!',
    ]);

    $blueprint = Blueprint::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Sequence Test',
    ]);

    BlueprintStep::create([
        'blueprint_id' => $blueprint->id,
        'step_order' => 0,
        'template_id' => $template->id,
        'wait_days' => 1,
    ]);

    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Initech',
        'contact_name' => 'Peter Gibbons',
        'contact_email' => 'peter@initech.com',
        'status' => 'new',
    ]);

    // Fake the Nylas sendMessage API call
    Http::fake([
        'https://api.us.nylas.com/v3/grants/mock-grant-livewire/messages/send' => Http::response([
            'request_id' => 'mock-req-livewire',
            'data' => [
                'id' => 'nylas-msg-test-id',
                'subject' => 'Welcome Peter Gibbons',
                'body' => 'Hi Peter Gibbons of Initech!',
            ]
        ], 200)
    ]);

    Volt::test('prospects-board')
        ->call('openStartContacting', $prospect->id)
        ->assertSet('selectedProspectId', $prospect->id)
        ->assertSet('isBlueprintModalOpen', true)
        ->call('startContacting', $blueprint->id)
        ->assertSet('selectedProspectId', null)
        ->assertSet('isBlueprintModalOpen', false);

    $prospect->refresh();
    expect($prospect->blueprint_id)->toBe($blueprint->id);
    expect($prospect->status)->toBe('active');
    expect($prospect->current_step_order)->toBe(1);
});

it('can pause and resume contacting sequence via livewire', function () {
    $this->actingAs($this->user);

    $prospect = Prospect::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'company_name' => 'Initech',
        'contact_name' => 'Peter Gibbons',
        'contact_email' => 'peter@initech.com',
        'status' => 'active',
    ]);

    Volt::test('prospects-board')
        ->call('pauseContacting', $prospect->id);

    $prospect->refresh();
    expect($prospect->status)->toBe('paused');

    Volt::test('prospects-board')
        ->call('resumeContacting', $prospect->id);

    $prospect->refresh();
    expect($prospect->status)->toBe('active');
});
