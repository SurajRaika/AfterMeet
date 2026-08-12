<?php

use App\Models\Prospect;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create([
        'email' => 'user_' . uniqid() . '_' . rand(1000, 9999) . '@example.com',
        'password' => bcrypt('password'),
    ]);
});

it('can manage prospects CRUD', function () {
    $this->actingAs($this->user);

    // 1. Create prospect
    $response = $this->post(route('prospects.store'), [
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john.smith@acme.com',
        'contact_role' => 'Director',
        'status' => 'new',
        'notes' => 'Interesting lead',
    ]);

    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Acme Corp',
        'contact_name' => 'John Smith',
        'contact_email' => 'john.smith@acme.com',
        'status' => 'new',
    ]);

    $prospect = Prospect::first();

    // 2. Edit / Update prospect
    $response = $this->put(route('prospects.update', $prospect->id), [
        'company_name' => 'Acme Corp Updated',
        'contact_name' => 'John Smith Updated',
        'contact_email' => 'john.smith.up@acme.com',
        'contact_role' => 'VP',
        'status' => 'active',
        'notes' => 'Some more notes',
    ]);

    $response->assertRedirect(route('prospects.index'));
    $this->assertDatabaseHas('prospects', [
        'id' => $prospect->id,
        'company_name' => 'Acme Corp Updated',
        'contact_name' => 'John Smith Updated',
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

    $csvContent = "Company,Contact Name,Email,Role,Notes\n" .
                  "Stark Industries,Tony Stark,tony@stark.com,CEO,Iron Man\n" .
                  "Wayne Enterprises,Bruce Wayne,bruce@wayne.com,Owner,Batman";

    $file = UploadedFile::fake()->createWithContent('prospects.csv', $csvContent);

    $response = $this->post(route('prospects.import'), [
        'file' => $file,
    ]);

    $response->assertRedirect(route('prospects.index'));

    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Stark Industries',
        'contact_name' => 'Tony Stark',
        'contact_email' => 'tony@stark.com',
    ]);

    $this->assertDatabaseHas('prospects', [
        'company_name' => 'Wayne Enterprises',
        'contact_name' => 'Bruce Wayne',
        'contact_email' => 'bruce@wayne.com',
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
