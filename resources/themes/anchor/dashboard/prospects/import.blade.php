<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <x-app.heading
                title="Import Prospects from CSV"
                description="Upload a CSV file and map columns to contact fields."
                :border="false"
            />

            <a href="{{ route('prospects.import.sample') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg shadow transition-colors">
                <x-phosphor-download-simple-bold class="w-4 h-4" />
                Download Sample CSV
            </a>
        </div>

        <div class="mt-6 max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('prospects.import.upload') }}" method="POST" enctype="multipart/form-data" class="space-y-6">
                @csrf

                <div>
                    <label for="file" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Select CSV File</label>
                    <p class="text-xs text-zinc-500 mb-3">Upload a standard CSV file. In the next step, you will map your custom columns to our system fields.</p>
                    <input type="file" name="file" id="file" required class="block w-full text-sm text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-400 hover:file:bg-indigo-100 transition-all cursor-pointer border border-zinc-300 dark:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-900" />
                    @error('file') <span class="text-red-500 text-xs block mt-1">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label for="blueprint_id" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Assign Sequence Blueprint (Optional)</label>
                    <select name="blueprint_id" id="blueprint_id" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <option value="">Do Not Assign Sequence</option>
                        @foreach($blueprints as $bp)
                            <option value="{{ $bp->id }}">{{ $bp->name }}</option>
                        @endforeach
                    </select>
                    @error('blueprint_id') <span class="text-red-500 text-xs block mt-1">{{ $message }}</span> @enderror
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <a href="{{ route('prospects.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        Continue to Field Mapping
                        <x-phosphor-arrow-right-bold class="w-4 h-4" />
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
