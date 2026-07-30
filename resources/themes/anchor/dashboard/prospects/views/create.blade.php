<x-layouts.app>
    <x-app.container class="lg:space-y-6" x-data="{
        filters: [
            { field: 'status', operator: '=', value: 'new' }
        ],
        addField() {
            this.filters.push({ field: 'contact_name', operator: '=', value: '' });
        },
        removeField(index) {
            this.filters.splice(index, 1);
            if (this.filters.length === 0) {
                this.addField();
            }
        }
    }">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Create Saved View"
                description="Build a dynamic, Zoho CRM-style custom view with multiple criteria/filters and custom sorting."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('prospect-views.store') }}" method="POST" class="space-y-6">
                @csrf

                <!-- View Name -->
                <div>
                    <label for="name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">View Name</label>
                    <input type="text" name="name" id="name" required placeholder="e.g. High Value Leads, Trade Show Contacts" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    @error('name') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>

                <!-- Filters Section -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <span class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Criteria (Match ALL conditions)</span>
                        <button type="button" @click="addField()" class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            <x-phosphor-plus-bold class="w-3.5 h-3.5" />
                            Add Condition
                        </button>
                    </div>

                    <div class="space-y-3 bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <template x-for="(filter, index) in filters" :key="index">
                            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <div class="w-full sm:w-1/3">
                                    <select :name="'filters['+index+'][field]'" x-model="filter.field" required class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        @foreach($fields as $fKey => $fVal)
                                            <option value="{{ $fKey }}">{{ $fVal }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="w-full sm:w-1/4">
                                    <select :name="'filters['+index+'][operator]'" x-model="filter.operator" required class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        @foreach($operators as $opKey => $opVal)
                                            <option value="{{ $opKey }}">{{ $opVal }}</option>
                                        @endforeach
                                    </select>
                                </div>
                                <div class="w-full sm:flex-1">
                                    <input type="text" :name="'filters['+index+'][value]'" x-model="filter.value" placeholder="Value to match..." class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                </div>
                                <button type="button" @click="removeField(index)" class="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg" title="Remove condition">
                                    <x-phosphor-trash-bold class="w-4 h-4" />
                                </button>
                            </div>
                        </template>
                    </div>
                    @error('filters') <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span> @enderror
                </div>

                <!-- Custom Sorting Section -->
                <div class="border-t border-zinc-200 dark:border-zinc-800 pt-5">
                    <span class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Custom Sorting (Optional)</span>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="sort_field" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sort By Field</label>
                            <select name="sort_field" id="sort_field" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="">Default (Latest Created)</option>
                                @foreach($fields as $fKey => $fVal)
                                    @if($fKey !== 'notes')
                                        <option value="{{ $fKey }}">{{ $fVal }}</option>
                                    @endif
                                @endforeach
                                <option value="created_at">Created Date</option>
                            </select>
                        </div>
                        <div>
                            <label for="sort_order" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sort Order</label>
                            <select name="sort_order" id="sort_order" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="asc">Ascending</option>
                                <option value="desc" selected>Descending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-3 pt-5 border-t border-zinc-200 dark:border-zinc-800">
                    <a href="{{ route('prospects.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        <x-phosphor-floppy-disk-bold class="w-4 h-4" />
                        Save View
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
