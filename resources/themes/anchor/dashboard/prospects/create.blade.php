<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Create Prospect"
                description="Add a single contact manually to start monitoring and outreaching."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('prospects.store') }}" method="POST" class="space-y-4">
                @csrf

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="contact_name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Name</label>
                        <input type="text" name="contact_name" id="contact_name" required placeholder="e.g. Alice Smith" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('contact_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="contact_email" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Email</label>
                        <input type="email" name="contact_email" id="contact_email" required placeholder="e.g. alice@example.com" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('contact_email') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="company_name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Company Name</label>
                        <input type="text" name="company_name" id="company_name" required placeholder="e.g. Acme Industries" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('company_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="contact_role" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Role / Job Title</label>
                        <input type="text" name="contact_role" id="contact_role" placeholder="e.g. Chief Marketing Officer" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('contact_role') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="status" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Initial Status</label>
                        <select name="status" id="status" required class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="new" selected>New</option>
                            <option value="active">Active</option>
                            <option value="qualified">Qualified</option>
                            <option value="junk">Junk</option>
                            <option value="paused">Paused</option>
                        </select>
                        @error('status') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="blueprint_id" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Assigned Blueprint</label>
                        <select name="blueprint_id" id="blueprint_id" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="">No Sequence Blueprint</option>
                            @foreach($blueprints as $bp)
                                <option value="{{ $bp->id }}">{{ $bp->name }}</option>
                            @endforeach
                        </select>
                        @error('blueprint_id') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                </div>

                <div>
                    <label for="notes" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Notes / Background info</label>
                    <textarea name="notes" id="notes" rows="4" placeholder="Met them at conference X, interested in..." class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                    @error('notes') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <a href="{{ route('prospects.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        Save Prospect
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
