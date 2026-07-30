<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Templates"
                description="Manage your email templates with placeholders like {company_name} and {contact_name}."
                :border="false"
            />
            <div class="flex items-center gap-2">
                <a href="{{ route('templates.ai-builder') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 rounded-lg shadow transition-colors">
                    <x-phosphor-sparkle-duotone class="w-4 h-4" />
                    AI Template Builder
                </a>
                <a href="{{ route('templates.create') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                    <x-phosphor-plus-bold class="w-4 h-4" />
                    Create Template
                </a>
            </div>
        </div>

        @if(session('success'))
            <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-zinc-800/50 dark:text-green-400" role="alert">
                <span class="font-medium">Success!</span> {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-zinc-800/50 dark:text-red-400" role="alert">
                <span class="font-medium">Error!</span> {{ session('error') }}
            </div>
        @endif

        <div class="mt-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subject</th>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Body Snippet</th>
                        <th class="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    @forelse($templates as $template)
                        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {{ $template->name }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                {{ $template->subject }}
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-xs truncate">
                                {{ Str::limit(strip_tags($template->body), 60) }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <a href="{{ route('templates.preview', $template->id) }}" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Preview</a>
                                <span class="text-zinc-300 dark:text-zinc-700">|</span>
                                <a href="{{ route('templates.edit', $template->id) }}" class="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300">Edit</a>
                                <span class="text-zinc-300 dark:text-zinc-700">|</span>
                                <form action="{{ route('templates.destroy', $template->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this template?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                <x-phosphor-envelope-open-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                                <p class="text-sm mt-2 font-medium">No templates found</p>
                                <p class="text-xs mt-1">Create your first email template to get started.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-app.container>
</x-layouts.app>
