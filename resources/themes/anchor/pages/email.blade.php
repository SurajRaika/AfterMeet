<?php

use function Laravel\Folio\{middleware, name};
use Livewire\Volt\Component;
use Filament\Notifications\Notification;
use App\Models\NylasAccount;
use App\Models\EmailThread;
use App\Models\EmailMessage;
use App\Models\EmailAttachment;
use App\Services\NylasService;
use Illuminate\Support\Str;

middleware('auth');
name('email');

new class extends Component
{
    // Folder selection: 'inbox', 'sent', 'drafts'
    public string $activeFolder = 'inbox';

    // Selected conversation
    public ?int $selectedThreadId = null;

    // Search query
    public string $searchQuery = '';

    // Compose fields
    public bool $isComposing = false;
    public string $toEmail = '';
    public string $composeSubject = '';
    public string $composeBody = '';
    public string $selectedAccountId = '';

    // Reply fields
    public string $replyBody = '';

    public function mount()
    {
        $firstAccount = auth()->user()->nylasAccounts()->first();
        if ($firstAccount) {
            $this->selectedAccountId = (string) $firstAccount->id;
        }

        $this->loadDefaultThread();
    }

    public function selectFolder(string $folder)
    {
        $this->activeFolder = $folder;
        $this->selectedThreadId = null;
        $this->loadDefaultThread();
    }

    public function selectThread(int $threadId)
    {
        $accountIds = auth()->user()->nylasAccounts()->pluck('id')->toArray();
        $thread = EmailThread::whereIn('nylas_account_id', $accountIds)->find($threadId);
        if ($thread) {
            $this->selectedThreadId = $threadId;
            $thread->messages()->where('is_read', false)->update(['is_read' => true]);
        } else {
            $this->selectedThreadId = null;
        }
    }

    protected function loadDefaultThread()
    {
        $threads = $this->getThreadsProperty();
        if ($threads->isNotEmpty()) {
            $this->selectedThreadId = $threads->first()->id;
        } else {
            $this->selectedThreadId = null;
        }
    }

    public function getThreadsProperty()
    {
        $accountIds = auth()->user()->nylasAccounts()->pluck('id')->toArray();

        $query = EmailThread::whereIn('nylas_account_id', $accountIds)
            ->with(['messages' => function ($q) {
                $q->orderBy('received_at', 'asc');
            }]);

        if ($this->searchQuery) {
            $q = '%' . $this->searchQuery . '%';
            $query->where(function ($sub) use ($q) {
                $sub->where('subject', 'like', $q)
                    ->orWhereHas('messages', function ($m) use ($q) {
                        $m->where('body_snippet', 'like', $q)
                          ->orWhere('body_html', 'like', $q)
                          ->orWhere('from_email', 'like', $q)
                          ->orWhere('from_name', 'like', $q);
                    });
            });
        }

        // Filter based on activeFolder
        if ($this->activeFolder === 'sent') {
            $query->whereHas('messages', function ($m) use ($accountIds) {
                $m->whereIn('nylas_account_id', $accountIds)
                  ->where('from_email', auth()->user()->email);
            });
        } elseif ($this->activeFolder === 'drafts') {
            $query->whereHas('messages', function ($m) {
                $m->where('is_draft', true);
            });
        } else { // inbox
            $query->whereHas('messages', function ($m) {
                $m->where('is_draft', false);
            });
        }

        return $query->latest('last_message_at')->get();
    }

    public function getSelectedThreadProperty()
    {
        if (!$this->selectedThreadId) {
            return null;
        }
        $accountIds = auth()->user()->nylasAccounts()->pluck('id')->toArray();
        return EmailThread::whereIn('nylas_account_id', $accountIds)
            ->with(['messages.attachments'])
            ->find($this->selectedThreadId);
    }

    public function getAccounts()
    {
        return auth()->user()->nylasAccounts;
    }

    public function sendEmail(NylasService $nylasService)
    {
        $this->validate([
            'toEmail' => 'required|email',
            'composeSubject' => 'required|string|max:255',
            'composeBody' => 'required|string',
            'selectedAccountId' => [
                'required',
                \Illuminate\Validation\Rule::exists('nylas_accounts', 'id')->where('user_id', auth()->id()),
            ],
        ]);

        $account = auth()->user()->nylasAccounts()->find($this->selectedAccountId);

        if (!$account) {
            Notification::make()
                ->title('Account error')
                ->body('Nylas account not found.')
                ->danger()
                ->send();
            return;
        }

        $payload = [
            'to' => [
                ['email' => $this->toEmail]
            ],
            'subject' => $this->composeSubject,
            'body' => $this->composeBody,
        ];

        try {
            $response = $nylasService->sendMessage($account->grant_id, $payload);

            if ($response && isset($response['data']['id'])) {
                $msgData = $response['data'];
                $thread = EmailThread::updateOrCreate(
                    ['nylas_thread_id' => $msgData['thread_id'] ?? 'th_' . uniqid()],
                    [
                        'nylas_account_id' => $account->id,
                        'subject' => $msgData['subject'] ?? $this->composeSubject,
                        'last_message_at' => now(),
                    ]
                );

                EmailMessage::create([
                    'nylas_message_id' => $msgData['id'],
                    'email_thread_id' => $thread->id,
                    'nylas_account_id' => $account->id,
                    'from_email' => auth()->user()->email,
                    'from_name' => auth()->user()->name,
                    'to' => $msgData['to'] ?? [['email' => $this->toEmail]],
                    'subject' => $msgData['subject'] ?? $this->composeSubject,
                    'body_snippet' => Str::limit(strip_tags($this->composeBody), 100),
                    'body_html' => $this->composeBody,
                    'is_read' => true,
                    'is_draft' => false,
                    'received_at' => now(),
                ]);

                Notification::make()
                    ->title('Email Sent!')
                    ->body('Your email was successfully dispatched and synced locally.')
                    ->success()
                    ->send();

                $this->isComposing = false;
                $this->toEmail = '';
                $this->composeSubject = '';
                $this->composeBody = '';

                $this->selectFolder('sent');
                $this->selectedThreadId = $thread->id;
            } else {
                Notification::make()
                    ->title('Sending Failed')
                    ->body('The email could not be sent. Please verify your connection.')
                    ->danger()
                    ->send();
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function sendReply(NylasService $nylasService)
    {
        $this->validate([
            'replyBody' => 'required|string',
        ]);

        $thread = $this->getSelectedThreadProperty();
        if (!$thread) {
            return;
        }

        $lastMessage = $thread->messages->last();
        if (!$lastMessage) {
            return;
        }

        $account = $thread->nylasAccount;

        $payload = [
            'to' => [
                ['email' => $lastMessage->from_email, 'name' => $lastMessage->from_name]
            ],
            'subject' => 'Re: ' . $thread->subject,
            'body' => $this->replyBody,
            'reply_to_message_id' => $lastMessage->nylas_message_id,
        ];

        try {
            $response = $nylasService->sendMessage($account->grant_id, $payload);

            if ($response && isset($response['data']['id'])) {
                $msgData = $response['data'];

                EmailMessage::create([
                    'nylas_message_id' => $msgData['id'],
                    'email_thread_id' => $thread->id,
                    'nylas_account_id' => $account->id,
                    'from_email' => auth()->user()->email,
                    'from_name' => auth()->user()->name,
                    'to' => $msgData['to'] ?? [['email' => $lastMessage->from_email, 'name' => $lastMessage->from_name]],
                    'subject' => $msgData['subject'] ?? 'Re: ' . $thread->subject,
                    'body_snippet' => Str::limit(strip_tags($this->replyBody), 100),
                    'body_html' => $this->replyBody,
                    'is_read' => true,
                    'is_draft' => false,
                    'received_at' => now(),
                ]);

                $thread->update(['last_message_at' => now()]);

                Notification::make()
                    ->title('Reply Sent!')
                    ->success()
                    ->send();

                $this->replyBody = '';
                $this->selectThread($thread->id);
            } else {
                Notification::make()
                    ->title('Failed to Reply')
                    ->body('Failed to dispatch reply.')
                    ->danger()
                    ->send();
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error')
                ->body($e->getMessage())
                ->danger()
                ->send();
        }
    }
};

?>

<x-layouts.app>
    @volt('email')
        <div class="h-full flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-6rem)]" x-data="{ composeOpen: @entangle('isComposing') }">
            <div class="flex-1 flex flex-col md:flex-row bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">

                <!-- 1. FOLDER NAVIGATION (Left Pane) -->
                <div class="w-full md:w-56 bg-zinc-50 dark:bg-zinc-900 border-r border-b md:border-b-0 border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
                    <!-- Compose Button -->
                    <button @click="composeOpen = true" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                        <x-phosphor-pencil-simple-bold class="w-4 h-4" />
                        Compose
                    </button>

                    <!-- Folders List -->
                    <nav class="space-y-1">
                        <button wire:click="selectFolder('inbox')" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors {{ $activeFolder === 'inbox' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50' }}">
                            <span class="flex items-center gap-2">
                                <x-phosphor-tray-duotone class="w-5 h-5 {{ $activeFolder === 'inbox' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400' }}" />
                                Inbox
                            </span>
                            @php
                                $unreadCount = auth()->user()->nylasAccounts()
                                    ->withCount(['messages' => function ($q) {
                                        $q->where('is_read', false)->where('is_draft', false);
                                    }])->get()->sum('messages_count');
                            @endphp
                            @if($unreadCount > 0)
                                <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                    {{ $unreadCount }}
                                </span>
                            @endif
                        </button>

                        <button wire:click="selectFolder('sent')" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors {{ $activeFolder === 'sent' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50' }}">
                            <span class="flex items-center gap-2">
                                <x-phosphor-paper-plane-tilt-duotone class="w-5 h-5 {{ $activeFolder === 'sent' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400' }}" />
                                Sent
                            </span>
                        </button>

                        <button wire:click="selectFolder('drafts')" class="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors {{ $activeFolder === 'drafts' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400' : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50' }}">
                            <span class="flex items-center gap-2">
                                <x-phosphor-file-text-duotone class="w-5 h-5 {{ $activeFolder === 'drafts' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400' }}" />
                                Drafts
                            </span>
                        </button>
                    </nav>

                    <div class="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 class="px-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Connected Grants</h4>
                        <div class="mt-2 space-y-2">
                            @foreach($this->getAccounts() as $account)
                                <div class="px-3 py-1.5 flex items-center gap-2 rounded-md bg-zinc-100 dark:bg-zinc-800/30">
                                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span class="text-xs text-zinc-600 dark:text-zinc-300 truncate" title="{{ $account->email }}">
                                        {{ $account->email }}
                                    </span>
                                </div>
                            @endforeach
                            @if($this->getAccounts()->isEmpty())
                                <p class="px-3 text-xs text-zinc-400">No accounts connected.</p>
                                <a href="{{ route('settings.integrations') }}" class="px-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Connect accounts</a>
                            @endif
                        </div>
                    </div>
                </div>

                <!-- 2. CONVERSATION LIST (Middle Pane) -->
                <div class="w-full md:w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-950" @if(auth()->user()->nylasAccounts()->where('is_syncing', true)->exists()) wire:poll.5s @endif>
                    <!-- Search Input -->
                    <div class="p-4 border-b border-zinc-200 dark:border-zinc-800">
                        <div class="relative">
                            <x-phosphor-magnifying-glass class="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                            <input wire:model.live.debounce.300ms="searchQuery" type="text" placeholder="Search mail..." class="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>

                    @if(auth()->user()->nylasAccounts()->where('is_syncing', true)->exists())
                        <div class="p-4 bg-indigo-50 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 flex items-center gap-3">
                            <x-phosphor-arrows-clockwise-bold class="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin flex-shrink-0" />
                            <div class="text-xs text-indigo-800 dark:text-indigo-300">
                                <span class="font-medium">Syncing your inbox...</span> We are fetching your recent emails from Nylas.
                            </div>
                        </div>
                    @endif

                    <!-- Threads scroll list -->
                    <div class="flex-1 overflow-y-auto divide-y divide-zinc-200 dark:divide-zinc-800 max-h-[500px] md:max-h-[calc(100vh-14rem)]">
                        @forelse($this->threads as $thread)
                            @php
                                $latestMsg = $thread->messages->last();
                                $hasUnread = $thread->messages->where('is_read', false)->isNotEmpty();
                            @endphp
                            <button wire:click="selectThread({{ $thread->id }})" class="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors block {{ $selectedThreadId === $thread->id ? 'bg-zinc-100/70 dark:bg-zinc-900' : '' }}">
                                <div class="flex items-center justify-between gap-2">
                                    <span class="text-xs font-semibold truncate {{ $hasUnread ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-500 dark:text-zinc-400' }}">
                                        {{ $latestMsg ? ($latestMsg->from_name ?: $latestMsg->from_email) : 'No sender' }}
                                    </span>
                                    <span class="text-[10px] text-zinc-400 whitespace-nowrap">
                                        {{ $thread->last_message_at ? $thread->last_message_at->diffForHumans() : '' }}
                                    </span>
                                </div>
                                <h4 class="text-sm mt-1 truncate {{ $hasUnread ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-700 dark:text-zinc-300' }}">
                                    {{ $thread->subject ?: '(No Subject)' }}
                                </h4>
                                <p class="text-xs mt-0.5 text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                    {{ $latestMsg ? $latestMsg->body_snippet : '' }}
                                </p>
                            </button>
                        @empty
                            <div class="p-8 text-center text-zinc-400 dark:text-zinc-500">
                                <x-phosphor-envelope-open-duotone class="w-10 h-10 mx-auto text-zinc-300" />
                                <p class="text-sm mt-2 font-medium">No messages found</p>
                                <p class="text-xs mt-1">Try another folder or sync your mail.</p>
                            </div>
                        @endforelse
                    </div>
                </div>

                <!-- 3. CONVERSATION VIEW & REPLY (Right Pane) -->
                <div class="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-900/40">
                    @if($this->selectedThread)
                        @php $thread = $this->selectedThread; @endphp

                        <!-- Header / Subject line -->
                        <div class="p-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h2 class="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                    {{ $thread->subject ?: '(No Subject)' }}
                                </h2>
                                <p class="text-xs text-zinc-400">
                                    Conversation ID: <span class="font-mono">{{ $thread->nylas_thread_id }}</span>
                                </p>
                            </div>
                        </div>

                        <!-- Messages Thread Scroll -->
                        <div class="flex-1 p-6 space-y-6 overflow-y-auto max-h-[400px] md:max-h-[calc(100vh-22rem)]">
                            @foreach($thread->messages as $msg)
                                <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-4 space-y-3">
                                    <!-- Sender details -->
                                    <div class="flex items-start justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm shadow-inner">
                                                {{ Str::upper(Str::substr($msg->from_name ?: $msg->from_email, 0, 1)) }}
                                            </div>
                                            <div>
                                                <h4 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {{ $msg->from_name }}
                                                </h4>
                                                <p class="text-xs text-zinc-400 font-mono">
                                                    &lt;{{ $msg->from_email }}&gt;
                                                </p>
                                            </div>
                                        </div>
                                        <div class="text-right">
                                            <span class="text-xs text-zinc-400">
                                                {{ $msg->received_at ? $msg->received_at->format('M d, Y, h:i A') : '' }}
                                            </span>
                                        </div>
                                    </div>

                                    <!-- Recipients -->
                                    @if(!empty($msg->to))
                                        <div class="text-xs text-zinc-400">
                                            <span class="font-semibold text-zinc-500">To:</span>
                                            @foreach($msg->to as $recipient)
                                                <span>{{ $recipient['name'] ?? '' }} &lt;{{ $recipient['email'] ?? '' }}&gt;</span>{{ !$loop->last ? ',' : '' }}
                                            @endforeach
                                        </div>
                                    @endif

                                    <!-- Message body -->
                                    <div class="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed overflow-x-auto">
                                        @if($msg->body_html)
                                            {!! $msg->body_html !!}
                                        @else
                                            <p class="whitespace-pre-wrap">{{ $msg->body_snippet }}</p>
                                        @endif
                                    </div>

                                    <!-- Attachments -->
                                    @if($msg->attachments->isNotEmpty())
                                        <div class="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 space-y-2">
                                            <h5 class="text-xs font-semibold text-zinc-500">Attachments</h5>
                                            <div class="flex flex-wrap gap-2">
                                                @foreach($msg->attachments as $att)
                                                    <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs text-zinc-700 dark:text-zinc-300">
                                                        <x-phosphor-paperclip-duotone class="w-4 h-4 text-zinc-400" />
                                                        <span>{{ $att->filename }} ({{ number_format($att->size / 1024, 1) }} KB)</span>
                                                        <button class="text-indigo-600 hover:underline font-semibold ml-2">Download</button>
                                                    </div>
                                                @endforeach
                                            </div>
                                        </div>
                                    @endif
                                </div>
                            @endforeach
                        </div>

                        <!-- Inline Reply Composer -->
                        <div class="p-4 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
                            <form wire:submit.prevent="sendReply" class="space-y-3">
                                <div>
                                    <textarea wire:model="replyBody" rows="4" placeholder="Reply to this conversation..." class="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 placeholder-zinc-400"></textarea>
                                    @error('replyBody') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                                </div>
                                <div class="flex justify-end">
                                    <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                                        <x-phosphor-paper-plane-tilt-bold class="w-4 h-4" />
                                        Send Reply
                                    </button>
                                </div>
                            </form>
                        </div>
                    @else
                        <div class="flex-1 flex flex-col items-center justify-center text-center p-8 text-zinc-400 dark:text-zinc-500">
                            <x-phosphor-envelope-duotone class="w-16 h-16 text-zinc-300 dark:text-zinc-700" />
                            <h3 class="text-base font-semibold mt-4 text-zinc-900 dark:text-zinc-100">Select an email to read</h3>
                            <p class="text-sm mt-1 max-w-xs mx-auto">Choose a conversation from the sidebar list to see the full message thread history.</p>
                        </div>
                    @endif
                </div>
            </div>

            <!-- 4. COMPOSE NEW EMAIL MODAL -->
            <div x-show="composeOpen" class="fixed inset-0 z-50 overflow-y-auto" style="display: none;">
                <div class="flex items-center justify-center min-h-screen p-4 text-center">
                    <!-- Backdrop -->
                    <div @click="composeOpen = false" class="fixed inset-0 transition-opacity bg-zinc-900/50 backdrop-blur-sm"></div>

                    <!-- Modal Box -->
                    <div class="relative inline-block w-full max-w-xl p-6 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-zinc-950 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800">
                        <div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                            <h3 class="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <x-phosphor-pencil-simple-duotone class="w-5 h-5 text-indigo-600" />
                                New Conversation
                            </h3>
                            <button @click="composeOpen = false" class="text-zinc-400 hover:text-zinc-600">
                                <x-phosphor-x-bold class="w-5 h-5" />
                            </button>
                        </div>

                        <form wire:submit.prevent="sendEmail" class="mt-4 space-y-4">
                            <!-- Account selection -->
                            <div>
                                <label for="selectedAccountId" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">From Account</label>
                                <select wire:model="selectedAccountId" id="selectedAccountId" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    @foreach($this->getAccounts() as $acc)
                                        <option value="{{ $acc->id }}">{{ $acc->email }}</option>
                                    @endforeach
                                </select>
                                @error('selectedAccountId') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                            </div>

                            <!-- To recipient -->
                            <div>
                                <label for="toEmail" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">To</label>
                                <input type="email" wire:model="toEmail" id="toEmail" placeholder="recipient@example.com" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                @error('toEmail') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                            </div>

                            <!-- Subject -->
                            <div>
                                <label for="composeSubject" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Subject</label>
                                <input type="text" wire:model="composeSubject" id="composeSubject" placeholder="Enter email subject" class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                                @error('composeSubject') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                            </div>

                            <!-- Body -->
                            <div>
                                <label for="composeBody" class="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">Message</label>
                                <textarea wire:model="composeBody" id="composeBody" rows="6" placeholder="Write your message here..." class="mt-1 block w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"></textarea>
                                @error('composeBody') <span class="text-red-500 text-xs">{{ $message }}</span> @enderror
                            </div>

                            <div class="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button type="button" @click="composeOpen = false" class="px-4 py-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors">
                                    <x-phosphor-paper-plane-tilt-bold class="w-4 h-4" />
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    @endvolt
</x-layouts.app>