export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department: string;
  manager: string;
  isManager: boolean;
  isAdmin: boolean;
  isPresident?: boolean;
  avatar: string;
}

export interface TimelineEvent {
  id: number;
  text: string;
  user: string;
  date: string;
}

export interface Pricing {
  baseCost: string;
  logistics: string;
  margin: string;
  finalPrice: string;
}

export interface Quotation {
  id: string;
  version: string;
  stage: string;
  pricing: Pricing;
  costSheetUploaded: boolean;
  fileName: string;
}

export interface Sampling {
  id: string;
  stage: string;
  carrier: string;
  trackingNumber: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  stage: string;
  totalValue: string;
  shippingContainerCount: string;
  carrier: string;
  loadingDate: string;
}

export interface VendorApproval {
  stage: string;
  vendorName: string;
  score: string;
  complianceCheck: string;
}

export interface Contract {
  version: string;
  signatureStatus: string;
  file: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  date: string;
}

export type TaskCategory =
  | 'Client Enquiry'
  | 'Sampling'
  | 'Costing'
  | 'Logistics'
  | 'Compliance'
  | 'HR'
  | 'IT / Support'
  | 'Administrative'
  | 'General Operations'
  | 'Campaign / Outreach'
  | 'Finance'
  | 'Other';

export type LinkType =
  | 'No Link / Standalone'
  | 'Enquiry'
  | 'Employee'
  | 'Department'
  | 'Campaign'
  | 'Other business record';

export interface Task {
  id: string;
  title: string;
  type: string;
  assignee: string; // can be "Anyone" or a specific person name  
  department: string;
  dueDate: string;
  priority: string;
  status: string;
  linkedRecord: string; // can be enquiry_id, employee_id, campaign_id, etc.
  description: string;
  watchers: string[];
  comments: Comment[];
  parentEnquiryId?: string; // dynamically populated/linked
  creator?: string; // name of user who created/assigned this task
  category?: TaskCategory;
  linkType?: LinkType;
  linkedRecordName?: string; // Human readable name for the link
}

export interface CostingComponent {
  id: string;
  name: string;
  cost: number;
  category: 'Packaging' | 'Transportation' | 'Procurement' | 'Logistics';
  notes?: string;
}

export interface CostingDocument {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface CostingComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface CostingRequest {
  id: string;
  enquiryId: string;
  status: 'Requested' | 'In Progress' | 'Awaiting Inputs' | 'Ready for Review' | 'Submitted' | 'Approved';
  assignee: string; // User's name, e.g., "Sarah Jenkins", "Tom Harris" or empty
  salesNote: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  createdDate: string;
  components: CostingComponent[];
  documents: CostingDocument[];
  comments: CostingComment[];
  internalRequests: Task[]; // requests to other departments/employees
  approvedCosting?: {
    baseCost: number;
    logistics: number;
    margin: number;
    total: number;
  };
  completionTime?: number; // average/completed hours duration
}

export interface SamplingDocument {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface SamplingComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface SamplingRequest {
  id: string;
  enquiryId: string;
  status: 'Requested' | 'In Progress' | 'Awaiting Inputs' | 'Ready for Review' | 'Submitted' | 'Approved';
  assignee: string; // Employee's name or empty
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  createdDate: string;
  sampleType: string;
  moisturePercentage: number;
  purityPercentage: number;
  weightGrams: number;
  quantity: number;
  condition: string;
  labResults: string;
  carrier: string;
  trackingNumber: string;
  documents: SamplingDocument[];
  comments: SamplingComment[];
  internalRequests: Task[];
}

export interface LogisticsDocument {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface LogisticsComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface LogisticsRequest {
  id: string;
  enquiryId: string;
  status: 'Requested' | 'In Progress' | 'Awaiting Inputs' | 'Ready for Review' | 'Submitted' | 'Approved';
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  createdDate: string;
  containerType: 'TEU' | 'FEU' | 'Other';
  carrier: string;
  bookingRef: string;
  vessel: string;
  voyage: string;
  portInfo: string;
  freightCharges: number;
  terminalCharges: number;
  loadingDate: string;
  documents: LogisticsDocument[];
  comments: LogisticsComment[];
  internalRequests: Task[];
}

export interface ComplianceDocument {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface ComplianceComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface ComplianceRequest {
  id: string;
  enquiryId: string;
  status: 'Requested' | 'In Progress' | 'Awaiting Inputs' | 'Ready for Review' | 'Submitted' | 'Approved';
  assignee: string;
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  createdDate: string;
  vendorDocsStatus: string;
  quarantineStatus: string;
  farmSanitationPassed: boolean;
  certificatesList: string[];
  findings: string;
  checklist: {
    docsVerified: boolean;
    quarantineApproved: boolean;
    sanitationPassed: boolean;
    certificatesStamped: boolean;
  };
  documents: ComplianceDocument[];
  comments: ComplianceComment[];
  internalRequests: Task[];
}

export interface HREmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Onboarding' | 'Offboarding';
  onboardingChecklist: { task: string; completed: boolean }[];
  offboardingChecklist: { task: string; completed: boolean }[];
  trainingModules: { name: string; completed: boolean; date?: string }[];
  documents: { id: string; name: string; type: string; date: string }[];
  attendanceRequests: { id: string; type: string; startDate: string; endDate: string; status: 'Pending' | 'Approved' | 'Rejected' }[];
  notes: string;
}

export type SalesType = 'export' | 'tender' | 'distributor' | 'retail';

export interface ExportDetails {
  destinationCountry: string;
  incoterms: string;
  shippingDetails: string;
  exportStage: 'enquiry' | 'costing' | 'quotation' | 'contract' | 'po' | 'shipped';
}

export interface TenderDetails {
  portalSource: string; // e.g. "GEM", "E-Procure India", "GovTenders EU"
  tenderNumber: string;
  emdAmount: number; // Earnest Money Deposit amount
  emdStatus: 'Pending' | 'Submitted' | 'Refunded' | 'Forfeited';
  hodApprovalStatus: 'Pending Review' | 'Approved' | 'Rejected';
  submissionDeadline: string;
  governmentAgencyName: string;
  tenderStage: 'identified' | 'emd_submitted' | 'technical_bid' | 'financial_bid' | 'awarded' | 'rejected';
}

export interface DistributorDetails {
  distributorId?: string;
  distributorName: string;
  territory: string;
  distributorStage: 'lead' | 'sample_evaluation' | 'commercial_terms' | 'contract_signed' | 'reorder';
}

export interface RetailDetails {
  retailChannel: string; // e.g., "Direct Supermarket", "E-Commerce Vendor", "Regional Wholesaler"
  endCustomerInfo: string;
  retailStage: 'discovery' | 'audit' | 'listing_approved' | 'first_po' | 'recurring';
}

export interface Enquiry {
  id: string;
  sales_type: SalesType;
  owningDepartment?: string;
  customerName: string;
  customerContact: string;
  product: string;
  quantity: string;
  destinationPort: string;
  status: string; // Generic: "Open" | "Costing Phase" | "Internal Review" | "Customs Verification" | "Won" | "Lost" | "Completed"
  salesOwner: string;
  watchers: string[];
  createdDate: string;
  timeline: TimelineEvent[];
  quotations: Quotation[];
  sampling: Sampling;
  purchaseOrder: PurchaseOrder | null;
  vendorApproval: VendorApproval;
  contract: Contract;
  tasks: Task[];
  costingRequest?: CostingRequest;
  samplingRequest?: SamplingRequest;
  logisticsRequest?: LogisticsRequest;
  complianceRequest?: ComplianceRequest;

