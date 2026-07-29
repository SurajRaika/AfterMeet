@php
    $stages = [
        'New' => 'bg-blue-50 text-blue-800 border-blue-200',
        'Researching' => 'bg-indigo-50 text-indigo-800 border-indigo-200',
        'Ready to Contact' => 'bg-purple-50 text-purple-800 border-purple-200',
        'Contacted' => 'bg-yellow-50 text-yellow-800 border-yellow-200',
        'Engaged' => 'bg-orange-50 text-orange-800 border-orange-200',
        'Connected' => 'bg-teal-50 text-teal-800 border-teal-200',
        'Converted' => 'bg-green-50 text-green-800 border-green-200',
        'Archived' => 'bg-gray-100 text-gray-800 border-gray-300',
    ];

    $prospectsGrouped = $this->getProspectsGrouped();
@endphp

<div class="overflow-x-auto pb-4" x-data="kanbanBoard()">
    <div class="flex gap-4 min-w-max p-1">
        @foreach($stages as $stageName => $colorClasses)
            <div
                class="w-80 bg-gray-50 border border-gray-200 rounded-lg flex flex-col p-3 shadow-sm"
                data-stage="{{ $stageName }}"
                @dragover.prevent="dragOver($event)"
                @dragleave="dragLeave($event)"
                @drop="drop($event, '{{ $stageName }}')"
            >
                <!-- Column Header -->
                <div class="flex items-center justify-between mb-3 border-b pb-2">
                    <span class="text-sm font-bold text-gray-700 uppercase tracking-wide">
                        {{ $stageName }}
                    </span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold {{ $colorClasses }}">
                        {{ $prospectsGrouped->get($stageName, collect())->count() }}
                    </span>
                </div>

                <!-- Cards Container -->
                <div class="flex-1 space-y-3 min-h-[350px] transition-colors duration-200 drop-zone">
                    @forelse($prospectsGrouped->get($stageName, collect())->sortBy('sort_order') as $index => $prospect)
                        @include('filament.resources.prospects.card', ['prospect' => $prospect])
                    @empty
                        <div class="flex items-center justify-center h-full text-xs text-gray-400 italic py-8 border-2 border-dashed border-gray-200 rounded-lg">
                            No prospects
                        </div>
                    @endforelse
                </div>
            </div>
        @endforeach
    </div>
</div>

<style>
    .drag-over {
        background-color: rgba(59, 130, 246, 0.05) !important;
        border-color: #3b82f6 !important;
        border-style: dashed !important;
    }
</style>

<script>
    function kanbanBoard() {
        return {
            draggedId: null,
            dragStart(event, id) {
                this.draggedId = id;
                event.dataTransfer.setData('text/plain', id);
                event.dataTransfer.effectAllowed = 'move';
            },
            dragOver(event) {
                const column = event.currentTarget;
                column.classList.add('drag-over');
            },
            dragLeave(event) {
                const column = event.currentTarget;
                column.classList.remove('drag-over');
            },
            drop(event, stage) {
                const column = event.currentTarget;
                column.classList.remove('drag-over');

                const id = event.dataTransfer.getData('text/plain') || this.draggedId;
                if (!id) return;

                // Fire standard Livewire update event on ListProspects class
                @this.call('updateProspectStage', parseInt(id), stage, 1);
            }
        }
    }
</script>
