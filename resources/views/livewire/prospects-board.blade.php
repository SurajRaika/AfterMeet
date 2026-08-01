<?php

use Livewire\Volt\Component;
use Livewire\Attributes\Url;
use Filament\Notifications\Notification;
use App\Models\Blueprint;
use App\Models\BlueprintStep;
use App\Models\Prospect;
use App\Models\ProspectStepLog;
use App\Models\ProspectView;
use App\Models\Template;
use App\Services\NylasService;
use Illuminate\Support\Str;

new class extends Component {
    #[Url(keep: true)]
    public string $layout = 'table';

    #[Url(keep: true)]
    public string $selectedViewId = 'all';

    #[Url(keep: true)]
    public string $statusFilter = '';

    public bool $isCreateViewOpen = false;

    // New backend properties
    public ?int $selectedProspectId = null;
    public bool $isBlueprintModalOpen = false;

    public function mount()
    {
        // Read initial query parameters or default values
        $this->layout = request()->query('layout', $this->layout);
        $this->selectedViewId = request()->query('view', $this->selectedViewId);
        $this->statusFilter = request()->query('status', $this->statusFilter);

        $this->ensureDefaultsExist();
    }

    protected function ensureDefaultsExist()
    {
        $tenantId = $this->getTenantId();

        // 1. Fetch or auto-create default views for this tenant
        $views = ProspectView::where('tenant_id', $tenantId)->get();
        if ($views->isEmpty()) {
            ProspectView::create([
                'tenant_id' => $tenantId,
                'name' => 'High Value Leads',
                'filters' => [
                    ['column' => 'stage', 'operator' => '=', 'value' => 'Engaged'],
                    ['column' => 'country', 'operator' => '=', 'value' => 'USA'],
                    ['column' => 'company_size', 'operator' => '>', 'value' => '100'],
                ],
                'sort_by' => 'company_size',
                'sort_direction' => 'desc',
                'visibility' => 'shared',
            ]);

            ProspectView::create([
                'tenant_id' => $tenantId,
                'name' => 'Trade Show Contacts',
                'filters' => [
                    ['column' => 'source', 'operator' => '=', 'value' => 'Event'],
                    ['column' => 'event', 'operator' => '=', 'value' => 'Canton Fair'],
                ],
                'sort_by' => 'created_at',
                'sort_direction' => 'desc',
                'visibility' => 'shared',
            ]);
        }

        // If tenant has no prospects, seed some mock ones to showcase the views
        if (Prospect::where('tenant_id', $tenantId)->count() === 0) {
            Prospect::create([
                'tenant_id' => $tenantId,
                'company_name' => 'Acme Inc',
                'contact_name' => 'John Doe',
                'contact_email' => 'johndoe@acme.com',
                'contact_role' => 'VP of Growth',
                'status' => 'active',
                'stage' => 'Engaged',
                'country' => 'USA',
                'company_size' => 150,
                'source' => 'Outbound',
            ]);

            Prospect::create([
                'tenant_id' => $tenantId,
                'company_name' => 'TradeCo',
                'contact_name' => 'Sven Gustafsson',
                'contact_email' => 'sven@tradeco.com',
                'contact_role' => 'Logistics Mgr',
                'status' => 'new',
                'stage' => 'New',
                'country' => 'Sweden',
                'company_size' => 45,
                'source' => 'Event',
                'event' => 'Canton Fair',
            ]);

            Prospect::create([
                'tenant_id' => $tenantId,
                'company_name' => 'Global Sales Corp',
                'contact_name' => 'Sarah Connor',
                'contact_email' => 'sarah@globalsales.com',
                'contact_role' => 'CEO',
                'status' => 'paused',
                'stage' => 'Researching',
                'country' => 'USA',
                'company_size' => 80,
                'source' => 'Inbound',
            ]);
        }
    }

    protected function getTenantId()
    {
        return auth()->user()->organization_id ?? auth()->id();
    }

    public function getViewsProperty()
    {
        $this->ensureDefaultsExist();
        return ProspectView::where('tenant_id', $this->getTenantId())->get();
    }

    public function getBlueprintsProperty()
    {
        return Blueprint::where('tenant_id', $this->getTenantId())->get();
    }

    public function getAutomationsProperty()
    {
        return \App\Models\Automation::where('is_active', true)->get();
    }

    public function getSelectedViewProperty()
    {
        if ($this->selectedViewId === 'all') {
            return null;
        }
        return ProspectView::where('tenant_id', $this->getTenantId())->find($this->selectedViewId);
    }

    public function getProspectsProperty()
    {
        $this->ensureDefaultsExist();
        $query = Prospect::where('tenant_id', $this->getTenantId())->with('blueprint');

        $selectedView = $this->getSelectedViewProperty();
        if ($selectedView) {
            $whitelist = ['stage', 'status', 'country', 'company_size', 'source', 'event', 'company_name', 'contact_name', 'contact_email', 'contact_role'];
            $operators = ['=', '>', '<', '!=', 'like'];
            if (is_array($selectedView->filters)) {
                foreach ($selectedView->filters as $filter) {
                    $col = $filter['column'] ?? null;
                    $op = $filter['operator'] ?? '=';
                    $val = $filter['value'] ?? '';

                    if ($col && in_array($col, $whitelist) && in_array($op, $operators)) {
                        if ($op === 'like') {
                            $query->where($col, 'like', '%' . $val . '%');
                        } else {
                            $query->where($col, $op, $val);
                        }
                    }
                }
            }

            if ($selectedView->sort_by && in_array($selectedView->sort_by, $whitelist)) {
                $dir = in_array(strtolower($selectedView->sort_direction ?? 'desc'), ['asc', 'desc']) ? $selectedView->sort_direction : 'desc';
                $query->orderBy($selectedView->sort_by, $dir);
            } else {
                $query->latest();
            }
        } else {
            $query->latest();
        }

        if ($this->statusFilter !== '') {
            $query->where('status', $this->statusFilter);
        }

        return $query->get();
    }

    public function selectLayout(string $layout)
    {
        $this->layout = $layout;
    }

    public function selectView(string $viewId)
    {
        $this->selectedViewId = $viewId;
    }

    public function clearFilters()
    {
        $this->statusFilter = '';
    }

    public function updateStage($id, $stage)
    {
        $prospect = Prospect::where('tenant_id', $this->getTenantId())->findOrFail($id);

        $allowedStages = ['New', 'Researching', 'Ready to Contact', 'Contacted', 'Engaged', 'Connected', 'Converted', 'Archived'];
        if (!in_array($stage, $allowedStages)) {
            Notification::make()
                ->title('Invalid Stage')
                ->body('The selected stage is invalid.')
                ->danger()
                ->send();
            return;
        }

        $prospect->update([
            'stage' => $stage,
        ]);

        Notification::make()
            ->title('Stage Updated')
            ->body("{$prospect->contact_name}'s stage updated to {$stage}.")
            ->success()
            ->send();
    }

    // NEW BACKEND ACTIONS
    public function openStartContacting($id)
    {
        $this->selectedProspectId = $id;
        $this->isBlueprintModalOpen = true;
    }

    public function closeBlueprintModal()
    {
        $this->selectedProspectId = null;
        $this->isBlueprintModalOpen = false;
    }

    public function startContacting($automationId)
    {
        if (!$this->selectedProspectId) {
            Notification::make()
                ->title('Error')
                ->body('No prospect selected.')
                ->danger()
                ->send();
            return;
        }

        $prospect = Prospect::where('tenant_id', $this->getTenantId())->findOrFail($this->selectedProspectId);
        $automation = \App\Models\Automation::findOrFail($automationId);

        $engine = new \App\Workflows\WorkflowEngine();
        $engine->start($automation, $prospect, [
            'trigger' => 'manual_prospects_ui',
            'triggered_at' => now()->toDateTimeString(),
        ]);

        $prospect->update([
            'status' => 'active',
        ]);

        Notification::make()
            ->title('Automation Started')
            ->body("Automation '{$automation->name}' successfully started for {$prospect->contact_name}.")
            ->success()
            ->send();

        $this->closeBlueprintModal();
    }

    public function pauseContacting($id)
    {
        $prospect = Prospect::where('tenant_id', $this->getTenantId())->findOrFail($id);
        $prospect->update(['status' => 'paused']);

        Notification::make()
            ->title('Sequence Paused')
            ->body("Contacting sequence paused for {$prospect->contact_name}.")
            ->success()
            ->send();
    }

    public function resumeContacting($id)
    {
        $prospect = Prospect::where('tenant_id', $this->getTenantId())->findOrFail($id);
        $prospect->update(['status' => 'active']);

        Notification::make()
            ->title('Sequence Resumed')
            ->body("Contacting sequence resumed for {$prospect->contact_name}.")
            ->success()
            ->send();
    }

    public function sendNextStep($id)
    {
        $prospect = Prospect::where('tenant_id', $this->getTenantId())->findOrFail($id);

        $step = $prospect->currentStep();
        if (!$step) {
            Notification::make()
                ->title('Error')
                ->body('No pending step found for this prospect.')
                ->danger()
                ->send();
            return;
        }

        $nylasAccount = auth()->user()->nylasAccounts()->first();
        if (!$nylasAccount) {
            Notification::make()
                ->title('Error')
                ->body('Please connect a Nylas account first.')
                ->danger()
                ->send();
            return;
        }

        $template = $step->template;
        if (!$template) {
            Notification::make()
                ->title('Error')
                ->body('The template for this step is missing.')
                ->danger()
                ->send();
            return;
        }

        $subject = Template::renderString($template->subject, $prospect);
        $body = Template::renderString($template->body, $prospect);

        $nylasService = new NylasService();
        $payload = [
            'to' => [
                ['email' => $prospect->contact_email, 'name' => $prospect->contact_name]
            ],
            'subject' => $subject,
            'body' => $body,
        ];

        try {
            $response = $nylasService->sendMessage($nylasAccount->grant_id, $payload);

            if ($response && isset($response['data']['id'])) {
                $messageId = $response['data']['id'];

                ProspectStepLog::create([
                    'prospect_id' => $prospect->id,
                    'blueprint_step_id' => $step->id,
                    'sent_at' => now(),
                    'message_id' => $messageId,
                ]);

                $prospect->current_step_order += 1;
                $prospect->last_sent_at = now();
                if ($prospect->status === 'new') {
                    $prospect->status = 'active';
                }
                $prospect->save();

                Notification::make()
                    ->title('Outreach Dispatched')
                    ->body("Email dispatched successfully to {$prospect->contact_name} and sequence advanced.")
                    ->success()
                    ->send();
            } else {
                Notification::make()
                    ->title('Sending Failed')
                    ->body('Failed to send email. Nylas API rejected the payload.')
                    ->danger()
                    ->send();
            }
        } catch (\Exception $e) {
            Notification::make()
                ->title('Error')
                ->body('Exception occurred: ' . $e->getMessage())
                ->danger()
                ->send();
        }
    }

    public function deleteProspect($id)
    {
        $prospect = Prospect::where('tenant_id', $this->getTenantId())->findOrFail($id);
        $prospect->delete();

        Notification::make()
            ->title('Success')
            ->body('Prospect deleted successfully.')
            ->success()
            ->send();
    }

    public function deleteView($id)
    {
        $view = ProspectView::where('tenant_id', $this->getTenantId())->findOrFail($id);
        $view->delete();

        if ($this->selectedViewId == $id) {
            $this->selectedViewId = 'all';
        }

        Notification::make()
            ->title('Success')
            ->body('Saved view deleted successfully.')
            ->success()
            ->send();
    }
};

