<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Prospect;
use App\Models\User;

class ProspectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('email', 'admin@admin.com')->first();
        $ownerId = $admin ? $admin->id : null;

        $prospects = [
            [
                'name' => 'Alice Smith',
                'company_name' => 'Acme Corp',
                'job_title' => 'VP of Engineering',
                'email' => 'alice@acme.com',
                'phone' => '+15550192',
                'linkedin_url' => 'https://linkedin.com/in/alice-smith',
                'website' => 'https://acme.com',
                'country' => 'United States',
                'industry' => 'Software',
                'stage' => 'New',
                'source' => 'LinkedIn Outbound',
                'notes' => 'Interested in API integrations.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Bob Johnson',
                'company_name' => 'Stark Industries',
                'job_title' => 'Chief Technology Officer',
                'email' => 'bob@stark.com',
                'phone' => '+15550183',
                'linkedin_url' => 'https://linkedin.com/in/bob-johnson',
                'website' => 'https://stark.com',
                'country' => 'United States',
                'industry' => 'Defense & Energy',
                'stage' => 'Researching',
                'source' => 'Website Form',
                'notes' => 'Needs customizable dashboards.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Charlie Brown',
                'company_name' => 'Peanuts Tech',
                'job_title' => 'Product Owner',
                'email' => 'charlie@peanuts.com',
                'phone' => '+15550174',
                'linkedin_url' => 'https://linkedin.com/in/charlie-brown',
                'website' => 'https://peanuts.com',
                'country' => 'Canada',
                'industry' => 'Education',
                'stage' => 'Ready to Contact',
                'source' => 'Cold Email',
                'notes' => 'Expressed interest via referral.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Diana Prince',
                'company_name' => 'Themyscira Global',
                'job_title' => 'Director of Security',
                'email' => 'diana@themyscira.com',
                'phone' => '+15550165',
                'linkedin_url' => 'https://linkedin.com/in/diana-prince',
                'website' => 'https://themyscira.com',
                'country' => 'Greece',
                'industry' => 'Defense & Security',
                'stage' => 'Contacted',
                'source' => 'Event Outreach',
                'notes' => 'Follow up next week about enterprise plan features.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Evan Wright',
                'company_name' => 'Apex Solutions',
                'job_title' => 'Procurement Manager',
                'email' => 'evan@apex.com',
                'phone' => '+15550156',
                'linkedin_url' => 'https://linkedin.com/in/evan-wright',
                'website' => 'https://apex.com',
                'country' => 'United Kingdom',
                'industry' => 'Logistics',
                'stage' => 'Engaged',
                'source' => 'LinkedIn Outbound',
                'notes' => 'Sent initial pricing document. Awaiting response.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Fiona Gallagher',
                'company_name' => 'South Side Tech',
                'job_title' => 'Operations Director',
                'email' => 'fiona@southsidetech.com',
                'phone' => '+15550147',
                'linkedin_url' => 'https://linkedin.com/in/fiona-gallagher',
                'website' => 'https://southsidetech.com',
                'country' => 'United States',
                'industry' => 'Retail',
                'stage' => 'Connected',
                'source' => 'Inbound Chat',
                'notes' => 'Had a demo call, very positive feedback.',
                'sort_order' => 1,
            ],
            [
                'name' => 'George Costanza',
                'company_name' => 'Vandelay Industries',
                'job_title' => 'Importer/Exporter',
                'email' => 'george@vandelay.com',
                'phone' => '+15550138',
                'linkedin_url' => 'https://linkedin.com/in/george-costanza',
                'website' => 'https://vandelay.com',
                'country' => 'United States',
                'industry' => 'Import / Export',
                'stage' => 'Converted',
                'source' => 'Direct Referral',
                'notes' => 'Successfully converted to customer pipeline.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Hannah Abbott',
                'company_name' => 'Leaky Cauldron Co',
                'job_title' => 'General Manager',
                'email' => 'hannah@leakycauldron.com',
                'phone' => '+15550129',
                'linkedin_url' => 'https://linkedin.com/in/hannah-abbott',
                'website' => 'https://leakycauldron.com',
                'country' => 'United Kingdom',
                'industry' => 'Hospitality',
                'stage' => 'Archived',
                'source' => 'Cold Call',
                'notes' => 'No active budget this fiscal year.',
                'sort_order' => 1,
            ],
        ];

        foreach ($prospects as $data) {
            $data['owner_id'] = $ownerId;
            Prospect::create($data);
        }
    }
}
