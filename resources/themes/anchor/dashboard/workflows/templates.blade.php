<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Automation Templates"
                description="Directly enable pre-packaged, certified automation blueprints for your sales pipeline. Instant deployment, fully tested, and secure."
                :border="false"
            />
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            @foreach($templates as $template)
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs border border-indigo-100 dark:border-indigo-900">
                                    <x-phosphor-brain-duotone class="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 class="text-base font-bold text-zinc-900 dark:text-zinc-100">{{ $template['name'] }}</h3>
                                    <p class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Trigger: {{ str_replace('_', ' ', $template['trigger_type']) }}</p>
                                </div>
                            </div>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
                                {{ $template['badge'] }}
                            </span>
                        </div>

                        <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                            {{ $template['description'] }}
                        </p>

                        <div>
                            <span class="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Automated Steps Enforced:</span>
                            <div class="flex flex-wrap gap-2">
                                @foreach($template['actions'] as $action)
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                                        {{ $action }}
                                    </span>
                                @endforeach
                            </div>
                        </div>
                    </div>

                    <div class="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                        <span class="text-xs text-zinc-400 dark:text-zinc-500 font-medium">Clicking enable deploys the workflow graph instantly</span>
                        <form action="{{ route('workflows.templates.deploy', $template['id']) }}" method="POST">
                            @csrf
                            <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                                <x-phosphor-lightning-bold class="w-4 h-4" />
                                Enable & Deploy Template
                            </button>
                        </form>
                    </div>
                </div>
            @endforeach
        </div>
    </x-app.container>
</x-layouts.app>
