@php
    $stages = ['New', 'Researching', 'Ready to Contact', 'Contacted', 'Engaged', 'Connected', 'Converted', 'Archived'];
    $stageColors = [
        'New' => 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900',
        'Researching' => 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/40 dark:text-zinc-400 dark:border-zinc-700',
        'Ready to Contact' => 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
        'Contacted' => 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
        'Engaged' => 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
        'Connected' => 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900',
        'Converted' => 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
        'Archived' => 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
    ];
    $groupedProspects = $this->prospects->groupBy(function($p) {
        return $p->stage ?? 'New';
    });
@endphp

<div class="overflow-x-auto pb-4" x-data="kanbanBoard()">
    <div class="flex gap-3 min-w-max p-0.5">
        @foreach($stages as $stage)
            @php
                $stageProspects = $groupedProspects->get($stage) ?? collect();
            @endphp
            <div
                class="w-64 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded flex flex-col p-3 shadow-sm"
                data-stage="{{ $stage }}"
                @dragover.prevent="dragOver($event)"
                @dragleave="dragLeave($event)"
                @drop="drop($event, '{{ $stage }}')"
            >
                <!-- Stage Header -->
                <div class="flex items-center justify-between mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
                    <span class="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        {{ $stage }}
                    </span>
                    <span class="px-1.5 py-0.5 rounded-sm text-[10px] font-bold {{ $stageColors[$stage] ?? 'bg-zinc-100 text-zinc-700' }}">
                        {{ $stageProspects->count() }}
                    </span>
                </div>

                <!-- Draggable Cards Area -->
                <div class="flex-1 space-y-2 min-h-[350px] transition-colors duration-150" id="column-{{ Str::slug($stage) }}">
                    @forelse($stageProspects as $prospect)
                        @php
                            $isNew = $prospect->status === 'new' || !$prospect->blueprint_id;
                            $isActive = $prospect->status === 'active';
                            $isPaused = $prospect->status === 'paused';
                        @endphp
                        <div
                            class="bg-white dark:bg-zinc-950 p-2.5 rounded border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-500 transition-colors"
                            draggable="true"
                            @dragstart="dragStart($event, '{{ $prospect->id }}')"
                        >
                            <div class="font-semibold text-zinc-900 dark:text-zinc-100 text-[12px] flex items-center justify-between">
                                <span>{{ $prospect->contact_name }}</span>
                                <!-- Status Dot Indicator -->
                                @if($isActive)
                                    <span class="relative flex h-1.5 w-1.5" title="Active (Started)">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                @elseif($isPaused)
                                    <span class="h-1.5 w-1.5 rounded-full bg-amber-500" title="Paused"></span>
                                @else
                                    <span class="h-1.5 w-1.5 rounded-full bg-blue-400" title="New / Unstarted"></span>
                                @endif
                            </div>
                            <div class="text-[10px] text-zinc-400 font-mono truncate">
                                {{ $prospect->contact_email }}
                            </div>
                            <div class="text-[11px] text-zinc-600 dark:text-zinc-300 mt-1 font-medium">
                                🏢 {{ $prospect->company_name }}
                            </div>
                            @if($prospect->country)
                                <div class="text-[10px] text-zinc-400 mt-0.5">
                                    📍 {{ $prospect->country }} @if($prospect->company_size) | Size: {{ $prospect->company_size }} @endif
                                </div>
                            @endif

                            <div class="flex items-center justify-between mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                <span class="inline-flex items-center px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                    {{ $prospect->status }}
                                </span>
                                <div class="flex gap-1.5 items-center">
                                    @if($isNew)
                                        <button type="button" wire:click="openStartContacting({{ $prospect->id }})" class="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                            Start
                                        </button>
                                    @elseif($isActive)
                                        <button type="button" wire:click="pauseContacting({{ $prospect->id }})" class="text-[10px] font-bold text-zinc-500 hover:underline">
                                            Pause
                                        </button>
                                    @elseif($isPaused)
                                        <button type="button" wire:click="resumeContacting({{ $prospect->id }})" class="text-[10px] font-bold text-emerald-600 hover:underline">
                                            Resume
                                        </button>
                                    @endif
                                    <span class="text-zinc-300 dark:text-zinc-700 text-[10px]">|</span>
                                    <a href="{{ route('prospects.edit', $prospect->id) }}" class="text-[10px] text-zinc-500 hover:underline">
                                        Edit
                                    </a>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="flex items-center justify-center h-full text-[11px] text-zinc-400 dark:text-zinc-500 italic py-6 border border-dashed border-zinc-200 dark:border-zinc-800 rounded">
                            No prospects
                        </div>
                    @endforelse
                </div>
            </div>
        @endforeach
    </div>
</div>

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
                const col = event.currentTarget;
                col.classList.add('bg-indigo-50/10', 'border-indigo-400', 'border-dashed');
            },
            dragLeave(event) {
                const col = event.currentTarget;
                col.classList.remove('bg-indigo-50/10', 'border-indigo-400', 'border-dashed');
            },
            drop(event, stage) {
                const col = event.currentTarget;
                col.classList.remove('bg-indigo-50/10', 'border-indigo-400', 'border-dashed');

                const id = event.dataTransfer.getData('text/plain') || this.draggedId;
                if (!id) return;

                // Call Livewire to update stage dynamically without full page reload
                @this.updateStage(id, stage);
            }
        }
    }
</script>
