<div
    class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-shadow duration-200 cursor-grab active:cursor-grabbing relative"
    draggable="true"
    @dragstart="dragStart($event, {{ $prospect->id }})"
>
    <!-- Top info -->
    <div class="flex items-start justify-between mb-2">
        <h4 class="text-sm font-semibold text-gray-900 leading-snug">
            {{ $prospect->name }}
        </h4>
        <a
            href="{{ route('filament.admin.resources.prospects.edit', $prospect->id) }}"
            class="text-gray-400 hover:text-gray-600 transition-colors duration-150 shrink-0 ml-2"
            title="Edit Prospect"
        >
            <svg class="text-gray-400 hover:text-gray-600 transition-colors duration-150" style="width: 16px; height: 16px; min-width: 16px; min-height: 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
            </svg>
        </a>
    </div>

    <!-- Company & Job details -->
    @if($prospect->company_name || $prospect->job_title)
        <div class="text-xs text-gray-500 mb-2">
            @if($prospect->job_title)
                <span class="font-medium text-gray-600">{{ $prospect->job_title }}</span>
            @endif
            @if($prospect->job_title && $prospect->company_name)
                at
            @endif
            @if($prospect->company_name)
                <span class="font-semibold text-gray-700">{{ $prospect->company_name }}</span>
            @endif
        </div>
    @endif

    <!-- Contact details -->
    @if($prospect->email || $prospect->phone)
        <div class="space-y-1.5 mb-3 pt-1.5 border-t border-gray-100">
            @if($prospect->email)
                <div class="flex items-center text-xs text-gray-500 gap-1.5">
                    <svg class="text-gray-400 shrink-0" style="width: 14px; height: 14px; min-width: 14px; min-height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <a href="mailto:{{ $prospect->email }}" class="hover:underline hover:text-primary-600 truncate">
                        {{ $prospect->email }}
                    </a>
                </div>
            @endif

            @if($prospect->phone)
                <div class="flex items-center text-xs text-gray-500 gap-1.5">
                    <svg class="text-gray-400 shrink-0" style="width: 14px; height: 14px; min-width: 14px; min-height: 14px;" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.98-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span class="truncate">{{ $prospect->phone }}</span>
                </div>
            @endif
        </div>
    @endif

    <!-- Extra metadata tags -->
    @if($prospect->industry || $prospect->country)
        <div class="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100">
            @if($prospect->industry)
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                    {{ $prospect->industry }}
                </span>
            @endif
            @if($prospect->country)
                <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                    {{ $prospect->country }}
                </span>
            @endif
        </div>
    @endif
</div>
