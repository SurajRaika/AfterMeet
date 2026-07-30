<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Create Blueprint"
                description="Design a new sequence blueprint. Define name, max attempts, and add steps."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('blueprints.store') }}" method="POST" class="space-y-6">
                @csrf

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="md:col-span-2">
                        <label for="name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Blueprint Name</label>
                        <input type="text" name="name" id="name" required placeholder="e.g. Inbound Demo Pipeline" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div class="md:col-span-2">
                        <label for="description" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                        <textarea name="description" id="description" rows="3" placeholder="Brief outline of what this blueprint achieves..." class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                        @error('description') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="max_attempts" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Max Attempts (Retries)</label>
                        <input type="number" name="max_attempts" id="max_attempts" required value="3" min="1" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('max_attempts') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                </div>

                <!-- Sequence Steps Section -->
                <div class="border-t border-zinc-200 dark:border-zinc-800 pt-6">
                    <div class="flex items-center justify-between mb-4">
                        <div>
                            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Sequence Steps</h3>
                            <p class="text-xs text-zinc-400">Order steps by defining templates and waiting periods (wait days).</p>
                        </div>
                        <button type="button" onclick="addStepRow()" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md border border-indigo-200 dark:border-indigo-900/60 transition-colors">
                            <x-phosphor-plus-bold class="w-3.5 h-3.5" />
                            Add Step
                        </button>
                    </div>

                    <div id="steps-list" class="space-y-3">
                        <!-- Dynamic rows appended here -->
                    </div>

                    @error('steps') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
                </div>

                <div class="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <a href="{{ route('blueprints.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        Create Blueprint
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>

    <script type="text/javascript">
        let stepIndex = 0;

        function addStepRow(templateId = '', waitDays = '3') {
            const container = document.getElementById('steps-list');
            const rowId = 'step-row-' + stepIndex;

            const rowHtml = `
                <div id="${rowId}" class="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <span class="text-xs font-bold text-zinc-400 font-mono flex-shrink-0">Step ${container.children.length + 1}</span>

                    <div class="flex-1">
                        <select name="steps[${stepIndex}][template_id]" required class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="" disabled selected>Select Template</option>
                            @foreach($templates as $tpl)
                                <option value="{{ $tpl->id }}" ${templateId == '{{ $tpl->id }}' ? 'selected' : ''}>{{ $tpl->name }}</option>
                            @endforeach
                        </select>
                    </div>

                    <div class="w-32 flex items-center gap-1.5">
                        <input type="number" name="steps[${stepIndex}][wait_days]" required min="0" value="${waitDays}" placeholder="Wait Days" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        <span class="text-xs text-zinc-400">days</span>
                    </div>

                    <button type="button" onclick="removeStepRow('${rowId}')" class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            `;

            container.insertAdjacentHTML('beforeend', rowHtml);
            stepIndex++;
        }

        function removeStepRow(rowId) {
            const row = document.getElementById(rowId);
            if (row) {
                row.remove();
                reindexSteps();
            }
        }

        function reindexSteps() {
            const container = document.getElementById('steps-list');
            Array.from(container.children).forEach((child, index) => {
                const label = child.querySelector('span');
                if (label) {
                    label.textContent = `Step ${index + 1}`;
                }
            });
        }

        // Initialize with one default step
        document.addEventListener('DOMContentLoaded', () => {
            addStepRow();
        });
    </script>
</x-layouts.app>
