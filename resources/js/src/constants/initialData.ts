import { User, Enquiry, Email, Prospect, Campaign, HREmployee, DocumentRecord, DocumentVersion, DocumentWorkItemLink } from '../types/crm';

export const USERS: Record<string, User> = {
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
    },
  harriet_hr_head: {
    id: 'harriet_hr_head',
    email: 'harriet.r@tradedesk.com',
    name: 'Harriet Reid',
    role: 'HR Department Manager',
    department: 'HR',
    manager: 'Arthur Pendelton',
    isManager: true,
    isAdmin: false,
    avatar: 'HR'
  },
  ian_it_head: {
    id: 'ian_it_head',
    email: 'ian.t@tradedesk.com',
    name: 'Ian Thomas',
    role: 'IT Department Lead',
    department: 'IT',
    manager: 'Marcus Brody',
    isManager: true,
    isAdmin: false,
    avatar: 'IT'
  },
  accounting_head: {
    id: 'accounting_head',
    email: 'richard.f@tradedesk.com',
    name: 'Richard Feynman',
    role: 'Accounting Department Head',
    department: 'Accounting',
    manager: 'Arthur Pendelton',
    isManager: true,
    isAdmin: false,
    avatar: 'RF'
  },
  accounting_clerk: {
    id: 'accounting_clerk',
    email: 'penny.b@tradedesk.com',
    name: 'Penny Bigelow',
    role: 'Accounting Officer',
    department: 'Accounting',
    manager: 'Richard Feynman',
    isManager: false,
    isAdmin: false,
    avatar: 'PB'
  }
};

