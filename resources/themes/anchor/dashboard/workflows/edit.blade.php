<x-layouts.app>
    <script>
        window.templatesList = @json($templates);
    </script>

    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Edit Workflow"
                description="Modify your workflow settings, nodes, or transition edges visually using the canvas."
                :border="false"
            />
            <a href="{{ route('workflows.index') }}" class="inline-flex items-center gap-1 text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors">
                <x-phosphor-arrow-left-bold class="w-4 h-4" />
                Back to Workflows
            </a>
        </div>

        <div class="mt-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('workflows.update', $workflow->id) }}" method="POST" class="space-y-6">
                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="name" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Name</label>
                        <input type="text" name="name" id="name" required value="{{ old('name', $workflow->name) }}" placeholder="e.g. Lead Enrichment & outreach sequence"
                            class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium">
                        @error('name')
                            <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div>
                        <label for="trigger_type" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Trigger Type</label>
                        <select name="trigger_type" id="trigger_type" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 font-medium">
                            <option value="manual" {{ old('trigger_type', $workflow->trigger_type) === 'manual' ? 'selected' : '' }}>Manual Trigger</option>
                            <option value="prospect_created" {{ old('trigger_type', $workflow->trigger_type) === 'prospect_created' ? 'selected' : '' }}>Prospect Created</option>
                            <option value="email_event" {{ old('trigger_type', $workflow->trigger_type) === 'email_event' ? 'selected' : '' }}>Email Event</option>
                        </select>
                        @error('trigger_type')
                            <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                        @enderror
                    </div>
                </div>

                <div>
                    <label for="description" class="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Description</label>
                    <textarea name="description" id="description" rows="2" placeholder="Describe what this workflow accomplishes..."
                        class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium">{{ old('description', $workflow->description) }}</textarea>
                    @error('description')
                        <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                    @enderror
                </div>

                <div class="flex items-center">
                    <input type="checkbox" name="is_active" id="is_active" value="1" {{ old('is_active', $workflow->is_active) ? 'checked' : '' }}
                        class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-300 rounded">
                    <label for="is_active" class="ml-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Activate this workflow immediately</label>
                </div>

                <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <label class="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">2. Visual Node Graph Canvas Builder</label>
                    <textarea name="graph" id="graph" required style="display: none;">{{ old('graph', $graphJson) }}</textarea>

                    <div id="workflow-visual-builder-root" class="w-full"></div>
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

    <x-slot name="javascript">
        @vite(['resources/themes/anchor/dashboard/workflows/visual_builder.tsx'])
    </x-slot>
</x-layouts.app>
