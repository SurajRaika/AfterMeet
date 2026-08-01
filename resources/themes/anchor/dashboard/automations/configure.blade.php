<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <a href="{{ route('automations.index') }}" class="text-xs text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 font-semibold flex items-center gap-1 mb-2">
                &larr; Back to Automations
            </a>
            <x-app.heading
                title="Customize Workflow: {{ $automation->name }}"
                description="Tailor node parameters, email copy, webhook URLs, and delays to match your precise use case."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('automations.update-config', $automation->id) }}" method="POST" class="space-y-6">
                @csrf

                <!-- Basic Meta -->
                <div>
                    <label for="name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Workflow Name</label>
                    <input type="text" name="name" id="name" required value="{{ old('name', $automation->name) }}" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    @error('name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>

                <!-- Iterate Nodes -->
                <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-8">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Configure Nodes</h3>

                    @foreach(($automation->workflow_definition['nodes'] ?? []) as $nodeId => $node)
                        <div class="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4">
                            <div class="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-2">
                                <div class="flex items-center gap-2">
                                    <span class="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 dark:text-zinc-400">
                                        @if($node['type'] === 'SendEmailNode')
                                            <x-phosphor-envelope-bold class="w-4 h-4" />
                                        @elseif($node['type'] === 'DelayNode')
                                            <x-phosphor-clock-bold class="w-4 h-4" />
                                        @elseif($node['type'] === 'TriggerWebhookNode')
                                            <x-phosphor-globe-bold class="w-4 h-4" />
                                        @else
                                            <x-phosphor-gear-bold class="w-4 h-4" />
                                        @endif
                                    </span>
                                    <h4 class="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                        {{ $nodeId }} <span class="text-xs font-normal text-zinc-400">({{ $node['type'] }})</span>
                                    </h4>
                                </div>
                            </div>

                            @if($node['type'] === 'SendEmailNode')
                                <div class="space-y-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Subject</label>
                                        <input type="text" name="nodes[{{ $nodeId }}][subject]" value="{{ $node['config']['subject'] ?? '' }}" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email Body</label>
                                        <textarea name="nodes[{{ $nodeId }}][body]" rows="4" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">{{ $node['config']['body'] ?? '' }}</textarea>
                                        <p class="text-[10px] text-zinc-400 mt-1">Use <code>{{"{{"}}contact_name{{"}}"}}</code>, <code>{{"{{"}}company_name{{"}}"}}</code>, or <code>{{"{{"}}contact_role{{"}}"}}</code> as placeholders.</p>
                                    </div>
                                </div>
                            @elseif($node['type'] === 'DelayNode')
                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Delay Period (Days)</label>
                                        <input type="number" name="nodes[{{ $nodeId }}][days]" value="{{ $node['config']['days'] ?? 0 }}" min="0" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Delay Period (Seconds / Testing)</label>
                                        <input type="number" name="nodes[{{ $nodeId }}][seconds]" value="{{ $node['config']['seconds'] ?? 0 }}" min="0" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                    </div>
                                </div>
                            @elseif($node['type'] === 'TriggerWebhookNode')
                                <div>
                                    <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Webhook URL</label>
                                    <input type="url" required name="nodes[{{ $nodeId }}][webhook_url]" value="{{ $node['config']['webhook_url'] ?? '' }}" placeholder="https://api.yourdomain.com/webhook" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                    <p class="text-[10px] text-zinc-400 mt-1">This URL will receive a secure HTTP POST containing prospect details on trigger.</p>
                                </div>
                            @elseif($node['type'] === 'ConditionNode')
                                <div class="space-y-3">
                                    <label class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Condition Branches</label>
                                    @foreach(($node['config']['conditions'] ?? []) as $key => $targetNode)
                                        <div class="flex items-center gap-2">
                                            <span class="text-xs font-mono font-bold text-zinc-400 min-w-[100px]">If intent is: "{{ $key }}"</span>
                                            <span class="text-xs text-zinc-400">&rarr; Go to node:</span>
                                            <input type="text" name="nodes[{{ $nodeId }}][conditions][{{ $key }}]" value="{{ $targetNode }}" class="rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-xs py-1 px-2.5 w-48 font-mono focus:outline-none" />
                                        </div>
                                    @endforeach
                                </div>
                            @else
                                <p class="text-xs text-zinc-400">No configuration required for this node type.</p>
                            @endif
                        </div>
                    @endforeach
                </div>

                <!-- Form Controls -->
                <div class="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <a href="{{ route('automations.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
