import React from 'react';
import { useCRMState } from './hooks/useCRMState';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { TaskChatDrawer } from './components/TaskChatDrawer';
import { DocumentVaultDrawer } from './components/DocumentVaultDrawer';
import { MyTasksView } from './components/views/MyTasksView';
import { PersonalMailboxView } from './components/views/PersonalMailboxView';
import { GlobalEnquiryView } from './components/views/GlobalEnquiryView';
import { SalesTrackerView } from './components/views/SalesTrackerView';
import { SalesProspectsView } from './components/views/SalesProspectsView';
import { SalesQuotationsView } from './components/views/SalesQuotationsView';
import { SalesSamplingView } from './components/views/SalesSamplingView';
import { SalesPOsView } from './components/views/SalesPOsView';
import { SalesVendorsView } from './components/views/SalesVendorsView';
import { SalesContractsView } from './components/views/SalesContractsView';
import { EnquiryDetailView } from './components/views/EnquiryDetailView';
import { OpsCostingView } from './components/views/OpsCostingView';
import { OpsSamplingView } from './components/views/OpsSamplingView';
import { OpsLogisticsView } from './components/views/OpsLogisticsView';
import { OpsComplianceView } from './components/views/OpsComplianceView';
import { OpsHRView } from './components/views/OpsHRView';
import {
  DashSalesView,
  DashCostingView,
  DashSamplingView,
  DashLogisticsView,
  DashComplianceView,
  DashHRView,
} from './components/views/Dashboards';
import { PresidentialOverviewView } from './components/views/PresidentialOverviewView';
import { RestrictedView } from './components/views/RestrictedView';
import { SpendManagementView } from './components/views/SpendManagementView';
import { CommandPalette } from './components/CommandPalette';

