<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Edit Workflow"
                description="Modify your workflow settings, nodes, or transition edges."
                :border="false"
            />
            <a href="{{ route('workflows.index') }}" class="inline-flex items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                <x-phosphor-arrow-left-bold class="w-4 h-4" />
                Back to Workflows
            </a>
        </div>

        <div class="mt-6 max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('workflows.update', $workflow->id) }}" method="POST" class="space-y-6">
                @csrf
                @method('PUT')

                <div>
                    <label for="name" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Name</label>
                    <input type="text" name="name" id="name" required value="{{ old('name', $workflow->name) }}" placeholder="e.g. Lead Enrichment & outreach sequence"
                        class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">
                    @error('name')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div>
                    <label for="description" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Description</label>
                    <textarea name="description" id="description" rows="2" placeholder="Describe what this workflow accomplishes..."
                        class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm">{{ old('description', $workflow->description) }}</textarea>
                    @error('description')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="trigger_type" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Trigger Type</label>
                        <select name="trigger_type" id="trigger_type" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                            <option value="manual" {{ old('trigger_type', $workflow->trigger_type) === 'manual' ? 'selected' : '' }}>Manual Trigger</option>
                            <option value="prospect_created" {{ old('trigger_type', $workflow->trigger_type) === 'prospect_created' ? 'selected' : '' }}>Prospect Created</option>
                            <option value="email_event" {{ old('trigger_type', $workflow->trigger_type) === 'email_event' ? 'selected' : '' }}>Email Event</option>
                        </select>
                        @error('trigger_type')
                            <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="flex items-center pt-6">
                        <input type="checkbox" name="is_active" id="is_active" value="1" {{ old('is_active', $workflow->is_active) ? 'checked' : '' }}
                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 rounded">
                        <label for="is_active" class="ml-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Activate this workflow immediately</label>
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between">
                        <label for="graph" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Workflow Node Graph JSON</label>
                        <span class="text-xs text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">V1 Format</span>
                    </div>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-2">Configure nodes (enrichment, condition, send_email, intent, sales_action) and edges that connect them.</p>
                    <textarea name="graph" id="graph" rows="12" required
                        class="font-mono mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs">{{ old('graph', $graphJson) }}</textarea>
                    @error('graph')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-3">
                    <a href="{{ route('workflows.index') }}" class="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">Cancel</a>
                    <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg shadow transition-colors">Save Changes</button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
