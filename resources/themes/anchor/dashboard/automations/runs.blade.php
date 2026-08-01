<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
                <a href="{{ route('automations.index') }}" class="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 font-semibold flex items-center gap-1 mb-2">
                    &larr; Back to Automations
                </a>
                <x-app.heading
                    title="Execution Runs & Logs"
                    description="Run history for the '{{ $automation->name }}' automation template."
                    :border="false"
                />
            </div>
        </div>

        @if(session('success'))
            <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-zinc-800/50 dark:text-green-400" role="alert">
                <span class="font-medium">Success!</span> {{ session('success') }}
            </div>
        @endif

        <div class="space-y-6 mt-6">
            @forelse($instances as $instance)
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm p-6">
                    <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4">
                        <div>
                            <span class="text-xs text-zinc-400 uppercase tracking-wider font-bold">Prospect</span>
                            <h3 class="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                                {{ $instance->prospect->contact_name ?? 'Unknown Prospect' }} ({{ $instance->prospect->company_name ?? 'N/A' }})
                            </h3>
                            <div class="text-xs text-zinc-400 mt-1">
                                Started: {{ $instance->started_at->diffForHumans() }} ({{ $instance->started_at }})
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="text-xs text-zinc-400 uppercase tracking-wider font-bold block mb-1">State</span>
                            @if($instance->status === 'active')
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900">
                                    Active (Running)
                                </span>
                            @elseif($instance->status === 'paused')
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900">
                                    Paused/Delayed
                                </span>
                            @elseif($instance->status === 'completed')
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400 border border-green-100 dark:border-green-900">
                                    Completed
                                </span>
                            @else
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-100 dark:border-red-900">
                                    Failed
                                </span>
                            @endif
                        </div>
                    </div>

                    <!-- Runs/Steps details -->
                    <div>
                        <h4 class="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Step-by-step Run Logs</h4>
                        <div class="space-y-4">
                            @forelse($instance->runs as $run)
                                <div class="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
                                    <div class="flex items-center justify-between mb-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                Node ID: <code class="bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs font-mono">{{ $run->node_id }}</code>
                                            </span>
                                            <span class="text-xs text-zinc-400">| Executed: {{ $run->created_at->diffForHumans() }}</span>
                                        </div>
                                        <div>
                                            @if($run->status === 'success')
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
                                                    Success
                                                </span>
                                            @elseif($run->status === 'delayed/paused')
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                                    Delayed/Paused
                                                </span>
                                            @else
                                                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
                                                    Failed
                                                </span>
                                            @endif
                                        </div>
                                    </div>

                                    @if($run->error_message)
                                        <div class="text-xs text-red-600 dark:text-red-400 font-semibold mb-2">
                                            Error: {{ $run->error_message }}
                                        </div>
                                    @endif

                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <span class="text-xs font-bold text-zinc-400 block mb-1">Input Payload</span>
                                            <pre class="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-[10px] font-mono overflow-x-auto max-h-32 text-zinc-700 dark:text-zinc-300">{{ json_encode($run->input_payload, JSON_PRETTY_PRINT) }}</pre>
                                        </div>
                                        <div>
                                            <span class="text-xs font-bold text-zinc-400 block mb-1">Output Payload</span>
                                            <pre class="bg-zinc-100 dark:bg-zinc-900 p-2 rounded text-[10px] font-mono overflow-x-auto max-h-32 text-zinc-700 dark:text-zinc-300">{{ json_encode($run->output_payload, JSON_PRETTY_PRINT) }}</pre>
                                        </div>
                                    </div>
                                </div>
                            @empty
                                <div class="text-xs text-zinc-400 dark:text-zinc-500">
                                    No steps executed yet. Node trigger is queued.
                                </div>
                            @endforelse
                        </div>
                    </div>
                </div>
            @empty
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-12 text-center text-zinc-400 dark:text-zinc-500">
                    <x-phosphor-clock-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                    <p class="text-sm mt-2 font-medium">No execution instances found</p>
                    <p class="text-xs mt-1">Select a prospect in the table on the Automations page and click "Trigger" to start an execution run.</p>
                </div>
            @endforelse
        </div>
    </x-app.container>
</x-layouts.app>
