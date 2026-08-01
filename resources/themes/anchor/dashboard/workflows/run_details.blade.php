<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <div>
                <x-app.heading
                    title="Workflow Execution Run #{{ $run->id }}"
                    description="Execution logs and state changes for workflow: {{ $run->workflow->name }}"
                    :border="false"
                />
                <div class="mt-2 flex items-center gap-3">
                    <span class="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        Status:
                        @if($run->status === 'completed')
                            <span class="px-2 py-0.5 font-bold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded-full border border-green-100 dark:border-green-900">Completed</span>
                        @elseif($run->status === 'failed')
                            <span class="px-2 py-0.5 font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded-full border border-red-100 dark:border-red-900">Failed</span>
                        @else
                            <span class="px-2 py-0.5 font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 rounded-full border border-yellow-100 dark:border-yellow-900">Running</span>
                        @endif
                    </span>
                    <span class="text-zinc-300 dark:text-zinc-700">|</span>
                    <span class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Executed at: {{ $run->created_at->format('M d, Y H:i:s') }}</span>
                </div>
            </div>
            <a href="{{ route('workflows.show', $run->workflow_id) }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                <x-phosphor-arrow-left-bold class="w-4 h-4" />
                Back to Workflow Schema
            </a>
        </div>

        @if($run->error_message)
            <div class="p-4 mb-6 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-zinc-800/50 dark:text-red-400 border border-red-200 dark:border-red-900" role="alert">
                <span class="font-bold">Error Exception:</span> {{ $run->error_message }}
            </div>
        @endif

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {{-- Input/Output State Summary --}}
            <div class="space-y-6">
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-wider">Initial Execution Input</h3>
                    <pre class="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 p-3 rounded-lg overflow-x-auto text-xs font-mono text-zinc-700 dark:text-zinc-300 max-h-60">{{ json_encode($run->input, JSON_PRETTY_PRINT) }}</pre>
                </div>

                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2 uppercase tracking-wider">Final Output Context</h3>
                    <pre class="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800 p-3 rounded-lg overflow-x-auto text-xs font-mono text-zinc-700 dark:text-zinc-300 max-h-60">{{ json_encode($run->output, JSON_PRETTY_PRINT) }}</pre>
                </div>
            </div>

            {{-- Step Runs (Detailed Timeline) --}}
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                    <div class="p-6 border-b border-zinc-200 dark:border-zinc-800">
                        <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100">Node Traversal History (Executed Steps)</h3>
                    </div>

                    <div class="p-6">
                        @if($run->stepRuns->isEmpty())
                            <div class="text-center text-zinc-400 py-8">
                                No execution steps logged for this run.
                            </div>
                        @else
                            <div class="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 space-y-8 pb-4">
                                @foreach($run->stepRuns as $index => $step)
                                    <div class="relative pl-6">
                                        {{-- Icon / Bullet --}}
                                        <span class="absolute -left-[11px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-zinc-950 border-2 border-indigo-600 dark:border-indigo-400 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
                                            {{ $index + 1 }}
                                        </span>

                                        <div class="bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-sm">
                                            <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-200/50 dark:border-zinc-800/50">
                                                <div>
                                                    <span class="font-bold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wide">
                                                        Node: {{ str_replace('_', ' ', $step->node_type) }}
                                                    </span>
                                                    <span class="block text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Node ID: {{ $step->node_id }}</span>
                                                </div>
                                                <div class="flex items-center gap-2">
                                                    @if($step->status === 'completed')
                                                        <span class="px-2 py-0.5 text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400 rounded border border-green-100 dark:border-green-900">Success</span>
                                                    @elseif($step->status === 'failed')
                                                        <span class="px-2 py-0.5 text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 rounded border border-red-100 dark:border-red-900">Failed</span>
                                                    @else
                                                        <span class="px-2 py-0.5 text-[10px] font-bold bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 rounded border border-yellow-100 dark:border-yellow-900">Running</span>
                                                    @endif
                                                    <span class="text-xs text-zinc-400 font-mono">{{ $step->completed_at ? $step->completed_at->format('H:i:s') : '' }}</span>
                                                </div>
                                            </div>

                                            @if($step->error_message)
                                                <div class="mt-3 p-2 text-xs bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200/40 rounded">
                                                    {{ $step->error_message }}
                                                </div>
                                            @endif

                                            <div class="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <span class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">State Input:</span>
                                                    <pre class="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 p-2.5 rounded-lg overflow-x-auto text-[10px] font-mono text-zinc-600 dark:text-zinc-400 max-h-32">{{ json_encode($step->input, JSON_PRETTY_PRINT) }}</pre>
                                                </div>
                                                <div>
                                                    <span class="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Node Output:</span>
                                                    <pre class="bg-white dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 p-2.5 rounded-lg overflow-x-auto text-[10px] font-mono text-zinc-600 dark:text-zinc-400 max-h-32">{{ json_encode($step->output, JSON_PRETTY_PRINT) }}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </x-app.container>
</x-layouts.app>
