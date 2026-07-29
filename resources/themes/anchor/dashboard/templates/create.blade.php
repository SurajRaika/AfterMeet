<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Create Template"
                description="Design a new email template for your pipeline campaigns."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('templates.store') }}" method="POST" class="space-y-4">
                @csrf

                <div>
                    <label for="name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Template Name</label>
                    <input type="text" name="name" id="name" required placeholder="e.g. Initial Outreach" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    @error('name') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label for="subject" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Subject Line</label>
                    <input type="text" name="subject" id="subject" required placeholder="e.g. Quick question for {{contact_name}}" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    @error('subject') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>

                <div>
                    <label for="body" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email Body</label>
                    <textarea name="body" id="body" rows="8" required placeholder="Hi {{contact_name}},\n\nI noticed that {{company_name}} is doing great things..." class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                    @error('body') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                </div>

                <div class="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                    <span class="font-bold uppercase tracking-wider block mb-1">Supported Placeholder Variables:</span>
                    <p><span class="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">{{ '{{company_name}}' }}</span> - The company name of the prospect</p>
                    <p><span class="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">{{ '{{contact_name}}' }}</span> - The full name of the prospect</p>
                    <p><span class="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">{{ '{{contact_email}}' }}</span> - The email address of the prospect</p>
                    <p><span class="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 rounded">{{ '{{contact_role}}' }}</span> - The role/title of the prospect</p>
                </div>

                <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <a href="{{ route('templates.index') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                        Cancel
                    </a>
                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        Save Template
                    </button>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
