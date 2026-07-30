<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Blueprints"
                description="Create automated email campaign blueprints defining multi-step sequences with templates and wait intervals."
                :border="false"
            />
            <a href="{{ route('blueprints.create') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                <x-phosphor-plus-bold class="w-4 h-4" />
                Create Blueprint
            </a>
        </div>

        @if(session('success'))
            <div class="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-zinc-800/50 dark:text-green-400" role="alert">
                <span class="font-medium">Success!</span> {{ session('success') }}
            </div>
        @endif

        <div class="mt-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                    <tr>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Steps</th>
                        <th class="px-6 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Max Attempts</th>
                        <th class="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                    @forelse($blueprints as $blueprint)
                        <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                {{ $blueprint->name }}
                            </td>
                            <td class="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm truncate">
                                {{ $blueprint->description ?: 'No description provided' }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900">
                                    {{ $blueprint->steps_count }} Steps
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                                {{ $blueprint->max_attempts }}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <a href="{{ route('blueprints.edit', $blueprint->id) }}" class="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300">Edit</a>
                                <span class="text-zinc-300 dark:text-zinc-700">|</span>
                                <form action="{{ route('blueprints.destroy', $blueprint->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this blueprint?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                <x-phosphor-stack-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                                <p class="text-sm mt-2 font-medium">No blueprints found</p>
                                <p class="text-xs mt-1">Create your first outreach sequence blueprint to begin organizing contacts.</p>
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </x-app.container>
</x-layouts.app>
