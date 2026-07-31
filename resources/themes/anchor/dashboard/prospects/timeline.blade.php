<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <!-- Back and Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div>
                <a href="{{ route('prospects.index') }}" class="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-semibold mb-2 transition-colors">
                    <x-phosphor-arrow-left-bold class="w-3.5 h-3.5" />
                    Back to Prospects Board
                </a>
                <h1 class="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    Outreach Tracker & Timeline
                </h1>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Track sequence steps, replies, matching conditions, and AI future agent actions for this prospect.
                </p>
            </div>

            <!-- Campaign Status Card -->
            <div class="mt-4 md:mt-0 flex items-center gap-3 bg-white dark:bg-zinc-950 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div>
                    <span class="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Campaign Status</span>
                    <div class="flex items-center gap-2 mt-0.5">
                        @if($prospect->status === 'active')
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                                <span class="relative flex h-2 w-2 mr-1.5">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Active Campaign
                            </span>
                        @elseif($prospect->status === 'paused')
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                                <span class="h-2 w-2 rounded-full bg-amber-500 mr-1.5"></span>
                                Campaign Paused
                            </span>
                        @elseif($prospect->status === 'new' || !$prospect->blueprint_id)
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                                <span class="h-2 w-2 rounded-full bg-blue-400 mr-1.5"></span>
                                Not Started (New)
                            </span>
                        @else
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                {{ ucfirst($prospect->status) }}
                            </span>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <!-- Left Side: Prospect Profile Info & AI Next Best Action -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Profile details -->
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 shadow-sm space-y-4">
                    <h2 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                        Prospect Profile
                    </h2>

                    <div>
                        <span class="text-[10px] text-zinc-400 font-bold uppercase">Contact Name</span>
                        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{{ $prospect->contact_name }}</p>
                    </div>

                    <div>
                        <span class="text-[10px] text-zinc-400 font-bold uppercase">Contact Email</span>
                        <p class="text-sm font-mono text-zinc-600 dark:text-zinc-400 mt-0.5">{{ $prospect->contact_email }}</p>
                    </div>

                    @if($prospect->contact_role)
                        <div>
                            <span class="text-[10px] text-zinc-400 font-bold uppercase">Role / Title</span>
                            <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-0.5">{{ $prospect->contact_role }}</p>
                        </div>
                    @endif

                    <div>
                        <span class="text-[10px] text-zinc-400 font-bold uppercase">Company</span>
                        <p class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{{ $prospect->company_name }}</p>
                    </div>

                    @if($prospect->blueprint)
                        <div>
                            <span class="text-[10px] text-zinc-400 font-bold uppercase">Assigned Sequence</span>
                            <div class="mt-1 flex items-center gap-1.5">
                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 font-semibold">
                                    <x-phosphor-flow-arrow-bold class="w-3.5 h-3.5" />
                                    {{ $prospect->blueprint->name }}
                                </span>
                            </div>
                            <span class="text-[10px] text-zinc-400 mt-1 block">Current Step Order: {{ $prospect->current_step_order }}</span>
                        </div>
                    @endif

                    @if($prospect->notes)
                        <div class="pt-2">
                            <span class="text-[10px] text-zinc-400 font-bold uppercase">Notes</span>
                            <p class="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded mt-1 border border-zinc-100 dark:border-zinc-900 italic">
                                "{{ $prospect->notes }}"
                            </p>
                        </div>
                    @endif
                </div>

                <!-- AI Future Agent Capabilities & Planned Actions Panel -->
                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-zinc-950 border border-indigo-200/60 dark:border-indigo-900/40 rounded-lg p-5 shadow-sm space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-indigo-200/40 dark:border-indigo-900/30">
                        <span class="p-1 bg-indigo-100 dark:bg-indigo-900/60 rounded text-indigo-600 dark:text-indigo-400">
                            <x-phosphor-sparkle-fill class="w-4 h-4" />
                        </span>
                        <h2 class="text-sm font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                            AI Agent Action Plan (Future)
                        </h2>
                    </div>

                    <p class="text-xs text-indigo-950/75 dark:text-zinc-400 leading-relaxed">
                        In the future, our AI agent will fully read and understand incoming prospect messages to take automated smart actions based on semantic intent and context.
                    </p>

                    <div class="space-y-2.5">
                        <div class="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-zinc-900/40 rounded border border-indigo-100/60 dark:border-zinc-800/60">
                            <span class="p-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 mt-0.5">
                                <x-phosphor-bell-bold class="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Contextual Alerts</h4>
                                <p class="text-[10px] text-zinc-500 mt-0.5">Auto-categorize and notify of hot leads needing custom human touches.</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-zinc-900/40 rounded border border-indigo-100/60 dark:border-zinc-800/60">
                            <span class="p-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mt-0.5">
                                <x-phosphor-magic-wand-bold class="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Smart Draft Generation</h4>
                                <p class="text-[10px] text-zinc-500 mt-0.5">AI drafts custom replies addressing prospect objections by querying database sources.</p>
                            </div>
                        </div>

                        <div class="flex items-start gap-2.5 p-2 bg-white/70 dark:bg-zinc-900/40 rounded border border-indigo-100/60 dark:border-zinc-800/60">
                            <span class="p-1 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 mt-0.5">
                                <x-phosphor-gear-bold class="w-3.5 h-3.5" />
                            </span>
                            <div>
                                <h4 class="text-xs font-bold text-zinc-800 dark:text-zinc-200">Autonomous Tool Calling</h4>
                                <p class="text-[10px] text-zinc-500 mt-0.5">Query CRM history, calendar availability, and product catalogs autonomously.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Right Side: Chronological Outreach Timeline -->
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
                    <h2 class="text-sm font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 pb-3 border-b border-zinc-100 dark:border-zinc-900 mb-6 flex items-center justify-between">
                        <span>Communication Timeline</span>
                        <span class="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 font-bold text-xs">
                            {{ $events->count() }} Event{{ $events->count() === 1 ? '' : 's' }}
                        </span>
                    </h2>

                    @if($events->isEmpty())
                        <div class="text-center py-12">
                            <x-phosphor-chat-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
                            <h3 class="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Outreach Logged Yet</h3>
                            <p class="text-xs text-zinc-500 mt-1">Start a sequence campaign or exchange emails to begin building the timeline history.</p>
                        </div>
                    @else
                        <!-- Timeline list wrapper -->
                        <div class="relative border-l border-zinc-200 dark:border-zinc-800 ml-3.5 md:ml-4 pl-6 md:pl-8 space-y-8">
                            @foreach($events as $event)
                                <div class="relative">
                                    <!-- Event Icon Bullet -->
                                    <div class="absolute -left-[39px] md:-left-[47px] top-0 w-8 h-8 rounded-full border-2 bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors shadow-sm
                                        @if($event['type'] === 'ai_automated')
                                            border-indigo-500 text-indigo-600 dark:text-indigo-400
                                        @elseif($event['type'] === 'user_manual')
                                            border-blue-500 text-blue-600 dark:text-blue-400
                                        @elseif($event['type'] === 'prospect_reply')
                                            border-emerald-500 text-emerald-600 dark:text-emerald-400
                                        @endif
                                    ">
                                        @if($event['type'] === 'ai_automated')
                                            <x-phosphor-sparkle-bold class="w-4 h-4" />
                                        @elseif($event['type'] === 'user_manual')
                                            <x-phosphor-paper-plane-tilt-bold class="w-4 h-4" />
                                        @elseif($event['type'] === 'prospect_reply')
                                            <x-phosphor-chat-text-bold class="w-4 h-4" />
                                        @endif
                                    </div>

                                    <!-- Event Details Card -->
                                    <div class="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 rounded-lg p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                                        <!-- Header line -->
                                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-1 pb-2 border-b border-zinc-100 dark:border-zinc-900 mb-2.5">
                                            <div>
                                                @if($event['type'] === 'ai_automated')
                                                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                                                        AI Automated Send
                                                    </span>
                                                    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1.5">
                                                        Sequence Step {{ $event['step_order'] + 1 }} ({{ $event['template_name'] }})
                                                    </span>
                                                @elseif($event['type'] === 'user_manual')
                                                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400">
                                                        User Emailed Back
                                                    </span>
                                                    <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-300 ml-1.5">
                                                        Manual Reply Sent
                                                    </span>
                                                @elseif($event['type'] === 'prospect_reply')
                                                    <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                                                        Prospect Response Received
                                                    </span>
                                                @endif
                                            </div>
                                            <!-- Date/Time of action -->
                                            <span class="text-[11px] font-medium text-zinc-400 font-mono" title="{{ $event['timestamp'] }}">
                                                {{ \Carbon\Carbon::parse($event['timestamp'])->diffForHumans() }} ({{ \Carbon\Carbon::parse($event['timestamp'])->format('M d, Y h:i A') }})
                                            </span>
                                        </div>

                                        <!-- Email Metadata / Details -->
                                        <div class="space-y-2">
                                            <div class="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                                                {{ $event['subject'] }}
                                            </div>

                                            @if($event['type'] === 'prospect_reply' && isset($event['from_email']))
                                                <div class="text-[11px] text-zinc-400">
                                                    From: <span class="font-semibold text-zinc-600 dark:text-zinc-300">{{ $event['from_name'] ?? $event['from_email'] }}</span> &lt;{{ $event['from_email'] }}&gt;
                                                </div>
                                            @endif

                                            <!-- Email Content Area -->
                                            <div class="text-xs text-zinc-600 dark:text-zinc-400 mt-2 bg-white dark:bg-zinc-950/60 p-3 rounded border border-zinc-100 dark:border-zinc-900 leading-relaxed font-sans max-h-48 overflow-y-auto">
                                                {!! nl2br(strip_tags($event['body'])) !!}
                                            </div>

                                            <!-- Condition Analysis for Prospect Responses -->
                                            @if($event['type'] === 'prospect_reply')
                                                <div class="mt-3 p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                                                    <div class="flex items-center justify-between">
                                                        <span class="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">AI Intent Condition Analysis</span>
                                                        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                                                            <x-phosphor-shield-check-bold class="w-3 h-3" />
                                                            Completed
                                                        </span>
                                                    </div>

                                                    @php
                                                        $lowerBody = strtolower($event['body']);
                                                        $matchedCondition = null;
                                                        $matchedColor = 'text-zinc-600 bg-zinc-100 border-zinc-200';

                                                        if (Str::contains($lowerBody, ['interested', 'demo', 'meeting', 'call', 'pricing', 'discuss', 'yes'])) {
                                                            $matchedCondition = 'Positive Interest Detected (Ready to schedule call / proceed)';
                                                            $matchedColor = 'text-emerald-700 bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40';
                                                        } elseif (Str::contains($lowerBody, ['unsubscribe', 'stop', 'remove', 'not interested', 'no'])) {
                                                            $matchedCondition = 'Opt-out / Negative Sentiment Match (Auto-pause recommended)';
                                                            $matchedColor = 'text-amber-700 bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40';
                                                        }
                                                    @endphp

                                                    @if($matchedCondition)
                                                        <div class="mt-2 flex items-center gap-2 p-1.5 rounded border text-[11px] font-semibold {{ $matchedColor }}">
                                                            <x-phosphor-check-circle-bold class="w-4 h-4 flex-shrink-0" />
                                                            <span>Matched Action Condition: {{ $matchedCondition }}</span>
                                                        </div>
                                                    @else
                                                        <div class="mt-2 text-[11px] text-zinc-500 italic">
                                                            No critical conditions matched in content body. Proceeding with standard sequence timeline.
                                                        </div>
                                                    @endif
                                                </div>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </x-app.container>
</x-layouts.app>
