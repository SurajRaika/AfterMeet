<div
    x-show="$wire.isBlueprintModalOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    style="display: none;"
    x-transition
>
    <div class="flex items-center justify-center min-h-screen px-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black/40 transition-opacity" @click="$wire.closeBlueprintModal()"></div>

        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded max-w-sm w-full p-4 shadow-lg z-10 space-y-3">
            <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Select Outreach Blueprint</h3>
                <button @click="$wire.closeBlueprintModal()" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <x-phosphor-x-bold class="w-3.5 h-3.5" />
                </button>
            </div>

            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">
                Choose a sequence blueprint to begin contacting this prospect. The first step sequence email will be dispatched immediately.
            </p>

            <div class="space-y-1 max-h-48 overflow-y-auto">
                @forelse($this->blueprints as $bp)
                    <button
                        type="button"
                        wire:click="startContacting({{ $bp->id }})"
                        class="w-full text-left px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors flex items-center justify-between"
                    >
                        <span>{{ $bp->name }}</span>
                        <x-phosphor-caret-right-bold class="w-3 h-3 text-zinc-400" />
                    </button>
                @empty
                    <div class="text-center py-4 text-[11px] text-zinc-400 dark:text-zinc-500 italic">
                        No blueprints created yet. Go to <a href="{{ route('blueprints.index') }}" class="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">Blueprints</a> to create one.
                    </div>
                @endforelse
            </div>

            <div class="flex items-center justify-end pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <button
                    type="button"
                    @click="$wire.closeBlueprintModal()"
                    class="px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded transition-colors"
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>
