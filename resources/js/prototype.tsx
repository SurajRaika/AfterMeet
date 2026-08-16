import React, { useState, useMemo } from 'react';

// Symmetrical directory of staff, department heads, VPs, and the President
const USERS = {
  arthur_president: {
    id: 'arthur_president',
    email: 'arthur.p@tradedesk.com',
    name: 'Arthur Pendelton',
    role: 'President & CEO',
    department: 'Executive',
    manager: 'Board of Directors',
    isManager: true,
    isAdmin: true,
    isPresident: true,
    avatar: 'AP'
  },
  amanda_sales_vp: {
    id: 'amanda_sales_vp',
    email: 'amanda.v@tradedesk.com',
    name: 'Amanda Vance',
    role: 'VP of Global Sales',
    department: 'Sales',
    manager: 'Arthur Pendelton',
    isManager: true,
    isAdmin: true,
    avatar: 'AV'
  },
  marcus_ops_vp: {
    id: 'marcus_ops_vp',
    email: 'marcus.b@tradedesk.com',
    name: 'Marcus Brody',
    role: 'VP of Operations',
    department: 'Operations',
    manager: 'Arthur Pendelton',
    isManager: true,
    isAdmin: true,
    avatar: 'MB'
  },
  sarah_costing_head: {
    id: 'sarah_costing_head',
    email: 'sarah.j@tradedesk.com',
    name: 'Sarah Jenkins',
    role: 'Costing Department Head',
    department: 'Costing',
    manager: 'Marcus Brody',
    isManager: true,
    isAdmin: false,
    avatar: 'SJ'
  },
  oliver_sampling_head: {
    id: 'oliver_sampling_head',
    email: 'oliver.v@tradedesk.com',
    name: 'Oliver Vance',
    role: 'Sampling Department Head',
    department: 'Sampling',
    manager: 'Marcus Brody',
    isManager: true,
    isAdmin: false,
    avatar: 'OV'
  },
  kenji_logistics_head: {
    id: 'kenji_logistics_head',
    email: 'kenji.s@tradedesk.com',
    name: 'Kenji Sato',
    role: 'Logistics Department Head',
    department: 'Logistics',
    manager: 'Marcus Brody',
    isManager: true,
    isAdmin: false,
    avatar: 'KS'
  },
  elena_compliance_head: {
    id: 'elena_compliance_head',
    email: 'elena.r@tradedesk.com',
    name: 'Elena Rostova',
    role: 'Compliance Department Head',
    department: 'Compliance',
    manager: 'Marcus Brody',
    isManager: true,
    isAdmin: false,
    avatar: 'ER'
  },
  rajesh_sales_rep: {
    id: 'rajesh_sales_rep',
    email: 'rajesh.m@tradedesk.com',
    name: 'Rajesh Mehta',
    role: 'Senior Sales Representative',
    department: 'Sales',
    manager: 'Amanda Vance',
    isManager: false,
    isAdmin: false,
    avatar: 'RM'
  },
  tom_costing_staff: {
    id: 'tom_costing_staff',
    email: 'tom.h@tradedesk.com',
    name: 'Tom Harris',
    role: 'Costing Desk Analyst',
    department: 'Costing',
    manager: 'Sarah Jenkins',
    isManager: false,
    isAdmin: false,
    avatar: 'TH'
  },
  liom_sampling_staff: {
    id: 'liom_sampling_staff',
    email: 'liom.c@tradedesk.com',
    name: 'Liam Carter',
    role: 'Sampling Lab Technician',
    department: 'Sampling',
    manager: 'Oliver Vance',
    isManager: false,
    isAdmin: false,
    avatar: 'LC'
  },
  chloe_logistics_staff: {
    id: 'chloe_logistics_staff',
    email: 'chloe.t@tradedesk.com',
    name: 'Chloe Taylor',
    role: 'Freight Dispatch Operator',
    department: 'Logistics',
    manager: 'Kenji Sato',
    isManager: false,
    isAdmin: false,
    avatar: 'CT'
  },
  sophia_compliance_staff: {
    id: 'sophia_compliance_staff',
    email: 'sophia.m@tradedesk.com',
    name: 'Sophia Miller',
    role: 'Quarantine Clearance Clerk',
    department: 'Compliance',
    manager: 'Elena Rostova',
    isManager: false,
    isAdmin: false,
    avatar: 'SM'
  }
};

const INITIAL_ENQUIRIES = [
  {
    id: 'ENQ-2026-0012',
    customerName: 'ABC Imports Inc.',
    customerContact: 'John Sterling',
    product: 'Premium Organic Sesame Seeds (Grade A)',
    quantity: '50 Metric Tons',
    destinationPort: 'Hamburg, Germany',
    status: 'Costing Phase',
    salesOwner: 'Rajesh Mehta',
    watchers: ['Sarah Jenkins', 'Elena Rostova'],
    createdDate: '2026-07-15',
    timeline: [
      { id: 1, text: 'Enquiry created by Rajesh Mehta', user: 'Rajesh Mehta', date: 'July 15, 10:00 AM' },
      { id: 2, text: 'Quotation request dispatched to Costing Desk', user: 'Rajesh Mehta', date: 'July 15, 10:15 AM' }
    ],
    quotations: [
      {
        id: 'QTN-2026-0405',
        version: 'v1.0',
        stage: 'Costing',
        pricing: { baseCost: '—', logistics: '—', margin: '—', finalPrice: '—' },
        costSheetUploaded: false,
        fileName: 'Draft_Proposal_v1.0.pdf'
      }
    ],
    sampling: {
      id: 'SMP-2026-112',
      stage: 'Requested',
      carrier: 'DHL Express',
      trackingNumber: 'Awaiting dispatch',
      notes: 'Needs Phytosanitary analysis report.'
    },
    purchaseOrder: null,
    vendorApproval: {
      stage: 'Documents Pending',
      vendorName: 'Indo-Ganges Cooperatives',
      score: '91 out of 100',
      complianceCheck: 'Pending Verification'
    },
    contract: {
      version: 'v1.0-draft',
      signatureStatus: 'Pending Review',
      file: 'Draft_Sales_Agreement.pdf'
    },
    tasks: [
      {
        id: 'TSK-201',
        title: 'Calculate exact port-to-port export costs',
        type: 'Action Item',
        assignee: 'Sarah Jenkins',
        department: 'Costing',
        dueDate: '2026-07-22',
        priority: 'High',
        status: 'Pending',
        linkedRecord: 'ENQ-2026-0012',
        description: 'Ensure inland warehousing, terminal handling, and ocean freight quotes are consolidated.',
        watchers: ['Sarah Jenkins'],
        comments: [
          { id: 101, author: 'Rajesh Mehta', text: 'Sarah, the client is asking for expedited freight cost structures. Please check Hamburg routes ASAP.', date: 'July 15, 10:20 AM' },
          { id: 102, author: 'Sarah Jenkins', text: 'Understood. Waiting on terminal handling fees quote from Hamburg Port Authorities.', date: 'July 15, 11:15 AM' }
        ]
      },
      {
        id: 'TSK-202',
        title: 'Prepare initial specification sample packets',
        type: 'Action Item',
        assignee: 'Liam Carter',
        department: 'Sampling',
        dueDate: '2026-07-25',
        priority: 'Medium',
        status: 'Pending',
        linkedRecord: 'ENQ-2026-0012',
        description: 'Pack 500g vacuum-sealed samples for lab inspection.',
        watchers: ['Oliver Vance'],
        comments: [
          { id: 103, author: 'Oliver Vance', text: 'Ensure the phytosanitary seal is packed correctly.', date: 'July 16, 09:00 AM' }
        ]
      }
    ]
  },
  {
    id: 'ENQ-2026-0013',
    customerName: 'Zenith Global Trade',
    customerContact: 'Hana Kobayashi',
    product: 'Dehydrated White Onion Flakes',
    quantity: '22 Metric Tons',
    destinationPort: 'Tokyo, Japan',
    status: 'Customs Verification',
    salesOwner: 'Rajesh Mehta',
    watchers: ['Elena Rostova', 'Kenji Sato'],
    createdDate: '2026-07-10',
    timeline: [
      { id: 1, text: 'Enquiry received & mapped', user: 'System', date: 'July 10, 09:00 AM' },
      { id: 2, text: 'Costing completed by Sarah Jenkins', user: 'Sarah Jenkins', date: 'July 11, 02:30 PM' },
      { id: 3, text: 'Quotation approved and sent to client', user: 'Rajesh Mehta', date: 'July 12, 11:00 AM' },
      { id: 4, text: 'Client confirmed order. PO Issued.', user: 'Rajesh Mehta', date: 'July 14, 04:15 PM' }
    ],
    quotations: [
      {
        id: 'QTN-2026-0402',
        version: 'v1.1',
        stage: 'Won',
        pricing: { baseCost: '$1,200', logistics: '$250', margin: '$150', finalPrice: '$1,600' },
        costSheetUploaded: true,
        fileName: 'Final_Onion_Proposal_v1.1.pdf'
      }
    ],
    sampling: {
      id: 'SMP-2026-110',
      stage: 'Approved',
      carrier: 'FedEx International',
      trackingNumber: 'FDX-9988-2211',
      notes: 'Moisture level verified under 6% target.'
    },
    purchaseOrder: {
      id: 'PO-2026-0091',
      stage: 'Production',
      totalValue: '$35,200',
      shippingContainerCount: '1x 20ft General Cargo Container',
      carrier: 'ONE Ocean Network Express',
      loadingDate: '2026-08-05'
    },
    vendorApproval: {
      stage: 'Approved',
      vendorName: 'Deccan Agro Processors',
      score: '96 out of 100',
      complianceCheck: 'Passed Clean'
    },
    contract: {
      version: 'v1.1-signed',
      signatureStatus: 'Fully Signed',
      file: 'Signed_Commercial_Contract_Zenith.pdf'
    },
    tasks: [
      {
        id: 'TSK-301',
        title: 'Verify export phytosanitary clearance certificate',
        type: 'Document Request',
        assignee: 'Sophia Miller',
        department: 'Compliance',
        dueDate: '2026-07-18',
        priority: 'High',
        status: 'Overdue',
        linkedRecord: 'ENQ-2026-0013',
        description: 'Obtain local agricultural quarantine authority seal for onion cargo.',
        watchers: ['Elena Rostova'],
        comments: [
          { id: 104, author: 'Elena Rostova', text: 'Sophia, this is flagged. Ensure state lab logs are attached to avoid quarantine clearance delays.', date: 'July 17, 10:00 AM' }
        ]
      },
      {
        id: 'TSK-302',
        title: 'Book 20ft ocean vessel slot with ONE shipping line',
        type: 'Action Item',
        assignee: 'Chloe Taylor',
        department: 'Logistics',
        dueDate: '2026-07-24',
        priority: 'High',
        status: 'Pending',
        linkedRecord: 'ENQ-2026-0013',
        description: 'Confirm freight rates lock and get booking reference number.',
        watchers: ['Kenji Sato'],
        comments: []
      }
    ]
  }
];

const INITIAL_EMAILS = [
  {
    id: 'MSG-001',
    sender: 'client@abcimports.com',
    senderName: 'John Sterling (ABC Imports)',
    recipient: 'rajesh.m@tradedesk.com',
    subject: 'Urgent: Technical Spec Revision for Sesame Seeds sample',
    body: 'Hello Rajesh, We reviewed the specifications for ENQ-2026-0012. Could we confirm if the moisture content limit matches the German Quarantine target under 6.5%? Let me know when the lab can ship out the sample kit.',
    date: 'Jul 18, 2026 04:30 PM',
    enquiryId: 'ENQ-2026-0012',
    unread: true
  },
  {
    id: 'MSG-002',
    sender: 'sarah.j@tradedesk.com',
    senderName: 'Sarah Jenkins (Costing)',
    recipient: 'marcus.b@tradedesk.com',
    subject: 'Escalation Check: Ocean Carrier quotes (Hamburg Route)',
    body: 'Marcus, The spot rates for Hamburg are spiking this week. I am updating the costing sheet model to reflect the new inland terminal handling fees. We need Sales to lock the client into the v1 proposal quickly before the carrier contracts expire.',
    date: 'Jul 17, 2026 11:15 AM',
    enquiryId: 'ENQ-2026-0012',
    unread: false
  },
  {
    id: 'MSG-003',
    sender: 'arthur.p@tradedesk.com',
    senderName: 'Arthur Pendelton (CEO)',
    recipient: 'amanda.v@tradedesk.com',
    subject: 'Q3 Sourcing Targets & Pipeline Expansion Review',
    body: 'Amanda, Fantastic work on closing the Tokyo dehydrated onion pipeline. Please ensure the logistics staff stays on top of the customs release documents to protect our on-time delivery metric.',
    date: 'Jul 16, 2026 09:00 AM',
    enquiryId: 'ENQ-2026-0013',
    unread: false
  },
  {
    id: 'MSG-004',
    sender: 'rajesh.m@tradedesk.com',
    senderName: 'Rajesh Mehta',
    recipient: 'sarah.j@tradedesk.com',
    subject: 'Costing request: ABC Imports Sesame Seeds',
    body: 'Hi Sarah, I just logged ENQ-2026-0012. The client is asking for a direct ocean carriage estimate. Let me know when your desk can publish the pricing metrics.',
    date: 'Jul 15, 2026 10:20 AM',
    enquiryId: 'ENQ-2026-0012',
    unread: false
  }
];

