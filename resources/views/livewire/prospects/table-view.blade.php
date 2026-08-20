<div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden shadow-sm">
    <table class="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
        <thead class="bg-zinc-50/50 dark:bg-zinc-900/30">
            <tr>
                <th class="px-4 py-2.5 text-left font-semibold text-zinc-500 uppercase tracking-wider">Contact</th>
                <th class="px-4 py-2.5 text-left font-semibold text-zinc-500 uppercase tracking-wider">Company</th>
                <th class="px-4 py-2.5 text-center font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th class="px-4 py-2.5 text-left font-semibold text-zinc-500 uppercase tracking-wider">Stage</th>
                <th class="px-4 py-2.5 text-right font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
            @forelse($this->prospects as $prospect)
                @php
                    $isNew = $prospect->status === 'new';
                    $isActive = $prospect->status === 'active';
                    $isPaused = $prospect->status === 'paused';
                @endphp
                <tr class="hover:bg-zinc-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                    <!-- Contact Column -->
                    <td class="px-4 py-3 whitespace-nowrap">
                        <div class="font-semibold text-zinc-900 dark:text-zinc-100">
                            {{ $prospect->contact_name }}
                        </div>
                        <div class="text-[11px] text-zinc-400 font-mono">
                            {{ $prospect->contact_email }}
                        </div>
                        @if($prospect->contact_role)
                            <div class="text-[10px] text-zinc-500 mt-0.5 font-medium">
                                {{ $prospect->contact_role }}
                            </div>
                        @endif
                    </td>

                    <!-- Company Column -->
                    <td class="px-4 py-3 whitespace-nowrap text-zinc-600 dark:text-zinc-300">
                        <div class="font-medium text-zinc-700 dark:text-zinc-300">{{ $prospect->company_name }}</div>
                        <div class="flex flex-wrap gap-1 mt-1">
                            @if($prospect->country)
                                <span class="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-sm">
                                    📍 {{ $prospect->country }}
                                </span>
                            @endif
                            @if($prospect->company_size)
                                <span class="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-sm">
                                    🏢 {{ $prospect->company_size }} emp
                                </span>
                            @endif
                            @if($prospect->source)
                                <span class="inline-flex items-center text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-sm">
                                    💡 {{ $prospect->source }} @if($prospect->event) ({{ $prospect->event }}) @endif
                                </span>
                            @endif
                        </div>
                    </td>

                    <!-- Status Badge Column -->
                    <td class="px-4 py-3 whitespace-nowrap text-center">
                        @if($isActive)
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60">
                                <span class="relative flex h-1.5 w-1.5 mr-1">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                </span>
                                Active
                            </span>
                        @elseif($isPaused)
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60">
                                <span class="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1"></span>
                                Paused
                            </span>
                        @elseif($isNew)
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
                                <span class="h-1.5 w-1.5 rounded-full bg-blue-400 mr-1"></span>
                                New
                            </span>
                        @else
                            <span class="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                                {{ ucfirst($prospect->status) }}
                            </span>
                        @endif
                    </td>

                    <!-- Stage Column -->
                    <td class="px-4 py-3 whitespace-nowrap">
                        <span class="px-1.5 py-0.5 rounded-sm text-[11px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
                            {{ $prospect->stage ?? 'New' }}
                        </span>
                    </td>

                    <!-- Compact Actions Column -->
                    <td class="px-4 py-3 whitespace-nowrap text-right font-medium space-x-1.5">
                        <a href="{{ route('prospects.timeline', $prospect->id) }}" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors font-semibold" title="View outreach timeline tracking">Timeline</a>
                        <span class="text-zinc-200 dark:text-zinc-800">|</span>
                        <a href="{{ route('prospects.edit', $prospect->id) }}" class="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors">Edit</a>
                        <span class="text-zinc-200 dark:text-zinc-800">|</span>
                        <button type="button" wire:click="deleteProspect({{ $prospect->id }})" wire:confirm="Are you sure you want to delete this prospect?" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors">Delete</button>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="px-4 py-10 text-center text-zinc-400 dark:text-zinc-500">
                        <x-phosphor-users-duotone class="w-10 h-10 mx-auto text-zinc-300 dark:text-zinc-700" />
                        <p class="text-xs mt-1.5 font-medium">No prospects found</p>
                        <p class="text-[11px] mt-0.5">Add individual prospects or upload a CSV file.</p>
                    </td>
                </tr>
            @endforelse
        </tbody>
    </table>
</div>
