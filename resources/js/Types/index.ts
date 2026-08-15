export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    organization_id?: number;
}

export interface Prospect {
    id: number;
    contact_name: string;
    contact_email: string;
    contact_role?: string;
    company_name: string;
    status: 'lead' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface EmailAttachment {
    id: number;
    file_name: string;
    file_size?: number;
    content_type?: string;
    download_url?: string;
}

export interface EmailMessage {
    id: number;
    nylas_message_id?: string;
    sender: string;
    recipient: string;
    subject: string;
    body: string;
    snippet?: string;
    received_at: string;
    is_read: boolean;
    attachments?: EmailAttachment[];
}

export interface EmailThread {
    id: number;
    nylas_thread_id?: string;
    subject: string;
    last_message_at: string;
    unread_count: number;
    messages?: EmailMessage[];
    prospect?: Prospect;
}

export interface OutreachTemplate {
    id: number;
    title: string;
    subject: string;
    body: string;
    placeholders?: string[];
    created_at?: string;
}

export interface BlueprintStep {
    id: number;
    step_number: number;
    template_id?: number;
    wait_days: number;
    action_type: 'email' | 'call' | 'task';
}

export interface Blueprint {
    id: number;
    name: string;
    description?: string;
    steps?: BlueprintStep[];
}

export interface ProspectView {
    id: number;
    name: string;
    filters: Array<{
        column: string;
        operator: string;
        value: string;
    }>;
    is_default?: boolean;
}

export type NavigationTab = 'inbox' | 'prospects' | 'templates' | 'blueprints' | 'analytics' | 'settings';
