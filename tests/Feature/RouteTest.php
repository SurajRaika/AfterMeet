<?php

// tests/Feature/RouteResponseTest.php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Blade;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\get;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Disable mass assignment protection
    \Illuminate\Database\Eloquent\Model::unguard();

    // Clear Spatie permission cache
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

    // Delete existing tables in a safe order to prevent any SQLite foreign key constraint violations
    DB::table('email_attachments')->delete();
    DB::table('email_messages')->delete();
    DB::table('email_threads')->delete();
    DB::table('nylas_accounts')->delete();
    DB::table('prospect_step_logs')->delete();
    DB::table('blueprint_steps')->delete();
    DB::table('prospects')->delete();
    DB::table('blueprints')->delete();
    DB::table('templates')->delete();
    DB::table('social_provider_user')->delete();
    DB::table('changelog_user')->delete();
    DB::table('api_keys')->delete();
    DB::table('posts')->delete();
    DB::table('pages')->delete();
    DB::table('form_entries')->delete();
    DB::table('activity_logs')->delete();
    DB::table('subscriptions')->delete();
    DB::table('plans')->delete();
    DB::table('model_has_roles')->delete();
    DB::table('model_has_permissions')->delete();
    DB::table('role_has_permissions')->delete();
    DB::table('invitations')->delete();
    DB::table('themes')->delete();
    DB::table('categories')->delete();
    DB::table('changelogs')->delete();
    DB::table('settings')->delete();

    DB::statement('PRAGMA foreign_keys = OFF;');
    DB::table('organizations')->delete();
    DB::table('users')->delete();
    DB::table('roles')->delete();
    DB::statement('PRAGMA foreign_keys = ON;');

    $roleAdmin = \Spatie\Permission\Models\Role::create([
        'id' => 1,
        'name' => 'admin',
        'guard_name' => 'web',
    ]);

    \Spatie\Permission\Models\Role::create([
        'id' => 2,
        'name' => 'registered',
        'guard_name' => 'web',
    ]);

    \Spatie\Permission\Models\Role::create([
        'id' => 3,
        'name' => 'basic',
        'guard_name' => 'web',
    ]);

    $user = \App\Models\User::create([
        'id' => 1,
        'name' => 'Admin User',
        'username' => 'admin',
        'email' => 'admin@admin.com',
        'password' => bcrypt('password'),
        'avatar' => 'users/default.png',
    ]);

    $user->assignRole($roleAdmin);

    // Create active theme
    DB::table('themes')->insert([
        [
            'id' => 1,
            'name' => 'Anchor Theme',
            'folder' => 'anchor',
            'active' => 1,
            'version' => 1.0,
        ]
    ]);

    // Manually register Folio path for anchor theme
    \Laravel\Folio\Folio::path(resource_path('themes/anchor/pages'))->middleware(['*']);

    // Manually register view namespace for theme
    view()->addNamespace('theme', resource_path('themes/anchor'));

    // Manually register Blade component paths for theme
    Blade::anonymousComponentPath(resource_path('themes/anchor/components/elements'));
    Blade::anonymousComponentPath(resource_path('themes/anchor/components'));

    \App\Models\Category::create([
        'id' => 1,
        'name' => 'Marketing',
        'slug' => 'marketing',
        'order' => 1,
    ]);

    \App\Models\Post::create([
        'id' => 5,
        'author_id' => 1,
        'category_id' => 1,
        'title' => 'Best ways to market your application',
        'slug' => 'best-ways-to-market-your-application',
        'status' => 'PUBLISHED',
        'body' => 'body text',
    ]);

    \Wave\Page::create([
        'id' => 1,
        'author_id' => 1,
        'title' => 'About',
        'slug' => 'about',
        'status' => 'ACTIVE',
        'body' => 'about text',
    ]);

    \Wave\Page::create([
        'id' => 2,
        'author_id' => 1,
        'title' => 'Example Page',
        'slug' => 'example-page',
        'status' => 'ACTIVE',
        'body' => 'example-page text',
    ]);

    \Wave\Changelog::create([
        'id' => 3,
        'title' => 'Wave 3.0 Released',
        'description' => 'Version 3',
        'body' => 'body text',
    ]);

    \Wave\Setting::create([
        'id' => 1,
        'key' => 'site.title',
        'display_name' => 'Site Title',
        'value' => 'Wave',
        'type' => 'text',
        'order' => 1,
        'group' => 'Site',
    ]);

    \Wave\Plan::create([
        'id' => 1,
        'name' => 'Basic',
        'description' => 'Basic Plan',
        'features' => 'Feature 1',
        'role_id' => 3,
        'monthly_price_id' => 'price_basic_monthly',
        'yearly_price_id' => 'price_basic_yearly',
        'monthly_price' => '5',
        'yearly_price' => '50',
        'active' => 1,
    ]);

    // Manually register dynamic pages as routes
    foreach (\Wave\Page::all() as $page) {
        \Illuminate\Support\Facades\Route::view($page->slug, 'theme::page', ['page' => $page->toArray()])->name($page->slug);
    }
});

it('responds with 200 for all routes', function (string $route) {
    $response = get($route);
    $response->assertStatus(200);
})->with('routes');

test('responds with 200 for all auth routes', function ($url) {
    $user = \App\Models\User::find(1);

    $this->actingAs($user);

    $response = $this->get($url);

    $response->assertStatus(200);
})->with('authroutes');

test('templates.create returns 200 for authenticated user', function () {
    $user = \App\Models\User::find(1);
    $this->actingAs($user);
    $response = $this->get(route('templates.create'));
    $response->assertStatus(200);
});

test('templates.generate-ai returns 200 for authenticated user', function () {
    $user = \App\Models\User::find(1);
    $this->actingAs($user);

    $prospect = \App\Models\Prospect::create([
        'tenant_id' => 1,
        'company_name' => 'Acme Inc',
        'contact_name' => 'John Doe',
        'contact_email' => 'john@example.com',
    ]);

    $response = $this->postJson(route('templates.generate-ai'), [
        'subject' => 'Meeting at {{company_name}}',
        'body' => 'Hello {{contact_name}}',
        'prospect_id' => (string) $prospect->id,
        'creativity' => 'balanced',
        'active_fields' => ['company_name', 'contact_name'],
    ]);

    $response->assertStatus(200);
    $response->assertJsonStructure(['subject', 'message', 'strategyInsight']);
});
