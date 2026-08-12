<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

it('Home returns a successful response', function () {
    // Clear theme cache
    Cache::forget('wave_active_theme');

    // Seed active theme
    DB::table('themes')->insert([
        [
            'id' => 1,
            'name' => 'Anchor Theme',
            'folder' => 'anchor',
            'active' => 1,
            'version' => 1.0,
        ]
    ]);

    $response = $this->get('/');
    $response->assertStatus(200);
    dump(substr($response->getContent(), 0, 500));
    $response->assertSee('Ship in Days');
});
