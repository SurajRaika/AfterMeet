<x-filament-panels::page>
    <div class="flex items-center justify-between mb-4">
        <div></div>
        <div class="flex rounded-md shadow-sm">
            <button
                type="button"
                wire:click="changeViewMode('kanban')"
                class="px-4 py-2 text-sm font-medium border rounded-l-md {{ $viewMode === 'kanban' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' }}"
            >
                Kanban View
            </button>
            <button
                type="button"
                wire:click="changeViewMode('table')"
                class="px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-md {{ $viewMode === 'table' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50' }}"
            >
                Table View
            </button>
        </div>
    </div>

    @if($viewMode === 'table')
        {{ $this->table }}
    @else
        @include('filament.resources.prospects.kanban')
    @endif
</x-filament-panels::page>