  // Type-Specific Details Branches
  exportDetails?: ExportDetails;
  tenderDetails?: TenderDetails;
  distributorDetails?: DistributorDetails;
  retailDetails?: RetailDetails;
}

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface Email {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  subject: string;
  body: string;
  date: string;
  enquiryId: string | null;
  unread: boolean;
  threadId?: string;
  attachments?: EmailAttachment[];
  cc?: string;
  bcc?: string;
  isStarred?: boolean;
  isArchived?: boolean;
  isTrash?: boolean;
  isDraft?: boolean;
}

export interface CustomFieldDefinition {
  id: string;
  name: string; // e.g. "Product Interest"
  key: string;  // e.g. "product_interest"
  type: 'text' | 'number' | 'select' | 'multi-select' | 'date' | 'boolean';
  options?: string[]; // options for select and multi-select
  required?: boolean;
}

export interface Prospect {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  status: string;
  replyReceived: boolean;
  lastOutboundCampaign: string;
  emailsSent: number;
  nextSchedule: string;
  sentiment: string;
  aiDraft: string;

  // Generic core fields
  phone?: string;
  website?: string;
  location?: string;
  source?: string;
  sourceDetails?: string;
  owner?: string;
  tags?: string[];
  notes?: string;

  // Custom Fields dynamic values
  customFields?: Record<string, any>;

  // Legacy fields (required for full backward compatibility, but set dynamically/not hardcoded in new forms)
  cropInterest: string;
  estimatedVolume: string;
}

export interface Campaign {
  id: string;
  name: string;
  active: boolean;
  sentToday: number;
  targetAudience: string;
  scheduleType: string;
}

export interface ExpenseComment {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface ExpenseTimelineEvent {
  id: string;
  text: string;
  user: string;
  date: string;
}

export interface Expense {
  id: string;
  expense_type: 'request' | 'claim';
  title: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  department: string;
  requestedBy: string;
  date: string; // for request: requested date; for claim: date of expense
  recurring?: boolean; // request only
  recurrenceDetails?: string; // request only
  attachment?: string; // attachment or quotation filename
  enquiryId?: string; // optional relationship
  taskId?: string; // optional relationship
  paymentMethod?: string; // claim only
  notes?: string;
  status: 'Draft' | 'Submitted' | 'Pending Approval' | 'Approved' | 'Sent to Accounting' | 'Processing' | 'Purchased/Paid' | 'Paid' | 'Completed' | 'Rejected' | 'Changes Requested';
  vendorPayee?: string; // recorded by accounting
  reimbursableAmount?: number; // claim only, confirmed by accounting
  accountingNotes?: string; // notes added by accounting
  timeline: ExpenseTimelineEvent[];
  comments: ExpenseComment[];
}

export interface CustomViewCondition {
  field: keyof Prospect;
  operator: 'equals' | 'contains' | 'not_equals';
  value: string;
}

export interface CustomView {
  id: string;
  name: string;
  conditions: CustomViewCondition[];
  isBuiltIn?: boolean;
}

export interface DocumentRecord {
  id: string;
  enquiryId: string;
  owningDepartmentId: string; // 'Sales', 'Costing', 'Logistics', 'Compliance', 'Sampling', etc.
  uploadedBy: string; // user name or ID
  currentVersionId: string;
  title: string;
  createdAt: string;
  sharedWith?: {
    users?: string[];
    departments?: string[];
  };
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  filePath: string;
  versionNumber: number;
  uploadedBy: string;
  createdAt: string;
  notes?: string;
}

export interface DocumentWorkItemLink {
  id: string;
  documentId: string;
  workItemId: string; // linked task or department request ID (e.g. TSK-201)
  linkedBy: string;
  createdAt: string;
}
