<x-layouts.app>
    <x-app.container class="lg:space-y-6">
        <div class="flex items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <x-app.heading
                title="Automations"
                description="Manage templates, trigger workflows on incoming email events, and execute cold outreach sequences."
                :border="false"
            />
            <a href="{{ route('automations.create') }}" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                <x-phosphor-plus-bold class="w-4 h-4" />
                New Workflow
            </a>
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

        <!-- 1. Default Templates section -->
        <div class="space-y-4">
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Default Templates</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @forelse($templates as $tmpl)
                    @php
                        $instCount = $instances->filter(fn($i) => $i->automation_id === $tmpl->id || str_contains($i->automation->name, $tmpl->name))->count();
                    @endphp
                    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div class="flex items-center justify-between">
                                <span class="px-2.5 py-1 text-xs font-semibold rounded-full {{ $tmpl->type === 'trigger' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }}">
                                    {{ ucfirst($tmpl->type) }}
                                </span>
                                <span class="text-xs text-zinc-500 font-medium">
                                    {{ $instCount }} active/total instances
                                </span>
                            </div>
                            <h3 class="mt-3 text-base font-bold text-zinc-900 dark:text-zinc-100">{{ $tmpl->name }}</h3>
                            <p class="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                                @if($tmpl->name === 'Cold Outreach Sequence')
                                    Send Email -> Delay 3 Days -> Check Reply -> Send Follow-up.
                                @elseif($tmpl->name === 'Smart Inbox Assistant')
                                    Trigger on Email Received -> Run Intent Node -> Condition (If "book_call" -> Send Calendar Link; If "unsubscribed" -> Update Prospect Status to Blocked).
                                @else
                                    Automated template workflow.
                                @endif
                            </p>
                        </div>
                        <div class="mt-6 flex gap-3">
                            <form action="{{ route('automations.duplicate', $tmpl->id) }}" method="POST" class="w-full">
                                @csrf
                                <button type="submit" class="w-full inline-flex justify-center items-center px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 dark:text-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors">
                                    Use Template (Customize)
                                </button>
                            </form>
                        </div>
                    </div>
                @empty
                    <div class="col-span-2 text-center text-sm text-zinc-400 py-6">No default templates found.</div>
                @endforelse
            </div>
        </div>

        <!-- 2. Customizable workflows list -->
        <div class="space-y-4 mt-8">
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Your Customizable Workflows</h2>
            <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                        <tr>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Active Status</th>
                            <th class="px-6 py-3.5 text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                        @forelse($customAutomations as $auto)
                            <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {{ $auto->name }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full {{ $auto->type === 'trigger' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }}">
                                        {{ ucfirst($auto->type) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <form action="{{ route('automations.toggle-active', $auto->id) }}" method="POST" class="inline-block">
                                        @csrf
                                        <button type="submit" class="px-3 py-1 rounded text-xs font-semibold shadow-sm transition-colors {{ $auto->is_active ? 'bg-green-100 hover:bg-green-200 text-green-800' : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800' }}">
                                            {{ $auto->is_active ? 'Active' : 'Inactive' }}
                                        </button>
                                    </form>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <a href="{{ route('automations.edit', $auto->id) }}" class="text-indigo-600 hover:text-indigo-900">Edit / Customise</a>
                                    <span class="text-zinc-300">|</span>
                                    <a href="#" onclick="openAssignModal({{ $auto->id }}, '{{ $auto->name }}')" class="text-emerald-600 hover:text-emerald-950">Assign Prospect</a>
                                    <span class="text-zinc-300">|</span>
                                    <form action="{{ route('automations.destroy', $auto->id) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this workflow?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="text-red-600 hover:text-red-900">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="4" class="px-6 py-12 text-center text-zinc-400">
                                    <p class="text-sm font-medium">No custom workflows created yet</p>
                                    <p class="text-xs mt-1">Duplicate a default template above or create a new one to start customizing!</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 3. Active Running Workflows instances -->
        <div class="space-y-4 mt-12">
            <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Running / Executed Workflows</h2>
            <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
                <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                    <thead class="bg-zinc-50 dark:bg-zinc-900/50">
                        <tr>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prospect</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workflow Name</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Current Step</th>
                            <th class="px-6 py-3.5 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider">Started At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                        @forelse($instances as $inst)
                            <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                    {{ $inst->prospect->contact_name ?? 'Unknown' }} ({{ $inst->prospect->contact_email ?? 'N/A' }})
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-600 dark:text-zinc-300">
                                    {{ $inst->automation->name ?? 'Deleted Automation' }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <span class="px-2.5 py-0.5 text-xs font-semibold rounded-full
                                        {{ $inst->status === 'active' ? 'bg-green-100 text-green-800' : '' }}
                                        {{ $inst->status === 'paused' ? 'bg-amber-100 text-amber-800' : '' }}
                                        {{ $inst->status === 'completed' ? 'bg-zinc-100 text-zinc-800' : '' }}
                                        {{ $inst->status === 'failed' ? 'bg-red-100 text-red-800' : '' }}
                                    ">
                                        {{ ucfirst($inst->status) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                    <code>{{ $inst->current_node ?? 'N/A' }}</code>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                                    {{ $inst->started_at ? $inst->started_at->diffForHumans() : 'N/A' }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="px-6 py-12 text-center text-zinc-400">
                                    <p class="text-sm font-medium">No running or executed workflow instances yet</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>

        <!-- 4. Assign to Prospect Modal -->
        <div id="assignModal" class="fixed inset-0 bg-zinc-900/50 flex items-center justify-center hidden z-50">
            <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                    <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">Assign Prospect to Workflow</h3>
                    <button onclick="closeAssignModal()" class="text-zinc-400 hover:text-zinc-600">&times;</button>
                </div>
                <form id="assignForm" method="POST" action="">
                    @csrf
                    <input type="hidden" name="workflow_id" id="modalWorkflowId">
                    <div class="space-y-4">
                        <p class="text-sm text-zinc-500">Assigning workflow: <strong id="modalWorkflowName"></strong></p>
                        <div>
                            <label class="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Select Prospect</label>
                            <select name="prospect_id" class="w-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-850 rounded-lg p-2.5 text-sm" required>
                                <option value="">-- Choose Prospect --</option>
                                @foreach($prospects as $p)
                                    <option value="{{ $p->id }}">{{ $p->contact_name }} ({{ $p->company_name }})</option>
                                @endforeach
                            </select>
                        </div>
                    </div>
                    <div class="pt-4 flex justify-end space-x-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                        <button type="button" onclick="closeAssignModal()" class="px-4 py-2 text-sm font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg">Cancel</button>
                        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Assign & Run</button>
                    </div>
                </form>
            </div>
        </div>

        <script>
            function openAssignModal(id, name) {
                document.getElementById('modalWorkflowId').value = id;
                document.getElementById('modalWorkflowName').innerText = name;
                document.getElementById('assignForm').action = "/dashboard/automations/" + id + "/assign";
                document.getElementById('assignModal').classList.remove('hidden');
            }
            function closeAssignModal() {
                document.getElementById('assignModal').classList.add('hidden');
            }
        </script>
    </x-app.container>
</x-layouts.app>
