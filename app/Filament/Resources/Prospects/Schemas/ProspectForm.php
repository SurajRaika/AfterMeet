<?php

namespace App\Filament\Resources\Prospects\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ProspectForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('company_name'),
                TextInput::make('job_title'),
                TextInput::make('email')
                    ->label('Email address')
                    ->email(),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('linkedin_url')
                    ->url(),
                TextInput::make('website')
                    ->url(),
                TextInput::make('country'),
                TextInput::make('industry'),
                Select::make('stage')
                    ->required()
                    ->options([
                        'New' => 'New',
                        'Researching' => 'Researching',
                        'Ready to Contact' => 'Ready to Contact',
                        'Contacted' => 'Contacted',
                        'Engaged' => 'Engaged',
                        'Connected' => 'Connected',
                        'Converted' => 'Converted',
                        'Archived' => 'Archived',
                    ])
                    ->default('New'),
                TextInput::make('source'),
                Select::make('owner_id')
                    ->relationship('owner', 'name'),
                Textarea::make('notes')
                    ->columnSpanFull(),
                DateTimePicker::make('last_contacted_at'),
                DateTimePicker::make('next_follow_up_at'),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('converted_to_enquiry_id')
                    ->numeric(),
            ]);
    }
}
