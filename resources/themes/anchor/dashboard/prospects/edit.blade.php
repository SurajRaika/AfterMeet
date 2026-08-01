<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Edit Prospect"
                description="Modify contact details, status, or manually override their sequence progress."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('prospects.update', $prospect->id) }}" method="POST" class="space-y-4">
                @csrf
                @method('PUT')

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label for="contact_name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Name</label>
                        <input type="text" name="contact_name" id="contact_name" required value="{{ old('contact_name', $prospect->contact_name) }}" placeholder="e.g. Alice Smith" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('contact_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="contact_email" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Email</label>
                        <input type="email" name="contact_email" id="contact_email" required value="{{ old('contact_email', $prospect->contact_email) }}" placeholder="e.g. alice@example.com" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('contact_email') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="company_name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Company Name</label>
                        <input type="text" name="company_name" id="company_name" required value="{{ old('company_name', $prospect->company_name) }}" placeholder="e.g. Acme Industries" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('company_name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="contact_role" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Contact Role / Job Title</label>
                        <input type="text" name="contact_role" id="contact_role" value="{{ old('contact_role', $prospect->contact_role) }}" placeholder="e.g. Chief Marketing Officer" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('contact_role') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="status" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Status</label>
                        <select name="status" id="status" required class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="new" {{ old('status', $prospect->status) === 'new' ? 'selected' : '' }}>New</option>
                            <option value="active" {{ old('status', $prospect->status) === 'active' ? 'selected' : '' }}>Active</option>
                            <option value="qualified" {{ old('status', $prospect->status) === 'qualified' ? 'selected' : '' }}>Qualified</option>
                            <option value="junk" {{ old('status', $prospect->status) === 'junk' ? 'selected' : '' }}>Junk</option>
                            <option value="paused" {{ old('status', $prospect->status) === 'paused' ? 'selected' : '' }}>Paused</option>
                        </select>
                        @error('status') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="stage" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Pipeline Stage</label>
                        <select name="stage" id="stage" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="New" {{ old('stage', $prospect->stage) === 'New' ? 'selected' : '' }}>New</option>
                            <option value="Researching" {{ old('stage', $prospect->stage) === 'Researching' ? 'selected' : '' }}>Researching</option>
                            <option value="Ready to Contact" {{ old('stage', $prospect->stage) === 'Ready to Contact' ? 'selected' : '' }}>Ready to Contact</option>
                            <option value="Contacted" {{ old('stage', $prospect->stage) === 'Contacted' ? 'selected' : '' }}>Contacted</option>
                            <option value="Engaged" {{ old('stage', $prospect->stage) === 'Engaged' ? 'selected' : '' }}>Engaged</option>
                            <option value="Connected" {{ old('stage', $prospect->stage) === 'Connected' ? 'selected' : '' }}>Connected</option>
                            <option value="Converted" {{ old('stage', $prospect->stage) === 'Converted' ? 'selected' : '' }}>Converted</option>
                            <option value="Archived" {{ old('stage', $prospect->stage) === 'Archived' ? 'selected' : '' }}>Archived</option>
                        </select>
                        @error('stage') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="country" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Country</label>
                        <input type="text" name="country" id="country" value="{{ old('country', $prospect->country) }}" placeholder="e.g. USA" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('country') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="company_size" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Company Size</label>
                        <input type="number" name="company_size" id="company_size" min="0" value="{{ old('company_size', $prospect->company_size) }}" placeholder="e.g. 150" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('company_size') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="source" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Source</label>
                        <input type="text" name="source" id="source" value="{{ old('source', $prospect->source) }}" placeholder="e.g. Event, Web, LeadList" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('source') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>

                    <div>
                        <label for="event" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Event Name (if Event source)</label>
                        <input type="text" name="event" id="event" value="{{ old('event', $prospect->event) }}" placeholder="e.g. Canton Fair" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        @error('event') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                    </div>
                </div>

                <div>
                    <label for="notes" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Notes / Background info</label>
                    <textarea name="notes" id="notes" rows="4" placeholder="Met them at conference X, interested in..." class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">{{ old('notes', $prospect->notes) }}</textarea>
                    @error('notes') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <a href="{{ route('prospects.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        Update Prospect
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