export const INITIAL_HR_EMPLOYEES: HREmployee[] = [
  {
    id: 'EMP-101',
    name: 'John Smith',
    role: 'Junior Trading Clerk',
    department: 'Sales',
    email: 'john.smith@tradedesk.com',
    status: 'Onboarding',
    onboardingChecklist: [
      { task: 'Submit signed employment agreement', completed: true },
      { task: 'Set up company email and Slack', completed: true },
      { task: 'Complete initial trade compliance webinar', completed: false },
      { task: 'Upload passport & medical clearances', completed: false }
    ],
    offboardingChecklist: [],
    trainingModules: [
      { name: 'Global Sourcing & Anti-Bribery Policy', completed: true, date: '2026-07-20' },
      { name: 'Phytosanitary & Quarantine Regulatory Standards', completed: false }
    ],
    documents: [
      { id: 'HRD-001', name: 'Smith_Employment_Agreement_Signed.pdf', type: 'Contract', date: '2026-07-18' }
    ],
    attendanceRequests: [
      { id: 'ATT-101', type: 'Medical Leave', startDate: '2026-08-10', endDate: '2026-08-12', status: 'Pending' }
    ],
    notes: 'Exciting new hire showing great potential. Needs mentoring on export logs.'
  },
  {
    id: 'EMP-102',
    name: 'Sarah Jenkins',
    role: 'Costing Department Head',
    department: 'Costing',
    email: 'sarah.j@tradedesk.com',
    status: 'Active',
    onboardingChecklist: [],
    offboardingChecklist: [],
    trainingModules: [
      { name: 'Managerial Leadership Track', completed: true, date: '2025-11-05' },
      { name: 'Export Tariff Calculation Masterclass', completed: true, date: '2026-02-12' }
    ],
    documents: [
      { id: 'HRD-002', name: 'Sarah_Promotion_Form.pdf', type: 'Review', date: '2025-12-01' }
    ],
    attendanceRequests: [],
    notes: 'Key senior operator. Consistently high throughput on pricing calculation sheets.'
  }
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'ENQ-2026-0012',
    sales_type: 'export',
    owningDepartment: 'Sales',
    customerName: 'ABC Imports Inc.',
    customerContact: 'John Sterling',
    product: 'Premium Organic Sesame Seeds (Grade A)',
    quantity: '50 Metric Tons',
    destinationPort: 'Hamburg, Germany',
    status: 'Costing Phase',
    salesOwner: 'Rajesh Mehta',
    watchers: ['Sarah Jenkins', 'Elena Rostova'],
    createdDate: '2026-07-15',
    exportDetails: {
      destinationCountry: 'Germany',
      incoterms: 'CIF Hamburg',
      shippingDetails: '2x 20ft Dry FCL Vessels via ONE Ocean Line',
      exportStage: 'costing'
    },
    timeline: [
      { id: 1, text: 'Export enquiry created by Rajesh Mehta', user: 'Rajesh Mehta', date: 'July 15, 10:00 AM' },
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
        ],
        category: 'Costing',
        linkType: 'Enquiry',
        linkedRecordName: 'ABC Imports Inc. (ENQ-2026-0012)'
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
        ],
        category: 'Sampling',
        linkType: 'Enquiry',
        linkedRecordName: 'ABC Imports Inc. (ENQ-2026-0012)'
      }
    ],
    costingRequest: {
      id: 'CR-2026-0012',
      enquiryId: 'ENQ-2026-0012',
      status: 'In Progress',
      assignee: 'Sarah Jenkins',
      salesNote: 'Need costing for 50 MT premium sesame seeds to Hamburg Port.',
      priority: 'High',
      dueDate: '2026-07-22',
      createdDate: '2026-07-15',
      components: [
        { id: 'C1', name: 'Raw Material Procurement FOB', cost: 1250, category: 'Procurement', notes: 'FOB bulk seed supplier index' },
        { id: 'C2', name: 'Terminal Handling & Customs clearance', cost: 150, category: 'Transportation', notes: 'Inland dry port processing fees' }
      ],
      documents: [
        { id: 'D1', fileName: 'FOB_Sourcing_Contract_Quote.pdf', uploadedBy: 'Rajesh Mehta', uploadedDate: 'July 15, 10:15 AM' }
      ],
      comments: [
        { id: 'CM1', author: 'Rajesh Mehta', text: 'Need a fast ocean freight estimation for Hamburg port terminal clearance.', date: 'July 15, 10:20 AM' },
        { id: 'CM2', author: 'Sarah Jenkins', text: 'Initiated ocean freight quotation with logistics desk.', date: 'July 15, 11:15 AM' }
      ],
      internalRequests: [
        {
          id: 'IT-201-1',
          title: 'Hamburg Freight Quotation',
          type: 'Action Item',
          assignee: 'Chloe Taylor',
          department: 'Logistics',
          dueDate: '2026-07-20',
          priority: 'High',
          status: 'Pending',
          linkedRecord: 'ENQ-2026-0012',
          description: 'Provide sea carrier shipping spot quotation for 50 MT to Hamburg.',
          watchers: ['Sarah Jenkins'],
          comments: [],
          category: 'Logistics',
          linkType: 'Enquiry',
          linkedRecordName: 'ABC Imports Inc. (ENQ-2026-0012)'
        }
      ]
    },
    samplingRequest: {
      id: 'SR-2026-0012',
      enquiryId: 'ENQ-2026-0012',
      status: 'Requested',
      assignee: '',
      priority: 'Medium',
      dueDate: '2026-07-25',
      createdDate: '2026-07-15',
      sampleType: 'Grade A Sesame Seeds (V-Pack)',
      moisturePercentage: 6.8,
      purityPercentage: 99.2,
      weightGrams: 500,
      quantity: 1,
      condition: 'Pristine Vacuum Sealed',
      labResults: 'Moisture within 7% SLA limits.',
      carrier: 'DHL Express',
      trackingNumber: 'Awaiting dispatch',
      documents: [],
      comments: [],
      internalRequests: []
    },
    logisticsRequest: {
      id: 'LR-2026-0012',
      enquiryId: 'ENQ-2026-0012',
      status: 'Requested',
      assignee: '',
      priority: 'High',
      dueDate: '2026-07-28',
      createdDate: '2026-07-15',
      containerType: 'FEU',
      carrier: 'ONE Ocean Network Express',
      bookingRef: 'BK-TDK-99221',
      vessel: 'ONE Blue Ocean V-092',
      voyage: 'VOY-221',
      portInfo: 'Terminal 4, Port of Hamburg',
      freightCharges: 3200,
      terminalCharges: 450,
      loadingDate: '2026-08-01',
      documents: [],
      comments: [],
      internalRequests: []
    },
    complianceRequest: {
      id: 'CMR-2026-0012',
      enquiryId: 'ENQ-2026-0012',
      status: 'Requested',
      assignee: '',
      priority: 'High',
      dueDate: '2026-07-24',
      createdDate: '2026-07-15',
      vendorDocsStatus: 'In Review',
      quarantineStatus: 'Pending Inspection',
      farmSanitationPassed: true,
      certificatesList: ['Agricultural Sourcing Permit', 'Phytosanitary Clearance Seal'],
      findings: 'Cooperative records verify pesticide residues are well below EU legal ceilings.',
      checklist: {
        docsVerified: false,
        quarantineApproved: false,
        sanitationPassed: true,
        certificatesStamped: false
      },
      documents: [],
      comments: [],
      internalRequests: []
    }
  },
  {
    id: 'ENQ-2026-0013',
    sales_type: 'export',
    owningDepartment: 'Sales',
    customerName: 'Zenith Global Trade',
    customerContact: 'Hana Kobayashi',
    product: 'Dehydrated White Onion Flakes',
    quantity: '22 Metric Tons',
    destinationPort: 'Tokyo, Japan',
    status: 'Customs Verification',
    salesOwner: 'Rajesh Mehta',
    watchers: ['Elena Rostova', 'Kenji Sato'],
    createdDate: '2026-07-10',
    exportDetails: {
      destinationCountry: 'Japan',
      incoterms: 'FOB Nhava Sheva',
      shippingDetails: '1x 20ft Container via ONE Line',
      exportStage: 'po'
    },
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
    ],
    costingRequest: {
      id: 'CR-2026-0013',
      enquiryId: 'ENQ-2026-0013',
      status: 'Approved',
      assignee: 'Sarah Jenkins',
      salesNote: 'Need costing for 22 MT onion flakes to Tokyo.',
      priority: 'High',
      dueDate: '2026-07-11',
      createdDate: '2026-07-10',
      components: [
        { id: 'C3', name: 'Raw Material Procurement FOB', cost: 1200, category: 'Procurement', notes: 'Deccan Agro Processors price' },
        { id: 'C4', name: 'Logistics & Carriage cost', cost: 250, category: 'Logistics', notes: 'Ocean cargo carrier ONE rate lock' },
        { id: 'C5', name: 'Inland trucking', cost: 150, category: 'Transportation', notes: 'Inland transport allocation' }
      ],
      documents: [
        { id: 'D2', fileName: 'Deccan_Agro_FOB_Contract.pdf', uploadedBy: 'Sarah Jenkins', uploadedDate: 'July 10, 04:30 PM' }
      ],
      comments: [
        { id: 'CM3', author: 'Sarah Jenkins', text: 'All quote factors secured and locked.', date: 'July 11, 01:15 PM' }
      ],
      internalRequests: [],
      approvedCosting: {
        baseCost: 1200,
        logistics: 250,
        margin: 150,
        total: 1600
      },
      completionTime: 29.5 // hours
    }
  },
  {
    id: 'ENQ-TND-2026-0001',
    sales_type: 'tender',
    owningDepartment: 'Tender',
    customerName: 'National Agricultural Cooperative Federation (Govt Agency)',
    customerContact: 'Dr. Ramesh Sharma (Procurement Officer)',
    product: 'Yellow Maize / Feed Corn (Non-GMO)',
    quantity: '500 Metric Tons',
    destinationPort: 'Nhava Sheva Port Terminal',
    status: 'In Progress',
    salesOwner: 'Amanda Vance',
    watchers: ['Arthur Pendelton', 'Sarah Jenkins'],
    createdDate: '2026-07-12',
    tenderDetails: {
      portalSource: 'GEM Portal India',
      tenderNumber: 'GEM/2026/B/882190',
      emdAmount: 250000,
      emdStatus: 'Submitted',
      hodApprovalStatus: 'Approved',
      submissionDeadline: '2026-08-05',
      governmentAgencyName: 'Central Food Supply Board',
      tenderStage: 'technical_bid'
    },
    timeline: [
      { id: 1, text: 'Tender GEM/2026/B/882190 identified on portal', user: 'Amanda Vance', date: 'July 12, 11:00 AM' },
      { id: 2, text: 'EMD Guarantee of ₹250,000 authorized by CEO', user: 'Arthur Pendelton', date: 'July 13, 03:00 PM' },
      { id: 3, text: 'Technical Bid submitted on GEM Portal', user: 'Amanda Vance', date: 'July 15, 05:00 PM' }
    ],
    quotations: [
      {
        id: 'QTN-TND-001',
        version: 'v1.0-gem',
        stage: 'Review',
        pricing: { baseCost: '$180,000', logistics: '$15,000', margin: '$12,000', finalPrice: '$207,000' },
        costSheetUploaded: true,
        fileName: 'GEM_Technical_Commercial_Bid.pdf'
      }
    ],
    sampling: {
      id: 'SMP-TND-001',
      stage: 'Approved',
      carrier: 'Government Courier Services',
      trackingNumber: 'GCS-99120',
      notes: 'Govt NABL Lab certified moisture & purity results.'
    },
    purchaseOrder: null,
    vendorApproval: {
      stage: 'Approved',
      vendorName: 'Central Grain Warehouse Co.',
      score: '98 out of 100',
      complianceCheck: 'Passed Clean'
    },
    contract: {
      version: 'v0.9-tender-draft',
      signatureStatus: 'Awaiting Award',
      file: 'Tender_Terms_Conditions_GEM.pdf'
    },
    tasks: []
  },
  {
    id: 'ENQ-DST-2026-0004',
    sales_type: 'distributor',
    owningDepartment: 'Distributor Sales',
    customerName: 'EuroSpice Wholesale Network',
    customerContact: 'Klaus Mueller',
    product: 'Whole Dried Red Chillies (S17 Teja)',
    quantity: '18 Metric Tons',
    destinationPort: 'Rotterdam, Netherlands',
    status: 'Open',
    salesOwner: 'Rajesh Mehta',
    watchers: ['Amanda Vance'],
    createdDate: '2026-07-17',
    distributorDetails: {
      distributorId: 'DST-EU-088',
      distributorName: 'EuroSpice Wholesale Network',
      territory: 'DACH Region (Germany, Austria, Switzerland)',
      distributorStage: 'commercial_terms'
    },
    timeline: [
      { id: 1, text: 'Distributor inquiry logged by Rajesh Mehta', user: 'Rajesh Mehta', date: 'July 17, 02:00 PM' }
    ],
    quotations: [
      {
        id: 'QTN-DST-001',
        version: 'v1.0',
        stage: 'Draft',
        pricing: { baseCost: '$42,000', logistics: '$3,500', margin: '$4,500', finalPrice: '$50,000' },
        costSheetUploaded: false,
        fileName: 'Distributor_Price_List_2026.pdf'
      }
    ],
    sampling: {
      id: 'SMP-DST-001',
      stage: 'Requested',
      carrier: 'DHL Express',
      trackingNumber: 'Pending',
      notes: 'Distributor requested lab sample batch.'
    },
    purchaseOrder: null,
    vendorApproval: {
      stage: 'Requested',
      vendorName: 'Andhra Crop Co-op',
      score: '92 out of 100',
      complianceCheck: 'In Progress'
    },
    contract: {
      version: 'v1.0-dist-agreement',
      signatureStatus: 'Drafting',
      file: 'Territory_Distribution_Agreement.pdf'
    },
    tasks: []
  },
  {
    id: 'ENQ-RTL-2026-0009',
    sales_type: 'retail',
    owningDepartment: 'Retail Sales',
    customerName: 'FreshBasket Supermarket Chain',
    customerContact: 'Priya Sharma (Category Manager)',
    product: 'Packaged Organic Basmati Rice (1kg Pouches)',
    quantity: '10,000 Units',
    destinationPort: 'Mumbai Central Distribution Warehouse',
    status: 'Won',
    salesOwner: 'Rajesh Mehta',
    watchers: ['Amanda Vance'],
    createdDate: '2026-07-14',
    retailDetails: {
      retailChannel: 'Direct Supermarket Chain',
      endCustomerInfo: '120 Retail Stores across Tier-1 Cities',
      retailStage: 'listing_approved'
    },
    timeline: [
      { id: 1, text: 'Retail Listing approved by FreshBasket Category Desk', user: 'Rajesh Mehta', date: 'July 14, 01:00 PM' },
      { id: 2, text: 'First SKU order received for 10,000 pouches', user: 'Rajesh Mehta', date: 'July 16, 11:30 AM' }
    ],
    quotations: [
      {
        id: 'QTN-RTL-001',
        version: 'v1.0-retail',
        stage: 'Won',
        pricing: { baseCost: '₹350,000', logistics: '₹20,000', margin: '₹80,000', finalPrice: '₹450,000' },
        costSheetUploaded: true,
        fileName: 'Retail_SKU_Listing_Contract.pdf'
      }
    ],
    sampling: {
      id: 'SMP-RTL-001',
      stage: 'Approved',
      carrier: 'Local Express Delivery',
      trackingNumber: 'LCL-8812',
      notes: 'Retail pouch packaging approved.'
    },
    purchaseOrder: {
      id: 'PO-RTL-0012',
      stage: 'Fulfillment',
      totalValue: '₹450,000',
      shippingContainerCount: '3 Truckloads',
      carrier: 'National Surface Transport',
      loadingDate: '2026-07-28'
    },
    vendorApproval: {
      stage: 'Approved',
      vendorName: 'Himalayan Organic Mills',
      score: '95 out of 100',
      complianceCheck: 'Passed Clean'
    },
    contract: {
      version: 'v1.0-retail-vendor',
      signatureStatus: 'Fully Signed',
      file: 'Supermarket_Listing_Agreement.pdf'
    },
    tasks: []
  }
];