?>

<div class="space-y-4">
    <!-- Header / Title -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 gap-4">
        <x-app.heading
            title="Prospects"
            description="Manage pipelines, assign blueprints, or trigger outreach manually."
            :border="false"
        />
        <div class="flex items-center gap-1.5">
            <!-- Layout Toggle -->
            <div class="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded mr-1 text-xs">
                <button wire:click="selectLayout('table')" class="px-2 py-1 rounded-sm font-medium transition-colors {{ ($layout === 'table') ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400' }}">
                    Table
                </button>
                <button wire:click="selectLayout('kanban')" class="px-2 py-1 rounded-sm font-medium transition-colors {{ ($layout === 'kanban') ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400' }}">
                    Kanban
                </button>
            </div>

            <a href="{{ route('prospects.import.show') }}" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors shadow-sm">
                <x-phosphor-upload-simple-bold class="w-3.5 h-3.5" />
                Import
            </a>

            <a href="{{ route('prospects.create') }}" class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-sm">
                <x-phosphor-plus-bold class="w-3.5 h-3.5" />
                Create
            </a>
        </div>
    </div>

    <!-- Filter Bar & Saved Views -->
    @include('livewire.prospects.filter-bar')

    <!-- Main Table or Kanban Workspace -->
    <div class="mt-2">
        @if($layout === 'kanban')
            @include('livewire.prospects.kanban-view')
        @else
            @include('livewire.prospects.table-view')
        @endif
    </div>

    <!-- Modals -->
    @include('livewire.prospects.blueprint-modal')

    <!-- Create Custom View Modal (Alpine.js) -->
    <div
        x-show="$wire.isCreateViewOpen"
        class="fixed inset-0 z-50 overflow-y-auto"
        style="display: none;"
        x-transition
    >
        <div class="flex items-center justify-center min-h-screen px-4">
            <!-- Overlay -->
            <div class="fixed inset-0 bg-black/50 transition-opacity" @click="$wire.isCreateViewOpen = false"></div>

            <!-- Modal Content -->
            <div class="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded max-w-xl w-full p-5 shadow-lg z-10 space-y-4">
                <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
                    <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Create Saved Filter View</h3>
                    <button @click="$wire.isCreateViewOpen = false" class="text-zinc-400 hover:text-zinc-600">
                        <x-phosphor-x-bold class="w-4 h-4" />
                    </button>
                </div>

                <form action="{{ route('prospects.views.store') }}" method="POST" class="space-y-4 text-xs">
                    @csrf

                    <div>
                        <label for="view_name" class="block font-semibold text-zinc-700 dark:text-zinc-300">View Name</label>
                        <input type="text" name="name" id="view_name" required placeholder="e.g. US High Value Leads" class="mt-1 block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
                    </div>

                    <!-- Filters Conditions -->
                    <div>
                        <label class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Filters (AND conditions)</label>
                        <div class="space-y-1.5">
                            @for($i = 0; $i < 3; $i++)
                                <div class="flex flex-col sm:flex-row gap-1.5 items-center bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                                    <select name="filters[{{ $i }}][column]" class="block w-full sm:w-1/3 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500">
                                        <option value="">-- Column --</option>
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

                                    <select name="filters[{{ $i }}][operator]" class="block w-full sm:w-16 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500">
                                        <option value="=">=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                        <option value="!=">!=</option>
                                        <option value="like">like</option>
                                    </select>

                                    <input type="text" name="filters[{{ $i }}][value]" placeholder="Value..." class="block w-full sm:flex-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 py-1 px-1.5 focus:ring-1 focus:ring-indigo-500" />
                                </div>
                            @endfor
                        </div>
                    </div>

                    <!-- Sorting Options -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label for="sort_by" class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Sort By</label>
                            <select name="sort_by" id="sort_by" class="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="">Default (Latest)</option>
                                <option value="company_size">Company Size</option>
                                <option value="company_name">Company Name</option>
                                <option value="contact_name">Contact Name</option>
                                <option value="stage">Stage</option>
                            </select>
                        </div>

                        <div>
                            <label for="sort_direction" class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Direction</label>
                            <select name="sort_direction" id="sort_direction" class="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <option value="asc">Ascending (A-Z)</option>
                                <option value="desc" selected>Descending (Z-A)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label for="visibility" class="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">Visibility</label>
                        <select name="visibility" id="visibility" class="block w-full rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="private" selected>Private (Only Me)</option>
                            <option value="shared">Shared (Entire Tenant)</option>
                        </select>
                    </div>

                    <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                        <button type="button" @click="$wire.isCreateViewOpen = false" class="px-3 py-1.5 font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="inline-flex items-center gap-1 px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded shadow-sm transition-colors">
                            Save View
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
