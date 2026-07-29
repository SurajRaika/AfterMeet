<?php

namespace App\Filament\Resources\Prospects\Pages;

use App\Filament\Resources\Prospects\ProspectResource;
use App\Models\Prospect;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Collection;

class ListProspects extends ListRecords
{
    protected static string $resource = ProspectResource::class;

    public string $viewMode = 'kanban'; // Default to Kanban view

    protected $queryString = ['viewMode'];

    public function changeViewMode(string $mode): void
    {
        $this->viewMode = $mode;
    }

    public function updateProspectStage(int $id, string $newStage, int $newIndex): void
    {
        $prospect = Prospect::find($id);
        if ($prospect) {
            $prospect->stage = $newStage;
            $prospect->sort_order = $newIndex;
            $prospect->save();
        }
    }

    /**
     * Get grouped prospects for the Kanban board view.
     * Moving the database query out of the Blade view for optimal performance and N+1 query prevention.
     */
    public function getProspectsGrouped(): \Illuminate\Support\Collection
    {
        return Prospect::with('owner')->get()->groupBy('stage');
    }

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }

    /**
     * Use custom blade view for the list prospects page.
     */
    public function getHeader(): ?\Illuminate\Contracts\View\View
    {
        // We can pass header action / view toggle content here, or use list page view customization.
        return null;
    }

    public function getView(): string
    {
        return 'filament.resources.prospects.pages.list-prospects';
    }
}
