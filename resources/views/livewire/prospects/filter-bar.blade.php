<div class="space-y-3">
    <!-- Saved Views Tabs Navigation -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 gap-2 mb-2">
        <div class="flex flex-wrap gap-1 -mb-px">
            <button wire:click="selectView('all')" class="inline-flex items-center px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors {{ ($selectedViewId === 'all') ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300' }}">
                All Prospects
            </button>
            @foreach($this->views as $v)
                <div class="inline-flex items-center group">
                    <button wire:click="selectView('{{ $v->id }}')" class="px-2 py-1.5 text-xs font-semibold border-b-2 transition-colors {{ $selectedViewId == $v->id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300' }}">
                        {{ $v->name }}
                    </button>
                    <!-- Delete saved view action -->
                    <button type="button" wire:click="deleteView({{ $v->id }})" wire:confirm="Are you sure you want to delete this view?" class="text-zinc-400 hover:text-red-500 p-0.5 rounded transition-colors ml-0.5" title="Delete View">
                        <x-phosphor-trash-bold class="w-3 h-3" />
                    </button>
                </div>
            @endforeach
        </div>

        <button wire:click="$set('isCreateViewOpen', true)" class="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pb-1">
            <x-phosphor-funnel-bold class="w-3 h-3" />
            Create Custom View
        </button>
    </div>

    <!-- Filter Bar -->
    <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40 p-2.5 border border-zinc-200 dark:border-zinc-800 rounded">
        <div class="flex items-center gap-2 w-full">
            <div class="w-40">
                <select wire:model.live="statusFilter" class="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="active">Active (Started)</option>
                    <option value="qualified">Qualified</option>
                    <option value="junk">Junk</option>
                    <option value="paused">Paused</option>
                </select>
            </div>
            @if($statusFilter !== '')
                <button wire:click="clearFilters" class="text-[11px] text-zinc-500 hover:text-zinc-700 underline">Clear filters</button>
            @endif
        </div>
    </div>
</div>
