<x-layouts.app>
    <x-app.container class="lg:space-y-6" x-data="{ isCreateViewOpen: false }">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <x-app.heading
                title="Prospects"
                description="Manage individual contact pipelines, assign blueprints, upload CSV files, or trigger outreach manually."
                :border="false"
            />
            <div class="flex items-center gap-2">
                <!-- Layout Toggle (Table vs Kanban) -->
                <div class="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg mr-2">
                    <a href="{{ request()->fullUrlWithQuery(['layout' => 'table']) }}" class="px-3 py-1.5 rounded-md text-xs font-semibold {{ (!request('layout') || request('layout') === 'table') ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400' }}">
                        Table
                    </a>
                    <a href="{{ request()->fullUrlWithQuery(['layout' => 'kanban']) }}" class="px-3 py-1.5 rounded-md text-xs font-semibold {{ (request('layout') === 'kanban') ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400' }}">
                        Kanban
                    </a>
                </div>

                <a href="{{ route('prospects.create') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                    <x-phosphor-plus-bold class="w-4 h-4" />
                    Create Prospect
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

        <!-- Saved Views Tabs Navigation -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-zinc-200 dark:border-zinc-800 gap-4 mb-4">
            <div class="flex flex-wrap gap-2 -mb-px">
                <a href="{{ route('prospects.index', ['view' => 'all'] + request()->except('view')) }}" class="inline-flex items-center px-4 py-2 text-sm font-semibold border-b-2 transition-colors {{ (!request('view') || request('view') === 'all') ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300' }}">
                    All Prospects
                </a>
                @foreach($views as $v)
                    <div class="inline-flex items-center group">
                        <a href="{{ route('prospects.index', ['view' => $v->id] + request()->except('view')) }}" class="px-3 py-2 text-sm font-semibold border-b-2 transition-colors {{ request('view') == $v->id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300' }}">
                            {{ $v->name }}
                        </a>
                        <!-- Delete saved view action -->
                        <form action="{{ route('prospects.views.destroy', $v->id) }}" method="POST" class="inline" onsubmit="return confirm('Are you sure you want to delete this view?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="text-zinc-400 hover:text-red-500 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ml-1" title="Delete View">
                                <x-phosphor-trash-bold class="w-3.5 h-3.5" />
                            </button>
                        </form>
                    </div>
                @endforeach
            </div>

            <button @click="isCreateViewOpen = true" class="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pb-2">
                <x-phosphor-funnel-bold class="w-3.5 h-3.5" />
                Create Custom View
            </button>
        </div>

        <!-- Main Workspace -->
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Left Side / Main Table or Kanban Board -->
            <div class="lg:col-span-3 space-y-4">

                @if(request('layout') === 'kanban')
                    <!-- KANBAN BOARD VIEW -->
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
                        $groupedProspects = $prospects->groupBy(function($p) {
                            return $p->stage ?? 'New';
                        });
                    @endphp

                    <div class="overflow-x-auto pb-4" x-data="kanbanBoard()">
                        <div class="flex gap-4 min-w-max p-1">
                            @foreach($stages as $stage)
                                @php
                                    $stageProspects = $groupedProspects->get($stage) ?? collect();
                                @endphp
                                <div
                                    class="w-72 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col p-4 shadow-sm"
                                    data-stage="{{ $stage }}"
                                    @dragover.prevent="dragOver($event)"
                                    @dragleave="dragLeave($event)"
                                    @drop="drop($event, '{{ $stage }}')"
                                >
                                    <!-- Stage Header -->
                                    <div class="flex items-center justify-between mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                                        <span class="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide">
                                            {{ $stage }}
                                        </span>
                                        <span class="px-2 py-0.5 rounded-full text-[10px] font-bold {{ $stageColors[$stage] ?? 'bg-zinc-100 text-zinc-700' }}">
                                            {{ $stageProspects->count() }}
                                        </span>
                                    </div>

                                    <!-- Draggable Cards Area -->
                                    <div class="flex-1 space-y-3 min-h-[400px] transition-colors duration-200" id="column-{{ Str::slug($stage) }}">
                                        @forelse($stageProspects as $prospect)
                                            <div
                                                class="bg-white dark:bg-zinc-950 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-500 transition-colors"
                                                draggable="true"
                                                @dragstart="dragStart($event, '{{ $prospect->id }}')"
                                            >
                                                <div class="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">
                                                    {{ $prospect->contact_name }}
                                                </div>
                                                <div class="text-xs text-zinc-400 font-mono truncate">
                                                    {{ $prospect->contact_email }}
                                                </div>
                                                <div class="text-[11px] text-zinc-500 mt-1">
                                                    🏢 {{ $prospect->company_name }}
                                                </div>
                                                @if($prospect->country)
                                                    <div class="text-[10px] text-zinc-400 mt-0.5">
                                                        📍 {{ $prospect->country }} @if($prospect->company_size) | Size: {{ $prospect->company_size }} @endif
                                                    </div>
                                                @endif
                                                @if($prospect->source)
                                                    <div class="text-[10px] text-zinc-400 mt-0.5">
                                                        💡 Source: {{ $prospect->source }} @if($prospect->event) ({{ $prospect->event }}) @endif
                                                    </div>
                                                @endif

                                                <div class="flex items-center justify-between mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
                                                    <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                        {{ $prospect->status }}
                                                    </span>
                                                    <a href="{{ route('prospects.edit', $prospect->id) }}" class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                                                        Edit
                                                    </a>
                                                </div>
                                            </div>
                                        @empty
                                            <div class="flex items-center justify-center h-full text-xs text-zinc-400 dark:text-zinc-500 italic py-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
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
                                    col.classList.add('bg-indigo-50/20', 'border-indigo-400', 'border-dashed');
                                },
                                dragLeave(event) {
                                    const col = event.currentTarget;
                                    col.classList.remove('bg-indigo-50/20', 'border-indigo-400', 'border-dashed');
                                },
                                drop(event, stage) {
                                    const col = event.currentTarget;
                                    col.classList.remove('bg-indigo-50/20', 'border-indigo-400', 'border-dashed');

                                    const id = event.dataTransfer.getData('text/plain') || this.draggedId;
                                    if (!id) return;

                                    fetch(`/dashboard/prospects/${id}/update-stage`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'X-CSRF-TOKEN': '{{ csrf_token() }}'
                                        },
                                        body: JSON.stringify({ stage: stage })
                                    })
                                    .then(res => res.json())
                                    .then(data => {
                                        if (data.success) {
                                            window.location.reload();
                                        } else {
                                            alert('Error: ' + (data.error || 'Failed to update stage'));
                                        }
                                    })
                                    .catch(err => console.error(err));
                                }
                            }
                        }
                    </script>

                @else
                    <!-- STANDARD TABLE VIEW -->
                    <!-- Filter Bar -->
                    <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                        <form action="{{ route('prospects.index') }}" method="GET" class="flex items-center gap-3 w-full">
                            <input type="hidden" name="view" value="{{ request('view') }}" />
                            <input type="hidden" name="layout" value="{{ request('layout') }}" />
                            <div class="w-48">
                                <select name="status" onchange="this.form.submit()" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-1.5 px-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="">All Statuses</option>
                                    <option value="new" {{ request('status') === 'new' ? 'selected' : '' }}>New</option>
                                    <option value="active" {{ request('status') === 'active' ? 'selected' : '' }}>Active</option>
                                    <option value="qualified" {{ request('status') === 'qualified' ? 'selected' : '' }}>Qualified</option>
                                    <option value="junk" {{ request('status') === 'junk' ? 'selected' : '' }}>Junk</option>
                                    <option value="paused" {{ request('status') === 'paused' ? 'selected' : '' }}>Paused</option>
                                </select>
                            </div>
                            @if(request('status'))
                                <a href="{{ route('prospects.index', request()->except('status')) }}" class="text-xs text-zinc-500 hover:text-zinc-700 underline">Clear filters</a>
                            @endif
                        </form>
                    </div>

                    <!-- Prospects Table -->
                    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                        <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                            <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                                <tr>
                                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Company</th>
                                    <th class="px-6 py-3.5 text-center text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stage</th>
                                    <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Blueprint / Step</th>
                                    <th class="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                @forelse($prospects as $prospect)
                                    @php
                                        $currentStep = $prospect->currentStep();
                                        $hasPendingStep = $prospect->blueprint_id && $currentStep;
                                    @endphp
                                    <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                {{ $prospect->contact_name }}
                                            </div>
                                            <div class="text-xs text-zinc-400 font-mono">
                                                {{ $prospect->contact_email }}
                                            </div>
                                            @if($prospect->contact_role)
                                                <div class="text-[10px] text-zinc-500 mt-0.5 font-medium">
                                                    {{ $prospect->contact_role }}
                                                </div>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                            <div>{{ $prospect->company_name }}</div>
                                            @if($prospect->country)
                                                <span class="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                                                    📍 {{ $prospect->country }} @if($prospect->company_size) | Size: {{ $prospect->company_size }} @endif
                                                </span>
                                            @endif
                                            @if($prospect->source)
                                                <span class="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                                                    💡 {{ $prospect->source }} @if($prospect->event) ({{ $prospect->event }}) @endif
                                                </span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-center">
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                                                {{ $prospect->status === 'new' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900' : '' }}
                                                {{ $prospect->status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900' : '' }}
                                                {{ $prospect->status === 'qualified' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900' : '' }}
                                                {{ $prospect->status === 'junk' ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900' : '' }}
                                                {{ $prospect->status === 'paused' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900' : '' }}
                                            ">
                                                {{ ucfirst($prospect->status) }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                            <span class="px-2 py-0.5 rounded text-xs bg-zinc-100 dark:bg-zinc-900 font-medium">
                                                {{ $prospect->stage ?? 'New' }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                            @if($prospect->blueprint)
                                                <span class="font-semibold text-zinc-700 dark:text-zinc-300">{{ $prospect->blueprint->name }}</span>
                                                <div class="text-xs text-zinc-400 mt-0.5">
                                                    @if($hasPendingStep)
                                                        Next: Step {{ $prospect->current_step_order + 1 }} ({{ $prospect->currentStep()->template->name ?? 'No template' }})
                                                    @else
                                                        <span class="text-emerald-600 dark:text-emerald-400 font-semibold">Sequence Finished</span>
                                                    @endif
                                                </div>
                                            @else
                                                <span class="text-zinc-400 text-xs italic">Unassigned</span>
                                            @endif
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            @if($hasPendingStep)
                                                <form action="{{ route('prospects.send-next-step', $prospect->id) }}" method="POST" class="inline-block">
                                                    @csrf
                                                    <button type="submit" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors" title="Send Step {{ $prospect->current_step_order + 1 }}">
                                                        <x-phosphor-paper-plane-tilt-bold class="w-3.5 h-3.5" />
                                                        Send Next Step
                                                    </button>
                                                </form>
                                            @else
                                                <button disabled class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 cursor-not-allowed">
                                                    Send Next Step
                                                </button>
                                            @endif
                                            <span class="text-zinc-300 dark:text-zinc-700">|</span>
                                            <a href="{{ route('prospects.edit', $prospect->id) }}" class="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300">Edit</a>
                                            <span class="text-zinc-300 dark:text-zinc-700">|</span>
                                            <form action="{{ route('prospects.destroy', $prospect->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this prospect?');">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                                            </form>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="6" class="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                            <x-phosphor-users-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                                            <p class="text-sm mt-2 font-medium">No prospects found</p>
                                            <p class="text-xs mt-1">Add individual prospects or upload a CSV file to begin outreach.</p>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            <!-- Right Side / Import Sidebar Box -->
            <div class="lg:col-span-1 space-y-4">
                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <x-phosphor-upload-simple-bold class="w-4 h-4 text-indigo-600" />
                        Import CSV
                    </h3>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                        Upload a CSV file containing columns like <code class="font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-zinc-700 dark:text-zinc-300">company_name</code>, <code class="font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-zinc-700 dark:text-zinc-300">contact_name</code>, and <code class="font-mono bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-zinc-700 dark:text-zinc-300">contact_email</code> to mass import contacts.
                    </p>

                    <form action="{{ route('prospects.import') }}" method="POST" enctype="multipart/form-data" class="space-y-4">
                        @csrf

                        <div>
                            <label for="import_file" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">CSV File</label>
                            <input type="file" name="file" id="import_file" required class="block w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 dark:file:bg-indigo-950/50 dark:file:text-indigo-400 hover:file:bg-indigo-100 transition-all cursor-pointer border border-zinc-300 dark:border-zinc-700 rounded-lg p-1 bg-zinc-50 dark:bg-zinc-900" />
                            @error('file') <span class="text-red-500 text-xs block mt-1">{{ $message }}</span> @enderror
                        </div>

                        <div>
                            <label for="import_blueprint_id" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Assign Blueprint</label>
                            <select name="blueprint_id" id="import_blueprint_id" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-xs py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="">Do Not Assign</option>
                                @foreach($blueprints as $bp)
                                    <option value="{{ $bp->id }}">{{ $bp->name }}</option>
                                @endforeach
                            </select>
                            @error('blueprint_id') <span class="text-red-500 text-xs block mt-1">{{ $message }}</span> @enderror
                        </div>

                        <button type="submit" class="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                            <x-phosphor-upload-simple-bold class="w-4 h-4" />
                            Start Import
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Create Custom View Modal (Alpine.js) -->
        <div
            x-show="isCreateViewOpen"
            class="fixed inset-0 z-50 overflow-y-auto"
            style="display: none;"
            x-transition
        >
            <div class="flex items-center justify-center min-h-screen px-4">
                <!-- Overlay -->
                <div class="fixed inset-0 bg-black/50 transition-opacity" @click="isCreateViewOpen = false"></div>

                <!-- Modal Content -->
                <div class="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-xl z-10 space-y-4">
                    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                        <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Create Saved Filter View</h3>
                        <button @click="isCreateViewOpen = false" class="text-zinc-400 hover:text-zinc-600">
                            <x-phosphor-x-bold class="w-5 h-5" />
                        </button>
                    </div>

                    <form action="{{ route('prospects.views.store') }}" method="POST" class="space-y-4">
                        @csrf

                        <div>
                            <label for="view_name" class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">View Name</label>
                            <input type="text" name="name" id="view_name" required placeholder="e.g. US High Value Leads" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                        </div>

                        <!-- Filters Conditions -->
                        <div>
                            <label class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Filters (AND conditions)</label>
                            <div class="space-y-2">
                                @for($i = 0; $i < 3; $i++)
                                    <div class="flex flex-col sm:flex-row gap-2 items-center bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                                        <select name="filters[{{ $i }}][column]" class="block w-full sm:w-1/3 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs py-1.5 px-2 focus:ring-1 focus:ring-indigo-500">
                                            <option value="">-- Select Column --</option>
                                            <option value="stage">Stage</option>
                                            <option value="country">Country</option>
                                            <option value="company_size">Company Size</option>
                                            <option value="source">Source</option>
                                            <option value="event">Event</option>
                                            <option value="status">Status</option>
                                            <option value="company_name">Company Name</option>
                                            <option value="contact_name">Contact Name</option>
                                            <option value="contact_email">Contact Email</option>
                                        </select>

                                        <select name="filters[{{ $i }}][operator]" class="block w-full sm:w-24 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs py-1.5 px-2 focus:ring-1 focus:ring-indigo-500">
                                            <option value="=">=</option>
                                            <option value=">">&gt;</option>
                                            <option value="<">&lt;</option>
                                            <option value="!=">!=</option>
                                            <option value="like">like</option>
                                        </select>

                                        <input type="text" name="filters[{{ $i }}][value]" placeholder="Value..." class="block w-full sm:flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs py-1.5 px-2 focus:ring-1 focus:ring-indigo-500" />
                                    </div>
                                @endfor
                            </div>
                        </div>

                        <!-- Sorting Options -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="sort_by" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Sort By (Optional)</label>
                                <select name="sort_by" id="sort_by" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="">Default (Latest)</option>
                                    <option value="company_size">Company Size</option>
                                    <option value="company_name">Company Name</option>
                                    <option value="contact_name">Contact Name</option>
                                    <option value="stage">Stage</option>
                                </select>
                            </div>

                            <div>
                                <label for="sort_direction" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Direction</label>
                                <select name="sort_direction" id="sort_direction" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="asc">Ascending (A-Z, 0-9)</option>
                                    <option value="desc" selected>Descending (Z-A, 9-0)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label for="visibility" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Visibility</label>
                            <select name="visibility" id="visibility" class="block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="private" selected>Private (Only Me)</option>
                                <option value="shared">Shared (Entire Tenant)</option>
                            </select>
                        </div>

                        <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                            <button type="button" @click="isCreateViewOpen = false" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                Cancel
                            </button>
                            <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                                Save View
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </x-app.container>
</x-layouts.app>
