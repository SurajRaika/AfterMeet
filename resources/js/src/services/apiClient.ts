import { User, Enquiry, Email, Prospect, Campaign, Task, HREmployee, Expense, CustomView, CustomFieldDefinition, DocumentRecord, DocumentVersion, DocumentWorkItemLink } from '../types/crm';
import { USERS, INITIAL_ENQUIRIES, INITIAL_EMAILS, INITIAL_PROSPECTS, INITIAL_CAMPAIGNS, INITIAL_HR_EMPLOYEES, INITIAL_EXPENSES, INITIAL_DOCUMENTS, INITIAL_DOCUMENT_VERSIONS, INITIAL_DOCUMENT_WORK_ITEM_LINKS } from '../constants/initialData';

// This is a highly extensible API Client designed to bridge the React prototype with a Laravel backend.
// In the production environment, simply switch API_CONFIG.useMock to false and specify the API_CONFIG.baseURL.
export const API_CONFIG = {
  useMock: true,
  baseURL: '/api', // Laravel API base URL
};

// Helper for making API requests.
// In production, this can be implemented with window.fetch or axios.
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (API_CONFIG.useMock) {
    throw new Error('Running in mock mode. Please use mock implementations instead.');
  }
  const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `API error: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  users: {
    async list(): Promise<Record<string, User>> {
      if (API_CONFIG.useMock) {
        return USERS;
      }
      return request<Record<string, User>>('/users');
    },
    async getSwitchableProfiles(): Promise<User[]> {
      if (API_CONFIG.useMock) {
        // Return switchable users as an array
        return Object.values(USERS);
      }
      return request<User[]>('/users/switchable');
    },
  },

  search: {
    async query(queryText: string): Promise<{
      enquiries: Enquiry[];
      tasks: Task[];
      emails: Email[];
      prospects: Prospect[];
      expenses: Expense[];
    }> {
      if (API_CONFIG.useMock) {
        const q = queryText.toLowerCase();
        // Return matching items from static initial datasets (INITIAL_ENQUIRIES, etc.)
        const matchingEnquiries = INITIAL_ENQUIRIES.filter(e =>
          e.id.toLowerCase().includes(q) ||
          e.customerName.toLowerCase().includes(q) ||
          e.product.toLowerCase().includes(q) ||
          (e.sales_type && e.sales_type.toLowerCase().includes(q))
        );
        const initialEnquiryTasks = INITIAL_ENQUIRIES.flatMap(e => e.tasks.map(t => ({ ...t, parentEnquiryId: e.id, creator: 'System' })));
        const standaloneTasks: Task[] = [
          {
            id: 'TSK-901',
            title: 'Update employee documents',
            type: 'Action Item',
            assignee: 'Harriet Reid',
            department: 'HR',
            dueDate: '2026-08-15',
            priority: 'Medium',
            status: 'Pending',
            linkedRecord: '',
            description: 'Review and update annual medical clearance forms and training credentials.',
            watchers: ['Harriet Reid'],
            comments: [],
            creator: 'Arthur Pendelton'
          },
          {
            id: 'TSK-902',
            title: 'Get transportation quote',
            type: 'Action Item',
            assignee: 'Anyone',
            department: 'Logistics',
            dueDate: '2026-07-26',
            priority: 'High',
            status: 'Pending',
            linkedRecord: 'ENQ-2026-0012',
            description: 'Verify back-up freight rates from alternate ocean carriers on Hamburg transit lanes.',
            watchers: ['Kenji Sato'],
            comments: [],
            creator: 'Marcus Brody',
            parentEnquiryId: 'ENQ-2026-0012'
          }
        ];
        const allTasks = [...initialEnquiryTasks, ...standaloneTasks];
        const matchingTasks = allTasks.filter(t =>
          t.id.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
        );
        const matchingEmails = INITIAL_EMAILS.filter(m =>
          m.id.toLowerCase().includes(q) ||
          m.subject.toLowerCase().includes(q) ||
          m.body.toLowerCase().includes(q)
        );
        const matchingProspects = INITIAL_PROSPECTS.filter(p =>
          p.id.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.contactName.toLowerCase().includes(q) ||
          p.cropInterest.toLowerCase().includes(q)
        );
        const matchingExpenses = INITIAL_EXPENSES.filter(e =>
          e.id.toLowerCase().includes(q) ||
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
        );

        return {
          enquiries: matchingEnquiries,
          tasks: matchingTasks,
          emails: matchingEmails,
          prospects: matchingProspects,
          expenses: matchingExpenses,
        };
      }
      return request<{
        enquiries: Enquiry[];
        tasks: Task[];
        emails: Email[];
        prospects: Prospect[];
        expenses: Expense[];
      }>(`/search?q=${encodeURIComponent(queryText)}`);
    }
  },

  enquiries: {
    async list(): Promise<Enquiry[]> {
      if (API_CONFIG.useMock) {
        return INITIAL_ENQUIRIES;
      }
      return request<Enquiry[]>('/enquiries');
    },
    async create(data: Partial<Enquiry>): Promise<Enquiry> {
      if (API_CONFIG.useMock) {
        return data as Enquiry;
      }
      return request<Enquiry>('/enquiries', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<Enquiry>): Promise<Enquiry> {
      if (API_CONFIG.useMock) {
        return data as Enquiry;
      }
      return request<Enquiry>(`/enquiries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },

  tasks: {
    async list(): Promise<Task[]> {
      if (API_CONFIG.useMock) {
        const initialEnquiryTasks = INITIAL_ENQUIRIES.flatMap(e => e.tasks.map(t => ({ ...t, parentEnquiryId: e.id, creator: 'System' })));
        const standaloneTasks: Task[] = [
          {
            id: 'TSK-901',
            title: 'Update employee documents',
            type: 'Action Item',
            assignee: 'Harriet Reid',
            department: 'HR',
            dueDate: '2026-08-15',
            priority: 'Medium',
            status: 'Pending',
            linkedRecord: '',
            description: 'Review and update annual medical clearance forms and training credentials.',
            watchers: ['Harriet Reid'],
            comments: [],
            creator: 'Arthur Pendelton'
          },
          {
            id: 'TSK-902',
            title: 'Get transportation quote',
            type: 'Action Item',
            assignee: 'Anyone',
            department: 'Logistics',
            dueDate: '2026-07-26',
            priority: 'High',
            status: 'Pending',
            linkedRecord: 'ENQ-2026-0012',
            description: 'Verify back-up freight rates from alternate ocean carriers on Hamburg transit lanes.',
            watchers: ['Kenji Sato'],
            comments: [],
            creator: 'Marcus Brody',
            parentEnquiryId: 'ENQ-2026-0012'
          }
        ];
        return [...initialEnquiryTasks, ...standaloneTasks];
      }
      return request<Task[]>('/tasks');
    },
    async create(data: Partial<Task>): Promise<Task> {
      if (API_CONFIG.useMock) {
        return data as Task;
      }
      return request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<Task>): Promise<Task> {
      if (API_CONFIG.useMock) {
        return data as Task;
      }
      return request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },

  expenses: {
    async list(): Promise<Expense[]> {
      if (API_CONFIG.useMock) {
        return INITIAL_EXPENSES;
      }
      return request<Expense[]>('/expenses');
    },
    async create(data: Partial<Expense>): Promise<Expense> {
      if (API_CONFIG.useMock) {
        return data as Expense;
      }
      return request<Expense>('/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<Expense>): Promise<Expense> {
      if (API_CONFIG.useMock) {
        return data as Expense;
      }
      return request<Expense>(`/expenses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },

  emails: {
    async list(): Promise<Email[]> {
      if (API_CONFIG.useMock) {
        return INITIAL_EMAILS;
      }
      return request<Email[]>('/emails');
    },
    async send(data: Partial<Email>): Promise<Email> {
      if (API_CONFIG.useMock) {
        return data as Email;
      }
      return request<Email>('/emails', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  hrEmployees: {
    async list(): Promise<HREmployee[]> {
      if (API_CONFIG.useMock) {
        return INITIAL_HR_EMPLOYEES;
      }
      return request<HREmployee[]>('/hr-employees');
    },
    async create(data: Partial<HREmployee>): Promise<HREmployee> {
      if (API_CONFIG.useMock) {
        return data as HREmployee;
      }
      return request<HREmployee>('/hr-employees', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    async update(id: string, data: Partial<HREmployee>): Promise<HREmployee> {
      if (API_CONFIG.useMock) {
        return data as HREmployee;
      }
      return request<HREmployee>(`/hr-employees/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },

  prospects: {
    async list(): Promise<Prospect[]> {
      if (API_CONFIG.useMock) {
        return INITIAL_PROSPECTS;
      }
      return request<Prospect[]>('/prospects');
    },
    async update(id: string, data: Partial<Prospect>): Promise<Prospect> {
      if (API_CONFIG.useMock) {
        return data as Prospect;
      }
      return request<Prospect>(`/prospects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  },

  campaigns: {
    async list(): Promise<Campaign[]> {
      if (API_CONFIG.useMock) {
        return INITIAL_CAMPAIGNS;
      }
      return request<Campaign[]>('/campaigns');
    }
  },

  customViews: {
    async list(): Promise<CustomView[]> {
      if (API_CONFIG.useMock) {
        // Return initial built-in custom views or fetch from localStorage
        const stored = localStorage.getItem('aftermeet_custom_views');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            console.error('Failed to parse stored custom views:', e);
          }
        }
        const defaultViews: CustomView[] = [
          {
            id: 'view-warm-sentiment',
            name: 'Warm Leads Only',
            conditions: [
              { field: 'sentiment', operator: 'equals', value: 'Warm Lead' }
            ],
            isBuiltIn: true
          },
          {
            id: 'view-sesame',
            name: 'Sesame Seed Interest',
            conditions: [
              { field: 'cropInterest', operator: 'contains', value: 'Sesame' }
            ],
            isBuiltIn: true
          }
        ];
        localStorage.setItem('aftermeet_custom_views', JSON.stringify(defaultViews));
        return defaultViews;
      }
      return request<CustomView[]>('/custom-views');
    },

    async create(data: CustomView): Promise<CustomView> {
      if (API_CONFIG.useMock) {
        const stored = localStorage.getItem('aftermeet_custom_views');
        const list: CustomView[] = stored ? JSON.parse(stored) : [];
        const newList = [...list, data];
        localStorage.setItem('aftermeet_custom_views', JSON.stringify(newList));
        return data;
      }
      return request<CustomView>('/custom-views', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string): Promise<boolean> {
      if (API_CONFIG.useMock) {
        const stored = localStorage.getItem('aftermeet_custom_views');
        if (stored) {
          const list: CustomView[] = JSON.parse(stored);
          const filtered = list.filter(v => v.id !== id);
          localStorage.setItem('aftermeet_custom_views', JSON.stringify(filtered));
        }
        return true;
      }
      await request<void>(`/custom-views/${id}`, {
        method: 'DELETE',
      });
      return true;
    }
  },

  prospectCustomFields: {
    async list(): Promise<CustomFieldDefinition[]> {
      if (API_CONFIG.useMock) {
        const stored = localStorage.getItem('aftermeet_prospect_custom_fields');
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch (e) {
            console.error('Failed to parse stored custom fields:', e);
          }
        }
        // Default dynamic custom fields based on requirements:
        const defaultFields: CustomFieldDefinition[] = [
          {
            id: 'f-prod-interest',
            name: 'Product Interest',
            key: 'cropInterest', // Mapped to the existing field key for compatibility
            type: 'select',
            options: ['Premium Sesame Seeds', 'Green Cardamom Splits', 'Dehydrated Onion Flakes', 'Sunflower Oil', 'Soybean Meal', 'Wheat Grains'],
            required: true
          },
          {
            id: 'f-monthly-volume',
            name: 'Monthly Volume',
            key: 'estimatedVolume', // Mapped to the existing field key for compatibility
            type: 'number',
            required: false
          },
          {
            id: 'f-target-market',
            name: 'Target Market',
            key: 'targetMarket',
            type: 'text',
            required: false
          },
          {
            id: 'f-certification',
            name: 'Certification Required',
            key: 'certificationRequired',
            type: 'multi-select',
            options: ['Phytosanitary', 'Organic', 'ISO 22000', 'Halal', 'Kosher'],
            required: false
          },
          {
            id: 'f-exp-purchase',
            name: 'Expected Purchase Date',
            key: 'expectedPurchaseDate',
            type: 'date',
            required: false
          },
          {
            id: 'f-is-distributor',
            name: 'Is Distributor',
            key: 'isDistributor',
            type: 'boolean',
            required: false
          }
        ];
        localStorage.setItem('aftermeet_prospect_custom_fields', JSON.stringify(defaultFields));
        return defaultFields;
      }
      return request<CustomFieldDefinition[]>('/prospects/custom-fields');
    },

    async create(data: CustomFieldDefinition): Promise<CustomFieldDefinition> {
      if (API_CONFIG.useMock) {
        const stored = localStorage.getItem('aftermeet_prospect_custom_fields');
        const list: CustomFieldDefinition[] = stored ? JSON.parse(stored) : [];
        const newList = [...list, data];
        localStorage.setItem('aftermeet_prospect_custom_fields', JSON.stringify(newList));
        return data;
      }
      return request<CustomFieldDefinition>('/prospects/custom-fields', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  },

  ai: {
    async generateOutreach(
      contactName: string,
      companyName: string,
      cropInterest: string,
      estimatedVolume: string,
      tone: string,
      creatorName: string
    ): Promise<string> {
      if (API_CONFIG.useMock) {
        const fallbackResponse = `Dear ${contactName},\n\nWe saw that ${companyName} is expanding imports in raw agricultural crops. Our focus is delivering pristine quality ${cropInterest} directly from our audited regional cooperatives.\n\nOur cooperative farms are rated highly on export specifications with secure phytosanitary clearances.\n\nCan we arrange a brief call next week to coordinate freight quotes and vacuum samples?\n\nSincerely,\n${creatorName}\nTradeDesk Global Outbound`;

        try {
          const apiKey = ""; // Can be configured at runtime
          if (!apiKey) throw new Error('API key unconfigured');
          const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

          const systemPrompt = "You are a professional B2B agricultural export marketing copywriter for TradeDesk. Draft short, direct, highly professional outbound sales proposal emails.";
          const userQuery = `Write a premium, brief outbound proposal to ${contactName} at ${companyName}. They import ${cropInterest}. Sourcing volume: ${estimatedVolume}. Tone parameter: ${tone}. Ask for a slot to provide pricing index or vacuum samples. Keep it strictly under 150 words.`;

          const payload = {
            contents: [{ parts: [{ text: userQuery }] }],
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              maxOutputTokens: 250,
              temperature: 0.7
            }
          };

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error('API request failed');
          }

          const result = await response.json();
          const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (generatedText) return generatedText;
          throw new Error('No draft returned');
        } catch (err) {
          console.warn("Outbound Gemini API call failed, using mock fallback: ", err);
          return fallbackResponse;
        }
      }

      const res = await request<{ draft: string }>('/ai/generate-outreach', {
        method: 'POST',
        body: JSON.stringify({ contactName, companyName, cropInterest, estimatedVolume, tone, creatorName })
      });
      return res.draft;
    }
  },

  documents: {
    async list(): Promise<{
      documents: DocumentRecord[];
      versions: DocumentVersion[];
      links: DocumentWorkItemLink[];
    }> {
      if (API_CONFIG.useMock) {
        return {
          documents: INITIAL_DOCUMENTS,
          versions: INITIAL_DOCUMENT_VERSIONS,
          links: INITIAL_DOCUMENT_WORK_ITEM_LINKS,
        };
      }
      return request<{
        documents: DocumentRecord[];
        versions: DocumentVersion[];
        links: DocumentWorkItemLink[];
      }>('/documents');
    },

    async createDocument(data: Partial<DocumentRecord>): Promise<DocumentRecord> {
      if (API_CONFIG.useMock) {
        return data as DocumentRecord;
      }
      return request<DocumentRecord>('/documents', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async createVersion(data: Partial<DocumentVersion>): Promise<DocumentVersion> {
      if (API_CONFIG.useMock) {
        return data as DocumentVersion;
      }
      return request<DocumentVersion>(`/documents/${data.documentId}/versions`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async createWorkItemLink(data: Partial<DocumentWorkItemLink>): Promise<DocumentWorkItemLink> {
      if (API_CONFIG.useMock) {
        return data as DocumentWorkItemLink;
      }
      return request<DocumentWorkItemLink>('/document-work-item-links', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }
};