const INITIAL_PROSPECTS = [
  {
    id: 'PRP-2026-001',
    companyName: 'Nippon Sourcing Corp',
    contactName: 'Takashi Yamamoto',
    email: 'yamamoto@nipponsourcing.co.jp',
    cropInterest: 'Green Cardamom Splits',
    estimatedVolume: '10 Metric Tons',
    status: 'Engaged',
    replyReceived: true,
    lastOutboundCampaign: 'Premium Spices Introduction',
    emailsSent: 2,
    nextSchedule: 'Completed Campaign',
    sentiment: 'Positive Interest',
    aiDraft: 'Hello Takashi Yamamoto,\n\nWe saw Nippon Sourcing Corp specializes in premium Japanese confectionery spices. Our Green Cardamom Splits (Moisture <7%) are directly accessible from the Indo-Ganges cooperatives.\n\nLet us know if you want us to package a vacuum sample.\n\nBest regards,\nTradeDesk Outbound Team'
  },
  {
    id: 'PRP-2026-002',
    companyName: 'EuroFoods Distribution AG',
    contactName: 'Elsa Schneider',
    email: 'schneider@eurofoods.ch',
    cropInterest: 'Dehydrated Onion Flakes',
    estimatedVolume: '40 Metric Tons',
    status: 'Cold outreach',
    replyReceived: false,
    lastOutboundCampaign: 'Dehydrated Alliums Promo',
    emailsSent: 1,
    nextSchedule: 'Jul 21, 2026 (Follow-up sequence)',
    sentiment: 'Unreplied',
    aiDraft: ''
  },
  {
    id: 'PRP-2026-003',
    companyName: 'Gulf Spices Cooperative',
    contactName: 'Youssef Al-Fayed',
    email: 'youssef@gulfspices.ae',
    cropInterest: 'Premium Sesame Seeds',
    estimatedVolume: '100 Metric Tons',
    status: 'Negotiation Draft',
    replyReceived: true,
    lastOutboundCampaign: 'Oilseed Bulk Sourcing Intro',
    emailsSent: 3,
    nextSchedule: 'Awaiting Promo Response',
    sentiment: 'Warm Lead',
    aiDraft: 'Dear Youssef Al-Fayed,\n\nTo lock down the shipping rates to Jebel Ali, we can provide a flat container discount rate. Let us schedule a brief session next week.'
  }
];