export const INITIAL_EMAILS: Email[] = [
  {
    id: 'MSG-001',
    sender: 'client@abcimports.com',
    senderName: 'John Sterling (ABC Imports)',
    recipient: 'rajesh.m@tradedesk.com',
    subject: 'Urgent: Technical Spec Revision for Sesame Seeds sample',
    body: 'Hello Rajesh, We reviewed the specifications for ENQ-2026-0012. Could we confirm if the moisture content limit matches the German Quarantine target under 6.5%? Let me know when the lab can ship out the sample kit.',
    date: 'Jul 18, 2026 04:30 PM',
    enquiryId: 'ENQ-2026-0012',
     unread: true,
    isStarred: true,
    attachments: [
      { name: 'Import_SLA_Requirements_Germany.pdf', size: '1.2 MB', type: 'application/pdf' }
    ]
  },
  {
    id: 'MSG-001-R1',
    threadId: 'TH-001',
    sender: 'rajesh.m@tradedesk.com',
    senderName: 'Rajesh Mehta',
    recipient: 'client@abcimports.com',
    subject: 'Re: Urgent: Technical Spec Revision for Sesame Seeds sample',
    body: 'Hi John, Absolutely! I have checked with our Compliance head. Our crop indeed guarantees under 6.2% moisture limit. Sending over a draft lab certificate for your reference.',
    date: 'Jul 18, 2026 05:15 PM',
    enquiryId: 'ENQ-2026-0012',
    unread: false


  },
  {
    id: 'MSG-002',
        threadId: 'TH-002', 
    sender: 'sarah.j@tradedesk.com',
    senderName: 'Sarah Jenkins (Costing)',
    recipient: 'marcus.b@tradedesk.com',
    subject: 'Escalation Check: Ocean Carrier quotes (Hamburg Route)',
    body: 'Marcus, The spot rates for Hamburg are spiking this week. I am updating the costing sheet model to reflect the new inland terminal handling fees. We need Sales to lock the client into the v1 proposal quickly before the carrier contracts expire.',
    date: 'Jul 17, 2026 11:15 AM',
    enquiryId: 'ENQ-2026-0012',
    unread: false,
        isStarred: false
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

export const INITIAL_PROSPECTS: Prospect[] = [
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

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: 'CMP-01', name: 'Oilseed Bulk Sourcing Intro', active: true, sentToday: 12, targetAudience: 'Global Importers', scheduleType: 'Every Tuesday' },
  { id: 'CMP-02', name: 'Dehydrated Alliums Promo', active: true, sentToday: 8, targetAudience: 'Swiss/German Food Processors', scheduleType: 'Every Thursday' },
  { id: 'CMP-03', name: 'Premium Spices Introduction', active: false, sentToday: 0, targetAudience: 'Asia-Pacific Retail Sourcing', scheduleType: 'Paused' }
];

import { Expense } from '../types/crm';

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'EXP-REQ-001',
    expense_type: 'request',
    title: 'CRM Subscription for Sales Operations',
    amount: 3000,
    currency: '₹',
    category: 'Software',
    description: 'Required for sales operations and pipeline tracking of new clients.',
    department: 'Sales',
    requestedBy: 'Rajesh Mehta',
    date: '2026-07-15',
    recurring: true,
    recurrenceDetails: 'Monthly',
    attachment: 'CRM_Quotation_2026.pdf',
    enquiryId: 'ENQ-2026-0012',
    status: 'Sent to Accounting',
    timeline: [
      { id: 'T-1', text: 'Expense Request created by Rajesh Mehta', user: 'Rajesh Mehta', date: '2026-07-15 10:00 AM' },
      { id: 'T-2', text: 'Submitted to Department Head (Amanda Vance) for approval', user: 'Rajesh Mehta', date: '2026-07-15 10:05 AM' },
      { id: 'T-3', text: 'Approved by Department Head (Amanda Vance)', user: 'Amanda Vance', date: '2026-07-15 02:00 PM' },
      { id: 'T-4', text: 'Sent to Accounting for payment processing', user: 'Amanda Vance', date: '2026-07-15 02:05 PM' }
    ],
    comments: [
      { id: 'C-1', author: 'Rajesh Mehta', text: 'We need this CRM to track ABC Imports more effectively.', date: '2026-07-15' },
      { id: 'C-2', author: 'Amanda Vance', text: 'Approved. Proceed with accounting.', date: '2026-07-15' }
    ]
  },
  {
    id: 'EXP-CLM-002',
    expense_type: 'claim',
    title: 'Client Dinner with John Sterling',
    amount: 4500,
    currency: '₹',
    category: 'Travel / Client Entertainment',
    description: 'Dinner discussion with John Sterling of ABC Imports to finalize specifications.',
    department: 'Sales',
    requestedBy: 'Rajesh Mehta',
    date: '2026-07-16',
    attachment: 'Restaurant_Receipt_ABC_Imports.pdf',
    enquiryId: 'ENQ-2026-0012',
    taskId: 'TSK-201',
    paymentMethod: 'Credit Card',
    status: 'Approved',
    timeline: [
      { id: 'T-5', text: 'Expense Claim submitted by Rajesh Mehta', user: 'Rajesh Mehta', date: '2026-07-16 09:00 AM' },
      { id: 'T-6', text: 'Approved by Department Head (Amanda Vance)', user: 'Amanda Vance', date: '2026-07-16 11:30 AM' }
    ],
    comments: [
      { id: 'C-3', author: 'Rajesh Mehta', text: 'Dinner with John. He is happy with sesame seed moisture specs.', date: '2026-07-16' }
    ]
  },
  {
    id: 'EXP-REQ-003',
    expense_type: 'request',
    title: 'Recruitment Software Subscription',
    amount: 5000,
    currency: '₹',
    category: 'Software',
    description: 'Premium subscription to job boards for operations recruitment.',
    department: 'HR',
    requestedBy: 'Harriet Reid',
    date: '2026-07-17',
    recurring: false,
    status: 'Pending Approval',
    timeline: [
      { id: 'T-7', text: 'Expense Request submitted by Harriet Reid', user: 'Harriet Reid', date: '2026-07-17 10:00 AM' }
    ],
    comments: []
  },
  {
    id: 'EXP-REQ-004',
    expense_type: 'request',
    title: 'Alternate Ocean Carrier Transit Rates Consultation',
    amount: 8000,
    currency: '₹',
    category: 'Transportation',
    description: 'Transit consulting fees for route optimization.',
    department: 'Logistics',
    requestedBy: 'Chloe Taylor',
    date: '2026-07-18',
    recurring: false,
    enquiryId: 'ENQ-2026-0012',
    status: 'Draft',
    timeline: [
      { id: 'T-8', text: 'Expense Request drafted by Chloe Taylor', user: 'Chloe Taylor', date: '2026-07-18 01:00 PM' }
    ],
    comments: []
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'DOC-001',
    enquiryId: 'ENQ-2026-0012',
    owningDepartmentId: 'Costing',
    uploadedBy: 'Rajesh Mehta',
    currentVersionId: 'DOC-VER-002',
    title: 'FOB Sourcing Contract Quote',
    createdAt: '2026-07-15'
  },
  {
    id: 'DOC-002',
    enquiryId: 'ENQ-2026-0012',
    owningDepartmentId: 'Compliance',
    uploadedBy: 'Sophia Miller',
    currentVersionId: 'DOC-VER-003',
    title: 'Phytosanitary Clearance Certificate',
    createdAt: '2026-07-16'
  },
  {
    id: 'DOC-003',
    enquiryId: 'ENQ-2026-0013',
    owningDepartmentId: 'Sales',
    uploadedBy: 'Sarah Jenkins',
    currentVersionId: 'DOC-VER-004',
    title: 'Deccan Agro FOB Sourcing Agreement',
    createdAt: '2026-07-10'
  }
];

