<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <x-app.heading
                title="Template Preview"
                description="Preview how this template will look when populated with a prospect's variables."
                :border="false"
            />
            <a href="{{ route('templates.index') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-300 dark:border-zinc-700">
                Back to Templates
            </a>
        </div>

        <div class="mt-6 max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
            <div class="bg-zinc-50 dark:bg-zinc-900/50 p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-1">
                <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Template:</span>
                <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{{ $template->name }}</h3>
            </div>

            <div class="p-6 space-y-6">
                <!-- Subject line -->
                <div class="space-y-1">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Subject line:</span>
                    <div class="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {{ $previewSubject }}
                    </div>
                </div>

                <!-- Body content -->
                <div class="space-y-1">
                    <span class="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Body:</span>
                    <div class="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed min-h-[150px]">
                        {{ $previewBody }}
                    </div>
                </div>

                <!-- Variable mappings info -->
                <div class="p-4 bg-indigo-50/50 dark:bg-zinc-900/40 border border-indigo-100 dark:border-zinc-800 rounded-lg space-y-2">
                    <h4 class="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                        <x-phosphor-info-bold class="w-4 h-4" />
                        Dummy Variable Values Applied
                    </h4>
                    <div class="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono">
                        <div>company_name: <span class="text-zinc-900 dark:text-zinc-200 font-bold">Acme Corp</span></div>
                        <div>contact_name: <span class="text-zinc-900 dark:text-zinc-200 font-bold">John Doe</span></div>
                        <div>contact_email: <span class="text-zinc-900 dark:text-zinc-200 font-bold">john@acme.com</span></div>
                        <div>contact_role: <span class="text-zinc-900 dark:text-zinc-200 font-bold">VP of Engineering</span></div>
                    </div>
                </div>
            </div>
        </div>
    </x-app.container>
</x-layouts.app>
