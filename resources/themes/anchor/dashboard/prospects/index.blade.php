<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <x-app.heading
                title="Prospects"
                description="Manage individual contact pipelines, assign blueprints, upload CSV files, or trigger outreach manually."
                :border="false"
            />
            <div class="flex items-center gap-2">
                <!-- Trigger CSV import modal/toggle or keep it as an inline card -->
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

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <!-- Left Side / Main Table -->
            <div class="lg:col-span-3 space-y-4">
                <!-- Filter Bar -->
                <div class="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                    <form action="{{ route('prospects.index') }}" method="GET" class="flex items-center gap-3 w-full">
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
                            <a href="{{ route('prospects.index') }}" class="text-xs text-zinc-500 hover:text-zinc-700 underline">Clear filters</a>
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
                                        {{ $prospect->company_name }}
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
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                                        @if($prospect->blueprint)
                                            <span class="font-semibold text-zinc-700 dark:text-zinc-300">{{ $prospect->blueprint->name }}</span>
                                            <div class="text-xs text-zinc-400 mt-0.5">
                                                @if($hasPendingStep)
                                                    Next: Step {{ $prospect->current_step_order + 1 }} ({{ $currentStep->template->name ?? 'No template name' }})
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
                                    <td colspan="5" class="px-6 py-12 text-center text-zinc-400 dark:text-zinc-500">
                                        <x-phosphor-users-duotone class="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
                                        <p class="text-sm mt-2 font-medium">No prospects found</p>
                                        <p class="text-xs mt-1">Add individual prospects or upload a CSV file to begin outreach.</p>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
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
    </x-app.container>
</x-layouts.app>