export const INITIAL_DOCUMENT_VERSIONS: DocumentVersion[] = [
  {
    id: 'DOC-VER-001',
    documentId: 'DOC-001',
    filePath: 'FOB_Sourcing_Contract_Quote_v1.pdf',
    versionNumber: 1,
    uploadedBy: 'Rajesh Mehta',
    createdAt: '2026-07-15 10:15 AM',
    notes: 'Initial supplier estimate'
  },
  {
    id: 'DOC-VER-002',
    documentId: 'DOC-001',
    filePath: 'FOB_Sourcing_Contract_Quote_v2_revised.pdf',
    versionNumber: 2,
    uploadedBy: 'Sarah Jenkins',
    createdAt: '2026-07-16 02:20 PM',
    notes: 'Revised terminal handling factors added'
  },
  {
    id: 'DOC-VER-003',
    documentId: 'DOC-002',
    filePath: 'Phytosanitary_Clearance_Seal_v1.pdf',
    versionNumber: 1,
    uploadedBy: 'Sophia Miller',
    createdAt: '2026-07-16 09:30 AM',
    notes: 'Quarantine lab stamp attached'
  },
  {
    id: 'DOC-VER-004',
    documentId: 'DOC-003',
    filePath: 'Deccan_Agro_FOB_Contract_v1.pdf',
    versionNumber: 1,
    uploadedBy: 'Sarah Jenkins',
    createdAt: '2026-07-10 04:30 PM',
    notes: 'Final executed vendor contract'
  }
];

export const INITIAL_DOCUMENT_WORK_ITEM_LINKS: DocumentWorkItemLink[] = [
  {
    id: 'LINK-001',
    documentId: 'DOC-001',
    workItemId: 'TSK-201',
    linkedBy: 'Sarah Jenkins',
    createdAt: '2026-07-15 10:20 AM'
  },
  {
    id: 'LINK-002',
    documentId: 'DOC-002',
    workItemId: 'TSK-202',
    linkedBy: 'Sophia Miller',
    createdAt: '2026-07-16 09:35 AM'
  },
  {
    id: 'LINK-003',
    documentId: 'DOC-003',
    workItemId: 'TSK-301',
    linkedBy: 'Sarah Jenkins',
    createdAt: '2026-07-10 04:35 PM'
  }
];
