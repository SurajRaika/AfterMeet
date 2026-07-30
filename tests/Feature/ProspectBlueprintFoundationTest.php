<?php

use App\Models\Blueprint;
use App\Models\BlueprintStep;
use App\Models\NylasAccount;
use App\Models\Prospect;
use App\Models\ProspectStepLog;
use App\Models\Template;
use App\Models\User;
use App\Services\NylasService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'user_' . uniqid() . '_' . rand(1000, 9999) . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('can manage templates CRUD and preview', function () {
    $this->actingAs($this->user);

    // 1. Create a template
    $response = $this->post(route('templates.store'), [
        'name' => 'Outreach 1',
        'subject' => 'Quick question for {{contact_name}}',
        'body' => 'Hi {{contact_name}}, is {{company_name}} looking for a solution?',
    ]);

    $response->assertRedirect(route('templates.index'));
    $this->assertDatabaseHas('templates', [
        'name' => 'Outreach 1',
        'subject' => 'Quick question for {{contact_name}}',
    ]);

    $template = Template::first();

    // 2. Edit / Update template
    $response = $this->put(route('templates.update', $template->id), [
        'name' => 'Outreach 1 Updated',
        'subject' => 'Updated subject',
        'body' => 'Updated body {{company_name}}',
    ]);

    $response->assertRedirect(route('templates.index'));
    $this->assertDatabaseHas('templates', [
        'id' => $template->id,
        'name' => 'Outreach 1 Updated',
        'subject' => 'Updated subject',
    ]);

    // 3. Preview template
    $response = $this->get(route('templates.preview', $template->id));
    $response->assertStatus(200);
    $response->assertSee('Outreach 1 Updated');
    $response->assertSee('John Doe'); // Dummy contact name applied
    $response->assertSee('Acme Corp'); // Dummy company name applied

    // 4. Delete template
    $response = $this->delete(route('templates.destroy', $template->id));
    $response->assertRedirect(route('templates.index'));
    $this->assertDatabaseMissing('templates', [
        'id' => $template->id,
    ]);
});

it('can manage blueprints with nested steps', function () {
    $this->actingAs($this->user);

    $template1 = Template::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Outreach 1',
        'subject' => 'Hello',
        'body' => 'Hi',
    ]);

    $template2 = Template::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Outreach 2',
        'subject' => 'Follow up',
        'body' => 'Hi again',
    ]);

    // 1. Create blueprint with steps
    $response = $this->post(route('blueprints.store'), [
        'name' => 'Outbound Prospecting',
        'description' => 'Cold outreach sequence',
        'max_attempts' => 4,
        'steps' => [
            [
                'template_id' => $template1->id,
                'wait_days' => 2,
            ],
            [
                'template_id' => $template2->id,
                'wait_days' => 5,
            ]
        ]
    ]);

    $response->assertRedirect(route('blueprints.index'));
    $this->assertDatabaseHas('blueprints', [
        'name' => 'Outbound Prospecting',
        'max_attempts' => 4,
    ]);

    $blueprint = Blueprint::first();
    expect($blueprint->steps)->toHaveCount(2);
    expect($blueprint->steps[0]->wait_days)->toBe(2);
    expect($blueprint->steps[1]->wait_days)->toBe(5);

    // 2. Edit / Update blueprint and sync steps
    $response = $this->put(route('blueprints.update', $blueprint->id), [
        'name' => 'Outbound Prospecting Updated',
        'description' => 'New desc',
        'max_attempts' => 3,
        'steps' => [
            [
                'template_id' => $template2->id,
                'wait_days' => 7,
            ]
        ]
    ]);

    $response->assertRedirect(route('blueprints.index'));
    $this->assertDatabaseHas('blueprints', [
        'id' => $blueprint->id,
        'name' => 'Outbound Prospecting Updated',
        'max_attempts' => 3,
    ]);

    $blueprint->refresh();
    expect($blueprint->steps)->toHaveCount(1);
    expect($blueprint->steps[0]->wait_days)->toBe(7);
    expect($blueprint->steps[0]->template_id)->toBe($template2->id);

    // 3. Delete blueprint
    $response = $this->delete(route('blueprints.destroy', $blueprint->id));
    $response->assertRedirect(route('blueprints.index'));
    $this->assertDatabaseMissing('blueprints', [
        'id' => $blueprint->id,
    ]);
    $this->assertDatabaseMissing('blueprint_steps', [
        'blueprint_id' => $blueprint->id,
    ]);
});

it('can manage prospects CRUD', function () {
    $this->actingAs($this->user);

    $blueprint = Blueprint::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'My Blueprint',
        'max_attempts' => 3,
    ]);

    // 1. Create prospect
    $response = $this->post(route('prospects.store'), [
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john.smith@acme.com',
        'contact_role' => 'Director',
        'status' => 'new',
        'blueprint_id' => $blueprint->id,
        'notes' => 'Interesting lead',
    ]);

    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john.smith@acme.com',
        'status' => 'new',
        'blueprint_id' => $blueprint->id,
    ]);

    $prospect = Prospect::first();

    // 2. Edit / Update prospect
    $response = $this->put(route('prospects.update', $prospect->id), [
        'company_name' => 'Acme Corp Updated',
        'contact_name' => 'John Smith Updated',
        'contact_email' => 'john.smith.up@acme.com',
        'contact_role' => 'VP',
        'status' => 'active',
        'blueprint_id' => $blueprint->id,
        'current_step_order' => 1,
        'notes' => 'Some more notes',
    ]);

    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseHas('prospects', [
        'id' => $prospect->id,
        'company_name' => 'Acme Corp Updated',
        'contact_name' => 'John Smith Updated',
        'current_step_order' => 1,
        'status' => 'active',
    ]);

    // 3. Delete prospect
    $response = $this->delete(route('prospects.destroy', $prospect->id));
    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseMissing('prospects', [
        'id' => $prospect->id,
    ]);
});

