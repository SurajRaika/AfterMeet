<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Automations Engine"
                description="Instantly launch, customize, and monitor automated templates and custom event workflows."
                :border="false"
            />
            <div class="flex items-center gap-3">
                <form action="{{ route('automations.seed-defaults') }}" method="POST" class="inline-block">
                    @csrf
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors">
                        Restore Default Templates
                    </button>
                </form>
            </div>
        </div>

        @if(session('success'))
            <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-zinc-800/50 dark:text-green-400" role="alert">
                <span class="font-medium">Success!</span> {{ session('success') }}
            </div>
        @endif

        <!-- Tabbed Navigation -->
        <div x-data="{ tab: 'templates' }" class="space-y-6">
            <div class="border-b border-zinc-200 dark:border-zinc-800">
                <nav class="flex space-x-6" aria-label="Tabs">
                    <button @click="tab = 'templates'" :class="tab === 'templates' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors">
                        Templates Library
                    </button>
                    <button @click="tab = 'active-runs'" :class="tab === 'active-runs' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'" class="whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors">
                        Active Runs / Workflows
                    </button>
                </nav>
            </div>

            <!-- Templates Library Tab (Canva-like Cards) -->
            <div x-show="tab === 'templates'" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @forelse($automations as $automation)
                    @php
                        $runsCount = $automation->instances()->count();
                        $activeRunsCount = $automation->instances()->whereIn('status', ['active', 'paused'])->count();
                    @endphp
                    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500 transition-all group duration-200 relative overflow-hidden">
                        <!-- Top design band -->
                        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r {{ $automation->type === 'trigger' ? 'from-purple-500 to-indigo-500' : 'from-blue-500 to-teal-500' }}"></div>

                        <div>
                            <div class="flex items-start justify-between mb-4">
                                <div class="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    @if($automation->type === 'trigger')
                                        <x-phosphor-lightning-duotone class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    @else
                                        <x-phosphor-envelope-duotone class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    @endif
                                </div>
                                <span class="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider {{ $automation->type === 'trigger' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' }}">
                                    {{ $automation->type }} Event
                                </span>
                            </div>

                            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {{ $automation->name }}
                            </h3>

                            <p class="text-xs text-zinc-400 dark:text-zinc-500 font-mono mb-4">
                                {{ count($automation->workflow_definition['nodes'] ?? []) }} Node(s) starting with: <code class="bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-[10px]">{{ $automation->workflow_definition['start_node'] ?? 'N/A' }}</code>
                            </p>

                            <!-- Stat Counts -->
                            <div class="grid grid-cols-2 gap-4 py-3 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-900 mb-4">
                                <div>
                                    <span class="text-[10px] text-zinc-400 uppercase font-bold block">Running Instances</span>
                                    <span class="text-lg font-bold text-zinc-800 dark:text-zinc-200">{{ $activeRunsCount }} active</span>
                                </div>
                                <div>
                                    <span class="text-[10px] text-zinc-400 uppercase font-bold block">Total Runs</span>
                                    <span class="text-lg font-bold text-zinc-800 dark:text-zinc-200">{{ $runsCount }} logs</span>
                                </div>
                            </div>
                        </div>

                        <!-- Manual testing and Triggering -->
                        <div class="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 mt-2">
                            <form action="{{ route('automations.trigger', $automation->id) }}" method="POST" class="flex items-center gap-2 mb-4">
                                @csrf
                                <select name="prospect_id" required class="flex-1 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-1.5 px-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="" disabled selected>Select Test Prospect</option>
                                    @foreach($prospects as $prospect)
                                        <option value="{{ $prospect->id }}">{{ $prospect->contact_name }} ({{ $prospect->company_name }})</option>
                                    @endforeach
                                </select>
                                <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow transition-colors">
                                    Trigger
                                </button>
                            </form>

                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <!-- Toggle Status form -->
                                    <form action="{{ route('automations.toggle', $automation->id) }}" method="POST">
                                        @csrf
                                        <button type="submit" class="inline-flex items-center gap-1.5">
                                            @if($automation->is_active)
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-100 dark:border-green-900">
                                                    Active
                                                </span>
                                            @else
                                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                    Disabled
                                                </span>
                                            @endif
                                        </button>
                                    </form>
                                </div>

                                <div class="flex items-center gap-3">
                                    <a href="{{ route('automations.configure', $automation->id) }}" class="text-xs font-bold text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        Customize
                                    </a>
                                    <span class="text-zinc-200 dark:text-zinc-800">|</span>
                                    <a href="{{ route('automations.runs', $automation->id) }}" class="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
                                        Logs
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                @empty
                    <div class="col-span-2 py-12 text-center text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                        <x-phosphor-stack-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                        <p class="text-sm mt-2 font-medium">No templates found</p>
                        <p class="text-xs mt-1">Click "Restore Default Templates" above to instantly start!</p>
                    </div>
                @endforelse
            </div>

            <!-- Active Runs / Workflows Tab -->
            <div x-show="tab === 'active-runs'" class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                        <tr>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prospect</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Automation</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Current Node</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Started</th>
                            <th class="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                        @php
                            $allInstances = \App\Models\AutomationInstance::with(['prospect', 'automation'])->latest()->get();
                        @endphp
                        @forelse($allInstances as $instance)
                            <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {{ $instance->prospect->contact_name ?? 'N/A' }}
                                    <span class="text-xs block text-zinc-400 font-normal">{{ $instance->prospect->company_name ?? '' }}</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                    {{ $instance->automation->name ?? 'N/A' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    @if($instance->status === 'active')
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-500">
                                            Active
                                        </span>
                                    @elseif($instance->status === 'paused')
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-500">
                                            Paused
                                        </span>
                                    @elseif($instance->status === 'completed')
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-500">
                                            Completed
                                        </span>
                                    @else
                                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-500">
                                            Failed
                                        </span>
                                    @endif
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-xs font-mono text-zinc-500">
                                    {{ $instance->current_node ?? 'N/A' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                    {{ $instance->started_at->diffForHumans() }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <a href="{{ route('automations.runs', $instance->automation_id) }}" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                                        View Runs
                                    </a>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                    <x-phosphor-clock-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                                    <p class="text-sm mt-2 font-medium">No running workflows found</p>
                                    <p class="text-xs mt-1">Deploy and trigger a template from the Library tab to see execution logs.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </x-app.container>
</x-layouts.app>
