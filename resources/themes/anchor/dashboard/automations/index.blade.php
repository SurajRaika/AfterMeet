<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Automations Engine"
                description="Manage your head-less queue-driven backend execution workflows."
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

        <div class="mt-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Automation</th>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                        <th class="px-6 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Manual Run Trigger</th>
                        <th class="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    @forelse($automations as $automation)
                        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                <div>{{ $automation->name }}</div>
                                <div class="text-xs text-zinc-400 mt-1 font-mono max-w-xs truncate">
                                    {{ count($automation->workflow_definition['nodes'] ?? []) }} Node(s) starting with: {{ $automation->workflow_definition['start_node'] ?? 'N/A' }}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                <span class="capitalize px-2 py-1 rounded text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                    {{ $automation->type }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                                <form action="{{ route('automations.toggle', $automation->id) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="inline-flex items-center gap-1">
                                        @if($automation->is_active)
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-100 dark:border-green-900">
                                                Active
                                            </span>
                                        @else
                                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-100 dark:border-red-900">
                                                Inactive
                                            </span>
                                        @endif
                                    </button>
                                </form>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                <form action="{{ route('automations.trigger', $automation->id) }}" method="POST" class="flex items-center gap-2">
                                    @csrf
                                    <select name="prospect_id" required class="text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 py-1 px-2 text-zinc-900 dark:text-zinc-100 focus:outline-none">
                                        <option value="" disabled selected>Select Prospect</option>
                                        @foreach($prospects as $prospect)
                                            <option value="{{ $prospect->id }}">{{ $prospect->contact_name }} ({{ $prospect->company_name }})</option>
                                        @endforeach
                                    </select>
                                    <button type="submit" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1 px-2.5 rounded shadow transition-colors">
                                        Trigger
                                    </button>
                                </form>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <a href="{{ route('automations.runs', $automation->id) }}" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold">Run History</a>
                                <span class="text-zinc-300 dark:text-zinc-700">|</span>
                                <form action="{{ route('automations.destroy', $automation->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this automation?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                <x-phosphor-stack-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                                <p class="text-sm mt-2 font-medium">No automations found</p>
                                <p class="text-xs mt-1">Restore default templates to get started.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-app.container>
</x-layouts.app>
