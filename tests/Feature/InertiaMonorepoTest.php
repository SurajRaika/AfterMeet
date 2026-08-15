<?php

namespace Tests\Feature;

use Tests\TestCase;

class InertiaMonorepoTest extends TestCase
{
    public function test_app_prototype_route_renders_inertia_component(): void
    {
        $response = $this->get(route('app-prototype'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('App'));
    }
}