it('can import prospects via CSV with flexible headers', function () {
    $this->actingAs($this->user);

    $blueprint = Blueprint::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Import Blueprint',
        'max_attempts' => 3,
    ]);

    $csvContent = "Company,Contact Name,Email,Role,Notes\n" .
                  "Stark Industries,Tony Stark,tony@stark.com,CEO,Iron Man\n" .
                  "Wayne Enterprises,Bruce Wayne,bruce@wayne.com,Owner,Batman";

    $file = UploadedFile::fake()->createWithContent('prospects.csv', $csvContent);

    $response = $this->post(route('prospects.import'), [
        'file' => $file,
        'blueprint_id' => $blueprint->id,
    ]);

    $response->assertRedirect(route('prospects.index'));

    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Stark Industries',
        'contact_name' => 'Tony Stark',
        'contact_email' => 'tony@stark.com',
        'blueprint_id' => $blueprint->id,
    ]);

    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Wayne Enterprises',
        'contact_name' => 'Bruce Wayne',
        'contact_email' => 'bruce@wayne.com',
        'blueprint_id' => $blueprint->id,
    ]);
});

it('can manually send the next sequence step and move prospect forward', function () {
    $this->actingAs($this->user);

    // 1. Connect a mock Nylas Account
    $nylasAccount = NylasAccount::create([
        'user_id' => $this->user->id,
        'grant_id' => 'mock-grant-123',
        'email' => 'user@example.com',
    ]);

    // 2. Set up Blueprint and Steps
    $template = Template::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Intro',
        'subject' => 'Welcome {{contact_name}} to outreach',
        'body' => 'Hi {{contact_name}}, hope things are good at {{company_name}}!',
    ]);

    $blueprint = Blueprint::create([
        'tenant_id' => $this->user->organization_id ?? $this->user->id,
        'name' => 'Sequence A',
    ]);

    $step = BlueprintStep::create([
        'blueprint_id' => $blueprint->id,
        'step_order' => 0,
        'template_id' => $template->id,
        'wait_days' => 3,
    ]);

    // 3. Create Prospect in 'new' status
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
        'https://api.us.nylas.com/v3/grants/mock-grant-123/messages/send' => Http::response([
            'request_id' => 'mock-req-999',
            'data' => [
                'id' => 'nylas-msg-id-777',
                'subject' => 'Welcome Gavin Belson to outreach',
                'body' => 'Hi Gavin Belson, hope things are good at Hooli!',
            ]
        ], 200)
    ]);

    // 4. Trigger send next step
    $response = $this->post(route('prospects.send-next-step', $prospect->id));

    $response->assertRedirect();
    $response->assertSessionHas('success');

    // 5. Verify database updates
    $prospect->refresh();

    // - Status advanced to active
    expect($prospect->status)->toBe('active');
    // - Current step order incremented to 1
    expect($prospect->current_step_order)->toBe(1);
    // - Last sent at set
    expect($prospect->last_sent_at)->not->toBeNull();

    // - Log record created
    $this->assertDatabaseHas('prospect_step_logs', [
        'prospect_id' => $prospect->id,
        'blueprint_step_id' => $step->id,
        'message_id' => 'nylas-msg-id-777',
    ]);
});

it('can complete the new mapped import flow', function () {
    $this->actingAs($this->user);

    // 1. Check download sample CSV
    $response = $this->get(route('prospects.import.sample'));
    $response->assertStatus(200);
    $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
    $response->assertSee('company_name,contact_name,contact_email');

    // 2. Check import show page
    $response = $this->get(route('prospects.import.show'));
    $response->assertStatus(200);
    $response->assertSee('Import Prospects from CSV');

    // 3. Check upload and redirect to mapping page
    $csvContent = "Firm Name,Full Name,Email Address,Job,Notes,Country,Size,Source,Event\n" .
                  "Stark Industries,Tony Stark,tony@stark.com,CEO,Iron Man,USA,100,Outbound,Canton Fair";

    $file = UploadedFile::fake()->createWithContent('prospects_to_map.csv', $csvContent);

    $response = $this->post(route('prospects.import.upload'), [
        'file' => $file,
    ]);

    $response->assertStatus(200);
    $response->assertSee('Map CSV Columns to System Fields');
    $response->assertSee('Firm Name (Column #1)');
    $response->assertSee('Full Name (Column #2)');

    // 4. Check process mapping form
    $tempPath = session('import_temp_path');
    expect($tempPath)->not->toBeNull();

    $response = $this->post(route('prospects.import.process'), [
        'mappings' => [
            'company_name' => '0',
            'contact_name' => '1',
            'contact_email' => '2',
            'contact_role' => '3',
            'notes' => '4',
            'country' => '5',
            'company_size' => '6',
            'source' => '7',
            'event' => '8',
        ],
    ]);

    $response->assertRedirect(route('prospects.index'));

    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Stark Industries',
        'contact_name' => 'Tony Stark',
        'contact_email' => 'tony@stark.com',
        'contact_role' => 'CEO',
        'notes' => 'Iron Man',
        'country' => 'USA',
        'company_size' => 100,
        'source' => 'Outbound',
        'event' => 'Canton Fair',
    ]);
});