export default function App() {
  const crm = useCRMState();

  // Initial Boot & Security States
  const [bootProgress, setBootProgress] = React.useState(0);
  const [bootStatus, setBootProgressStatus] = React.useState('Establishing Secure Uplink...');
  const [bootCompleted, setBootCompleted] = React.useState(false);
  const [securityInput, setSecurityInput] = React.useState('');
  const [isAuthorized, setIsAuthorized] = React.useState(true);
  const [passcodeError, setPasscodeError] = React.useState('');

  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [paletteMode, setPaletteMode] = React.useState<'search' | 'action'>('search');

  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (e.shiftKey) {
          setPaletteMode('action');
        } else {
          setPaletteMode('search');
        }
        setPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  React.useEffect(() => {
    const statusMessages = [
      'Establishing Secure Uplink...',
      'Mounting Financial Ledger Databases...',
      'Verifying Departmental Permission Nodes...',
      'Decrypting Sovereign Sourcing Keys...',
      'aftermeet io Enterprise Core Online.',
    ];

    const timer = setInterval(() => {
      setBootProgress((prev) => {
        const next = prev + 5;
        // Map progress range to status text
        const statusIndex = Math.min(
          Math.floor((next / 100) * statusMessages.length),
          statusMessages.length - 1
        );
        setBootProgressStatus(statusMessages[statusIndex] || 'Running Core Diagnostics...');

        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setBootCompleted(true);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 80);

    return () => clearInterval(timer);
  }, []);

  const handleSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (securityInput.trim() === 'AM-2026') {
      setIsAuthorized(true);
      crm.triggerToast('Security Clearance Verified. Welcome to aftermeet io.');
    } else {
      setPasscodeError('Access Denied. Invalid Authorization Code.');
      setSecurityInput('');
    }
  };

  // Rendering Loading Screen
  if (!bootCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-mono p-4">
        <div className="w-full max-w-md border border-neutral-800 p-6 space-y-6">
          <div className="space-y-1 text-center">
            <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest block">Core Platform Initialization</span>
            <h1 className="text-sm font-black text-white uppercase tracking-tight">aftermeet io Enterprise</h1>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-neutral-400">
              <span>{bootStatus}</span>
              <span>{bootProgress}%</span>
            </div>
            <div className="w-full bg-neutral-900 h-1.5 rounded-none overflow-hidden border border-neutral-800">
              <div
                className="bg-white h-full transition-all duration-75"
                style={{ width: `${bootProgress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[9px] text-neutral-600 font-mono divide-y divide-neutral-900 border-t border-neutral-900 pt-3 space-y-1">
            <p>&gt; sys_load_module spend_management</p>
            <p>&gt; sys_auth_initiate_handshake</p>
            <p>&gt; sys_established_secure_channel_5173</p>
          </div>
        </div>
      </div>
    );
  }

  // Rendering Security passcode gate
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-mono p-4">
        <div className="w-full max-w-sm border border-neutral-850 bg-neutral-900 p-6 space-y-5">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 bg-white text-black font-black text-sm flex items-center justify-center mx-auto mb-2">A</div>
            <h2 className="text-xs font-black uppercase text-neutral-200 tracking-tight">System Security Clearance Gate</h2>
            <p className="text-[9px] text-neutral-500">Please provide valid security credentials to decrypt aftermeet io databases.</p>
          </div>

          <form onSubmit={handleSecurityCheck} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[8px] uppercase font-bold text-neutral-400 block tracking-wider">Passcode Verification Key</label>
              <input
                type="password"
                placeholder="ENTER SECURITY CODE"
                value={securityInput}
                onChange={(e) => {
                  setSecurityInput(e.target.value);
                  setPasscodeError('');
                }}
                required
                className="w-full bg-black border border-neutral-800 text-white p-2.5 text-center text-xs focus:outline-none focus:border-white font-mono placeholder-neutral-700 uppercase tracking-widest"
              />
            </div>

            {passcodeError && (
              <p className="text-[9px] text-red-500 font-bold text-center uppercase tracking-tight">{passcodeError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2 text-[10px] uppercase transition-colors"
            >
              Verify Credentials
            </button>
          </form>

          <p className="text-center text-[8px] text-neutral-600">Authorized personnel access only &bull; Code: AM-2026</p>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    if (crm.currentView.startsWith('denied-')) {
      return (
        <RestrictedView
          currentUser={crm.currentUser}
          currentView={crm.currentView}
          setCurrentUser={crm.setCurrentUser}
          setCurrentView={crm.setCurrentView}
          triggerToast={crm.triggerToast}
        />
      );
    }

    if (crm.currentView.startsWith('spend-')) {
      const subView = crm.currentView.replace('spend-', '') as any;
      return (
        <SpendManagementView
          currentUser={crm.currentUser}
          expenses={crm.expenses}
          enquiries={crm.enquiries}
          tasks={crm.tasks}
          currentSubView={subView}
          setCurrentView={crm.setCurrentView}
          setSelectedEnquiryId={crm.setSelectedEnquiryId}
          setActiveTaskId={crm.setActiveTaskId}
          handleCreateExpense={crm.handleCreateExpense}
          handleUpdateExpenseStatus={crm.handleUpdateExpenseStatus}
          handleAddExpenseComment={crm.handleAddExpenseComment}
          handleUpdateAccountingDetails={crm.handleUpdateAccountingDetails}
        />
      );
    }

    switch (crm.currentView) {
      case 'global-enquiry':
        return (
          <GlobalEnquiryView
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            searchQuery={crm.searchQuery}
          />
        );
      case 'my-tasks':
        return (
          <MyTasksView
            currentUser={crm.currentUser}
            personalTasks={crm.personalTasks}
              tasks={crm.tasks}
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTaskId={crm.setActiveTaskId}
            handleMarkComplete={crm.handleMarkComplete}
            handleCreateTask={crm.handleCreateTask}
            handleAssignTask={crm.handleAssignTask}
          />
        );
      case 'personal-email':
        return (
          <PersonalMailboxView
            currentUser={crm.currentUser}
            emails={crm.emails}
            enquiries={crm.enquiries}
            emailFolder={crm.emailFolder}
            setEmailFolder={crm.setEmailFolder}
            selectedEmailId={crm.selectedEmailId}
            setSelectedEmailId={crm.setSelectedEmailId}
            emailComposeOpen={crm.emailComposeOpen}
            setEmailComposeOpen={crm.setEmailComposeOpen}
            composeTo={crm.composeTo}
            setComposeTo={crm.setComposeTo}
            composeCc={crm.composeCc}
            setComposeCc={crm.setComposeCc}
            composeBcc={crm.composeBcc}
            setComposeBcc={crm.setComposeBcc}
            composeSubject={crm.composeSubject}
            setComposeSubject={crm.setComposeSubject}
            composeBody={crm.composeBody}
            setComposeBody={crm.setComposeBody}
            composeEnquiry={crm.composeEnquiry}
            setComposeEnquiry={crm.setComposeEnquiry}
            composeAttachments={crm.composeAttachments}
            setComposeAttachments={crm.setComposeAttachments}
            emailSearchQuery={crm.emailSearchQuery}
            setEmailSearchQuery={crm.setEmailSearchQuery}
            activeDraftId={crm.activeDraftId}
            setActiveDraftId={crm.setActiveDraftId}
            draftSavedStatus={crm.draftSavedStatus}
            setDraftSavedStatus={crm.setDraftSavedStatus}
            handleSaveDraft={crm.handleSaveDraft}
            handleSendEmail={crm.handleSendEmail}
            handleToggleStarEmail={crm.handleToggleStarEmail}
            handleArchiveEmail={crm.handleArchiveEmail}
            handleTrashEmail={crm.handleTrashEmail}
            handleDeleteEmailPermanently={crm.handleDeleteEmailPermanently}
            userFilteredEmails={crm.userFilteredEmails}
            activeEmail={crm.activeEmail}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
          />
        );
      case 'sales-enquiry':
      case 'sales-tracker':
        return (
          <SalesTrackerView
            enquiries={crm.enquiries}
            filteredEnquiries={crm.filteredEnquiries}
            setEnquiries={crm.setEnquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleUpdateEnquiryStatus={crm.handleUpdateEnquiryStatus}
            searchQuery={crm.searchQuery}
          />
        );
      case 'sales-prospects':
        return (
          <SalesProspectsView
            prospects={crm.prospects}
            setProspects={crm.setProspects}
            campaigns={crm.campaigns}
            setCampaigns={crm.setCampaigns}
            selectedTone={crm.selectedTone}
            setSelectedTone={crm.setSelectedTone}
            aiGeneratingId={crm.aiGeneratingId}
            handleGenerateAIOutreach={crm.handleGenerateAIOutreach}
            promoteProspectToEnquiry={crm.promoteProspectToEnquiry}
            triggerToast={crm.triggerToast}
            customViews={crm.customViews}
            activeCustomViewId={crm.activeCustomViewId}
            setActiveCustomViewId={crm.setActiveCustomViewId}
            prospectDisplayMode={crm.prospectDisplayMode}
            setProspectDisplayMode={crm.setProspectDisplayMode}
            handleUpdateProspectStatus={crm.handleUpdateProspectStatus}
            handleCreateCustomView={crm.handleCreateCustomView}
            handleDeleteCustomView={crm.handleDeleteCustomView}
          />
        );
      case 'sales-quotations':
        return (
          <SalesQuotationsView
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
          />
        );
      case 'sales-sampling':
        return (
          <SalesSamplingView
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
          />
        );
      case 'sales-pos':
        return (
          <SalesPOsView
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
          />
        );
      case 'sales-vendors':
        return (
          <SalesVendorsView
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
          />
        );
      case 'sales-contracts':
        return (
          <SalesContractsView
            enquiries={crm.enquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTab={crm.setActiveTab}
          />
        );
      case 'enquiry-detail':
        return (
          <EnquiryDetailView
            activeEnquiry={crm.activeEnquiry}
            activeTab={crm.activeTab}
            setActiveTab={crm.setActiveTab}
            currentUser={crm.currentUser}
            setEnquiries={crm.setEnquiries}
            setSelectedEnquiryId={crm.setSelectedEnquiryId}
            setCurrentView={crm.setCurrentView}
            setActiveTaskId={crm.setActiveTaskId}
            triggerToast={crm.triggerToast}
            handleCreateCostingRequest={crm.handleCreateCostingRequest}
            handlePrepareQuotationFromCosting={crm.handlePrepareQuotationFromCosting}
            handleCreateTask={crm.handleCreateTask}
            documents={crm.documents}
            documentVersions={crm.documentVersions}
            documentWorkItemLinks={crm.documentWorkItemLinks}
            onOpenDocumentVault={() => crm.toggleDocumentVault(true)}
            handleUploadDocument={crm.handleUploadDocument}
          />
        );
      case 'ops-costing':
        return (
          <OpsCostingView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignCostingRequest={crm.handleAssignCostingRequest}
            handleUpdateCostingComponent={crm.handleUpdateCostingComponent}
            handleRequestInternalTask={crm.handleRequestInternalTask}
            handleSubmitCostingRequest={crm.handleSubmitCostingRequest}
            handleAddCostingComment={crm.handleAddCostingComment}
            handleAddCostingDocument={crm.handleAddCostingDocument}
            setActiveTaskId={crm.setActiveTaskId}
          />
        );
      case 'ops-sampling':
        return (
          <OpsSamplingView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignSamplingRequest={crm.handleAssignSamplingRequest}
            handleUpdateSamplingDetails={crm.handleUpdateSamplingDetails}
            handleSubmitSamplingRequest={crm.handleSubmitSamplingRequest}
            handleAddSamplingComment={crm.handleAddSamplingComment}
            handleAddSamplingDocument={crm.handleAddSamplingDocument}
            handleRequestSamplingInternalTask={crm.handleRequestSamplingInternalTask}
            setActiveTaskId={crm.setActiveTaskId}
          />
        );
      case 'ops-logistics':
        return (
          <OpsLogisticsView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignLogisticsRequest={crm.handleAssignLogisticsRequest}
            handleUpdateLogisticsDetails={crm.handleUpdateLogisticsDetails}
            handleSubmitLogisticsRequest={crm.handleSubmitLogisticsRequest}
            handleAddLogisticsComment={crm.handleAddLogisticsComment}
            handleAddLogisticsDocument={crm.handleAddLogisticsDocument}
            handleRequestLogisticsInternalTask={crm.handleRequestLogisticsInternalTask}
            setActiveTaskId={crm.setActiveTaskId}
          />
        );
      case 'ops-compliance':
        return (
          <OpsComplianceView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignComplianceRequest={crm.handleAssignComplianceRequest}
            handleUpdateComplianceDetails={crm.handleUpdateComplianceDetails}
            handleSubmitComplianceRequest={crm.handleSubmitComplianceRequest}
            handleAddComplianceComment={crm.handleAddComplianceComment}
            handleAddComplianceDocument={crm.handleAddComplianceDocument}
            handleRequestComplianceInternalTask={crm.handleRequestComplianceInternalTask}
            setActiveTaskId={crm.setActiveTaskId}
          />
        );
      case 'ops-hr':
        return (
          <OpsHRView
            currentUser={crm.currentUser}
            hrEmployees={crm.hrEmployees}
            tasks={crm.tasks}
            triggerToast={crm.triggerToast}
            handleCreateHREmployee={crm.handleCreateHREmployee}
            handleUpdateHREmployeeDetails={crm.handleUpdateHREmployeeDetails}
            handleToggleHROnboardingCheck={crm.handleToggleHROnboardingCheck}
            handleToggleHROffboardingCheck={crm.handleToggleHROffboardingCheck}
            handleToggleHRTrainingCheck={crm.handleToggleHRTrainingCheck}
            handleUploadHRDocument={crm.handleUploadHRDocument}
            handleCreateHRAttendanceRequest={crm.handleCreateHRAttendanceRequest}
            handleActionHRAttendanceRequest={crm.handleActionHRAttendanceRequest}
            handleCreateTask={crm.handleCreateTask}
            setActiveTaskId={crm.setActiveTaskId}
          />
        );
      case 'dash-sales':
        return <DashSalesView />;
      case 'dash-costing':
        return (
          <DashCostingView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignCostingRequest={crm.handleAssignCostingRequest}
            handleApproveCostingRequest={crm.handleApproveCostingRequest}
            handleRejectCostingRequest={crm.handleRejectCostingRequest}
          />
        );
      case 'dash-sampling':
        return (
          <DashSamplingView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignSamplingRequest={crm.handleAssignSamplingRequest}
            handleApproveSamplingRequest={crm.handleApproveSamplingRequest}
            handleRejectSamplingRequest={crm.handleRejectSamplingRequest}
          />
        );
      case 'dash-logistics':
        return (
          <DashLogisticsView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignLogisticsRequest={crm.handleAssignLogisticsRequest}
            handleApproveLogisticsRequest={crm.handleApproveLogisticsRequest}
            handleRejectLogisticsRequest={crm.handleRejectLogisticsRequest}
          />
        );
      case 'dash-compliance':
        return (
          <DashComplianceView
            enquiries={crm.enquiries}
            currentUser={crm.currentUser}
            triggerToast={crm.triggerToast}
            handleAssignComplianceRequest={crm.handleAssignComplianceRequest}
            handleApproveComplianceRequest={crm.handleApproveComplianceRequest}
            handleRejectComplianceRequest={crm.handleRejectComplianceRequest}
          />
        );
      case 'dash-hr':
        return (
          <DashHRView
            hrEmployees={crm.hrEmployees}
            tasks={crm.tasks}
            triggerToast={crm.triggerToast}
            handleActionHRAttendanceRequest={crm.handleActionHRAttendanceRequest}
          />
        );
      case 'presidential-overview':
        return (
          <PresidentialOverviewView
            enquiries={crm.enquiries}
            globalTasks={crm.globalTasks}
          />
        );
      default:
        return (
          <div className="p-4">
            <h2 className="text-sm font-bold uppercase">View under construction</h2>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-neutral-50 text-neutral-800 font-sans text-[11px] antialiased overflow-hidden">

      {/* SIDEBAR NAVIGATION SYSTEM */}
      <Sidebar
        currentUser={crm.currentUser}
        setCurrentUser={crm.setCurrentUser}
        currentView={crm.currentView}
        handleNavClick={crm.handleNavClick}
        personalTasks={crm.personalTasks}
        checkPermissions={crm.checkPermissions}
        triggerToast={crm.triggerToast}
      />

      {/* WORKSPACE CONTENT LAYOUT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-neutral-50 relative">

        {/* GLOBAL HEADER BAR */}
        <Header
          currentUser={crm.currentUser}
          onOpenSearch={() => {
            setPaletteMode('search');
            setPaletteOpen(true);
          }}
          onOpenActions={() => {
            setPaletteMode('action');
            setPaletteOpen(true);
          }}
          onOpenDocumentVault={() => {
            crm.toggleDocumentVault(true);
          }}
        />

        {/* TOAST PANEL */}
        <Toast
          toastMessage={crm.toastMessage}
          setToastMessage={crm.setToastMessage}
        />

        <main className="p-4 space-y-4 max-w-full">
          {renderActiveView()}
        </main>
      </div>

      {/* TASK CHAT WORKSPACE SIDEBAR DRAWER */}
      <TaskChatDrawer
        activeTaskId={crm.activeTaskId}
        activeTaskDetails={crm.activeTaskDetails}
        setActiveTaskId={crm.setActiveTaskId}
        chatCommentText={crm.chatCommentText}
        setChatCommentText={crm.setChatCommentText}
        handleAddComment={crm.handleAddComment}
        currentUser={crm.currentUser}
        triggerToast={crm.triggerToast}
      />

      {/* DOCUMENT VAULT SIDEBAR PANEL */}
      <DocumentVaultDrawer
        isOpen={crm.isDocumentVaultOpen}
        onClose={() => crm.toggleDocumentVault(false)}
        selectedEnquiryId={crm.selectedEnquiryId}
        documents={crm.documents}
        documentVersions={crm.documentVersions}
        documentWorkItemLinks={crm.documentWorkItemLinks}
        tasks={crm.tasks}
        currentUser={crm.currentUser}
        handleUploadDocument={crm.handleUploadDocument}
        handleUploadNewDocumentVersion={crm.handleUploadNewDocumentVersion}
        handleLinkDocumentToRequest={crm.handleLinkDocumentToRequest}
        handleShareDocument={crm.handleShareDocument}
        triggerToast={crm.triggerToast}
      />

      <CommandPalette
        currentUser={crm.currentUser}
        setCurrentUser={crm.setCurrentUser}
        currentView={crm.currentView}
        handleNavClick={crm.handleNavClick}
        triggerToast={crm.triggerToast}
        setEmailComposeOpen={crm.setEmailComposeOpen}
        setSelectedEnquiryId={crm.setSelectedEnquiryId}
        setActiveTaskId={crm.setActiveTaskId}
        isOpen={paletteOpen}
        setIsOpen={setPaletteOpen}
        initialMode={paletteMode}
      />

    </div>
  );
}
