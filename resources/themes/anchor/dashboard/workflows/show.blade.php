<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
                <x-app.heading
                    title="{{ $workflow->name }}"
                    description="{{ $workflow->description ?: 'No description provided.' }}"
                    :border="false"
                />
                <div class="mt-2 flex items-center gap-3">
                    <span class="capitalize px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        Trigger: {{ str_replace('_', ' ', $workflow->trigger_type) }}
                    </span>
                    @if($workflow->is_active)
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-100 dark:border-green-900">
                            Active
                        </span>
                    @else
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-zinc-50 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800">
                            Inactive
                        </span>
                    @endif
                </div>
            </div>
            <div class="flex gap-2">
                <a href="{{ route('workflows.edit', $workflow->id) }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                    <x-phosphor-pencil-bold class="w-4 h-4" />
                    Edit Graph
                </a>
                <a href="{{ route('workflows.index') }}" class="inline-flex items-center gap-1 px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                    Back to List
                </a>
            </div>
        </div>

        @if(session('success'))
            <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-zinc-800/50 dark:text-green-400" role="alert">
                <span class="font-medium">Success!</span> {{ session('success') }}
            </div>
        @endif
        @if(session('error'))
            <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-zinc-800/50 dark:text-red-400" role="alert">
                <span class="font-medium">Error!</span> {{ session('error') }}
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {{-- Manual Execution Box --}}
            <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm h-fit">
                <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                    <x-phosphor-play-circle-bold class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Trigger Execution Manual Run
                </h3>
                <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-4">Launch a new sandbox instance run of this Node Graph workflow immediately.</p>

                <form action="{{ route('workflows.execute', $workflow->id) }}" method="POST" class="space-y-4">
                    @csrf
                    <div>
                        <label for="prospect_id" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Select context Prospect</label>
                        <select name="prospect_id" id="prospect_id" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="">-- No Prospect (Standalone execution) --</option>
                            @foreach($prospects as $prospect)
                                <option value="{{ $prospect->id }}">
                                    {{ $prospect->contact_name }} ({{ $prospect->company_name }})
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div>
                        <label for="custom_input" class="block text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">Custom Input (JSON payload)</label>
                        <textarea name="custom_input" id="custom_input" rows="4" placeholder='{"custom_key": "custom_value"}'
                            class="font-mono block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-xs focus:ring-indigo-500 focus:border-indigo-500">{"company_size": 250, "industry": "fintech"}</textarea>
                    </div>

                    <button type="submit" class="w-full inline-flex justify-center items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        <x-phosphor-lightning-bold class="w-4 h-4" />
                        Execute Workflow Run
                    </button>
                </form>
            </div>

            {{-- Graph JSON View --}}
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <div class="flex items-center justify-between mb-3">
                        <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100">Workflow Definition Schema</h3>
                        <span class="text-xs text-zinc-400 dark:text-zinc-500 font-mono">{{ count($workflow->graph['nodes'] ?? []) }} nodes, {{ count($workflow->graph['edges'] ?? []) }} edges</span>
                    </div>
                    <pre class="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-700 dark:text-zinc-300 max-h-72">{{ json_encode($workflow->graph, JSON_PRETTY_PRINT) }}</pre>
                </div>

                {{-- Executions Logs --}}
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div class="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100">Execution History (Runs)</h3>
                        <span class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Recent executions</span>
                    </div>

                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Run ID</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Target Prospect</th>
                                    <th class="px-6 py-3 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Executed At</th>
                                    <th class="px-6 py-3 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
                                @forelse($runs as $run)
                                    <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                            #{{ $run->id }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            @if($run->prospect)
                                                <span class="font-medium text-zinc-700 dark:text-zinc-300">{{ $run->prospect->contact_name }}</span>
                                                <span class="block text-xs text-zinc-400">{{ $run->prospect->company_name }}</span>
                                            @else
                                                <span class="text-zinc-400 italic">No prospect context</span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                                            @if($run->status === 'completed')
                                                <span class="px-2 py-0.5 text-xs font-bold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded-full border border-green-100 dark:border-green-900">Completed</span>
                                            @elseif($run->status === 'failed')
                                                <span class="px-2 py-0.5 text-xs font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900">Failed</span>
                                            @else
                                                <span class="px-2 py-0.5 text-xs font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 rounded-full border border-yellow-100 dark:border-yellow-900">Running</span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            {{ $run->created_at->format('M d, Y H:i:s') }}
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a href="{{ route('workflows.showRun', $run->id) }}" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Inspect Log</a>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="px-6 py-8 text-center text-zinc-400 dark:text-zinc-500">
                                            No executions logged yet. Use the left panel to execute this workflow.
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </x-app.container>
</x-layouts.app>