const INITIAL_CAMPAIGNS = [
  { id: 'CMP-01', name: 'Oilseed Bulk Sourcing Intro', active: true, sentToday: 12, targetAudience: 'Global Importers', scheduleType: 'Every Tuesday' },
  { id: 'CMP-02', name: 'Dehydrated Alliums Promo', active: true, sentToday: 8, targetAudience: 'Swiss/German Food Processors', scheduleType: 'Every Thursday' },
  { id: 'CMP-03', name: 'Premium Spices Introduction', active: false, sentToday: 0, targetAudience: 'Asia-Pacific Retail Sourcing', scheduleType: 'Paused' }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(USERS.arthur_president);
  const [enquiries, setEnquiries] = useState(INITIAL_ENQUIRIES);
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [prospects, setProspects] = useState(INITIAL_PROSPECTS);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [currentView, setCurrentView] = useState('sales-tracker');
  const [selectedEnquiryId, setSelectedEnquiryId] = useState('ENQ-2026-0012');
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Email Client States
  const [emailFolder, setEmailFolder] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState('MSG-001');
  const [emailComposeOpen, setEmailComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeEnquiry, setComposeEnquiry] = useState('');

  // Sourcing & desk workflow helper inputs
  const [inputBaseCost, setInputBaseCost] = useState('1450');
  const [inputLogistics, setInputLogistics] = useState('180');
  const [inputMargin, setInputMargin] = useState('120');
  const [sampleTrackingInput, setSampleTrackingInput] = useState('DHL-8877-VACC');
  const [selectedVessel, setSelectedVessel] = useState('ONE Blue Ocean V-092');

  // Task Chat & Collaborator Workspace State
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [chatCommentText, setChatCommentText] = useState('');

  // Outbound Marketing Assistant States
  const [aiGeneratingId, setAiGeneratingId] = useState(null);
  const [selectedTone, setSelectedTone] = useState('Premium');
  const [customSearchPrompt, setCustomSearchPrompt] = useState('');

  // Trigger brief alert notifications
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const activeEnquiry = useMemo(() => {
    return enquiries.find(e => e.id === selectedEnquiryId) || enquiries[0];
  }, [enquiries, selectedEnquiryId]);

  const globalTasks = useMemo(() => {
    return enquiries.flatMap(e => e.tasks.map(t => ({ ...t, parentEnquiryId: e.id })));
  }, [enquiries]);

  // Selected single task details for Chat Drawer
  const activeTaskDetails = useMemo(() => {
    if (!activeTaskId) return null;
    return globalTasks.find(t => t.id === activeTaskId);
  }, [globalTasks, activeTaskId]);

  // Filters tasks assigned directly to the simulated operator OR watched/collaborating via @mentions
  const personalTasks = useMemo(() => {
    return globalTasks.filter(t => 
      t.assignee === currentUser.name || 
      (t.department === currentUser.department && !currentUser.isManager) ||
      (t.watchers && t.watchers.includes(currentUser.name))
    );
  }, [globalTasks, currentUser]);

  const checkPermissions = (targetView) => {
    if (currentUser.isPresident || currentUser.isAdmin) return true;
    if (targetView === 'personal-email') return true;

    // Sales Front-End checks (Enquiries + Prospects + Nested Submodules)
    if (['sales-tracker', 'sales-prospects', 'sales-quotations', 'sales-sampling', 'sales-pos', 'sales-vendors', 'sales-contracts', 'enquiry-detail'].includes(targetView)) {
      return currentUser.department === 'Sales';
    }

    // Operations Staff checks (Only the staff member's specific department)
    if (targetView === 'ops-costing') return currentUser.department === 'Costing';
    if (targetView === 'ops-sampling') return currentUser.department === 'Sampling';
    if (targetView === 'ops-logistics') return currentUser.department === 'Logistics';
    if (targetView === 'ops-compliance') return currentUser.department === 'Compliance';

    // Dashboards check (Requires BOTH correct department AND Manager/Head status)
    if (targetView === 'dash-sales') return (currentUser.department === 'Sales' && currentUser.isManager);
    if (targetView === 'dash-costing') return (currentUser.department === 'Costing' && currentUser.isManager);
    if (targetView === 'dash-sampling') return (currentUser.department === 'Sampling' && currentUser.isManager);
    if (targetView === 'dash-logistics') return (currentUser.department === 'Logistics' && currentUser.isManager);
    if (targetView === 'dash-compliance') return (currentUser.department === 'Compliance' && currentUser.isManager);

    if (targetView === 'presidential-overview') return currentUser.isPresident;

    return true; // My Tasks is public
  };

  const handleAddComment = (taskId, text) => {
    if (!text.trim()) return;

    // Scan the text block for @Member name mentions to dynamically invite them to the task watchers array
    const mentionedMembers = [];
    Object.values(USERS).forEach(user => {
      if (text.includes(`@${user.name}`)) {
        mentionedMembers.push(user.name);
      }
    });

    setEnquiries(prev => prev.map(item => {
      const hasTask = item.tasks.some(t => t.id === taskId);
      if (hasTask) {
        const updatedTasks = item.tasks.map(t => {
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
        });

        const timelineMemos = mentionedMembers.map(m => ({
          id: Date.now() + Math.random(),
          text: `${currentUser.name} mentioned and invited @${m} to Task ${taskId} chat.`,
          user: 'System',
          date: 'Just now'
        }));

        return {
          ...item,
          tasks: updatedTasks,
          timeline: [...item.timeline, ...timelineMemos]
        };
      }
      return item;
    }));

    setChatCommentText('');
    triggerToast(mentionedMembers.length > 0 
      ? `Task chat updated. Invited: ${mentionedMembers.join(', ')}`
      : 'Message published to internal task thread.'
    );
  };

  const handleMarkComplete = (taskId) => {
    setEnquiries(prev => prev.map(item => {
      const hasTask = item.tasks.some(t => t.id === taskId);
      if (hasTask) {
        const updatedTasks = item.tasks.map(t => {
          if (t.id === taskId) return { ...t, status: 'Completed' };
          return t;
        });
        return {
          ...item,
          tasks: updatedTasks,
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
    triggerToast(`Task ${taskId} resolved.`);
  };

  const handleSourcingCostSubmit = (enquiryId, quoteId) => {
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

        const updatedTasks = item.tasks.map(t => {
          if (t.department === 'Costing') return { ...t, status: 'Completed' };
          return t;
        });

        return {
          ...item,
          status: 'Internal Review',
          quotations: updatedQuotations,
          tasks: updatedTasks,
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

  const handleSamplingSubmit = (enquiryId, trackingNo) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
        const updatedTasks = item.tasks.map(t => {
          if (t.department === 'Sampling') return { ...t, status: 'Completed' };
          return t;
        });
        return {
          ...item,
          sampling: {
            ...item.sampling,
            stage: 'Shipped',
            trackingNumber: trackingNo
          },
          tasks: updatedTasks,
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

  const handleLogisticsSubmit = (enquiryId, vesselName) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
        const updatedTasks = item.tasks.map(t => {
          if (t.department === 'Logistics') return { ...t, status: 'Completed' };
          return t;
        });
        return {
          ...item,
          purchaseOrder: item.purchaseOrder ? {
            ...item.purchaseOrder,
            stage: 'Dispatch',
            carrier: vesselName
          } : null,
          tasks: updatedTasks,
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

  const handleComplianceSubmit = (enquiryId) => {
    setEnquiries(prev => prev.map(item => {
      if (item.id === enquiryId) {
        const updatedTasks = item.tasks.map(t => {
          if (t.department === 'Compliance') return { ...t, status: 'Completed' };
          return t;
        });
        return {
          ...item,
          vendorApproval: {
            ...item.vendorApproval,
            stage: 'Approved',
            complianceCheck: 'Passed Clean'
          },
          tasks: updatedTasks,
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

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      triggerToast('All email fields are required.');
      return;
    }

    const newMail = {
      id: `MSG-${Date.now().toString().slice(-3)}`,
      sender: currentUser.email,
      senderName: currentUser.name,
      recipient: composeTo,
      subject: composeSubject,
      body: composeBody,
      date: 'Just now',
      enquiryId: composeEnquiry || null,
      unread: false
    };

    setEmails([newMail, ...emails]);
    setEmailComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setComposeEnquiry('');
    triggerToast('Email sent to destination queue.');
  };

  // LLM Powered Outreach Email Drafting Function using standard Google Gemini Endpoint
  const handleGenerateAIOutreach = async (prospectId) => {
    const targetProspect = prospects.find(p => p.id === prospectId);
    if (!targetProspect) return;

    setAiGeneratingId(prospectId);
    triggerToast(`Calling Gemini Outbound Assistant...`);

    const fallbackResponse = `Dear ${targetProspect.contactName},\n\nWe saw that ${targetProspect.companyName} is expanding imports in raw agricultural crops. Our focus is delivering pristine quality ${targetProspect.cropInterest} directly from our audited regional cooperatives.\n\nOur cooperative farms are rated highly on export specifications with secure phytosanitary clearances.\n\nCan we arrange a brief call next week to coordinate freight quotes and vacuum samples?\n\nSincerely,\n${currentUser.name}\nTradeDesk Global Outbound`;

    try {
      const apiKey = ""; // Canvas framework replaces this on runtime if configured
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const systemPrompt = "You are a professional B2B agricultural export marketing copywriter for TradeDesk. Draft short, direct, highly professional outbound sales proposal emails.";
      const userQuery = `Write a premium, brief outbound proposal to ${targetProspect.contactName} at ${targetProspect.companyName}. They import ${targetProspect.cropInterest}. Sourcing volume: ${targetProspect.estimatedVolume}. Tone parameter: ${selectedTone}. Ask for a slot to provide pricing index or vacuum samples. Keep it strictly under 150 words.`;

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
        throw new Error('API request throttled or key missing');
      }

      const result = await response.json();
      const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        setProspects(prev => prev.map(p => {
          if (p.id === prospectId) {
            return { ...p, aiDraft: generatedText };
          }
          return p;
        }));
        triggerToast(`Outbound email drafted with Gemini Flash AI.`);
      } else {
        throw new Error('No draft returned');
      }
    } catch (err) {
      console.warn("Outbound Gemini API call failed, falling back to clean template: ", err.message);
      setProspects(prev => prev.map(p => {
        if (p.id === prospectId) {
          return { ...p, aiDraft: fallbackResponse };
        }
        return p;
      }));
      triggerToast(`Draft compiled via template generator.`);
    } finally {
      setAiGeneratingId(null);
    }
  };

  // Convert prospect to live enquiry once communication opens
  const promoteProspectToEnquiry = (prospectId) => {
    const targetProspect = prospects.find(p => p.id === prospectId);
    if (!targetProspect) return;

    const nextEnqId = `ENQ-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const newEnq = {
      id: nextEnqId,
      customerName: targetProspect.companyName,
      customerContact: targetProspect.contactName,
      product: targetProspect.cropInterest,
      quantity: targetProspect.estimatedVolume,
      destinationPort: 'Hamburg, Germany', // default template destination
      status: 'Costing Phase',
      salesOwner: currentUser.name,
      watchers: [],
      createdDate: new Date().toISOString().split('T')[0],
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
      tasks: [
        {
          id: `TSK-${Math.floor(Math.random() * 900) + 100}`,
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
          comments: []
        }
      ]
    };

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
    return emails.filter(mail => {
      if (emailFolder === 'inbox') {
        return mail.recipient === currentUser.email;
      } else {
        return mail.sender === currentUser.email;
      }
    });
  }, [emails, emailFolder, currentUser]);

  const activeEmail = useMemo(() => {
    return emails.find(m => m.id === selectedEmailId) || userFilteredEmails[0];
  }, [emails, selectedEmailId, userFilteredEmails]);

  const renderPermissionBadge = (viewKey) => {
    const isAllowed = checkPermissions(viewKey);
    return isAllowed ? (
      <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 border border-emerald-200 uppercase tracking-tight">Active</span>
    ) : (
      <span className="text-[9px] text-amber-600 font-bold bg-amber-50 px-1 border border-amber-200 uppercase tracking-tight">Locked 🔒</span>
    );
  };

  const handleNavClick = (viewKey) => {
    if (checkPermissions(viewKey)) {
      setCurrentView(viewKey);
    } else {
      setCurrentView(`denied-${viewKey}`);
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-800 font-sans text-[11px] antialiased overflow-hidden">
      
      {/* ========================================== */}
      {/* SIDEBAR NAVIGATION SYSTEM                  */}
      {/* ========================================== */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col justify-between shrink-0 rounded-none overflow-hidden">
        <div className="overflow-y-auto flex-1">
          
          {/* Top Brand Block */}
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-4 bg-black flex items-center justify-center text-white font-black text-[10px] rounded-none">T</span>
              <span className="font-bold text-neutral-900 tracking-tight text-[11px] uppercase">TRADEDESK</span>
            </div>
          </div>

          {/* DYNAMIC ROLE SELECTOR (Simulation Switcher) */}
          <div className="m-2 p-2 bg-neutral-50 border border-neutral-200 rounded-none">
            <span className="text-[9px] text-neutral-400 font-bold block uppercase tracking-wider mb-1">Simulate Crew Profile</span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const nextUser = USERS[e.target.value];
                setCurrentUser(nextUser);
                triggerToast(`Workspace credentials switched to ${nextUser.name} (${nextUser.role})`);
              }}
              className="w-full bg-white border border-neutral-200 rounded-none p-1 text-[11px] text-neutral-800 font-medium focus:outline-none"
            >
              <optgroup label="1. EXECUTIVE DESK">
                <option value="arthur_president">Arthur Pendelton [Executive CEO]</option>
                <option value="amanda_sales_vp">Amanda Vance [Sales VP]</option>
                <option value="marcus_ops_vp">Marcus Brody [Operations VP]</option>
              </optgroup>
              <optgroup label="2. DEPARTMENT HEADS">
                <option value="sarah_costing_head">Sarah Jenkins [Costing Head]</option>
                <option value="oliver_sampling_head">Oliver Vance [Sampling Head]</option>
                <option value="kenji_logistics_head">Kenji Sato [Logistics Head]</option>
                <option value="elena_compliance_head">Elena Rostova [Compliance Head]</option>
              </optgroup>
              <optgroup label="3. OPERATIONS STAFF">
                <option value="rajesh_sales_rep">Rajesh Mehta [Sales Rep]</option>
                <option value="tom_costing_staff">Tom Harris [Costing Analyst]</option>
                <option value="liom_sampling_staff">Liam Carter [Sampling Tech]</option>
                <option value="chloe_logistics_staff">Chloe Taylor [Logistics Operator]</option>
                <option value="sophia_compliance_staff">Sophia Miller [Compliance Clerk]</option>
              </optgroup>
            </select>
          </div>

          <nav className="px-2 py-1 space-y-3">
            
            {/* PERSONAL TASKS & COMMUNICATION */}
            <div>
              <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Workspace Tools
              </span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setCurrentView('my-tasks')}
                  className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'my-tasks' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>My Tasks Inbox</span>
                  </span>
                  <span className={`text-[9px] px-1 font-mono border ${currentView === 'my-tasks' ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-100 text-neutral-600 border-neutral-200'}`}>
                    {personalTasks.filter(t => t.status !== 'Completed').length}
                  </span>
                </button>

                <button
                  onClick={() => handleNavClick('personal-email')}
                  className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'personal-email' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>✉</span>
                    <span>Personal Mailbox</span>
                  </span>
                  {renderPermissionBadge('personal-email')}
                </button>
              </div>
            </div>

            {/* FRONT-END SALES SECTION */}
            <div>
              <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Sales Front-End
              </span>


              {/* NEW Outbound Prospects Panel */}
                <button
                  onClick={() => handleNavClick('sales-prospects')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'sales-prospects' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    
                    <span>Outbound Prospects</span>
                  </span>
                  {renderPermissionBadge('sales-prospects')}
                </button>


              <div className="space-y-0.5">
                
                <button
                  onClick={() => handleNavClick('sales-tracker')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'sales-tracker' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>Enquiries (Active Deals)</span>
                  {renderPermissionBadge('sales-tracker')}
                </button>

                

                {/* Indented child views representing child modules of all enquiries */}
                <div className="pl-3 border-l border-neutral-200 ml-2 space-y-0.5">
                  <button
                    onClick={() => handleNavClick('sales-quotations')}
                    className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                      currentView === 'sales-quotations' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>↳ Quotations Log</span>
                    {renderPermissionBadge('sales-quotations')}
                  </button>

                  <button
                    onClick={() => handleNavClick('sales-sampling')}
                    className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                      currentView === 'sales-sampling' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>↳ Sampling Records</span>
                    {renderPermissionBadge('sales-sampling')}
                  </button>

                  <button
                    onClick={() => handleNavClick('sales-pos')}
                    className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                      currentView === 'sales-pos' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>↳ Purchase Orders</span>
                    {renderPermissionBadge('sales-pos')}
                  </button>

                  <button
                    onClick={() => handleNavClick('sales-vendors')}
                    className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                      currentView === 'sales-vendors' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>↳ Vendor Approvals</span>
                    {renderPermissionBadge('sales-vendors')}
                  </button>

                  <button
                    onClick={() => handleNavClick('sales-contracts')}
                    className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between text-[10px] transition-colors ${
                      currentView === 'sales-contracts' ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    <span>↳ Contracts Registry</span>
                    {renderPermissionBadge('sales-contracts')}
                  </button>
                </div>
              </div>
            </div>

            {/* OPERATIONS STAFF WORKSPACE */}
            <div>
              <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Operations Back-End
              </span>
              <div className="space-y-0.5">
                
                <button
                  onClick={() => handleNavClick('ops-costing')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'ops-costing' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>📊 Costing Desk</span>
                  {renderPermissionBadge('ops-costing')}
                </button>

                <button
                  onClick={() => handleNavClick('ops-sampling')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'ops-sampling' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>📦 Sampling Desk</span>
                  {renderPermissionBadge('ops-sampling')}
                </button>

                <button
                  onClick={() => handleNavClick('ops-logistics')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'ops-logistics' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>🚢 Logistics Desk</span>
                  {renderPermissionBadge('ops-logistics')}
                </button>

                <button
                  onClick={() => handleNavClick('ops-compliance')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'ops-compliance' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>⚖️ Compliance Desk</span>
                  {renderPermissionBadge('ops-compliance')}
                </button>

              </div>
            </div>

            {/* DEPARTMENT DASHBOARDS */}
            <div>
              <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Dashboard of Departments
              </span>
              <div className="space-y-0.5">
                
                <button
                  onClick={() => handleNavClick('dash-sales')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'dash-sales' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>↳ Sales Trade Stats</span>
                  {renderPermissionBadge('dash-sales')}
                </button>

                <button
                  onClick={() => handleNavClick('dash-costing')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'dash-costing' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>↳ Costing Turnaround</span>
                  {renderPermissionBadge('dash-costing')}
                </button>

                <button
                  onClick={() => handleNavClick('dash-sampling')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'dash-sampling' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>↳ Sampling Quality</span>
                  {renderPermissionBadge('dash-sampling')}
                </button>

                <button
                  onClick={() => handleNavClick('dash-logistics')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'dash-logistics' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>↳ Ocean Freight KPIs</span>
                  {renderPermissionBadge('dash-logistics')}
                </button>

                <button
                  onClick={() => handleNavClick('dash-compliance')}
                  className={`w-full text-left px-2 py-1 rounded-none flex items-center justify-between font-medium transition-colors ${
                    currentView === 'dash-compliance' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <span>↳ Quarantine Audits</span>
                  {renderPermissionBadge('dash-compliance')}
                </button>

              </div>
            </div>

            {/* PRESIDENTIAL COMMAND OVERVIEW */}
            <div>
              <span className="px-2 text-[9px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Executive Desk
              </span>
              <button
                onClick={() => handleNavClick('presidential-overview')}
                className={`w-full text-left px-2 py-1.5 rounded-none flex items-center justify-between font-medium transition-colors ${
                  currentView === 'presidential-overview' ? 'bg-neutral-900 text-white' : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>👑</span>
                  <span className="font-bold">Presidential Command</span>
                </span>
                {renderPermissionBadge('presidential-overview')}
              </button>
            </div>

          </nav>
        </div>

        {/* ACTIVE OPERATOR METADATA CARD */}
        <div className="p-2.5 bg-neutral-100 border-t border-neutral-200 flex items-center space-x-2 shrink-0">
          <div className="w-7 h-7 bg-neutral-900 text-white font-bold flex items-center justify-center text-[10px] rounded-none">
            {currentUser.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block font-bold text-neutral-900 leading-tight truncate">{currentUser.name}</span>
            <span className="block text-neutral-500 text-[9px] leading-none truncate">{currentUser.role}</span>
          </div>
        </div>
      </aside>

      {/* ========================================== */}
      {/* WORKSPACE CONTENT LAYOUT                   */}
      {/* ========================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-neutral-50 relative">
        
        {/* GLOBAL HEADER BAR */}
        <header className="h-10 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center space-x-2 w-96">
            <span className="text-neutral-400 text-[10px]">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active deals, ports, trackers..."
              className="w-full bg-transparent border-0 py-1 text-[11px] placeholder-neutral-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 border text-neutral-600 font-mono">
              CREDENTIALS: <strong className="text-neutral-900">{currentUser.department.toUpperCase()}</strong>
            </span>
          </div>
        </header>

        {/* TOAST PANEL */}
        {toastMessage && (
          <div className="bg-neutral-950 text-white px-4 py-1.5 text-[10px] flex justify-between items-center shrink-0">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white font-bold">✕</button>
          </div>
        )}

        <main className="p-4 space-y-4 max-w-full">

          {/* ========================================== */}
          {/* PERSONAL TASK INBOX VIEW                   */}
          {/* ========================================== */}
          {currentView === 'my-tasks' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Personal Workspace Tasks</h1>
                <p className="text-neutral-500 text-[10px]">Duty lists assigned directly to {currentUser.name} or collaborators invited via @mention.</p>
              </div>

              {personalTasks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-neutral-200 bg-white">
                  <span className="text-neutral-400 text-[10px] block">No active tasks assigned. Enjoy your day!</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* DIRECTLY ASSIGNED SECTION */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Directly Assigned to Me</span>
                    <div className="bg-white border border-neutral-200 rounded-none overflow-hidden divide-y divide-neutral-100">
                      {personalTasks.filter(t => t.assignee === currentUser.name).map(task => (
                        <div key={task.id} className="p-3 flex justify-between items-center hover:bg-neutral-50">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-[8px] font-bold px-1 py-0.2 border ${
                                task.status === 'Completed' ? 'bg-neutral-100 text-neutral-400 border-neutral-200' : 'bg-neutral-900 text-white border-neutral-900'
                              }`}>
                                {task.status}
                              </span>
                              <span className="font-bold text-neutral-950">{task.title}</span>
                              <span className="text-neutral-400">({task.id})</span>
                            </div>
                            <p className="text-neutral-500 text-[9px] mt-0.5">
                              Enquiry Context: <strong className="text-neutral-700 underline cursor-pointer" onClick={() => {
                                setSelectedEnquiryId(task.parentEnquiryId);
                                setCurrentView('enquiry-detail');
                              }}>{task.parentEnquiryId}</strong> &bull; Priority: {task.priority} &bull; Due: {task.dueDate}
                            </p>
                            <p className="text-neutral-600 mt-1 max-w-xl text-[10px] truncate">{task.description}</p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setActiveTaskId(task.id)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-2.5 py-1 text-[9px] uppercase rounded-none transition-colors border border-neutral-300"
                            >
                              Workspace Chat ({task.comments ? task.comments.length : 0})
                            </button>
                            {task.status !== 'Completed' && (
                              <button
                                onClick={() => handleMarkComplete(task.id)}
                                className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 font-bold px-2 py-1 text-[9px] uppercase rounded-none transition-colors"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* WATCHED & COLLABORATING SECTION */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider block">Collaborating / Mentioned on</span>
                    <div className="bg-white border border-neutral-200 rounded-none overflow-hidden divide-y divide-neutral-100">
                      {personalTasks.filter(t => t.assignee !== currentUser.name && t.watchers && t.watchers.includes(currentUser.name)).map(task => (
                        <div key={task.id} className="p-3 flex justify-between items-center hover:bg-neutral-50">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[8px] font-bold px-1 py-0.2 border bg-neutral-100 text-neutral-600 border-neutral-300">
                                Collaborator
                              </span>
                              <span className="font-bold text-neutral-950">{task.title}</span>
                              <span className="text-neutral-400">({task.id})</span>
                            </div>
                            <p className="text-neutral-500 text-[9px] mt-0.5">
                              Enquiry Context: <strong className="text-neutral-700 underline cursor-pointer" onClick={() => {
                                setSelectedEnquiryId(task.parentEnquiryId);
                                setCurrentView('enquiry-detail');
                              }}>{task.parentEnquiryId}</strong> &bull; Assignee: {task.assignee} &bull; Due: {task.dueDate}
                            </p>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setActiveTaskId(task.id)}
                              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold px-2.5 py-1 text-[9px] uppercase rounded-none transition-colors border border-neutral-300"
                            >
                              Workspace Chat ({task.comments ? task.comments.length : 0})
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================== */}
          {/* PERSONAL MAILBOX VIEW                      */}
          {/* ========================================== */}
          {currentView === 'personal-email' && (
            <div className="space-y-3 bg-white border border-neutral-200 p-4 rounded-none min-h-[480px] flex flex-col justify-between">
              <div>
                <div className="border-b border-neutral-200 pb-2 flex justify-between items-center">
                  <div>
                    <h1 className="text-xs font-bold text-neutral-900 uppercase">Personal Email Terminal</h1>
                    <p className="text-neutral-500 text-[10px]">Secure internal communication gateway mapped to: <span className="font-mono text-neutral-900 font-bold">{currentUser.email}</span></p>
                  </div>
                  <button
                    onClick={() => {
                      setEmailComposeOpen(true);
                      setComposeTo('');
                      setComposeSubject('');
                      setComposeBody('');
                    }}
                    className="bg-black hover:bg-neutral-800 text-white text-[10px] px-3 py-1 font-bold uppercase rounded-none"
                  >
                    + Compose Mail
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-3">
                  {/* Folders & Directory Left Sidebar */}
                  <div className="md:col-span-3 space-y-1 border-r border-neutral-200 pr-2">
                    <button
                      onClick={() => { setEmailFolder('inbox'); setEmailComposeOpen(false); }}
                      className={`w-full text-left px-2 py-1 font-medium flex justify-between ${emailFolder === 'inbox' && !emailComposeOpen ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                      <span>📥 Inbox</span>
                      <span>({emails.filter(m => m.recipient === currentUser.email).length})</span>
                    </button>
                    <button
                      onClick={() => { setEmailFolder('sent'); setEmailComposeOpen(false); }}
                      className={`w-full text-left px-2 py-1 font-medium flex justify-between ${emailFolder === 'sent' && !emailComposeOpen ? 'bg-neutral-100 text-neutral-900 font-bold' : 'text-neutral-500 hover:text-neutral-900'}`}
                    >
                      <span>📤 Sent Folder</span>
                      <span>({emails.filter(m => m.sender === currentUser.email).length})</span>
                    </button>
                  </div>

                  {/* Mailbox List Center Column */}
                  <div className="md:col-span-4 border-r border-neutral-200 pr-2 max-h-[350px] overflow-y-auto space-y-1.5">
                    {emailComposeOpen ? (
                      <div className="text-neutral-400 text-[10px] italic p-4 text-center">
                        Compose mode active
                      </div>
                    ) : userFilteredEmails.length === 0 ? (
                      <div className="text-neutral-400 text-[10px] p-4 text-center">
                        No emails in this queue
                      </div>
                    ) : (
                      userFilteredEmails.map(mail => (
                        <div
                          key={mail.id}
                          onClick={() => {
                            setSelectedEmailId(mail.id);
                            mail.unread = false;
                          }}
                          className={`p-2 border cursor-pointer transition-colors ${selectedEmailId === mail.id ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:bg-neutral-50'}`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold truncate max-w-[120px]">
                              {emailFolder === 'inbox' ? mail.senderName : `To: ${mail.recipient}`}
                            </span>
                            <span className="text-[9px] text-neutral-400">{mail.date}</span>
                          </div>
                          <p className="font-medium text-neutral-950 truncate">{mail.subject}</p>
                          <p className="text-[9px] text-neutral-500 truncate mt-0.5">{mail.body}</p>
                          {mail.enquiryId && (
                            <span className="inline-block mt-1 bg-neutral-100 px-1 text-[8px] font-mono border text-neutral-600">
                              {mail.enquiryId}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Detailed Email View Right Column */}
                  <div className="md:col-span-5 min-h-[300px] flex flex-col justify-between">
                    {emailComposeOpen ? (
                      /* COMPOSE EMAIL FORM */
                      <form onSubmit={handleSendEmail} className="space-y-3">
                        <span className="font-bold uppercase text-[9px] text-neutral-400 block border-b pb-1">New Message</span>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-0.5">Recipient (To:)</label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. sarah.j@tradedesk.com"
                            value={composeTo}
                            onChange={(e) => setComposeTo(e.target.value)}
                            className="w-full bg-white border border-neutral-200 px-2 py-1 text-[11px] focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-0.5">Subject</label>
                          <input
                            type="text"
                            required
                            placeholder="Session check, quote request..."
                            value={composeSubject}
                            onChange={(e) => setComposeSubject(e.target.value)}
                            className="w-full bg-white border border-neutral-200 px-2 py-1 text-[11px] focus:outline-none focus:border-neutral-900"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-0.5">Reference Enquiry ID (Optional)</label>
                            <select
                              value={composeEnquiry}
                              onChange={(e) => setComposeEnquiry(e.target.value)}
                              className="w-full bg-white border border-neutral-200 p-1 text-[11px] focus:outline-none focus:border-neutral-900"
                            >
                              <option value="">None</option>
                              {enquiries.map(e => (
                                <option key={e.id} value={e.id}>{e.id} - {e.customerName}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-neutral-400 block mb-0.5">Body Message</label>
                          <textarea
                            required
                            rows={4}
                            placeholder="Draft your operational memo here..."
                            value={composeBody}
                            onChange={(e) => setComposeBody(e.target.value)}
                            className="w-full bg-white border border-neutral-200 p-2 text-[11px] focus:outline-none focus:border-neutral-900 resize-none font-sans"
                          />
                        </div>
                        <div className="flex space-x-2 pt-1">
                          <button
                            type="submit"
                            className="bg-black text-white hover:bg-neutral-800 font-bold uppercase px-3 py-1 text-[9px] rounded-none"
                          >
                            Send Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setEmailComposeOpen(false)}
                            className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 font-bold uppercase px-3 py-1 text-[9px] rounded-none"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : activeEmail ? (
                      /* EMAIL READER PANEL */
                      <div className="space-y-3 bg-neutral-50 p-3 border border-neutral-200">
                        <div className="border-b border-neutral-200 pb-1.5 flex justify-between items-start">
                          <div>
                            <span className="font-bold text-neutral-950 block text-[11px]">{activeEmail.subject}</span>
                            <span className="text-[9px] text-neutral-500 block mt-0.5">From: {activeEmail.senderName} ({activeEmail.sender})</span>
                            <span className="text-[9px] text-neutral-500 block">To: {activeEmail.recipient}</span>
                          </div>
                          <span className="text-[9px] text-neutral-400 shrink-0">{activeEmail.date}</span>
                        </div>
                        <p className="text-neutral-800 text-[11px] leading-relaxed whitespace-pre-wrap">{activeEmail.body}</p>
                        
                        {activeEmail.enquiryId && (
                          <div className="border-t border-neutral-200 pt-2 flex justify-between items-center">
                            <span className="text-[9px] text-neutral-400 font-mono">Enquiry Connection:</span>
                            <button
                              onClick={() => {
                                setSelectedEnquiryId(activeEmail.enquiryId);
                                setCurrentView('enquiry-detail');
                                setActiveTab('Overview');
                              }}
                              className="text-neutral-900 hover:underline font-bold text-[9px] uppercase"
                            >
                              Go to Enquiry {activeEmail.enquiryId} →
                            </button>
                          </div>
                        )}
                        <div className="border-t border-neutral-200 pt-2 flex space-x-2">
                          <button
                            onClick={() => {
                              setEmailComposeOpen(true);
                              setComposeTo(activeEmail.sender);
                              setComposeSubject(`Re: ${activeEmail.subject}`);
                              setComposeBody(`\n\n--- Original Message from ${activeEmail.senderName} on ${activeEmail.date} ---\n${activeEmail.body}`);
                            }}
                            className="bg-black hover:bg-neutral-850 text-white text-[9px] font-bold uppercase py-1 px-3.5"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-neutral-400">
                        Select an email record to inspect
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW: FRONT-END SALES TRACKER              */}
          {/* ========================================== */}
          {currentView === 'sales-tracker' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2 flex justify-between items-end">
                <div>
                  <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Sales Enquiry Tracking Queue</h1>
                  <p className="text-neutral-500 text-[10px]">Primary trade terminal monitoring prospective and active crop requests.</p>
                </div>
                <button 
                  onClick={() => {
                    const generatedId = `ENQ-2026-${Math.floor(Math.random() * 9000) + 1000}`;
                    const newEnq = {
                      id: generatedId,
                      customerName: 'Siam Agritech Co.',
                      customerContact: 'Somchai Prasert',
                      product: 'White Pepper Powder (Steam Treated)',
                      quantity: '15 Metric Tons',
                      destinationPort: 'Bangkok, Thailand',
                      status: 'Costing Phase',
                      salesOwner: currentUser.name,
                      watchers: [],
                      createdDate: '2026-07-19',
                      timeline: [
                        { id: 1, text: 'Enquiry initialized', user: currentUser.name, date: 'Just now' }
                      ],
                      quotations: [{
                        id: `QTN-2026-${Math.floor(Math.random() * 900) + 100}`,
                        version: 'v1.0',
                        stage: 'Costing',
                        pricing: { baseCost: '—', logistics: '—', margin: '—', finalPrice: '—' },
                        costSheetUploaded: false,
                        fileName: 'Pending_Pepper_v1.0.pdf'
                      }],
                      sampling: { id: `SMP-2026-${Math.floor(Math.random()*900)+100}`, stage: 'Requested', carrier: 'DHL', trackingNumber: 'Pending', notes: 'Moisture target < 8%' },
                      purchaseOrder: null,
                      vendorApproval: { stage: 'Requested', vendorName: 'Thai Farms Joint-Venture', score: '88 out of 100', complianceCheck: 'Awaiting Assessment' },
                      contract: { version: 'v1.0-draft', signatureStatus: 'Awaiting Signature', file: 'Draft_Pepper_Contract.pdf' },
                      tasks: []
                    };
                    setEnquiries([newEnq, ...enquiries]);
                    triggerToast(`Created new Enquiry: ${generatedId}`);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-2.5 rounded-none text-[10px] uppercase"
                >
                  + Add Live Enquiry
                </button>
              </div>

              <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                      <th className="p-2">Enquiry ID</th>
                      <th className="p-2">Client Firm</th>
                      <th className="p-2">Product Specification</th>
                      <th className="p-2">Sourcing Volume</th>
                      <th className="p-2">Discharge Port</th>
                      <th className="p-2">Phase</th>
                      <th className="p-2 text-right font-bold">Owner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {filteredEnquiries.map(enq => (
                      <tr
                        key={enq.id}
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setCurrentView('enquiry-detail');
                          setActiveTab('Overview');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <td className="p-2 font-bold text-neutral-900 underline">{enq.id}</td>
                        <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                        <td className="p-2">{enq.product}</td>
                        <td className="p-2">{enq.quantity}</td>
                        <td className="p-2 font-mono">{enq.destinationPort}</td>
                        <td className="p-2">
                          <span className="bg-neutral-100 border border-neutral-200 px-1 py-0.2 text-[8px] font-bold text-neutral-800 uppercase">
                            {enq.status}
                          </span>
                        </td>
                        <td className="p-2 text-right font-medium text-neutral-600">{enq.salesOwner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VIEW: NEW SALES PROSPECTS & MARKETING     */}
          {/* ========================================== */}
          {currentView === 'sales-prospects' && (
            <div className="space-y-4">
              <div className="border-b border-neutral-200 pb-2 flex justify-between items-end">
                <div>
                  <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Outbound Marketing Prospects Pipeline</h1>
                  <p className="text-neutral-500 text-[10px]">Cold Outreach, Automated Email sequences, and LLM Powered Campaign Sourcing before active communication is promoted to Enquiries.</p>
                </div>
                <button
                  onClick={() => {
                    const nextId = `PRP-2026-${Math.floor(Math.random() * 900) + 100}`;
                    const newProspect = {
                      id: nextId,
                      companyName: 'Apex Spice Merchants',
                      contactName: 'Sarah Connors',
                      email: 'connors@apexspices.co.uk',
                      cropInterest: 'Premium Organic Cardamom',
                      estimatedVolume: '15 Metric Tons',
                      status: 'Cold outreach',
                      replyReceived: false,
                      lastOutboundCampaign: 'Premium Spices Introduction',
                      emailsSent: 0,
                      nextSchedule: 'Pending Generation',
                      sentiment: 'Discovered',
                      aiDraft: ''
                    };
                    setProspects([newProspect, ...prospects]);
                    triggerToast(`Added discovered lead: ${newProspect.companyName}`);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-bold py-1 px-2.5 rounded-none text-[10px] uppercase"
                >
                  + Add Outreach Prospect
                </button>
              </div>

              {/* Marketing Performance Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total Prospect Pool</span>
                  <p className="text-base font-black text-neutral-900 mt-1">{prospects.length} Targeted Companies</p>
                  <span className="text-neutral-500 text-[9px]">Cold Outreach Sourcing Campaign</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active Outbound Sequences</span>
                  <p className="text-base font-black text-neutral-900 mt-1">{campaigns.filter(c => c.active).length} Sequences Active</p>
                  <span className="text-emerald-600 text-[9px] font-bold">● High Deliverability</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Response Rate</span>
                  <p className="text-base font-black text-neutral-900 mt-1">
                    {Math.round((prospects.filter(p => p.replyReceived).length / prospects.length) * 100)}% Conversion
                  </p>
                  <span className="text-neutral-500 text-[9px]">Average reply benchmark</span>
                </div>
                <div className="bg-white border p-3 font-mono">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active AI Outreach Service</span>
                  <p className="text-base font-black text-emerald-600 mt-1">ONLINE</p>
                  <span className="text-neutral-500 text-[9px]">gemini-3-flash-preview ready</span>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Outbound Prospect Queue List */}
                <div className="xl:col-span-2 space-y-3">
                  <div className="bg-white border border-neutral-200 p-3 rounded-none">
                    <span className="font-bold text-[9px] text-neutral-400 uppercase tracking-wider block mb-2">Unconnected Sourcing Leads</span>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                            <th className="p-2">Lead ID</th>
                            <th className="p-2">Company / Contact</th>
                            <th className="p-2">Crop Interest</th>
                            <th className="p-2">Outbound Campaign</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-neutral-700">
                          {prospects.map(p => (
                            <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="p-2 font-mono font-bold text-neutral-900">{p.id}</td>
                              <td className="p-2">
                                <span className="block font-bold text-neutral-950">{p.companyName}</span>
                                <span className="block text-neutral-500 text-[9px]">{p.contactName} ({p.email})</span>
                              </td>
                              <td className="p-2">
                                <span className="block font-medium">{p.cropInterest}</span>
                                <span className="block text-neutral-400 text-[9px]">Volume: {p.estimatedVolume}</span>
                              </td>
                              <td className="p-2 text-neutral-600">
                                <span className="block">{p.lastOutboundCampaign || 'No campaign assigned'}</span>
                                <span className="block text-[9px] text-neutral-400">Emails dispatched: {p.emailsSent}</span>
                              </td>
                              <td className="p-2">
                                <span className={`inline-block px-1.5 py-0.2 text-[8px] font-bold border uppercase ${
                                  p.status === 'Enquiry Active' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                    : p.replyReceived 
                                      ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                                }`}>
                                  {p.status}
                                </span>
                                {p.replyReceived && p.status !== 'Enquiry Active' && (
                                  <span className="block text-[8px] text-emerald-600 font-bold mt-0.5">✔ Active Reply</span>
                                )}
                              </td>
                              <td className="p-2 text-right space-y-1">
                                {p.status !== 'Enquiry Active' ? (
                                  <>
                                    <button
                                      onClick={() => handleGenerateAIOutreach(p.id)}
                                      disabled={aiGeneratingId === p.id}
                                      className="bg-neutral-950 hover:bg-neutral-850 text-white text-[9px] px-2 py-0.5 rounded-none uppercase block w-full text-center"
                                    >
                                      {aiGeneratingId === p.id ? 'Generating...' : 'Gen AI Outreach'}
                                    </button>
                                    {p.replyReceived && (
                                      <button
                                        onClick={() => promoteProspectToEnquiry(p.id)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] px-2 py-0.5 rounded-none uppercase block w-full text-center font-bold"
                                      >
                                        Convert to Enquiry →
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[9px] text-emerald-600 block italic font-bold">Deal Promoted</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* AI Outbound Copy & Automation Campaign Scheduler sidebar */}
                <div className="space-y-4">
                  
                  {/* Campaign Outbox Sequence Scheduler */}
                  <div className="bg-white border border-neutral-200 p-3 rounded-none">
                    <span className="font-bold text-[9px] text-neutral-400 uppercase tracking-wider block border-b pb-1 mb-2">Outbound Automation Sequences</span>
                    <div className="space-y-3">
                      {campaigns.map(c => (
                        <div key={c.id} className="p-2 border border-neutral-100 bg-neutral-50 text-[10px] space-y-1">
                          <div className="flex justify-between items-center">
                            <strong className="text-neutral-950">{c.name}</strong>
                            <span className={`text-[8px] font-bold px-1 ${c.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-neutral-200 text-neutral-500'}`}>
                              {c.active ? 'ACTIVE RUNNING' : 'PAUSED'}
                            </span>
                          </div>
                          <p className="text-neutral-500">Audience: {c.targetAudience} &bull; {c.scheduleType}</p>
                          <div className="flex justify-between items-center pt-1 border-t border-neutral-200 text-[9px]">
                            <span>Dispatched today: <strong>{c.sentToday} outbounds</strong></span>
                            <button
                              onClick={() => {
                                setCampaigns(prev => prev.map(item => {
                                  if (item.id === c.id) return { ...item, active: !item.active };
                                  return item;
                                }));
                                triggerToast(`${c.name} automation status modified.`);
                              }}
                              className="text-neutral-900 underline hover:no-underline font-bold uppercase"
                            >
                              Toggle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Copywriting Draft Display Box */}
                  <div className="bg-white border border-neutral-200 p-3 rounded-none">
                    <div className="border-b pb-1.5 mb-2 flex justify-between items-center">
                      <span className="font-bold text-[9px] text-neutral-400 uppercase tracking-wider block">AI Custom Copywriter Playground</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-[8px] text-neutral-400">Tone:</span>
                        <select
                          value={selectedTone}
                          onChange={(e) => setSelectedTone(e.target.value)}
                          className="bg-neutral-100 border border-neutral-200 text-[8px] focus:outline-none"
                        >
                          <option value="Premium">Premium</option>
                          <option value="Urgent">Urgent Promo</option>
                          <option value="Direct">Concise Direct</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-neutral-500 mb-2">Click "Gen AI Outreach" on any active prospect. The customized B2B proposal drafted via Gemini AI will populate instantly below for review and outbound scheduling.</p>

                    <div className="bg-neutral-50 border p-2 min-h-[140px] text-neutral-800 leading-relaxed font-mono whitespace-pre-wrap text-[9px]">
                      {prospects.some(p => p.aiDraft) ? (
                        prospects.find(p => p.aiDraft && p.status !== 'Enquiry Active')?.aiDraft || "Select an active unpromoted lead to draft outbound campaign pitch text."
                      ) : (
                        "Initiate copywriting outbound sequence with Google Gemini Outbound models."
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CHILD VIEW: SALES QUOTATIONS LOG           */}
          {/* ========================================== */}
          {currentView === 'sales-quotations' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Quotations Summary</h1>
                <p className="text-neutral-500 text-[10px]">Commercial pricing schedules, including inland logistics and targeting margins.</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                      <th className="p-2">Quotation ID</th>
                      <th className="p-2">Enquiry Parent</th>
                      <th className="p-2">Client Firm</th>
                      <th className="p-2">Procurement Base</th>
                      <th className="p-2">Logistics Quote</th>
                      <th className="p-2">Sales Margin</th>
                      <th className="p-2 font-bold">Total Proposal Price</th>
                      <th className="p-2">Phase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {enquiries.map(enq => enq.quotations.map(q => (
                      <tr 
                        key={q.id}
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setCurrentView('enquiry-detail');
                          setActiveTab('Quotations');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <td className="p-2 font-bold text-neutral-900 underline">{q.id}</td>
                        <td className="p-2 font-mono">{enq.id}</td>
                        <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                        <td className="p-2">{q.pricing.baseCost}</td>
                        <td className="p-2">{q.pricing.logistics}</td>
                        <td className="p-2">{q.pricing.margin}</td>
                        <td className="p-2 font-mono font-bold text-neutral-900">{q.pricing.finalPrice}</td>
                        <td className="p-2">
                          <span className="bg-neutral-100 border border-neutral-200 px-1 py-0.2 text-[8px] font-bold text-neutral-700 uppercase">
                            {q.stage}
                          </span>
                        </td>
                      </tr>
                    )))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CHILD VIEW: SALES SAMPLING LOG             */}
          {/* ========================================== */}
          {currentView === 'sales-sampling' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Sampling Log</h1>
                <p className="text-neutral-500 text-[10px]">Air waybill tracking for vacuum-sealed quality checking packets.</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                      <th className="p-2">Sample ID</th>
                      <th className="p-2">Enquiry Parent</th>
                      <th className="p-2">Client Firm</th>
                      <th className="p-2">Logistics Courier</th>
                      <th className="p-2">AWB Tracking Reference</th>
                      <th className="p-2">Lab Assessment Notes</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {enquiries.map(enq => (
                      <tr 
                        key={enq.sampling.id}
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setCurrentView('enquiry-detail');
                          setActiveTab('Sampling');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <td className="p-2 font-bold text-neutral-900 underline">{enq.sampling.id}</td>
                        <td className="p-2 font-mono">{enq.id}</td>
                        <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                        <td className="p-2">{enq.sampling.carrier}</td>
                        <td className="p-2 font-mono">{enq.sampling.trackingNumber}</td>
                        <td className="p-2 text-neutral-500">{enq.sampling.notes}</td>
                        <td className="p-2">
                          <span className="bg-neutral-100 border border-neutral-200 px-1 py-0.2 text-[8px] font-bold text-neutral-700 uppercase">
                            {enq.sampling.stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CHILD VIEW: PURCHASE ORDERS LOG           */}
          {/* ========================================== */}
          {currentView === 'sales-pos' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Purchase Orders</h1>
                <p className="text-neutral-500 text-[10px]">Active production contracts detailing total cargo value and container slots.</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                      <th className="p-2">PO ID</th>
                      <th className="p-2">Enquiry Parent</th>
                      <th className="p-2">Client Firm</th>
                      <th className="p-2">Total Financial Value</th>
                      <th className="p-2">Container Allocation</th>
                      <th className="p-2">Shipping Carrier</th>
                      <th className="p-2">Loading Target Date</th>
                      <th className="p-2">Stage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {enquiries.map(enq => {
                      if (!enq.purchaseOrder) return null;
                      return (
                        <tr 
                          key={enq.purchaseOrder.id}
                          onClick={() => {
                            setSelectedEnquiryId(enq.id);
                            setCurrentView('enquiry-detail');
                            setActiveTab('Purchase Orders');
                          }}
                          className="hover:bg-neutral-50 cursor-pointer transition-colors"
                        >
                          <td className="p-2 font-bold text-neutral-900 underline">{enq.purchaseOrder.id}</td>
                          <td className="p-2 font-mono">{enq.id}</td>
                          <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                          <td className="p-2 font-mono font-bold">{enq.purchaseOrder.totalValue}</td>
                          <td className="p-2">{enq.purchaseOrder.shippingContainerCount}</td>
                          <td className="p-2">{enq.purchaseOrder.carrier}</td>
                          <td className="p-2 font-mono">{enq.purchaseOrder.loadingDate}</td>
                          <td className="p-2">
                            <span className="bg-neutral-900 text-white px-1 py-0.2 text-[8px] font-bold uppercase">
                              {enq.purchaseOrder.stage}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CHILD VIEW: VENDOR APPROVALS               */}
          {/* ========================================== */}
          {currentView === 'sales-vendors' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Sourcing Co-Operatives</h1>
                <p className="text-neutral-500 text-[10px]">Agronomic field units, safety ratings, and custom clearance statuses.</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                      <th className="p-2">Enquiry Parent</th>
                      <th className="p-2">Farming Cooperative</th>
                      <th className="p-2">Safety Compliance Score</th>
                      <th className="p-2">Quarantine Assessment</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {enquiries.map(enq => (
                      <tr 
                        key={enq.id}
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setCurrentView('enquiry-detail');
                          setActiveTab('Vendor Approvals');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <td className="p-2 font-mono font-bold text-neutral-900 underline">{enq.id}</td>
                        <td className="p-2 font-semibold text-neutral-950">{enq.vendorApproval.vendorName}</td>
                        <td className="p-2">{enq.vendorApproval.score}</td>
                        <td className="p-2 font-mono">{enq.vendorApproval.complianceCheck}</td>
                        <td className="p-2">
                          <span className="bg-neutral-100 border border-neutral-200 px-1.5 py-0.2 text-[8px] font-bold text-neutral-700 uppercase">
                            {enq.vendorApproval.stage}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* CHILD VIEW: CONTRACTS REGISTER             */}
          {/* ========================================== */}
          {currentView === 'sales-contracts' && (
            <div className="space-y-3">
              <div className="border-b border-neutral-200 pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Front-End: Contracts Log</h1>
                <p className="text-neutral-500 text-[10px]">Commercial sales agreements and legal digital signatures.</p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-none overflow-hidden">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] text-neutral-400 uppercase font-mono">
                      <th className="p-2">Enquiry Parent</th>
                      <th className="p-2">Client Firm</th>
                      <th className="p-2">Sales Agreement Document</th>
                      <th className="p-2">Execution Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-700">
                    {enquiries.map(enq => (
                      <tr 
                        key={enq.id}
                        onClick={() => {
                          setSelectedEnquiryId(enq.id);
                          setCurrentView('enquiry-detail');
                          setActiveTab('Contracts');
                        }}
                        className="hover:bg-neutral-50 cursor-pointer transition-colors"
                      >
                        <td className="p-2 font-mono font-bold text-neutral-900 underline">{enq.id}</td>
                        <td className="p-2 font-semibold text-neutral-950">{enq.customerName}</td>
                        <td className="p-2 font-mono">{enq.contract.file} ({enq.contract.version})</td>
                        <td className="p-2">
                          <span className="bg-neutral-100 border px-2 py-0.2 text-[8px] font-bold uppercase text-neutral-600">
                            {enq.contract.signatureStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* THE CENTRAL HUB: ENQUIRY DETAILS VIEW                     */}
          {/* ========================================================= */}
          {currentView === 'enquiry-detail' && activeEnquiry && (
            <div className="space-y-4">
              
              {/* Header Context Bar */}
              <div className="bg-white border border-neutral-200 p-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 rounded-none">
                <div>
                  <span className="bg-neutral-950 text-white text-[8px] font-bold px-1.5 py-0.2 uppercase">Deal Central Hub</span>
                  <h2 className="text-xs font-bold text-neutral-950 mt-1">
                    {activeEnquiry.id} &mdash; {activeEnquiry.customerName}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1 text-[9px]">
                  <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
                    Stage: <strong>{activeEnquiry.status}</strong>
                  </span>
                  <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
                    Discharge: <strong>{activeEnquiry.destinationPort}</strong>
                  </span>
                  <span className="border border-neutral-200 bg-neutral-50 px-2 py-0.5">
                    Owner: <strong>{activeEnquiry.salesOwner}</strong>
                  </span>
                </div>
              </div>

              {/* Sub-Module Navigation Tabs */}
              <div className="flex border-b border-neutral-200 bg-white p-0.5 rounded-none overflow-x-auto">
                {['Overview', 'Quotations', 'Sampling', 'Purchase Orders', 'Vendor Approvals', 'Contracts', 'Internal Collaboration Panel'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase shrink-0 rounded-none transition-colors ${
                      activeTab === tab
                        ? 'bg-neutral-950 text-white'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Viewport for Active Tab */}
              <div className="bg-white border border-neutral-200 p-4 rounded-none">
                
                {/* 1. OVERVIEW & TIMELINE */}
                {activeTab === 'Overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-4">
                      <div className="grid grid-cols-2 gap-3 border border-neutral-200 p-3 bg-neutral-50 text-[10px]">
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase font-bold">Cargo Description</span>
                          <span className="font-bold text-neutral-900">{activeEnquiry.product}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase font-bold">Shipment Volume</span>
                          <span className="font-bold text-neutral-900">{activeEnquiry.quantity}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase font-bold">Corporate Buyer</span>
                          <span className="font-bold text-neutral-900">{activeEnquiry.customerName}</span>
                        </div>
                        <div>
                          <span className="text-neutral-400 block text-[8px] uppercase font-bold">Discharge Port Terminals</span>
                          <span className="font-bold text-neutral-900">{activeEnquiry.destinationPort}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Log Feed */}
                    <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-none">
                      <span className="font-bold text-[8px] text-neutral-400 uppercase tracking-wider block mb-2">Chronological Activity Log</span>
                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {activeEnquiry.timeline.slice().reverse().map(log => (
                          <div key={log.id} className="text-[9px] leading-relaxed border-b border-neutral-200 pb-1.5">
                            <p className="text-neutral-900 font-medium">{log.text}</p>
                            <span className="text-[8px] text-neutral-400 block mt-0.5">Author: {log.user} &bull; {log.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. QUOTATIONS */}
                {activeTab === 'Quotations' && (
                  <div className="space-y-3">
                    {activeEnquiry.quotations.map(q => (
                      <div key={q.id} className="border border-neutral-200 bg-neutral-50 p-3 rounded-none space-y-3 text-[10px]">
                        <div className="flex justify-between items-center border-b pb-1.5">
                          <span className="font-bold">QTN RECORD: {q.id} (Version {q.version})</span>
                          <span className="bg-white border px-2 py-0.5 text-[8px] font-bold uppercase">{q.stage}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 bg-white p-2 border">
                          <div>
                            <span className="text-neutral-400 block text-[8px] uppercase">FOB Procurement Base</span>
                            <span className="font-bold text-neutral-900">{q.pricing.baseCost}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[8px] uppercase">Inland/Ocean Logistics</span>
                            <span className="font-bold text-neutral-900">{q.pricing.logistics}</span>
                          </div>
                          <div>
                            <span className="text-neutral-400 block text-[8px] uppercase font-bold">Corporate Margin</span>
                            <span className="font-bold text-neutral-900">{q.pricing.margin}</span>
                          </div>
                          <div>
                            <span className="text-neutral-900 block font-bold text-[8px] uppercase">Total Proposal Price</span>
                            <span className="font-bold text-neutral-900 font-mono">{q.pricing.finalPrice}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. SAMPLING */}
                {activeTab === 'Sampling' && (
                  <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
                    <div className="flex justify-between items-center border-b pb-1">
                      <span className="font-bold">WAYBILL: {activeEnquiry.sampling.id}</span>
                      <span className="bg-white border px-2 py-0.5 text-[8px] font-bold uppercase">{activeEnquiry.sampling.stage}</span>
                    </div>
                    <p>Carrier Assigned: <strong>{activeEnquiry.sampling.carrier}</strong></p>
                    <p>Air Waybill Number: <span className="font-mono">{activeEnquiry.sampling.trackingNumber}</span></p>
                  </div>
                )}

                {/* 4. PURCHASE ORDERS */}
                {activeTab === 'Purchase Orders' && (
                  <div className="text-[10px]">
                    {!activeEnquiry.purchaseOrder ? (
                      <div className="text-center py-4 border border-dashed border-neutral-200 text-neutral-400">
                        No active purchase order linked yet. (Triggers when quote moves to WON stage).
                      </div>
                    ) : (
                      <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2">
                        <div className="flex justify-between items-center border-b pb-1">
                          <span className="font-bold text-neutral-900">PO RECORD: {activeEnquiry.purchaseOrder.id}</span>
                          <span className="bg-neutral-950 text-white px-2 py-0.5 text-[8px] uppercase">{activeEnquiry.purchaseOrder.stage}</span>
                        </div>
                        <p>Total Financial Value: <span className="font-bold font-mono">{activeEnquiry.purchaseOrder.totalValue}</span></p>
                        <p>Loading Target Date: <span className="font-mono">{activeEnquiry.purchaseOrder.loadingDate}</span></p>
                      </div>
                    )}
                  </div>
                )}

                {/* 5. VENDOR APPROVALS */}
                {activeTab === 'Vendor Approvals' && (
                  <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
                    <p>Assigned Sourcing Cooperative: <strong>{activeEnquiry.vendorApproval.vendorName}</strong></p>
                    <p>Agronomic field safety rating: <span className="font-bold">{activeEnquiry.vendorApproval.score}</span></p>
                    <p>Quarantine assessment status: <span className="font-mono">{activeEnquiry.vendorApproval.complianceCheck}</span></p>
                  </div>
                )}

                {/* 6. CONTRACTS */}
                {activeTab === 'Contracts' && (
                  <div className="border border-neutral-200 bg-neutral-50 p-3 space-y-2 text-[10px]">
                    <p>File Target: <span className="font-mono">{activeEnquiry.contract.file} ({activeEnquiry.contract.version})</span></p>
                    <p>Signatures Status: <strong>{activeEnquiry.contract.signatureStatus}</strong></p>
                  </div>
                )}

                {/* 7. INTERNAL COLLABORATION (TASK DELEGATION BOX & CHAT TRIGGER) */}
                {activeTab === 'Internal Collaboration Panel' && (
                  <div className="space-y-3">
                    <span className="font-bold block uppercase text-[9px] tracking-tight text-neutral-400">Delegate Background Checks to Departments</span>
                    <div className="p-3 border bg-neutral-50 text-[10px]">
                      <p className="text-neutral-500 mb-2">Sales owners can dispatch background duties and collaborate on them using internal chat channels.</p>
                      <button
                        onClick={() => {
                          const generatedTaskId = `TSK-${Math.floor(Math.random() * 900) + 100}`;
                          const newTask = {
                            id: generatedTaskId,
                            title: 'Perform Phytosanitary Safety Evaluation',
                            type: 'Action Item',
                            assignee: 'Sophia Miller',
                            department: 'Compliance',
                            dueDate: '2026-07-28',
                            priority: 'High',
                            status: 'Pending',
                            linkedRecord: activeEnquiry.id,
                            description: 'Moisture target checks on physical raw cargo samples before logistics release.',
                            watchers: ['Elena Rostova'],
                            comments: []
                          };
                          setEnquiries(prev => prev.map(item => {
                            if (item.id === activeEnquiry.id) {
                              return {
                                ...item,
                                tasks: [...item.tasks, newTask],
                                timeline: [
                                  ...item.timeline,
                                  {
                                    id: Date.now(),
                                    text: `Sales assigned task [${generatedTaskId}] to Compliance Desk.`,
                                    user: currentUser.name,
                                    date: 'Just now'
                                  }
                                ]
                              };
                            }
                            return item;
                          }));
                          triggerToast(`Task ${generatedTaskId} delegated to Compliance Desk.`);
                        }}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1 text-[9px] rounded-none transition-colors"
                      >
                        + Delegate Sample Compliance Check (Compliance Desk)
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-bold text-[8px] uppercase text-neutral-400">Current Deal Task Status Stack (Click on any task to open its Chat Workspace)</span>
                      {activeEnquiry.tasks.map(t => (
                        <div key={t.id} className="p-2 border bg-neutral-50 flex justify-between items-center text-[10px] hover:bg-neutral-100 transition-colors">
                          <div className="cursor-pointer" onClick={() => setActiveTaskId(t.id)}>
                            <span className="font-bold block text-neutral-900 hover:underline">{t.title} ({t.id})</span>
                            <span className="text-[9px] text-neutral-500">Assignee: {t.assignee} ({t.department}) &bull; Due: {t.dueDate} &bull; Watchers: {t.watchers ? t.watchers.join(', ') : 'None'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setActiveTaskId(t.id)}
                              className="bg-white border border-neutral-300 hover:bg-neutral-50 px-2 py-0.5 text-[8px] font-bold uppercase"
                            >
                              Workspace Chat ({t.comments ? t.comments.length : 0})
                            </button>
                            <span className="bg-neutral-200 border px-1.5 py-0.5 font-mono text-[8px] uppercase font-bold">{t.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPERATIONS BACK-END VIEW: 1. COSTING DESK                 */}
          {/* ========================================================= */}
          {currentView === 'ops-costing' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Costing Desk Terminal</h1>
                <p className="text-neutral-500 text-[10px]">Compile crop pricing indices, container carriage calculations, and forward to sales review.</p>
              </div>

              <div className="bg-white border p-4 space-y-3">
                <span className="font-bold text-[10px] block border-b pb-1">PROFORMA PRICING SHEET COMPILATION (ENQ-2026-0012)</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div>
                    <label className="text-[8px] text-neutral-400 block uppercase font-bold mb-1">Base Procurement Cost (FOB/MT)</label>
                    <input
                      type="number"
                      value={inputBaseCost}
                      onChange={(e) => setInputBaseCost(e.target.value)}
                      className="w-full bg-white border px-2 py-1 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-neutral-400 block uppercase font-bold mb-1">Inland & Ocean Freight Factors</label>
                    <input
                      type="number"
                      value={inputLogistics}
                      onChange={(e) => setInputLogistics(e.target.value)}
                      className="w-full bg-white border px-2 py-1 text-[11px] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-neutral-400 block uppercase font-bold mb-1">Margin Allocation Threshold</label>
                    <input
                      type="number"
                      value={inputMargin}
                      onChange={(e) => setInputMargin(e.target.value)}
                      className="w-full bg-white border px-2 py-1 text-[11px] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-[10px] text-neutral-600">
                    Sourcing Total: <strong>${(parseFloat(inputBaseCost || 0) + parseFloat(inputLogistics || 0) + parseFloat(inputMargin || 0)).toLocaleString()} / MT</strong>
                  </span>
                  <button
                    onClick={() => handleSourcingCostSubmit('ENQ-2026-0012', 'QTN-2026-0405')}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1.5 text-[9px] transition-colors rounded-none"
                  >
                    Lock Sheet & Dispatch Quote
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPERATIONS BACK-END VIEW: 2. SAMPLING DESK                */}
          {/* ========================================================= */}
          {currentView === 'ops-sampling' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sampling Desk Terminal</h1>
                <p className="text-neutral-500 text-[10px]">Prepare physical sealed sample packs and register shipping waybills.</p>
              </div>

              <div className="bg-white border p-4 space-y-3">
                <span className="font-bold text-[10px] block border-b pb-1">COURIER DISPATCH WAYBILL REGISTRATION (ENQ-2026-0012)</span>
                <div>
                  <label className="text-[8px] text-neutral-400 block uppercase font-bold mb-1">Air Waybill Tracking Number</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={sampleTrackingInput}
                      onChange={(e) => setSampleTrackingInput(e.target.value)}
                      className="bg-white border px-2 py-1 text-[11px] focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => handleSamplingSubmit('ENQ-2026-0012', sampleTrackingInput)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1 text-[9px] transition-colors rounded-none"
                    >
                      Verify & Release Cargo Sample
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPERATIONS BACK-END VIEW: 3. LOGISTICS DESK               */}
          {/* ========================================================= */}
          {currentView === 'ops-logistics' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Logistics Booking Terminal</h1>
                <p className="text-neutral-500 text-[10px]">Secure container freight slots and assign transport vessels.</p>
              </div>

              <div className="bg-white border p-4 space-y-3">
                <span className="font-bold text-[10px] block border-b pb-1">OCEAN FREIGHT SPACE LOCKOUT (ENQ-2026-0013)</span>
                <div>
                  <label className="text-[8px] text-neutral-400 block uppercase font-bold mb-1">Assigned Carrier Transport</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedVessel}
                      onChange={(e) => setSelectedVessel(e.target.value)}
                      className="bg-white border px-2 py-1 text-[11px] focus:outline-none flex-1"
                    >
                      <option value="ONE Blue Ocean V-092">ONE Blue Ocean V-092 (Ocean Network Express)</option>
                      <option value="Maersk Levant V-881">Maersk Levant V-881 (A.P. Moller-Maersk)</option>
                      <option value="CMA CGM Fortitude V-112">CMA CGM Fortitude V-112 (CMA CGM Group)</option>
                    </select>
                    <button
                      onClick={() => handleLogisticsSubmit('ENQ-2026-0013', selectedVessel)}
                      className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1.5 text-[9px] transition-colors rounded-none"
                    >
                      Lock Shipping Space
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPERATIONS BACK-END VIEW: 4. COMPLIANCE DESK              */}
          {/* ========================================================= */}
          {currentView === 'ops-compliance' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Compliance Verification Desk</h1>
                <p className="text-neutral-500 text-[10px]">Stamping clearance documents and phytosanitary certificates.</p>
              </div>

              <div className="bg-white border p-4 space-y-3">
                <span className="font-bold text-[10px] block border-b pb-1">PHYTOSANITARY EXPORT SANITATION SEAL (ENQ-2026-0013)</span>
                <p className="text-neutral-500 text-[10px]">Stamping certifies that farm-level moisture evaluations comply with local agriculture directives.</p>
                <button
                  onClick={() => handleComplianceSubmit('ENQ-2026-0013')}
                  className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase px-3 py-1.5 text-[9px] transition-colors rounded-none"
                >
                  ✓ Stamp Agricultural Clearance Certificate
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* AUDIT DASHBOARD 1: SALES TRADE STATS                      */}
          {/* ========================================================= */}
          {currentView === 'dash-sales' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sales Trade Dashboard</h1>
                <p className="text-neutral-500 text-[10px]">Pipeline funnels and metrics reserved for Sales Management.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Active Funnel Value</span>
                  <p className="text-base font-black text-neutral-900 mt-1">$412,500</p>
                  <p className="text-[9px] text-emerald-600 mt-0.5">↑ +14% Target variance</p>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Win Latency</span>
                  <p className="text-base font-black text-neutral-900 mt-1">11.4 Days</p>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Prospect initialization to PO signing</p>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Sales Target Match</span>
                  <p className="text-base font-black text-neutral-900 mt-1">88.2%</p>
                  <p className="text-[9px] text-neutral-500 mt-0.5">Completed quarterly quotas</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* AUDIT DASHBOARD 2: COSTING TURNAROUND                     */}
          {/* ========================================================= */}
          {currentView === 'dash-costing' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Costing Turnaround Analytics</h1>
                <p className="text-neutral-500 text-[10px]">Workload statistics reserved for Costing Management.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Pricing Estimation Speed</span>
                  <p className="text-base font-black text-neutral-900 mt-1">4.2 Hours</p>
                  <span className="text-[9px] text-emerald-600 block mt-0.5">Target variance: -7.8 hours</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Outstanding Pricing Requests</span>
                  <p className="text-base font-black text-neutral-900 mt-1">2 Sheets</p>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Actively compiling</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* AUDIT DASHBOARD 3: SAMPLING QUALITY                       */}
          {/* ========================================================= */}
          {currentView === 'dash-sampling' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Sampling Quality Assurance Dashboard</h1>
                <p className="text-neutral-500 text-[10px]">Sealing, transit latency, and lab quality indicators.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Pre-Transit Moisture Score</span>
                  <p className="text-base font-black text-neutral-900 mt-1">99.1%</p>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Under moisture limit target</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Courier Hand-Off Latency</span>
                  <p className="text-base font-black text-neutral-900 mt-1">2.1 Days</p>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Lab sampling cycle time</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Vacuum Seal Issues</span>
                  <p className="text-base font-black text-neutral-900 mt-1">0 cases</p>
                  <span className="text-[9px] text-emerald-600 block mt-0.5">Zero failures registered</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* AUDIT DASHBOARD 4: LOGISTICS KPIS                         */}
          {/* ========================================================= */}
          {currentView === 'dash-logistics' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Logistics & Freight KPIs</h1>
                <p className="text-neutral-500 text-[10px]">Cargo scheduling and demurrage compliance.</p>
              </div>

              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Assigned Freight Allocation</span>
                  <p className="text-base font-black text-neutral-900 mt-1">3 FEU</p>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Active maritime slots</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">On-Time Cargo Loading</span>
                  <p className="text-base font-black text-neutral-900 mt-1">96.4%</p>
                  <span className="text-[9px] text-emerald-600 block mt-0.5">Zero delays on active transport</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Active Demurrage Penalties</span>
                  <p className="text-base font-black text-neutral-900 mt-1">$0</p>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Full transport compliance</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* AUDIT DASHBOARD 5: COMPLIANCE AUDITS                      */}
          {/* ========================================================= */}
          {currentView === 'dash-compliance' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h1 className="text-xs font-bold text-neutral-900 uppercase">Compliance Verification Log</h1>
                <p className="text-neutral-500 text-[10px]">Quarantine clearances and agronomic field reports.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Farm Sanitation Clearance Pass</span>
                  <p className="text-base font-black text-neutral-900 mt-1">100% Passed</p>
                  <span className="text-[9px] text-emerald-600 block mt-0.5">Validated sourcing safety clearances</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[9px] uppercase font-bold">Certificate Stamp SLA</span>
                  <p className="text-base font-black text-neutral-900 mt-1">1.2 Days</p>
                  <span className="text-[9px] text-neutral-500 block mt-0.5">Average certification processing time</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* THE PRESIDENTIAL COMMAND OVERVIEW                         */}
          {/* ========================================================= */}
          {currentView === 'presidential-overview' && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-xs font-bold text-neutral-900 uppercase tracking-tight">Presidential Command Overview</h1>
                    <p className="text-neutral-500 text-[10px]">Central organizational health, operational throughput, and global financial funnel indicators.</p>
                  </div>
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 text-[8px] font-bold font-mono tracking-tight uppercase border border-amber-200">Executive clearance level</span>
                </div>
              </div>

              {/* High-Level Scorecard Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-[10px]">
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Total Organization Pipeline Value</span>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">$1,452,500</p>
                  <span className="text-emerald-600 text-[9px] font-bold">↑ +18.4% YoY Growth</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Average Company-Wide SLA</span>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">94.2%</p>
                  <span className="text-neutral-500 text-[9px]">Across background operational departments</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Active Enquiries in Queue</span>
                  <p className="text-lg font-black text-neutral-900 mt-0.5">{enquiries.length} Active</p>
                  <span className="text-neutral-500 text-[9px]">Sourcing total: 72 Metric Tons</span>
                </div>
                <div className="bg-white border p-3">
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Pending New Roadblocks</span>
                  <p className="text-lg font-black text-red-600 mt-0.5">
                    {globalTasks.filter(t => t.status === 'Overdue').length} Overdue
                  </p>
                  <span className="text-red-500 text-[9px] font-bold">Requires escalation</span>
                </div>
              </div>

              {/* Departmental Workload Map */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                
                {/* Departmental Workload & Task Balancing */}
                <div className="bg-white border p-3 space-y-3">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1.5">Department Task Distribution Matrix</span>
                  
                  <div className="space-y-2">
                    {['Sales', 'Costing', 'Sampling', 'Logistics', 'Compliance'].map(dept => {
                      const count = globalTasks.filter(t => t.department === dept && t.status !== 'Completed').length;
                      const completedCount = globalTasks.filter(t => t.department === dept && t.status === 'Completed').length;
                      const percentage = (completedCount / (count + completedCount || 1)) * 100;
                      return (
                        <div key={dept} className="space-y-1 text-[10px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-neutral-850">{dept} Team</span>
                            <span className="text-neutral-500 text-[9px]">
                              {count} Pending &bull; {completedCount} Resolved ({Math.round(percentage)}% Success Rate)
                            </span>
                          </div>
                          <div className="w-full bg-neutral-100 h-1.5 rounded-none overflow-hidden">
                            <div className="bg-black h-1.5" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Company-Wide Active Deals Sourcing Funnel */}
                <div className="bg-white border p-3 space-y-3">
                  <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-400 block border-b pb-1.5">Organizational Deal Ledger</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {enquiries.map(enq => (
                      <div key={enq.id} className="p-2 border bg-neutral-50 text-[10px] flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-neutral-900">{enq.id} &mdash; {enq.customerName}</span>
                          <span className="text-[9px] text-neutral-500">Product: {enq.product} ({enq.quantity})</span>
                        </div>
                        <div className="text-right">
                          <span className="bg-white border text-neutral-700 px-1.5 py-0.5 text-[8px] font-bold font-mono uppercase block">
                            {enq.status}
                          </span>
                          <span className="text-[8px] text-neutral-400 mt-0.5 block">Owner: {enq.salesOwner}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ACCESS BARRIER: RESTRICTED VIEWS PANEL                    */}
          {/* ========================================================= */}
          {currentView.startsWith('denied-') && (
            <div className="bg-white border border-neutral-200 p-8 text-center max-w-md mx-auto space-y-3">
              <span className="text-2xl block">🔒</span>
              <h2 className="text-xs font-bold uppercase text-neutral-900">Access Restricted</h2>
              <p className="text-neutral-500 leading-relaxed text-[10px]">
                Your active profile simulator (<strong>{currentUser.name}</strong>, assigned to the <strong>{currentUser.department} Team</strong>) is not cleared for this console.
              </p>
              
              <div className="border-t pt-3 space-y-1.5">
                <span className="text-[8px] text-neutral-400 font-bold block uppercase tracking-wider">Elevate Simulator Workspace Credentials</span>
                <div className="flex flex-col space-y-1">
                  
                  {currentView.includes('presidential') && (
                    <button
                      onClick={() => {
                        setCurrentUser(USERS.arthur_president);
                        setCurrentView('presidential-overview');
                        triggerToast('Credentials elevated to President Arthur Pendelton.');
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                    >
                      Log in as President & CEO (Arthur Pendelton)
                    </button>
                  )}

                  {!currentView.includes('presidential') && (
                    <>
                      {currentView.includes('prospects') && (
                        <button
                          onClick={() => {
                            setCurrentUser(USERS.rajesh_sales_rep);
                            setCurrentView('sales-prospects');
                            triggerToast('Workspace credentials upgraded to Rajesh Mehta (Sales).');
                          }}
                          className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                        >
                          Switch to Sales Team
                        </button>
                      )}

                      {currentView.includes('ops-') && (
                        <button
                          onClick={() => {
                            if (currentView.includes('costing')) {
                              setCurrentUser(USERS.sarah_costing_head);
                              setCurrentView('ops-costing');
                            } else if (currentView.includes('sampling')) {
                              setCurrentUser(USERS.liom_sampling_staff);
                              setCurrentView('ops-sampling');
                            } else if (currentView.includes('logistics')) {
                              setCurrentUser(USERS.chloe_logistics_staff);
                              setCurrentView('ops-logistics');
                            } else if (currentView.includes('compliance')) {
                              setCurrentUser(USERS.sophia_compliance_staff);
                              setCurrentView('ops-compliance');
                            }
                            triggerToast('Workspace credentials updated.');
                          }}
                          className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                        >
                          Auto-Switch to Authorized Department Member
                        </button>
                      )}

                      {currentView.includes('dash-') && (
                        <button
                          onClick={() => {
                            if (currentView.includes('sales')) {
                              setCurrentUser(USERS.amanda_sales_vp);
                              setCurrentView('dash-sales');
                            } else if (currentView.includes('costing')) {
                              setCurrentUser(USERS.sarah_costing_head);
                              setCurrentView('dash-costing');
                            } else if (currentView.includes('sampling')) {
                              setCurrentUser(USERS.oliver_sampling_head);
                              setCurrentView('dash-sampling');
                            } else if (currentView.includes('logistics')) {
                              setCurrentUser(USERS.kenji_logistics_head);
                              setCurrentView('dash-logistics');
                            } else if (currentView.includes('compliance')) {
                              setCurrentUser(USERS.elena_compliance_head);
                              setCurrentView('dash-compliance');
                            }
                            triggerToast('Workspace credentials elevated to Department Manager.');
                          }}
                          className="bg-black hover:bg-neutral-800 text-white font-bold py-1.5 px-3 uppercase text-[9px] transition-colors rounded-none"
                        >
                          Auto-Elevate to Department Manager
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* 12. TASK CHAT WORKSPACE SIDEBAR DRAWER                     */}
      {/* ========================================================= */}
      {activeTaskId && activeTaskDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-35 z-50 flex justify-end">
          {/* Backdrop close capture */}
          <div className="flex-1" onClick={() => setActiveTaskId(null)} />
          
          <div className="w-[450px] bg-white h-full border-l border-neutral-200 flex flex-col justify-between shadow-2xl p-4 space-y-4">
            
            {/* Drawer Header context */}
            <div className="border-b border-neutral-100 pb-3 flex justify-between items-start shrink-0">
              <div className="space-y-1">
                <span className="bg-neutral-900 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase">Task Chat Workspace</span>
                <h3 className="font-bold text-neutral-950 text-xs leading-snug">{activeTaskDetails.title}</h3>
                <span className="text-[9px] text-neutral-400 block">Task Reference ID: {activeTaskDetails.id} &bull; Enquiry: {activeTaskDetails.parentEnquiryId}</span>
              </div>
              <button 
                onClick={() => setActiveTaskId(null)}
                className="text-neutral-400 hover:text-neutral-900 font-bold text-sm bg-neutral-100 hover:bg-neutral-200 w-5 h-5 flex items-center justify-center rounded-none"
              >
                ✕
              </button>
            </div>

            {/* Task Details Info Panel */}
            <div className="bg-neutral-50 p-2 border border-neutral-200 text-[10px] space-y-1.5 shrink-0">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Assignee Target</span>
                  <span className="font-bold text-neutral-800">{activeTaskDetails.assignee}</span>
                </div>
                <div>
                  <span className="text-neutral-400 text-[8px] uppercase font-bold block">Priority Rating</span>
                  <span className="font-bold text-neutral-800">{activeTaskDetails.priority}</span>
                </div>
              </div>
              <div>
                <span className="text-neutral-400 text-[8px] uppercase font-bold block">Scope of Work</span>
                <p className="text-neutral-600 leading-relaxed">{activeTaskDetails.description}</p>
              </div>
              <div className="pt-1.5 border-t border-neutral-200 flex flex-wrap gap-1 items-center">
                <span className="text-neutral-400 text-[8px] uppercase font-bold">Collaborators:</span>
                {activeTaskDetails.watchers && activeTaskDetails.watchers.length > 0 ? (
                  activeTaskDetails.watchers.map((w, index) => (
                    <span key={index} className="bg-white border border-neutral-300 text-neutral-700 px-1 py-0.1 text-[8px] font-mono">
                      @{w}
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-500 italic text-[9px]">Only assigned handlers are watching. Use @mention to invite team members.</span>
                )}
              </div>
            </div>

            {/* Internal Task Chat History Feed */}
            <div className="flex-1 overflow-y-auto bg-neutral-50 border border-neutral-200 p-2 space-y-3 min-h-0">
              <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-wider block border-b pb-1">Internal task stream logs</span>
              
              {activeTaskDetails.comments && activeTaskDetails.comments.length > 0 ? (
                activeTaskDetails.comments.map((comment) => (
                  <div key={comment.id} className="bg-white p-2 border border-neutral-200 space-y-1">
                    <div className="flex justify-between items-center border-b pb-0.5">
                      <span className="font-bold text-neutral-900 text-[10px]">
                        {comment.author}
                      </span>
                      <span className="text-[8px] text-neutral-400">{comment.date}</span>
                    </div>
                    <p className="text-neutral-700 leading-relaxed text-[10px] whitespace-pre-wrap">
                      {comment.text.split(/(\s+)/).map((word, i) => {
                        if (word.startsWith('@')) {
                          return <strong key={i} className="text-blue-600 font-bold bg-blue-5 font-mono px-0.5">{word}</strong>;
                        }
                        return word;
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-neutral-400 italic">
                  No operational chats logged. Initiate communication by typing below or mentioning @Member to loop them in.
                </div>
              )}
            </div>

            {/* Chat Input form area with Mention Suggester helpers */}
            <div className="space-y-2 shrink-0">
              
              {/* Mention Suggestion panel helper */}
              <div className="flex flex-wrap gap-1 items-center justify-between">
                <span className="text-[8px] text-neutral-400 uppercase font-bold">Quick Mention Invite:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.values(USERS).filter(u => u.name !== currentUser.name).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setChatCommentText(prev => prev + ` @${u.name} `);
                        triggerToast(`Appended mention marker for @${u.name}`);
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-800 text-[8px] px-1.5 py-0.5 rounded-none font-medium transition-colors"
                    >
                      +{u.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message submit editor container */}
              <div className="flex space-x-1.5">
                <textarea
                  value={chatCommentText}
                  onChange={(e) => setChatCommentText(e.target.value)}
                  placeholder="Type an internal update here... Use @Name to invite team members."
                  rows={2}
                  className="w-full bg-white border border-neutral-300 p-1.5 text-[10px] focus:outline-none focus:border-neutral-900 resize-none font-sans"
                />
                <button
                  onClick={() => handleAddComment(activeTaskDetails.id, chatCommentText)}
                  className="bg-black text-white hover:bg-neutral-850 font-bold px-3 py-1 uppercase text-[9px] shrink-0"
                >
                  Send
                </button>
              </div>
              <span className="text-[8px] text-neutral-400 block italic leading-none">Collaborators mentioned will automatically have this task populated in their personal tasks inbox context.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
