import { useState, useMemo, useEffect } from 'react';
import { USERS, INITIAL_ENQUIRIES, INITIAL_EMAILS, INITIAL_PROSPECTS, INITIAL_CAMPAIGNS, INITIAL_HR_EMPLOYEES, INITIAL_EXPENSES, INITIAL_DOCUMENTS, INITIAL_DOCUMENT_VERSIONS, INITIAL_DOCUMENT_WORK_ITEM_LINKS } from '../constants/initialData';
import { User, Enquiry, Email, EmailAttachment, Prospect, Campaign, Task, HREmployee, TaskCategory, LinkType, Expense, SamplingRequest, LogisticsRequest, ComplianceRequest, CustomView, CustomViewCondition, DocumentRecord, DocumentVersion, DocumentWorkItemLink } from '../types/crm';
import { apiClient } from '../services/apiClient';

export function useCRMState() {
  const [currentUser, setCurrentUser] = useState<User>(USERS.arthur_president!);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(INITIAL_ENQUIRIES);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [tasks, setTasks] = useState<Task[]>(() => {
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
  });
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [hrEmployees, setHrEmployees] = useState<HREmployee[]>(INITIAL_HR_EMPLOYEES);
  const [prospects, setProspects] = useState<Prospect[]>(INITIAL_PROSPECTS);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [customViews, setCustomViews] = useState<CustomView[]>([]);
  const [activeCustomViewId, setActiveCustomViewId] = useState<string | null>(null);
  const [prospectDisplayMode, setProspectDisplayMode] = useState<'table' | 'kanban'>('table');

  // Document Vault States
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [documentVersions, setDocumentVersions] = useState<DocumentVersion[]>(INITIAL_DOCUMENT_VERSIONS);
  const [documentWorkItemLinks, setDocumentWorkItemLinks] = useState<DocumentWorkItemLink[]>(INITIAL_DOCUMENT_WORK_ITEM_LINKS);
  const [isDocumentVaultOpen, setIsDocumentVaultOpen] = useState<boolean>(false);

  // Load data asynchronously from the central API Client on mount.
  // This mirrors standard production patterns, allowing direct replacement with back-end calls.
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [
          loadedEnquiries,
          loadedExpenses,
          loadedTasks,
          loadedEmails,
          loadedHrEmployees,
          loadedProspects,
          loadedCampaigns,
          loadedCustomViews,
          loadedDocVault,
        ] = await Promise.all([
          apiClient.enquiries.list(),
          apiClient.expenses.list(),
          apiClient.tasks.list(),
          apiClient.emails.list(),
          apiClient.hrEmployees.list(),
          apiClient.prospects.list(),
          apiClient.campaigns.list(),
          apiClient.customViews.list(),
          apiClient.documents.list(),
        ]);
        setEnquiries(loadedEnquiries);
        setExpenses(loadedExpenses);
        setTasks(loadedTasks);
        setEmails(loadedEmails);
        setHrEmployees(loadedHrEmployees);
        setProspects(loadedProspects);
        setCampaigns(loadedCampaigns);
        setCustomViews(loadedCustomViews);
        if (loadedDocVault) {
          setDocuments(loadedDocVault.documents);
          setDocumentVersions(loadedDocVault.versions);
          setDocumentWorkItemLinks(loadedDocVault.links);
        }
      } catch (err) {
        console.error('Failed to load initial data from API client:', err);
      }
    };
    loadInitialData();
  }, []);

  const [currentView, setCurrentView] = useState<string>('sales-tracker');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('ENQ-2026-0012');
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Email Client States
  const [emailFolder, setEmailFolder] = useState<string>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>('MSG-001');
  const [emailComposeOpen, setEmailComposeOpen] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeCc, setComposeCc] = useState<string>('');
  const [composeBcc, setComposeBcc] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [composeEnquiry, setComposeEnquiry] = useState<string>('');
  const [composeAttachments, setComposeAttachments] = useState<EmailAttachment[]>([]);
  const [emailSearchQuery, setEmailSearchQuery] = useState<string>('');
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [draftSavedStatus, setDraftSavedStatus] = useState<string>('');

  // Sourcing & desk workflow helper inputs
  const [inputBaseCost, setInputBaseCost] = useState<string>('1450');
  const [inputLogistics, setInputLogistics] = useState<string>('180');
  const [inputMargin, setInputMargin] = useState<string>('120');
  const [sampleTrackingInput, setSampleTrackingInput] = useState<string>('DHL-8877-VACC');
  const [selectedVessel, setSelectedVessel] = useState<string>('ONE Blue Ocean V-092');

  // Task Chat & Collaborator Workspace State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [chatCommentText, setChatCommentText] = useState<string>('');

  // Outbound Marketing Assistant States
  const [aiGeneratingId, setAiGeneratingId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string>('Premium');
  const [customSearchPrompt, setCustomSearchPrompt] = useState<string>('');

  // Trigger brief alert notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

 const enquiriesWithTasks = useMemo(() => {
    return enquiries.map(e => ({
      ...e,
      tasks: tasks.filter(t => t.parentEnquiryId === e.id || t.linkedRecord === e.id)
    }));
  }, [enquiries, tasks]);

  const activeEnquiry = useMemo(() => {
  const enq = enquiriesWithTasks.find(e => e.id === selectedEnquiryId) || enquiriesWithTasks[0]!;
    return enq;
  }, [enquiriesWithTasks, selectedEnquiryId]);



  



  const globalTasks = useMemo(() => {
    return tasks;
  }, [tasks]);

  // Selected single task details for Chat Drawer
  const activeTaskDetails = useMemo(() => {
    if (!activeTaskId) return null;
    return globalTasks.find(t => t.id === activeTaskId) || null;
  }, [globalTasks, activeTaskId]);

  // Filters tasks assigned directly to the simulated operator OR watched/collaborating via @mentions
  const personalTasks = useMemo(() => {
    return globalTasks.filter(t =>
      t.assignee === currentUser.name ||
      (t.department === currentUser.department && (t.assignee === 'Anyone' || t.assignee === currentUser.name || !currentUser.isManager)) ||
      (t.watchers && t.watchers.includes(currentUser.name))
    );
  }, [globalTasks, currentUser]);

  const checkPermissions = (targetView: string): boolean => {
    if (currentUser.isPresident || currentUser.isAdmin) return true;
    if (targetView === 'personal-email') return true;

    // Spend Management permission gates
    if (targetView.startsWith('spend-')) {
      if (targetView === 'spend-overview' || targetView === 'spend-accounting') {
        // Accounting dashboard & work queue requires Accounting dept
        return currentUser.department === 'Accounting' || currentUser.isPresident || currentUser.isAdmin;
      }
      if (targetView === 'spend-approvals') {
        // Manager views pending approvals
        return currentUser.isManager || currentUser.isPresident || currentUser.isAdmin;
      }
      return true; // Everyone can access My Expenses, Requests, Claims
    }

    // Sales Front-End checks (Global Enquiry + Sales Enquiry + Prospects + Submodules)
    if (['global-enquiry', 'sales-enquiry', 'sales-tracker', 'sales-prospects', 'sales-quotations', 'sales-sampling', 'sales-pos', 'sales-vendors', 'sales-contracts', 'enquiry-detail'].includes(targetView)) {
      if (targetView === 'global-enquiry') return true; // Global Enquiry is open for cross-department & executive reference
      return currentUser.department === 'Sales' || currentUser.isPresident || currentUser.isAdmin;
    }

    // Operations Staff checks (Only the staff member's specific department)
    if (targetView === 'ops-costing') return currentUser.department === 'Costing';
    if (targetView === 'ops-sampling') return currentUser.department === 'Sampling';
    if (targetView === 'ops-logistics') return currentUser.department === 'Logistics';
    if (targetView === 'ops-compliance') return currentUser.department === 'Compliance';
    if (targetView === 'ops-hr') return currentUser.department === 'HR';

    // Dashboards check (Requires BOTH correct department AND Manager/Head status)
    if (targetView === 'dash-sales') return (currentUser.department === 'Sales' && currentUser.isManager);
    if (targetView === 'dash-costing') return (currentUser.department === 'Costing' && currentUser.isManager);
    if (targetView === 'dash-sampling') return (currentUser.department === 'Sampling' && currentUser.isManager);
    if (targetView === 'dash-logistics') return (currentUser.department === 'Logistics' && currentUser.isManager);
    if (targetView === 'dash-compliance') return (currentUser.department === 'Compliance' && currentUser.isManager);
    if (targetView === 'dash-hr') return (currentUser.department === 'HR' && currentUser.isManager);

    if (targetView === 'presidential-overview') return !!currentUser.isPresident;

    return true; // My Tasks is public
  };

  // Costing Workflow State Handlers
  const handleCreateCostingRequest = (enquiryId: string, salesNote: string, priority: 'Low' | 'Medium' | 'High', dueDate: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
        // Prevent duplicate creation
        if (item.costingRequest) return item;

        const generatedTaskId = `TSK-CST-${Math.floor(Math.random() * 900) + 100}`;
        const newCostingTask: Task = {
          id: generatedTaskId,
          title: `Costing compilation: ${item.product}`,
          type: 'Action Item',
          assignee: 'Sarah Jenkins', // default assigned to Head of costing or empty
          department: 'Costing',
          dueDate: dueDate,
          priority: priority,
          status: 'Pending',
          linkedRecord: item.id,
          description: `Sales Request note: ${salesNote}`,
          watchers: ['Sarah Jenkins'],
          comments: []
        };

        const newRequest = {
          id: `CR-${item.id.split('-').pop()}`,
          enquiryId: item.id,
          status: 'Requested' as const,
          assignee: 'Sarah Jenkins',
          salesNote: salesNote,
          priority: priority,
          dueDate: dueDate,
          createdDate: new Date().toISOString().split('T')[0]!,
          components: [],
          documents: [],
          comments: [
            {
              id: `CC-${Date.now()}`,
              author: currentUser.name,
              text: `Costing request initiated. Note: "${salesNote}"`,
              date: 'Just now'
            }
          ],
          internalRequests: []
        };

        return {
          ...item,
          status: 'Costing Phase',
          tasks: [...item.tasks, newCostingTask],
          costingRequest: newRequest,
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Sales requested costing desk calculation. Note: "${salesNote}"`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Costing request created for ${enquiryId}`);
  };

  const handleAssignCostingRequest = (enquiryId: string, assigneeName: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        const nextStatus = item.costingRequest.status === 'Requested' ? 'In Progress' : item.costingRequest.status;

        // Also update assignee of the main Costing task on this enquiry if it exists
        const updatedTasks = item.tasks.map(t => {
          if (t.department === 'Costing' && t.status !== 'Completed') {
            return { ...t, assignee: assigneeName };
          }
          return t;
        });

        return {
          ...item,
          tasks: updatedTasks,
          costingRequest: {
            ...item.costingRequest,
            assignee: assigneeName,
            status: nextStatus as any,
            comments: [
              ...item.costingRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Assigned costing request to ${assigneeName}`,
                date: 'Just now'
              }
            ]
          },
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Costing request for ${item.id} assigned to ${assigneeName}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Assigned costing analyst: ${assigneeName}`);
  };

  const handleUpdateCostingComponent = (
    enquiryId: string,
    componentId: string | null,
    name: string,
    cost: number,
    category: 'Packaging' | 'Transportation' | 'Procurement' | 'Logistics',
    notes?: string,
    isDelete?: boolean
  ) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        let updatedComponents = [...item.costingRequest.components];
        if (componentId === null) {
          // Add
          const newComp = {
            id: `CST-COMP-${Date.now()}`,
            name,
            cost,
            category,
            notes
          };
          updatedComponents.push(newComp);
        } else if (isDelete) {
          // Delete
          updatedComponents = updatedComponents.filter(c => c.id !== componentId);
        } else {
          // Update
          updatedComponents = updatedComponents.map(c => {
            if (c.id === componentId) {
              return { ...c, name, cost, category, notes };
            }
            return c;
          });
        }

        return {
          ...item,
          costingRequest: {
            ...item.costingRequest,
            components: updatedComponents
          }
        };
      }
      return item;
    }));
    triggerToast(`Costing component successfully updated.`);
  };

  const handleRequestInternalTask = (
    enquiryId: string,
    title: string,
    department: string,
    assignee: string,
    description: string,
    priority: string,
    dueDate: string
  ) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        const generatedTaskId = `TSK-INT-${Math.floor(Math.random() * 900) + 100}`;
        const newInternalTask: Task = {
          id: generatedTaskId,
          title: title,
          type: 'Internal Request',
          assignee: assignee,
          department: department,
          dueDate: dueDate,
          priority: priority,
          status: 'Pending',
          linkedRecord: item.id,
          description: description,
          watchers: [currentUser.name, assignee],
          comments: []
        };

        return {
          ...item,
          tasks: [...item.tasks, newInternalTask],
          costingRequest: {
            ...item.costingRequest,
            status: item.costingRequest.status === 'In Progress' ? 'Awaiting Inputs' : item.costingRequest.status,
            internalRequests: [...item.costingRequest.internalRequests, newInternalTask],
            comments: [
              ...item.costingRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Dispatched internal task ${generatedTaskId} to ${department} (${assignee}): "${title}"`,
                date: 'Just now'
              }
            ]
          },
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Costing Desk dispatched internal task [${generatedTaskId}] to ${department} Desk.`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Internal task dispatched to ${department} Desk.`);
  };

  const handleSubmitCostingRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        return {
          ...item,
          costingRequest: {
            ...item.costingRequest,
            status: 'Ready for Review' as const,
            comments: [
              ...item.costingRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Submitted compiled costing models for management validation.`,
                date: 'Just now'
              }
            ]
          },
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Costing Desk analyst submitted pricing sheet for approval.`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Costing sheet submitted to manager.`);
  };

  const handleApproveCostingRequest = (
    enquiryId: string,
    baseCost: number,
    logistics: number,
    margin: number
  ) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        const totalCost = baseCost + logistics + margin;

        // Automatically resolve Costing tasks on this enquiry
        const updatedTasks = item.tasks.map(t => {
          if (t.department === 'Costing') {
            return { ...t, status: 'Completed' };
          }
          return t;
        });

        return {
          ...item,
          tasks: updatedTasks,
          costingRequest: {
            ...item.costingRequest,
            status: 'Approved' as const,
            approvedCosting: {
              baseCost,
              logistics,
              margin,
              total: totalCost
            },
            comments: [
              ...item.costingRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Costing request APPROVED. Base: $${baseCost.toLocaleString()}, Logistics: $${logistics.toLocaleString()}, Margin: $${margin.toLocaleString()}, Total: $${totalCost.toLocaleString()}`,
                date: 'Just now'
              }
            ]
          },
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Costing request approved by ${currentUser.name}. Total pricing calculated: $${totalCost.toLocaleString()}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Costing request successfully approved.`);
  };

  const handleRejectCostingRequest = (enquiryId: string, note: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        return {
          ...item,
          costingRequest: {
            ...item.costingRequest,
            status: 'In Progress' as const,
            comments: [
              ...item.costingRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `REJECTED/REVISION REQUIRED. Feedback: "${note}"`,
                date: 'Just now'
              }
            ]
          },
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Costing sheet rejected for revision: "${note}"`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Costing sheet rejected and sent back for revision.`);
  };

  const handlePrepareQuotationFromCosting = (enquiryId: string, quoteId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest && item.costingRequest.approvedCosting) {
        const appCost = item.costingRequest.approvedCosting;
        const updatedQuotations = item.quotations.map(q => {
          if (q.id === quoteId) {
            return {
              ...q,
              stage: 'Review',
              costSheetUploaded: true,
              pricing: {
                baseCost: `$${appCost.baseCost.toLocaleString()}`,
                logistics: `$${appCost.logistics.toLocaleString()}`,
                margin: `$${appCost.margin.toLocaleString()}`,
                finalPrice: `$${appCost.total.toLocaleString()}`
              }
            };
          }
          return q;
        });

        return {
          ...item,
          status: 'Internal Review',
          quotations: updatedQuotations,
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Quotation Prepared using Approved Costing index. Base Price Locked: $${appCost.total.toLocaleString()}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast(`Quotation updated with approved Costing components.`);
  };

  const handleAddCostingComment = (enquiryId: string, text: string) => {
    if (!text.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        return {
          ...item,
          costingRequest: {
            ...item.costingRequest,
            comments: [
              ...item.costingRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: text,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Costing comment published.`);
  };

  const handleAddCostingDocument = (enquiryId: string, fileName: string) => {
    if (!fileName.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.costingRequest) {
        return {
          ...item,
          costingRequest: {
            ...item.costingRequest,
            documents: [
              ...item.costingRequest.documents,
              {
                id: `CD-${Date.now()}`,
                fileName: fileName,
                uploadedBy: currentUser.name,
                uploadedDate: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Costing document attached.`);
  };

  // -------------------------------------------------------------
  // SAMPLING WORKFLOW HANDLERS
  // -------------------------------------------------------------
  const handleAssignSamplingRequest = (enquiryId: string, assigneeName: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        const nextStatus = item.samplingRequest.status === 'Requested' ? 'In Progress' : item.samplingRequest.status;
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            assignee: assigneeName,
            status: nextStatus as any,
            comments: [
              ...item.samplingRequest.comments,
              {
                id: `SC-${Date.now()}`,
                author: currentUser.name,
                text: `Assigned sampling request to ${assigneeName}`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Assigned sampling analyst: ${assigneeName}`);
  };

  const handleUpdateSamplingDetails = (enquiryId: string, details: Partial<Omit<SamplingRequest, 'id' | 'enquiryId' | 'comments' | 'documents' | 'internalRequests'>>) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            ...details
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling request specifications updated.`);
  };

  const handleSubmitSamplingRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            status: 'Ready for Review' as const,
            comments: [
              ...item.samplingRequest.comments,
              {
                id: `SC-${Date.now()}`,
                author: currentUser.name,
                text: `Submitted physical sample files & metrics for management review.`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling package submitted to manager.`);
  };

  const handleApproveSamplingRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        // Resolve matching sampling tasks
        setTasks(prevT => prevT.map(t => {
          if (t.linkedRecord === enquiryId && t.department === 'Sampling') {
            return { ...t, status: 'Completed' };
          }
          return t;
        }));
        return {
          ...item,
          sampling: {
            ...item.sampling,
            stage: 'Approved',
            trackingNumber: item.samplingRequest.trackingNumber || 'DHL-992-APPROVED'
          },
          samplingRequest: {
            ...item.samplingRequest,
            status: 'Approved' as const,
            comments: [
              ...item.samplingRequest.comments,
              {
                id: `SC-${Date.now()}`,
                author: currentUser.name,
                text: `Sampling package APPROVED & SEALED.`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling request successfully approved.`);
  };

  const handleRejectSamplingRequest = (enquiryId: string, note: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            status: 'In Progress' as const,
            comments: [
              ...item.samplingRequest.comments,
              {
                id: `SC-${Date.now()}`,
                author: currentUser.name,
                text: `REJECTED/REVISION REQUIRED: "${note}"`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling request sent back for revision.`);
  };

  const handleAddSamplingComment = (enquiryId: string, text: string) => {
    if (!text.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            comments: [
              ...item.samplingRequest.comments,
              {
                id: `SC-${Date.now()}`,
                author: currentUser.name,
                text,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling comment published.`);
  };

  const handleAddSamplingDocument = (enquiryId: string, fileName: string) => {
    if (!fileName.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            documents: [
              ...item.samplingRequest.documents,
              {
                id: `SD-${Date.now()}`,
                fileName,
                uploadedBy: currentUser.name,
                uploadedDate: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling certificate attached.`);
  };

  const handleRequestSamplingInternalTask = (
    enquiryId: string,
    title: string,
    department: string,
    assignee: string,
    description: string,
    priority: string,
    dueDate: string
  ) => {
    const generatedTaskId = `TSK-SMP-${Math.floor(Math.random() * 900) + 100}`;
    const newInternalTask: Task = {
      id: generatedTaskId,
      title,
      type: 'Internal Request',
      assignee,
      department,
      dueDate,
      priority,
      status: 'Pending',
      linkedRecord: enquiryId,
      description,
      watchers: [currentUser.name, assignee],
      comments: [],
      category: 'Sampling',
      linkType: 'Enquiry',
      linkedRecordName: enquiryId
    };

    setTasks(prev => [...prev, newInternalTask]);
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.samplingRequest) {
        return {
          ...item,
          samplingRequest: {
            ...item.samplingRequest,
            internalRequests: [...item.samplingRequest.internalRequests, newInternalTask]
          }
        };
      }
      return item;
    }));
    triggerToast(`Sampling internal task dispatched.`);
  };


  // -------------------------------------------------------------
  // LOGISTICS WORKFLOW HANDLERS
  // -------------------------------------------------------------
  const handleAssignLogisticsRequest = (enquiryId: string, assigneeName: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        const nextStatus = item.logisticsRequest.status === 'Requested' ? 'In Progress' : item.logisticsRequest.status;
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            assignee: assigneeName,
            status: nextStatus as any,
            comments: [
              ...item.logisticsRequest.comments,
              {
                id: `LC-${Date.now()}`,
                author: currentUser.name,
                text: `Assigned logistics booking task to ${assigneeName}`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Assigned logistics analyst: ${assigneeName}`);
  };

  const handleUpdateLogisticsDetails = (enquiryId: string, details: Partial<Omit<LogisticsRequest, 'id' | 'enquiryId' | 'comments' | 'documents' | 'internalRequests'>>) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            ...details
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics freight specifications updated.`);
  };

  const handleSubmitLogisticsRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            status: 'Ready for Review' as const,
            comments: [
              ...item.logisticsRequest.comments,
              {
                id: `LC-${Date.now()}`,
                author: currentUser.name,
                text: `Submitted shipping files & transport plans for management validation.`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics plan submitted to manager.`);
  };

  const handleApproveLogisticsRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        setTasks(prevT => prevT.map(t => {
          if (t.linkedRecord === enquiryId && t.department === 'Logistics') {
            return { ...t, status: 'Completed' };
          }
          return t;
        }));
        return {
          ...item,
          purchaseOrder: item.purchaseOrder ? {
            ...item.purchaseOrder,
            stage: 'Dispatch',
            carrier: item.logisticsRequest.carrier || 'ONE Line',
            shippingContainerCount: `${item.logisticsRequest.containerType || '1x 20ft General'}`
          } : {
            id: `PO-${Date.now().toString().slice(-4)}`,
            stage: 'Dispatch',
            totalValue: '$32,000',
            shippingContainerCount: `${item.logisticsRequest.containerType || '1x 20ft'}`,
            carrier: item.logisticsRequest.carrier || 'ONE Ocean Network Express',
            loadingDate: item.logisticsRequest.loadingDate || '2026-08-10'
          },
          logisticsRequest: {
            ...item.logisticsRequest,
            status: 'Approved' as const,
            comments: [
              ...item.logisticsRequest.comments,
              {
                id: `LC-${Date.now()}`,
                author: currentUser.name,
                text: `Logistics vessel slot and rates APPROVED.`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics request successfully approved.`);
  };

  const handleRejectLogisticsRequest = (enquiryId: string, note: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            status: 'In Progress' as const,
            comments: [
              ...item.logisticsRequest.comments,
              {
                id: `LC-${Date.now()}`,
                author: currentUser.name,
                text: `REJECTED/REVISION REQUIRED: "${note}"`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics request sent back for revision.`);
  };

  const handleAddLogisticsComment = (enquiryId: string, text: string) => {
    if (!text.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            comments: [
              ...item.logisticsRequest.comments,
              {
                id: `LC-${Date.now()}`,
                author: currentUser.name,
                text,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics comment published.`);
  };

  const handleAddLogisticsDocument = (enquiryId: string, fileName: string) => {
    if (!fileName.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            documents: [
              ...item.logisticsRequest.documents,
              {
                id: `LD-${Date.now()}`,
                fileName,
                uploadedBy: currentUser.name,
                uploadedDate: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics document attached.`);
  };

  const handleRequestLogisticsInternalTask = (
    enquiryId: string,
    title: string,
    department: string,
    assignee: string,
    description: string,
    priority: string,
    dueDate: string
  ) => {
    const generatedTaskId = `TSK-LOG-${Math.floor(Math.random() * 900) + 100}`;
    const newInternalTask: Task = {
      id: generatedTaskId,
      title,
      type: 'Internal Request',
      assignee,
      department,
      dueDate,
      priority,
      status: 'Pending',
      linkedRecord: enquiryId,
      description,
      watchers: [currentUser.name, assignee],
      comments: [],
      category: 'Logistics',
      linkType: 'Enquiry',
      linkedRecordName: enquiryId
    };

    setTasks(prev => [...prev, newInternalTask]);
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.logisticsRequest) {
        return {
          ...item,
          logisticsRequest: {
            ...item.logisticsRequest,
            internalRequests: [...item.logisticsRequest.internalRequests, newInternalTask]
          }
        };
      }
      return item;
    }));
    triggerToast(`Logistics internal task dispatched.`);
  };


  // -------------------------------------------------------------
  // COMPLIANCE WORKFLOW HANDLERS
  // -------------------------------------------------------------
  const handleAssignComplianceRequest = (enquiryId: string, assigneeName: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        const nextStatus = item.complianceRequest.status === 'Requested' ? 'In Progress' : item.complianceRequest.status;
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            assignee: assigneeName,
            status: nextStatus as any,
            comments: [
              ...item.complianceRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Assigned compliance audit to ${assigneeName}`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Assigned compliance analyst: ${assigneeName}`);
  };

  const handleUpdateComplianceDetails = (enquiryId: string, details: Partial<Omit<ComplianceRequest, 'id' | 'enquiryId' | 'comments' | 'documents' | 'internalRequests'>>) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            ...details
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance parameters updated.`);
  };

  const handleSubmitComplianceRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            status: 'Ready for Review' as const,
            comments: [
              ...item.complianceRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Submitted quarantine audits and farm certification checklists for head sign-off.`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance files submitted to manager.`);
  };

  const handleApproveComplianceRequest = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        setTasks(prevT => prevT.map(t => {
          if (t.linkedRecord === enquiryId && t.department === 'Compliance') {
            return { ...t, status: 'Completed' };
          }
          return t;
        }));
        return {
          ...item,
          vendorApproval: {
            ...item.vendorApproval,
            stage: 'Approved',
            complianceCheck: 'Passed Clean'
          },
          complianceRequest: {
            ...item.complianceRequest,
            status: 'Approved' as const,
            comments: [
              ...item.complianceRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `Compliance and agricultural clearances APPROVED and locked.`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance request successfully approved.`);
  };

  const handleRejectComplianceRequest = (enquiryId: string, note: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            status: 'In Progress' as const,
            comments: [
              ...item.complianceRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text: `REJECTED/REVISION REQUIRED: "${note}"`,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance request sent back for revision.`);
  };

  const handleAddComplianceComment = (enquiryId: string, text: string) => {
    if (!text.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            comments: [
              ...item.complianceRequest.comments,
              {
                id: `CC-${Date.now()}`,
                author: currentUser.name,
                text,
                date: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance comment published.`);
  };

  const handleAddComplianceDocument = (enquiryId: string, fileName: string) => {
    if (!fileName.trim()) return;
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            documents: [
              ...item.complianceRequest.documents,
              {
                id: `CD-${Date.now()}`,
                fileName,
                uploadedBy: currentUser.name,
                uploadedDate: 'Just now'
              }
            ]
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance document attached.`);
  };

  const handleRequestComplianceInternalTask = (
    enquiryId: string,
    title: string,
    department: string,
    assignee: string,
    description: string,
    priority: string,
    dueDate: string
  ) => {
    const generatedTaskId = `TSK-CMP-${Math.floor(Math.random() * 900) + 100}`;
    const newInternalTask: Task = {
      id: generatedTaskId,
      title,
      type: 'Internal Request',
      assignee,
      department,
      dueDate,
      priority,
      status: 'Pending',
      linkedRecord: enquiryId,
      description,
      watchers: [currentUser.name, assignee],
      comments: [],
      category: 'Compliance',
      linkType: 'Enquiry',
      linkedRecordName: enquiryId
    };

    setTasks(prev => [...prev, newInternalTask]);
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId && item.complianceRequest) {
        return {
          ...item,
          complianceRequest: {
            ...item.complianceRequest,
            internalRequests: [...item.complianceRequest.internalRequests, newInternalTask]
          }
        };
      }
      return item;
    }));
    triggerToast(`Compliance internal task dispatched.`);
  };


  // -------------------------------------------------------------
  // HR OPERATIONS HANDLERS
  // -------------------------------------------------------------
  const handleCreateHREmployee = (empData: Omit<HREmployee, 'onboardingChecklist' | 'offboardingChecklist' | 'trainingModules' | 'documents' | 'attendanceRequests'>) => {
    const newEmp: HREmployee = {
      ...empData,
      onboardingChecklist: [
        { task: 'Submit signed employment agreement', completed: false },
        { task: 'Set up company email and Slack', completed: false },
        { task: 'Complete initial trade compliance webinar', completed: false },
        { task: 'Upload passport & medical clearances', completed: false }
      ],
      offboardingChecklist: [
        { task: 'Deactivate corporate email & accounts', completed: false },
        { task: 'Return company hardware & devices', completed: false },
        { task: 'Conduct exit feedback interview', completed: false }
      ],
      trainingModules: [
        { name: 'Global Sourcing & Anti-Bribery Policy', completed: false },
        { name: 'Phytosanitary & Quarantine Regulatory Standards', completed: false }
      ],
      documents: [],
      attendanceRequests: []
    };

    setHrEmployees(prev => [...prev, newEmp]);
    triggerToast(`Created new HR employee card: ${empData.name}`);
  };

  const handleUpdateHREmployeeDetails = (employeeId: string, fields: Partial<Pick<HREmployee, 'role' | 'department' | 'email' | 'status' | 'notes'>>) => {
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return { ...emp, ...fields };
      }
      return emp;
    }));
    triggerToast(`HR employee records updated.`);
  };

  const handleToggleHROnboardingCheck = (employeeId: string, taskText: string) => {
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          onboardingChecklist: emp.onboardingChecklist.map(item =>
            item.task === taskText ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return emp;
    }));
    triggerToast(`HR onboarding checklist updated.`);
  };

  const handleToggleHROffboardingCheck = (employeeId: string, taskText: string) => {
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          offboardingChecklist: emp.offboardingChecklist.map(item =>
            item.task === taskText ? { ...item, completed: !item.completed } : item
          )
        };
      }
      return emp;
    }));
    triggerToast(`HR offboarding checklist updated.`);
  };

  const handleToggleHRTrainingCheck = (employeeId: string, moduleName: string) => {
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          trainingModules: emp.trainingModules.map(item =>
            item.name === moduleName
              ? { ...item, completed: !item.completed, date: !item.completed ? new Date().toISOString().split('T')[0] : undefined }
              : item
          )
        };
      }
      return emp;
    }));
    triggerToast(`HR training certifications adjusted.`);
  };

  const handleUploadHRDocument = (employeeId: string, name: string, type: string) => {
    if (!name.trim()) return;
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          documents: [
            ...emp.documents,
            {
              id: `HRD-${Date.now()}`,
              name,
              type,
              date: new Date().toISOString().split('T')[0]!
            }
          ]
        };
      }
      return emp;
    }));
    triggerToast(`HR Document file uploaded.`);
  };

  const handleCreateHRAttendanceRequest = (employeeId: string, type: string, startDate: string, endDate: string) => {
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          attendanceRequests: [
            ...emp.attendanceRequests,
            {
              id: `ATT-${Date.now()}`,
              type,
              startDate,
              endDate,
              status: 'Pending'
            }
          ]
        };
      }
      return emp;
    }));
    triggerToast(`Attendance/Leave request logged in HR queue.`);
  };

  const handleActionHRAttendanceRequest = (employeeId: string, requestId: string, status: 'Approved' | 'Rejected') => {
    setHrEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          attendanceRequests: emp.attendanceRequests.map(req =>
            req.id === requestId ? { ...req, status } : req
          )
        };
      }
      return emp;
    }));
    triggerToast(`Leave request ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`);
  };

  const handleAddComment = (taskId: string, text: string) => {
    if (!text.trim()) return;

    // Scan the text block for @Member name mentions to dynamically invite them to the task watchers array
    const mentionedMembers: string[] = [];
    Object.values(USERS).forEach(user => {
      if (text.includes(`@${user.name}`)) {
        mentionedMembers.push(user.name);
      }
    });

    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newComment = {
          id: Date.now(),
          author: currentUser.name,
          text: text,
          date: 'Just now'
        };

            const updatedWatchers = [...(t.watchers || [])];
        mentionedMembers.forEach(m => {
          if (!updatedWatchers.includes(m)) {
            updatedWatchers.push(m);
          }
 
        });

       
        return {
         ...t,
          watchers: updatedWatchers,
          comments: [...(t.comments || []), newComment]
        };
      }
      return t;
    }));


// Find if the task is linked to an enquiry to push to timeline
    const targetTask = tasks.find(t => t.id === taskId);
    const parentEnquiryId = targetTask?.parentEnquiryId || targetTask?.linkedRecord;

    if (parentEnquiryId && mentionedMembers.length > 0) {
      setEnquiries(prev => prev.map(item => {
        if (item.id === parentEnquiryId) {
          const timelineMemos = mentionedMembers.map(m => ({
            id: Date.now() + Math.random(),
            text: `${currentUser.name} mentioned and invited @${m} to Task ${taskId} chat.`,
            user: 'System',
            date: 'Just now'
          }));
          return {
            ...item,
            timeline: [...item.timeline, ...timelineMemos]
          };
        }
        return item;
      }));
    }


    setChatCommentText('');
    triggerToast(mentionedMembers.length > 0
      ? `Task chat updated. Invited: ${mentionedMembers.join(', ')}`
      : 'Message published to internal task thread.'
    );
  };

  const handleMarkComplete = (taskId: string) => {
   setTasks(prev => prev.map(t => {
      if (t.id === taskId) return { ...t, status: 'Completed' };
      return t;
    }));

    const targetTask = tasks.find(t => t.id === taskId);
    const parentEnquiryId = targetTask?.parentEnquiryId || targetTask?.linkedRecord;

    if (parentEnquiryId) {
      setEnquiries(prev => prev.map(item => {
        if (item.id === parentEnquiryId) {
          return {
            ...item,
            timeline: [
              ...item.timeline,
              {
                id: Date.now(),
                text: `Task [${taskId}] marked completed.`,
                user: currentUser.name,
                date: 'Just now'
              }
            ]
          };
        }
        return item;
      }));
    }

    triggerToast(`Task ${taskId} resolved.`);
  };

  // Create Task (Global / Cross-Departmental)
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'status' | 'comments' | 'watchers' | 'creator'>) => {
    const generatedTaskId = `TSK-${Math.floor(Math.random() * 900) + 100}`;
    const newTask: Task = {
      ...taskData,
      id: generatedTaskId,
      status: 'Pending',
      comments: [],
      watchers: taskData.assignee !== 'Anyone' ? [taskData.assignee] : [],
      creator: currentUser.name
    };

    setTasks(prev => [...prev, newTask]);

    const linkedId = taskData.parentEnquiryId || taskData.linkedRecord;
    if (linkedId) {
      setEnquiries(prev => prev.map(item => {
        if (item.id === linkedId) {
          return {
            ...item,
            timeline: [
              ...item.timeline,
              {
                id: Date.now(),
                text: `New task [${generatedTaskId}] created and linked: ${taskData.title}`,
                user: currentUser.name,
                date: 'Just now'
              }
            ]
          };
        }
        return item;
      }));
    }

    triggerToast(`Task ${generatedTaskId} created successfully.`);
  };

  // Re-assign or delegate a department task to a specific person
  const handleAssignTask = (taskId: string, assigneeName: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
                 ...t,
          assignee: assigneeName,
          watchers: [...new Set([...(t.watchers || []), assigneeName])]
        };
      }
      return t;
    }));
    triggerToast(`Task assigned to ${assigneeName}.`);
  };

  const handleSourcingCostSubmit = (enquiryId: string, quoteId: string) => {
    const calculatedSum = parseFloat(inputBaseCost) + parseFloat(inputLogistics) + parseFloat(inputMargin);
    if (isNaN(calculatedSum)) {
      triggerToast('Ensure valid decimal inputs.');
      return;
    }

    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
        const updatedQuotations = item.quotations.map(q => {
          if (q.id === quoteId) {
            return {
              ...q,
              stage: 'Review',
              costSheetUploaded: true,
              pricing: {
                baseCost: `$${parseFloat(inputBaseCost).toLocaleString()}`,
                logistics: `$${parseFloat(inputLogistics).toLocaleString()}`,
                margin: `$${parseFloat(inputMargin).toLocaleString()}`,
                finalPrice: `$${calculatedSum.toLocaleString()}`
              }
            };
          }
          return q;
        });

         setTasks(prev => prev.map(t => {
          if (t.parentEnquiryId === enquiryId && t.department === 'Costing') {
            return { ...t, status: 'Completed' };
          }
          return t;
        }));

        return {
          ...item,
          status: 'Internal Review',
          quotations: updatedQuotations,

          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Pricing calculated by Costing Desk. Base quote configured: $${calculatedSum.toLocaleString()}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast('Cost spreadsheet compiled and dispatched to Front-End.');
  };

  const handleSamplingSubmit = (enquiryId: string, trackingNo: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
      setTasks(prevT => prevT.map(t => {
          if (t.parentEnquiryId === enquiryId && t.department === 'Sampling') return { ...t, status: 'Completed' };
          return t;
        }));        return {
          ...item,
          sampling: {
            ...item.sampling,
            stage: 'Shipped',
            trackingNumber: trackingNo
          },

          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Sample dispatched under Waybill: ${trackingNo}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast('Tracking waybill registered.');
  };

  const handleLogisticsSubmit = (enquiryId: string, vesselName: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
         setTasks(prevT => prevT.map(t => {
          if (t.parentEnquiryId === enquiryId && t.department === 'Logistics') return { ...t, status: 'Completed' };
          return t;
        }));
        return {
          ...item,
          purchaseOrder: item.purchaseOrder ? {
            ...item.purchaseOrder,
            stage: 'Dispatch',
            carrier: vesselName
          } : null,
          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Vessel slot locked: ${vesselName}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast('Ocean vessel booking finalized.');
  };

  const handleComplianceSubmit = (enquiryId: string) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
        setTasks(prevT => prevT.map(t => {
          if (t.parentEnquiryId === enquiryId && t.department === 'Compliance') return { ...t, status: 'Completed' };
          return t;
        }));
        return {
          ...item,
          vendorApproval: {
            ...item.vendorApproval,
            stage: 'Approved',
            complianceCheck: 'Passed Clean'
          },

          timeline: [
            ...item.timeline,
            {
              id: Date.now(),
              text: `Phytosanitary and quarantine release sealed for export logistics.`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return item;
    }));
    triggerToast('Quarantine check released.');
  };

  const handleSaveDraft = (
    toValue: string,
    ccValue: string,
    bccValue: string,
    subjectValue: string,
    bodyValue: string,
    enquiryValue: string,
    filesValue: EmailAttachment[]
  ) => {
    setDraftSavedStatus('Draft Auto-Saved');
    setTimeout(() => setDraftSavedStatus(''), 2000);

    // Save as a draft inside emails list
    setEmails(prev => {
      // Find existing activeDraftId
      const exists = prev.some(m => m.id === activeDraftId);
      if (exists) {
        return prev.map(m => m.id === activeDraftId ? {
          ...m,
          recipient: toValue,
          cc: ccValue,
          bcc: bccValue,
          subject: subjectValue || '(No Subject)',
          body: bodyValue,
          enquiryId: enquiryValue || null,
          attachments: filesValue,
          isDraft: true
        } : m);
      } else {
        // Create new draft
        const draftId = activeDraftId || `DRAFT-${Date.now().toString().slice(-4)}`;
        if (!activeDraftId) {
          setActiveDraftId(draftId);
        }
        const newDraft: Email = {
          id: draftId,
          sender: currentUser.email,
          senderName: currentUser.name,
          recipient: toValue,
          cc: ccValue,
          bcc: bccValue,
          subject: subjectValue || '(No Subject)',
          body: bodyValue,
          date: 'Just now',
          enquiryId: enquiryValue || null,
          unread: false,
          attachments: filesValue,
          isDraft: true
        };
        return [newDraft, ...prev];
      }
    });
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      triggerToast('All email fields are required.');
      return;
    }

    const newMail: Email = {
      id: `MSG-${Date.now().toString().slice(-3)}`,
      sender: currentUser.email,
      senderName: currentUser.name,
      recipient: composeTo,
      cc: composeCc,
      bcc: composeBcc,
      subject: composeSubject,
      body: composeBody,
      date: 'Just now',
      enquiryId: composeEnquiry || null,
      unread: false,
      attachments: composeAttachments,
      isDraft: false
    };

    setEmails(prev => {
      // If we are sending an active draft, replace/remove it
      const filtered = activeDraftId ? prev.filter(m => m.id !== activeDraftId) : prev;
      return [newMail, ...filtered];
    });

    setEmailComposeOpen(false);
    setComposeTo('');
    setComposeCc('');
    setComposeBcc('');
    setComposeSubject('');
    setComposeBody('');
    setComposeEnquiry('');
    setComposeAttachments([]);
    setActiveDraftId(null);
    triggerToast('Email sent to destination queue.');
  };

  const handleToggleStarEmail = (id: string) => {
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
    triggerToast('Starred status updated');
  };

  const handleArchiveEmail = (id: string, archive: boolean) => {
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isArchived: archive } : m));
    triggerToast(archive ? 'Email archived' : 'Email moved to Inbox');
  };

  const handleTrashEmail = (id: string, trash: boolean) => {
    setEmails(prev => prev.map(m => m.id === id ? { ...m, isTrash: trash } : m));
    triggerToast(trash ? 'Email moved to Trash' : 'Email restored');
  };

  const handleDeleteEmailPermanently = (id: string) => {
    setEmails(prev => prev.filter(m => m.id !== id));
    triggerToast('Email deleted permanently');
  };

  // LLM Powered Outreach Email Drafting Function calling central API Client
  const handleGenerateAIOutreach = async (prospectId: string) => {
    const targetProspect = prospects.find(p => p.id === prospectId);
    if (!targetProspect) return;

    setAiGeneratingId(prospectId);
    triggerToast(`Calling Gemini Outbound Assistant...`);

    try {
      const generatedText = await apiClient.ai.generateOutreach(
        targetProspect.contactName,
        targetProspect.companyName,
        targetProspect.cropInterest,
        targetProspect.estimatedVolume,
        selectedTone,
        currentUser.name
      );

      setProspects(prev => prev.map(p => {
        if (p.id === prospectId) {
          return { ...p, aiDraft: generatedText };
        }
        return p;
      }));
      triggerToast(`Outbound email drafted with Gemini Flash AI.`);
    } catch (err: any) {
      console.warn("Outbound Gemini API call failed: ", err.message);
      triggerToast(`Failed to generate AI outreach.`);
    } finally {
      setAiGeneratingId(null);
    }
  };

  // Convert prospect to live enquiry once communication opens
  const promoteProspectToEnquiry = (prospectId: string) => {
    const targetProspect = prospects.find(p => p.id === prospectId);
    if (!targetProspect) return;

    const nextEnqId = `ENQ-2026-${Math.floor(Math.random() * 9000) + 1000}`;
        const generatedTaskId = `TSK-${Math.floor(Math.random() * 900) + 100}`;
    const newEnq: Enquiry = {
      id: nextEnqId,
      customerName: targetProspect.companyName,
      customerContact: targetProspect.contactName,
      product: targetProspect.cropInterest,
      quantity: targetProspect.estimatedVolume,
      destinationPort: 'Hamburg, Germany', // default template destination
      status: 'Costing Phase',
      salesOwner: currentUser.name,
      watchers: [],
      createdDate: new Date().toISOString().split('T')[0]!,
      timeline: [
        { id: 1, text: `Enquiry generated automatically from Outbound Prospects (Promoted: ${targetProspect.companyName})`, user: currentUser.name, date: 'Just now' }
      ],
      quotations: [{
        id: `QTN-2026-${Math.floor(Math.random() * 900) + 100}`,
        version: 'v1.0',
        stage: 'Costing',
        pricing: { baseCost: '—', logistics: '—', margin: '—', finalPrice: '—' },
        costSheetUploaded: false,
        fileName: 'Pending_Costing_Proposal.pdf'
      }],
      sampling: { id: `SMP-2026-${Math.floor(Math.random() * 900) + 100}`, stage: 'Requested', carrier: 'DHL', trackingNumber: 'Pending', notes: 'Outbound request sample match' },
      purchaseOrder: null,
      vendorApproval: { stage: 'Requested', vendorName: 'Indo-Ganges Cooperatives', score: '89 out of 100', complianceCheck: 'Awaiting Assessment' },
      contract: { version: 'v1.0-draft', signatureStatus: 'Awaiting Signature', file: 'Draft_Agreement.pdf' },
           tasks: []
    };
 const initialTask: Task = {
      id: generatedTaskId,
      title: 'Calculate premium cost structures',
      type: 'Action Item',
      assignee: 'Sarah Jenkins',
      department: 'Costing',
      dueDate: '2026-07-26',
      priority: 'High',
      status: 'Pending',
      linkedRecord: nextEnqId,
      description: `Consolidate port costing sheet for ${targetProspect.cropInterest} request.`,
      watchers: [],
      comments: [],
      parentEnquiryId: nextEnqId,
      creator: currentUser.name
    };

    setTasks(prev => [...prev, initialTask]);

    // Add to enquiries
    setEnquiries(prev => [newEnq, ...prev]);
    // Remove or transition prospect state
    setProspects(prev => prev.map(p => {
      if (p.id === prospectId) {
        return { ...p, status: 'Enquiry Active', nextSchedule: `Linked to ${nextEnqId}` };
      }
      return p;
    }));

    setSelectedEnquiryId(nextEnqId);
    setCurrentView('enquiry-detail');
    setActiveTab('Overview');
    triggerToast(`Promoted to active deal: ${nextEnqId}`);
  };

  const filteredEnquiries = useMemo(() => {
    if (!searchQuery.trim()) return enquiries;
    const q = searchQuery.toLowerCase();
    return enquiries.filter(e =>
      e.id.toLowerCase().includes(q) ||
      e.customerName.toLowerCase().includes(q) ||
      e.product.toLowerCase().includes(q)
    );
  }, [enquiries, searchQuery]);

  const userFilteredEmails = useMemo(() => {
    let list = emails;

    // Filter by Folder
    if (emailFolder === 'inbox') {
      // Incoming messages that are not archived and not trashed and not drafts
      list = list.filter(m => m.recipient === currentUser.email && !m.isArchived && !m.isTrash && !m.isDraft);
    } else if (emailFolder === 'sent') {
      // Sent messages that are not archived and not trashed and not drafts
      list = list.filter(m => m.sender === currentUser.email && !m.isArchived && !m.isTrash && !m.isDraft);
    } else if (emailFolder === 'starred') {
      // Starred messages (both sent/received) that are not trashed
      list = list.filter(m => m.isStarred && !m.isTrash);
    } else if (emailFolder === 'archive') {
      // Archived messages that are not trashed
      list = list.filter(m => m.isArchived && !m.isTrash);
    } else if (emailFolder === 'trash') {
      // Trashed messages
      list = list.filter(m => m.isTrash);
    } else if (emailFolder === 'drafts') {
      // Drafts that are not trashed
      list = list.filter(m => m.isDraft && !m.isTrash);
    }

    // Filter by emailSearchQuery if active
    if (emailSearchQuery.trim()) {
      const q = emailSearchQuery.toLowerCase();
      list = list.filter(m =>
        m.subject.toLowerCase().includes(q) ||
        m.body.toLowerCase().includes(q) ||
        m.senderName.toLowerCase().includes(q) ||
        m.recipient.toLowerCase().includes(q) ||
        (m.cc && m.cc.toLowerCase().includes(q)) ||
        (m.bcc && m.bcc.toLowerCase().includes(q)) ||
        (m.enquiryId && m.enquiryId.toLowerCase().includes(q))
      );
    }

    return list;
  }, [emails, emailFolder, currentUser, emailSearchQuery]);

  const activeEmail = useMemo(() => {
    return emails.find(m => m.id === selectedEmailId) || userFilteredEmails[0] || null;
  }, [emails, selectedEmailId, userFilteredEmails]);

  const handleNavClick = (viewKey: string) => {
    if (checkPermissions(viewKey)) {
      setCurrentView(viewKey);
    } else {
      setCurrentView(`denied-${viewKey}`);
    }
  };

  // -------------------------------------------------------------
  // SPEND MANAGEMENT WORKFLOW HANDLERS
  // -------------------------------------------------------------
  const handleCreateExpense = (expenseData: Omit<Expense, 'id' | 'status' | 'timeline' | 'comments'> & { status?: Expense['status'] }) => {
    const generatedId = `EXP-${expenseData.expense_type === 'request' ? 'REQ' : 'CLM'}-${Math.floor(Math.random() * 900) + 100}`;
    const initialStatus = expenseData.status || 'Draft';

    const newExpense: Expense = {
      ...expenseData,
      id: generatedId,
      status: initialStatus,
      timeline: [
        {
          id: `T-${Date.now()}`,
          text: `Expense ${expenseData.expense_type === 'request' ? 'Request' : 'Claim'} created as ${initialStatus}.`,
          user: currentUser.name,
          date: new Date().toLocaleString()
        }
      ],
      comments: []
    };

    setExpenses(prev => [newExpense, ...prev]);
    triggerToast(`${expenseData.expense_type === 'request' ? 'Request' : 'Claim'} [${generatedId}] created.`);
  };

  const handleUpdateExpenseStatus = (expenseId: string, status: Expense['status'], logMsg?: string) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === expenseId) {
        return {
          ...exp,
          status,
          timeline: [
            ...exp.timeline,
            {
              id: `T-${Date.now()}`,
              text: logMsg || `Status updated to ${status}.`,
              user: currentUser.name,
              date: new Date().toLocaleString()
            }
          ]
        };
      }
      return exp;
    }));
    triggerToast(`Expense ${expenseId} status changed to ${status}.`);
  };

  const handleAddExpenseComment = (expenseId: string, commentText: string) => {
    if (!commentText.trim()) return;
    setExpenses(prev => prev.map(exp => {
      if (exp.id === expenseId) {
        return {
          ...exp,
          comments: [
            ...exp.comments,
            {
              id: `C-${Date.now()}`,
              author: currentUser.name,
              text: commentText,
              date: new Date().toLocaleDateString()
            }
          ]
        };
      }
      return exp;
    }));
    triggerToast(`Comment registered on ${expenseId}.`);
  };

  const handleUpdateAccountingDetails = (
    expenseId: string,
    details: { vendorPayee?: string; reimbursableAmount?: number; accountingNotes?: string; status?: Expense['status'] }
  ) => {
    setExpenses(prev => prev.map(exp => {
      if (exp.id === expenseId) {
        const nextStatus = details.status || exp.status;
        const logMsg = `Accounting updated details: ${
          details.vendorPayee ? `Vendor/Payee: ${details.vendorPayee}. ` : ''
        }${
          details.reimbursableAmount !== undefined ? `Reimbursable: ₹${details.reimbursableAmount}. ` : ''
        }${
          details.accountingNotes ? `Notes: ${details.accountingNotes}. ` : ''
        }${
          details.status ? `Status: ${details.status}.` : ''
        }`;

        return {
          ...exp,
          vendorPayee: details.vendorPayee !== undefined ? details.vendorPayee : exp.vendorPayee,
          reimbursableAmount: details.reimbursableAmount !== undefined ? details.reimbursableAmount : exp.reimbursableAmount,
          accountingNotes: details.accountingNotes !== undefined ? details.accountingNotes : exp.accountingNotes,
          status: nextStatus,
          timeline: [
            ...exp.timeline,
            {
              id: `T-${Date.now()}`,
              text: logMsg,
              user: currentUser.name,
              date: new Date().toLocaleString()
            }
          ]
        };
      }
      return exp;
    }));
    triggerToast(`Accounting updated on ${expenseId}.`);
  };

  // -------------------------------------------------------------
  // DOCUMENT VAULT HANDLERS
  // -------------------------------------------------------------
  const toggleDocumentVault = (open?: boolean) => {
    setIsDocumentVaultOpen(prev => open !== undefined ? open : !prev);
  };

  const handleUploadDocument = (
    title: string,
    filePath: string,
    enquiryId: string,
    workItemId?: string,
    owningDept?: string,
    sharedWith?: { users?: string[]; departments?: string[] },
    notes?: string
  ) => {
    const docId = `DOC-${Date.now()}`;
    const verId = `DOC-VER-${Date.now()}`;
    const dept = owningDept || currentUser.department || 'Sales';
    const dateStr = new Date().toISOString().split('T')[0]!;
    const timeStr = new Date().toLocaleString();

    const newDoc: DocumentRecord = {
      id: docId,
      enquiryId,
      owningDepartmentId: dept,
      uploadedBy: currentUser.name,
      currentVersionId: verId,
      title: title || filePath,
      createdAt: dateStr,
      sharedWith
    };

    const newVersion: DocumentVersion = {
      id: verId,
      documentId: docId,
      filePath,
      versionNumber: 1,
      uploadedBy: currentUser.name,
      createdAt: timeStr,
      notes
    };

    setDocuments(prev => [newDoc, ...prev]);
    setDocumentVersions(prev => [newVersion, ...prev]);

    if (workItemId) {
      const newLink: DocumentWorkItemLink = {
        id: `LINK-${Date.now()}`,
        documentId: docId,
        workItemId,
        linkedBy: currentUser.name,
        createdAt: timeStr
      };
      setDocumentWorkItemLinks(prev => [newLink, ...prev]);
    }

    // Add to enquiry timeline
    setEnquiries(prev => prev.map(e => {
      if (e.id === enquiryId) {
        return {
          ...e,
          timeline: [
            ...e.timeline,
            {
              id: Date.now(),
              text: `Document uploaded to Vault: "${newDoc.title}" (${filePath}) ${workItemId ? `linked to request ${workItemId}` : ''}`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return e;
    }));

    triggerToast(`Uploaded "${newDoc.title}" v1.0 to Document Vault.`);
    return newDoc;
  };

  const handleUploadNewDocumentVersion = (
    documentId: string,
    filePath: string,
    notes?: string
  ) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return;

    // Find highest current version number
    const existingVersions = documentVersions.filter(v => v.documentId === documentId);
    const maxVer = existingVersions.reduce((max, v) => Math.max(max, v.versionNumber), 0);
    const newVerNum = maxVer + 1;
    const newVerId = `DOC-VER-${Date.now()}`;
    const timeStr = new Date().toLocaleString();

    const newVersion: DocumentVersion = {
      id: newVerId,
      documentId,
      filePath,
      versionNumber: newVerNum,
      uploadedBy: currentUser.name,
      createdAt: timeStr,
      notes
    };

    // NEVER overwrite old version! Append new version and update currentVersionId on DocumentRecord.
    setDocumentVersions(prev => [newVersion, ...prev]);
    setDocuments(prev => prev.map(d => {
      if (d.id === documentId) {
        return {
          ...d,
          currentVersionId: newVerId
        };
      }
      return d;
    }));

    // Push to enquiry timeline
    setEnquiries(prev => prev.map(e => {
      if (e.id === doc.enquiryId) {
        return {
          ...e,
          timeline: [
            ...e.timeline,
            {
              id: Date.now(),
              text: `Uploaded version ${newVerNum}.0 for document "${doc.title}" (${filePath})`,
              user: currentUser.name,
              date: 'Just now'
            }
          ]
        };
      }
      return e;
    }));

    triggerToast(`Uploaded new version v${newVerNum}.0 for "${doc.title}". Prior versions preserved.`);
  };

  const handleLinkDocumentToRequest = (documentId: string, workItemId: string) => {
    const existing = documentWorkItemLinks.find(l => l.documentId === documentId && l.workItemId === workItemId);
    if (existing) {
      triggerToast('Document is already linked to this request.');
      return;
    }

    const newLink: DocumentWorkItemLink = {
      id: `LINK-${Date.now()}`,
      documentId,
      workItemId,
      linkedBy: currentUser.name,
      createdAt: new Date().toLocaleString()
    };

    setDocumentWorkItemLinks(prev => [newLink, ...prev]);
    triggerToast(`Document linked to request ${workItemId}.`);
  };

  const handleShareDocument = (documentId: string, sharedUsers?: string[], sharedDepartments?: string[]) => {
    setDocuments(prev => prev.map(d => {
      if (d.id === documentId) {
        return {
          ...d,
          sharedWith: {
            users: [...new Set([...(d.sharedWith?.users || []), ...(sharedUsers || [])])],
            departments: [...new Set([...(d.sharedWith?.departments || []), ...(sharedDepartments || [])])]
          }
        };
      }
      return d;
    }));
    triggerToast(`Updated sharing settings for document.`);
  };

  const handleUpdateProspectStatus = async (prospectId: string, newStatus: string) => {
    try {
      await apiClient.prospects.update(prospectId, { status: newStatus });
      setProspects(prev => prev.map(p => p.id === prospectId ? { ...p, status: newStatus } : p));
      triggerToast(`Prospect status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update prospect status:', err);
      triggerToast('Error updating status');
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId: string, newStatus: string) => {
    try {
      await apiClient.enquiries.update(enquiryId, { status: newStatus });
      setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e));
      triggerToast(`Enquiry status updated to ${newStatus}`);
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
      triggerToast('Error updating status');
    }
  };

  const handleCreateCustomView = async (name: string, conditions: CustomViewCondition[]) => {
    const id = `view-${Date.now()}`;
    const newView: CustomView = { id, name, conditions };
    try {
      await apiClient.customViews.create(newView);
      setCustomViews(prev => [...prev, newView]);
      setActiveCustomViewId(id);
      triggerToast(`Saved custom view "${name}"`);
    } catch (err) {
      console.error('Failed to create custom view:', err);
      triggerToast('Error saving custom view');
    }
  };

  const handleDeleteCustomView = async (id: string) => {
    try {
      await apiClient.customViews.delete(id);
      setCustomViews(prev => prev.filter(v => v.id !== id));
      if (activeCustomViewId === id) {
        setActiveCustomViewId(null);
      }
      triggerToast('Custom view removed');
    } catch (err) {
      console.error('Failed to delete custom view:', err);
      triggerToast('Error deleting custom view');
    }
  };

  return {
    customViews,
    setCustomViews,
    activeCustomViewId,
    setActiveCustomViewId,
    prospectDisplayMode,
    setProspectDisplayMode,
    handleUpdateProspectStatus,
    handleUpdateEnquiryStatus,
    handleCreateCustomView,
    handleDeleteCustomView,
    currentUser,
    setCurrentUser,
    enquiries,
    setEnquiries,
    emails,
    setEmails,
    prospects,
    setProspects,
    campaigns,
    setCampaigns,
    currentView,
    setCurrentView,
    selectedEnquiryId,
    setSelectedEnquiryId,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    toastMessage,
    setToastMessage,
    emailFolder,
    setEmailFolder,
    selectedEmailId,
    setSelectedEmailId,
    emailComposeOpen,
    setEmailComposeOpen,
    composeTo,
    setComposeTo,
    composeSubject,
    setComposeSubject,
    composeBody,
    setComposeBody,
    composeEnquiry,
    setComposeEnquiry,
    emailSearchQuery,
    setEmailSearchQuery,
    composeCc,
    setComposeCc,
    composeBcc,
    setComposeBcc,
    composeAttachments,
    setComposeAttachments,
    activeDraftId,
    setActiveDraftId,
    draftSavedStatus,
    setDraftSavedStatus,
    handleSaveDraft,
    handleToggleStarEmail,
    handleArchiveEmail,
    handleTrashEmail,
    handleDeleteEmailPermanently,
    inputBaseCost,
    setInputBaseCost,
    inputLogistics,
    setInputLogistics,
    inputMargin,
    setInputMargin,
    sampleTrackingInput,
    setSampleTrackingInput,
    selectedVessel,
    setSelectedVessel,
    activeTaskId,
    setActiveTaskId,
    chatCommentText,
    setChatCommentText,
    aiGeneratingId,
    setAiGeneratingId,
    selectedTone,
    setSelectedTone,
    customSearchPrompt,
    setCustomSearchPrompt,
    triggerToast,
    activeEnquiry,
    globalTasks,
    activeTaskDetails,
    personalTasks,
    checkPermissions,
    handleAddComment,
    handleMarkComplete,
    handleSourcingCostSubmit,
    handleSamplingSubmit,
    handleLogisticsSubmit,
    handleComplianceSubmit,
    handleSendEmail,
    handleGenerateAIOutreach,
    promoteProspectToEnquiry,
    filteredEnquiries,
    userFilteredEmails,
    activeEmail,
 handleNavClick,
    tasks,
    setTasks,
    handleCreateTask,
    handleAssignTask,
    handleCreateCostingRequest,
    handleAssignCostingRequest,
    handleUpdateCostingComponent,
    handleRequestInternalTask,
    handleSubmitCostingRequest,
    handleApproveCostingRequest,
    handleRejectCostingRequest,
    handlePrepareQuotationFromCosting,
    handleAddCostingComment,
    handleAddCostingDocument,

    // HR STATE
    hrEmployees,
    setHrEmployees,

    // SAMPLING STATE & WORKFLOWS
    handleAssignSamplingRequest,
    handleUpdateSamplingDetails,
    handleSubmitSamplingRequest,
    handleApproveSamplingRequest,
    handleRejectSamplingRequest,
    handleAddSamplingComment,
    handleAddSamplingDocument,
    handleRequestSamplingInternalTask,

    // LOGISTICS STATE & WORKFLOWS
    handleAssignLogisticsRequest,
    handleUpdateLogisticsDetails,
    handleSubmitLogisticsRequest,
    handleApproveLogisticsRequest,
    handleRejectLogisticsRequest,
    handleAddLogisticsComment,
    handleAddLogisticsDocument,
    handleRequestLogisticsInternalTask,

    // COMPLIANCE STATE & WORKFLOWS
    handleAssignComplianceRequest,
    handleUpdateComplianceDetails,
    handleSubmitComplianceRequest,
    handleApproveComplianceRequest,
    handleRejectComplianceRequest,
    handleAddComplianceComment,
    handleAddComplianceDocument,
    handleRequestComplianceInternalTask,

    // HR WORKFLOWS
    handleCreateHREmployee,
    handleUpdateHREmployeeDetails,
    handleToggleHROnboardingCheck,
    handleToggleHROffboardingCheck,
    handleToggleHRTrainingCheck,
    handleUploadHRDocument,
    handleCreateHRAttendanceRequest,
    handleActionHRAttendanceRequest,

    // SPEND MANAGEMENT STATE & WORKFLOWS
    expenses,
    setExpenses,
    handleCreateExpense,
    handleUpdateExpenseStatus,
    handleAddExpenseComment,
    handleUpdateAccountingDetails,

    // DOCUMENT VAULT STATE & WORKFLOWS
    documents,
    setDocuments,
    documentVersions,
    setDocumentVersions,
    documentWorkItemLinks,
    setDocumentWorkItemLinks,
    isDocumentVaultOpen,
    setIsDocumentVaultOpen,
    toggleDocumentVault,
    handleUploadDocument,
    handleUploadNewDocumentVersion,
    handleLinkDocumentToRequest,
    handleShareDocument
  };
}
export type CRMState = ReturnType<typeof useCRMState>;
