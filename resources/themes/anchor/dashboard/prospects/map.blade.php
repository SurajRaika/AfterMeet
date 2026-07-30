<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Map CSV Columns to System Fields"
                description="Match each of our contact fields with the corresponding column from your uploaded CSV."
                :border="false"
            />
        </div>

        <div class="mt-6 max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <form action="{{ route('prospects.import.process') }}" method="POST" class="space-y-6">
                @csrf

                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        <div>System Field</div>
                        <div>CSV Column Header</div>
                    </div>

                    @foreach($fields as $fieldKey => $fieldMeta)
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center py-2 border-b border-zinc-100 dark:border-zinc-900/50">
                            <div>
                                <label for="map_{{ $fieldKey }}" class="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {{ $fieldMeta['label'] }}
                                    @if($fieldMeta['required'])
                                        <span class="text-red-500">*</span>
                                    @else
                                        <span class="text-xs text-zinc-400 font-normal">(Optional)</span>
                                    @endif
                                </label>
                            </div>

                            <div>
                                <select name="mappings[{{ $fieldKey }}]" id="map_{{ $fieldKey }}" @if($fieldMeta['required']) required @endif class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    @if(!$fieldMeta['required'])
                                        <option value="">-- Leave Unmapped --</option>
                                    @else
                                        <option value="" disabled>-- Select Column --</option>
                                    @endif

                                    @foreach($headers as $index => $header)
                                        <option value="{{ $index }}" {{ old("mappings.{$fieldKey}", $suggestedMapping[$fieldKey] ?? '') == $index ? 'selected' : '' }}>
                                            {{ $header }} (Column #{{ $index + 1 }})
                                        </option>
                                    @endforeach
                                </select>
                                @error("mappings.{$fieldKey}")
                                    <span class="text-red-500 text-xs mt-1 block">{{ $message }}</span>
                                @enderror
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <p class="text-xs text-zinc-400">
                        <span class="text-red-500">*</span> Required fields must be mapped to proceed with the import.
                    </p>
                    <div class="flex items-center gap-3">
                        <a href="{{ route('prospects.import.show') }}" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                            Back
                        </a>
                        <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                            <x-phosphor-upload-simple-bold class="w-4 h-4" />
                            Run Import Process
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </x-app.container>
</x-layouts.app>
