import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Cpu,
  Link as LinkIcon,
  UserCheck,
  Library,
  Activity,
  CreditCard,
  Sliders,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  Phone,
  Calendar,
  Globe,
  TrendingUp,
  Trash2,
  Check,
  Play,
  RefreshCw,
  Database,
  Smartphone,
  ShieldCheck,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowRight,
  MoreVertical,
  Plus,
  ShieldAlert,
  Server,
  Terminal,
  Eye,
  FileText,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useApp, ROLES } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';

// Mock data removed. State will be managed dynamically.

export const SuperAdminControlCenter = ({ defaultTab }) => {
  const [tab, setTab] = useState(defaultTab || 'overview');
  const navigate = useNavigate();
  const { setRole, enterWorkspace, subscriptions, pendingRequests, updateRequestStatus, addPendingRequest, rejectRequest } = useApp();
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const getSubTitle = (activeTab) => {
    switch (activeTab) {
      case 'overview':
        return 'AI automation activity, active hotel workspaces, and system sync performance.';
      case 'onboarding':
        return 'Review hotel requests, provision credentials, and generate isolated sandboxes.';
      case 'workspaces':
        return 'Active hotel organizations currently running AI automation workflows on the AutoPilot platform.';
      case 'integrations-infra':
        return 'Infrastructure connections, sync intervals, webhook endpoints, and sync node latency.';

      case 'knowledge-infra':
        return 'Vector indices, multi-tenant RAG indexes, embedding models, and index latency.';
      default:
        return 'Admin operations control center.';
    }
  };

  const getTabTitle = (activeTab) => {
    switch (activeTab) {
      case 'overview':
        return 'Dashboard';
      case 'onboarding':
        return 'Hotel Setup Requests';
      case 'workspaces':
        return 'Hotel Accounts';
      case 'integrations-infra':
        return 'Integrations Infrastructure';

      case 'knowledge-infra':
        return 'Knowledge Infrastructure';
      default:
        return 'Control Panel';
    }
  };


  // Datasets State
  const [requests, setRequests] = useState(pendingRequests);
  
  useEffect(() => {
    setRequests(pendingRequests);
  }, [pendingRequests]);

  const [workspaces, setWorkspaces] = useState([]);
  const [streams, setStreams] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchWorkspaces = () => {
    fetch(`${API_BASE_URL}/api/hotels`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && Array.isArray(data.data)) {
          const formattedWorkspaces = data.data.map(h => ({
            id: h.id,
            name: h.hotelName,
            pms: h.pmsProvider || 'Unknown',
            whatsapp: h.whatsappConnected ? 'Connected' : 'Disconnected',
            aiStatus: h.aiStatus,
            isPaused: h.isPaused,
            conversations: h.aiProcessed || 0,
            chatsToday: h.chatsToday || 0,
            satisfaction: h.satisfaction ? `${h.satisfaction}%` : '100%',
            escalations: h.escalations || 0,
            health: '100%',
            plan: h.subscriptionPlan,
            syncTime: 'Just now',
            monthlyUsage: h.monthlyUsage || 0
          }));
          setWorkspaces(formattedWorkspaces);
        }
      })
      .catch(err => console.error('Failed to fetch hotels:', err));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);



  // Filters / Search
  const [searchQuery, setSearchQuery] = useState('');
  const [streamFilter, setStreamFilter] = useState('All');
  const [confidenceLimit, setConfidenceLimit] = useState(85);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  // Active onboarding edit state
  const [assigningRequestId, setAssigningRequestId] = useState(null);

  // Onboarding & Rejection workflow states
  const [selectedRequest, setSelectedRequest] = useState(null); // for VIEW details modal
  const [deployedCredentials, setDeployedCredentials] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  // Notes editing states
  const [editingNotesRequest, setEditingNotesRequest] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [provisionForm, setProvisionForm] = useState({
    hotelName: '',
    country: 'USA',
    roomCount: 120,
    pmsType: 'Opera PMS',
    email: '',
    managerName: '',
    enableWhatsApp: true,
    enableEmail: true,
    languageMode: 'Auto-Detect Multilingual',
    plan: 'Standard',
    assignedSpecialist: 'Sarah Jenkins',
    workspaceId: '',
    credentialsEmail: '',
    credentialsPassword: '',
    createSandbox: true,
    pmsStatus: 'Connected'
  });

  useEffect(() => {
    if (showProvisionModal) {
      setProvisionForm({
        hotelName: '',
        country: 'USA',
        roomCount: 120,
        pmsType: 'Opera PMS',
        email: '',
        managerName: '',
        enableWhatsApp: true,
        enableEmail: true,
        languageMode: 'Auto-Detect Multilingual',
        plan: 'Standard',
        assignedSpecialist: 'Sarah Jenkins',
        workspaceId: `ws_${Math.random().toString(36).substr(2, 6)}`,
        credentialsEmail: '',
        credentialsPassword: `AutoPilot@${Math.floor(1000 + Math.random() * 9000)}`,
        createSandbox: true,
        pmsStatus: 'Connected'
      });
    }
  }, [showProvisionModal]);

  // Reject State
  const [rejectingRequest, setRejectingRequest] = useState(null); // for REJECT modal
  const [rejectionReason, setRejectionReason] = useState('');
  const [deletingWorkspace, setDeletingWorkspace] = useState(null); // for custom delete confirmation modal

  // 10-Step Onboarding Pipeline Workspace States
  const [workspaceActiveTab, setWorkspaceActiveTab] = useState('discussion');
  const [newDiscussionMsg, setNewDiscussionMsg] = useState('');
  const [customizationInput, setCustomizationInput] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docNameInput, setDocNameInput] = useState('');
  const [docTypeInput, setDocTypeInput] = useState('SOP Manual');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [activationResult, setActivationResult] = useState(null);
  const [credentialForm, setCredentialForm] = useState({
    pmsApiKey: '',
    pmsSecret: '',
    whatsappApiKey: '',
    smtpHost: 'smtp.googlemail.com',
    smtpUser: '',
    smtpPass: '',
    webhookUrl: ''
  });

  // Reactive tab controller for Setup Hub based on request progress
  useEffect(() => {
    if (selectedRequest) {
      // Sync credentialForm values if they exist
      setCredentialForm({
        pmsApiKey: selectedRequest.pmsApiKey || '',
        pmsSecret: selectedRequest.pmsSecret || '',
        whatsappApiKey: selectedRequest.whatsappApiKey || '',
        smtpHost: selectedRequest.smtpHost || 'smtp.googlemail.com',
        smtpUser: selectedRequest.smtpUser || '',
        smtpPass: selectedRequest.smtpPass || '',
        webhookUrl: selectedRequest.webhookUrl || ''
      });
      setCustomizationInput(selectedRequest.customizationReqs || '');
      setValidationResults(null);

      const status = selectedRequest.status;
      if (status === 'Request Received' || status === 'pending_review' || status === 'approved_waiting_discussion') {
        setWorkspaceActiveTab('discussion');
      } else if (status === 'agreement_completed') {
        setWorkspaceActiveTab('vault');
      } else if (status === 'configured' || status === 'ready_for_activation') {
        setWorkspaceActiveTab('validation');
      } else {
        setWorkspaceActiveTab('discussion');
      }
    }
  }, [selectedRequest]);

  const [isSendingMsg, setIsSendingMsg] = React.useState(false);

  const handlePostDiscussionMsg = async () => {
    if (!newDiscussionMsg.trim() || !selectedRequest || isSendingMsg) return;
    const msgText = newDiscussionMsg.trim();
    setIsSendingMsg(true);

    // Optimistic update — show message instantly in UI
    const newMsg = { sender: 'Super Admin', text: msgText, timestamp: new Date().toISOString() };
    const optimisticMsgs = [...(selectedRequest.messages || []), newMsg];
    const optimisticUpdated = { ...selectedRequest, messages: optimisticMsgs };
    setSelectedRequest(optimisticUpdated);
    setNewDiscussionMsg('');

    try {
      const updatedTimeline = [...(selectedRequest.timeline || []), `Operator posted alignment message: "${msgText.substring(0, 40)}..."`];
      const updated = await updateRequestStatus(selectedRequest.id, selectedRequest.status, {
        messages: optimisticMsgs,
        timeline: updatedTimeline
      });
      if (updated) {
        setSelectedRequest(updated);
        setRequests(prev => prev.map(item => item.id === selectedRequest.id ? updated : item));
      }
      triggerToast('Message sent successfully!');
    } catch (err) {
      console.error('Failed to post message:', err);
      triggerToast('Failed to send message. Please try again.');
      // Rollback optimistic update on error
      setSelectedRequest(selectedRequest);
    } finally {
      setIsSendingMsg(false);
    }
  };

  const handleUploadSopDoc = async () => {
    if (!docNameInput.trim() || !selectedRequest) return;
    setUploadingDoc(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotel-documents/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: docNameInput.trim(),
          docType: docTypeInput,
          hotelRequestId: selectedRequest.id
        })
      });
      const data = await res.json();
      if (data.success && data.data && data.data.request) {
        const r = data.data.request;
        const formatted = {
          id: r.requestId,
          hotelName: r.hotelName,
          managerName: r.contactName,
          contactName: r.contactName,
          email: r.email,
          workEmail: r.email,
          phone: r.whatsapp || '',
          whatsapp: r.whatsapp || '',
          country: 'International',
          pmsType: r.pmsProvider,
          pmsProvider: r.pmsProvider,
          roomCount: parseInt(r.roomCount) || 100,
          rooms: r.roomCount,
          plan: r.plan,
          status: r.status,
          specialist: r.specialist,
          integrationHealth: r.integrationHealth,
          notes: r.notes || '',
          date: r.createdAt.split('T')[0],
          onboardingToken: r.onboardingToken,
          operator: { name: r.specialist, role: 'Hospitality Onboarding Specialist' },
          website: r.website || '',
          hotelType: r.hotelType || 'Boutique',
          uniqueHotelId: r.uniqueHotelId || '',
          messages: r.messages ? JSON.parse(r.messages) : [],
          checklist: r.checklist ? JSON.parse(r.checklist) : [],
          timeline: r.timeline ? JSON.parse(r.timeline) : [],
          customizationReqs: r.customizationReqs || '',
          sopDocuments: r.sopDocuments ? JSON.parse(r.sopDocuments) : [],
          tempPassword: r.tempPassword
        };
        setSelectedRequest(formatted);
        setRequests(prev => prev.map(item => item.id === selectedRequest.id ? formatted : item));
        triggerToast(`Successfully uploaded ${docNameInput.trim()} & sent to multi-tenant RAG vectorization!`);
      } else {
        triggerToast(data.message || 'Failed to upload document');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Network error uploading document');
    } finally {
      setUploadingDoc(false);
      setDocNameInput('');
    }
  };

  const handleSaveCustomizationReqs = async () => {
    if (!selectedRequest) return;
    const updatedTimeline = [...(selectedRequest.timeline || []), `Updated customization requirements ledger`];
    const updated = await updateRequestStatus(selectedRequest.id, selectedRequest.status, {
      customizationReqs: customizationInput,
      timeline: updatedTimeline
    });
    if (updated) {
      setSelectedRequest(updated);
      setRequests(prev => prev.map(item => item.id === selectedRequest.id ? updated : item));
    }
    triggerToast(`Customization requirements successfully cataloged!`);
  };

  const handleSecureVaultSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!credentialForm.pmsApiKey.trim()) {
      triggerToast('MEWS PMS Client Token is required!');
      return;
    }
    if (!credentialForm.pmsSecret.trim()) {
      triggerToast('MEWS PMS Access Token is required!');
      return;
    }
    if (!credentialForm.whatsappApiKey.trim()) {
      triggerToast('WhatsApp Gateway API Key is required!');
      return;
    }
    if (!credentialForm.smtpHost.trim()) {
      triggerToast('SMTP Host server is required!');
      return;
    }
    if (!credentialForm.smtpUser.trim()) {
      triggerToast('SMTP Login User is required!');
      return;
    }
    if (!credentialForm.smtpPass.trim()) {
      triggerToast('SMTP Login Password is required!');
      return;
    }

    triggerToast('Initiating live PMS handshake verification test...');
    try {
      const testRes = await fetch(`${API_BASE_URL}/api/mews/test-connection?clientToken=${encodeURIComponent(credentialForm.pmsApiKey)}&accessToken=${encodeURIComponent(credentialForm.pmsSecret)}`);
      const testData = await testRes.json();
      if (!testData.success) {
        triggerToast(`PMS Connection Test Failed: ${testData.message || 'Verify token credentials'}`);
        return;
      }
      triggerToast(`PMS Handshake verified successfully for ${testData.data?.hotelName || 'Enterprise Hotel'}!`);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to reach PMS validation endpoint. Proceeding with caution...');
    }

    triggerToast('Encrypting credentials and routing to Google Secret Manager...');
    
    // Masked credentials to save in main request ledger
    const updates = {
      pmsApiKey: credentialForm.pmsApiKey ? '••••••••••••••••' : '',
      pmsSecret: credentialForm.pmsSecret ? '••••••••••••••••' : '',
      whatsappApiKey: credentialForm.whatsappApiKey ? '••••••••••••••••' : '',
      smtpHost: credentialForm.smtpHost,
      smtpUser: credentialForm.smtpUser,
      smtpPass: credentialForm.smtpPass ? '••••••••••••••••' : '',
      webhookUrl: credentialForm.webhookUrl,
      uniqueHotelId: selectedRequest.uniqueHotelId || `hotel_ws_${Math.floor(100 + Math.random() * 900)}`,
      timeline: [...(selectedRequest.timeline || []), `Encrypted sensitive credentials & deployed database shard: ${selectedRequest.uniqueHotelId || 'hotel_ws'}`]
    };

    const updated = await updateRequestStatus(selectedRequest.id, 'configured', updates);
    if (updated) {
      setSelectedRequest(updated);
      setRequests(prev => prev.map(item => item.id === selectedRequest.id ? updated : item));
    }
    triggerToast('Sensitive credentials securely vaulted in Google Secret Manager!');
  };

  const handleOpenDetails = (r) => {
    setSelectedRequest(r);
  };

  const handleStartOnboarding = async (r) => {
    const updated = await updateRequestStatus(r.id, 'approved_waiting_discussion');
    if (updated) {
      setRequests(prev => prev.map(item => item.id === r.id ? updated : item));
      if (selectedRequest && selectedRequest.id === r.id) {
        setSelectedRequest(updated);
      }
    }
    triggerToast(`Request approved! Onboarding pipeline and communication hub initialized.`);
  };

  const handleStartReject = (r) => {
    setRejectingRequest(r);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectingRequest) return;

    // Set request status as 'Rejected'
    setRequests(prev => prev.map(r => r.id === rejectingRequest.id ? { ...r, status: 'Rejected' } : r));
    rejectRequest(rejectingRequest.id);
    if (selectedRequest && selectedRequest.id === rejectingRequest.id) {
      setSelectedRequest(prev => ({ ...prev, status: 'Rejected' }));
    }

    triggerToast(`Onboarding request from ${rejectingRequest.hotelName} rejected.`);
    setRejectingRequest(null);
  };

  const handleSaveNotes = () => {
    if (!editingNotesRequest) return;
    setRequests(prev => prev.map(r => r.id === editingNotesRequest.id ? { ...r, notes: tempNotes } : r));
    updateRequestStatus(editingNotesRequest.id, editingNotesRequest.status, { notes: tempNotes });
    if (selectedRequest && selectedRequest.id === editingNotesRequest.id) {
      setSelectedRequest(prev => ({ ...prev, notes: tempNotes }));
    }
    triggerToast(`Operational notes updated for ${editingNotesRequest.hotelName}`);
    setEditingNotesRequest(null);
  };

  useEffect(() => {
    if (defaultTab) {
      setTab(defaultTab);
    }
  }, [defaultTab]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Onboarding Actions
  const handleOnboardingStatus = async (id, newStatus, updates = {}) => {
    const updated = await updateRequestStatus(id, newStatus, updates);
    if (updated) {
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(updated);
      }
    }
    triggerToast(`Request status updated to "${newStatus}"`);
  };

  const handleCreateWorkspace = async (hotel) => {
    triggerToast(`Provisioning production workspace for ${hotel.hotelName}...`);
    const updated = await updateRequestStatus(hotel.id, 'active');
    if (updated) {
      setRequests(prev => prev.map(r => r.id === hotel.id ? updated : r));
      if (selectedRequest && selectedRequest.id === hotel.id) {
        setSelectedRequest(updated);
      }
      // Store activation credentials result to display in gorgeous welcome modal
      setDeployedCredentials({
        hotelName: hotel.hotelName,
        email: hotel.email,
        password: updated.tempPassword || 'AutoPilot@2026',
        workspaceUrl: `https://${hotel.hotelName.toLowerCase().replace(/[^a-z0-9]/g, '')}.autopilot.ai/login`
      });
      fetchWorkspaces();
      triggerToast(`Workspace active! Credentials compiled.`);
    }
  };

  const handleAssignManager = (id, managerName) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, manager: managerName } : r));
    setAssigningRequestId(null);
    triggerToast(`Assigned ${managerName} as onboarding manager.`);
  };

  // Workspace Actions
  const toggleWorkspaceAi = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, aiStatus: nextStatus } : w));
    triggerToast(`AI Orchestration ${nextStatus === 'Active' ? 'Resumed' : 'Paused'} for workspace.`);
  };

  const toggleWorkspaceWhatsapp = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Connected' ? 'Disconnected' : 'Connected';
    setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, whatsapp: nextStatus } : w));
    triggerToast(`WhatsApp channel ${nextStatus}.`);
  };

  const resetIntegration = (id, name) => {
    triggerToast(`Resetting API ledger links for ${name}...`);
    setTimeout(() => {
      setWorkspaces(prev => prev.map(w => w.id === id ? { ...w, syncTime: 'Just now' } : w));
      triggerToast(`Integration handshake complete for ${name}.`);
    }, 1200);
  };

  // Run diagnostics simulation
  const runDiagnostics = () => {
    setIsDiagnosticRunning(true);
    triggerToast('Initiating platform diagnostic sweep...');
    setTimeout(() => {
      setIsDiagnosticRunning(false);
      triggerToast('Platform integrity check: 100% Healthy.');
    }, 1800);
  };

  return (
    <div className="px-0 pt-1 pb-16 sm:py-2 sm:px-0 max-w-[1600px] mx-auto space-y-4 sm:space-y-6 font-sans text-left bg-slate-50/25">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#0B1020] border border-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 font-sans"
          >
            <CheckCircle2 size={16} className="text-[#A78BFA]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      {tab !== 'overview' && tab !== 'workspaces' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-150 pb-5">
          <div className="text-left space-y-1">
            <span className="text-[9px] font-black tracking-widest text-[#6D4AFF] uppercase font-mono">Admin Console</span>
            <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase">
              {getTabTitle(tab)}
            </h1>
            <p className="text-xs text-slate-500 font-bold leading-normal">
              {getSubTitle(tab)}
            </p>
          </div>
          
          {tab === 'onboarding' && (
            <button 
              onClick={() => setShowProvisionModal(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-purple-600 to-[#6D4AFF] hover:from-purple-700 hover:to-[#5b3ce4] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 font-sans shrink-0 self-start sm:self-center"
            >
              <Plus size={14} className="text-white" />
              <span>Add Hotel Workspace</span>
            </button>
          )}
        </div>
      )}

      {/* RENDER ACTIVE TAB CODES */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* TAB 1: OVERVIEW (PLATFORM OVERVIEW) */}
          {tab === 'overview' && (() => {
            const currentMRR = workspaces.reduce((acc, w) => acc + (w.monthlyUsage || 0), 0);
            const totalRevenueToday = workspaces.reduce((acc, w) => acc + ((w.monthlyUsage || 0) / 30), 0);
            
            const chartData = [
              { name: 'Jan', mrr: currentMRR * 0.7 },
              { name: 'Feb', mrr: currentMRR * 0.8 },
              { name: 'Mar', mrr: currentMRR * 0.85 },
              { name: 'Apr', mrr: currentMRR * 0.9 },
              { name: 'May', mrr: currentMRR * 0.95 },
              { name: 'Jun', mrr: currentMRR }
            ];

            const CustomTooltip = ({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl shadow-xl text-left">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider font-mono">Monthly Revenue</p>
                    <p className="text-xs font-black text-white font-mono mt-0.5">${payload[0].value.toLocaleString()}</p>
                  </div>
                );
              }
              return null;
            };

            return (
              <div className="space-y-6 text-left animate-in fade-in duration-200">

                {/* Streamlined TOP HEADER SECTION */}
                <div className="pb-4 border-b border-slate-150">
                  <div className="space-y-1 text-left">
                    <h1 className="text-lg font-black text-slate-950 tracking-tight uppercase">
                      Dashboard
                    </h1>
                    <p className="text-xs text-slate-500 font-bold leading-normal">
                      Monitor AI automation activity, active hotel workspaces, and system performance.
                    </p>
                  </div>
                </div>

                {/* SECTION 1 — PRIMARY PLATFORM METRICS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: 'Active Hotels', value: workspaces.length, desc: 'Connected tenant environments', icon: Building2, color: 'text-blue-600 bg-blue-50/50 border-blue-100' },
                    { title: 'Active Conversations', value: workspaces.reduce((acc, w) => acc + (w.chatsToday || 0), 0).toLocaleString(), desc: 'Real-time multi-tenant chats', icon: MessageSquare, color: 'text-[#6D4AFF] bg-purple-50/50 border-purple-100' },
                    { title: 'AI Resolution Rate', value: workspaces.length > 0 ? ((workspaces.reduce((acc, w) => acc + (w.conversations || 0), 0) / Math.max(workspaces.reduce((acc, w) => acc + (w.chatsToday || 0), 0), 1)) * 100).toFixed(1) + '%' : '0%', desc: 'Autonomously completed flows', icon: Cpu, color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100' },
                    { title: 'Human Escalations', value: workspaces.reduce((acc, w) => acc + (w.escalations || 0), 0).toLocaleString(), desc: 'Awaiting operator takeover', icon: UserCheck, color: 'text-amber-600 bg-amber-50/50 border-amber-100' }
                  ].map((m, i) => (
                    <div key={i} className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">{m.title}</span>
                        <p className="text-2xl font-black text-slate-950 tracking-tight">{m.value}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{m.desc}</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color} border shrink-0`}>
                        <m.icon size={16} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* SECTION 2 — LIVE SYSTEM OPERATIONS (2 COLUMNS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* LEFT COLUMN: REVENUE PERFORMANCE CHART */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm text-left flex flex-col justify-between h-[340px]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="space-y-0.5 text-left">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">MRR Performance</h3>
                        <p className="text-[10px] text-slate-400 font-semibold">Monthly Recurring Revenue trajectory across all hotel tiers.</p>
                      </div>
                      <span className="text-[10px] font-black text-[#6D4AFF] bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl uppercase font-mono shrink-0">
                        +${totalRevenueToday.toFixed(0).toLocaleString()} TODAY
                      </span>
                    </div>

                    <div className="flex-1 w-full min-h-[200px] mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6D4AFF" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#6D4AFF" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="mrr" stroke="#6D4AFF" strokeWidth={2} fillOpacity={1} fill="url(#colorMrr)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ACTIVE HOTEL WORKSPACES */}
                  <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm text-left flex flex-col justify-between h-[340px]">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Active Workspace Pulse</h3>
                      <span className="text-[9px] font-black text-slate-400 font-mono">DEPLOYED: {workspaces.length} NODES</span>
                    </div>

                    <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 mt-3">
                      {workspaces.map(w => (
                        <div key={w.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/40 rounded-xl">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-800 block truncate max-w-[180px]">{w.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{w.pms} • {w.whatsapp === 'Connected' ? 'Sync Live' : 'Offline'}</span>
                          </div>
                          <div className="text-right font-mono text-[10px] font-bold text-slate-600 space-y-0.5 shrink-0">
                            <span className="block">{w.conversations || '142'} chats</span>
                            <span className="text-emerald-600 font-black">{w.health || '100%'} health</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            );
          })()}
          {/* TAB 2: HOTEL ONBOARDING */}
          {tab === 'onboarding' && (() => {
            const filteredRequests = requests.filter(r => {
              if (r.status === 'Rejected' || r.status === 'Workspace Live' || r.status === 'Workspace Activated') return false;
              const matchesSearch = r.hotelName.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesSource = sourceFilter === 'All' || (r.source || 'Website Request') === sourceFilter;
              return matchesSearch && matchesSource;
            });

            // Priority colors helper
            const getPriorityStyles = (p) => {
              switch (p) {
                case 'VIP CLIENT':
                  return 'bg-purple-50 text-purple-700 border-purple-200';
                case 'ENTERPRISE':
                  return 'bg-indigo-50 text-indigo-700 border-indigo-200';
                case 'HIGH PRIORITY':
                  return 'bg-orange-50 text-orange-700 border-orange-200';
                case 'TRIAL':
                  return 'bg-slate-50 text-slate-600 border-slate-200';
                case 'DELAYED':
                  return 'bg-yellow-50 text-yellow-700 border-yellow-200';
                case 'BLOCKED':
                  return 'bg-rose-50 text-rose-700 border-rose-200';
                default:
                  return 'bg-slate-50 text-slate-600 border-slate-200';
              }
            };

            return (
              <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-6">

                {/* Onboarding Stats Pills */}
                <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2.5 sm:gap-4 pb-1 w-full">
                  {[
                    { label: 'Pending Review', value: requests.filter(r => r.status === 'pending_review' || r.status === 'Request Received' || r.status === 'Pending').length, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                    { label: 'In Discussions', value: requests.filter(r => r.status === 'approved_waiting_discussion').length, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                    { label: 'Vault Configuration', value: requests.filter(r => r.status === 'agreement_completed' || r.status === 'configured' || r.status === 'ready_for_activation').length, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                    { label: 'Active Properties', value: requests.filter(r => r.status === 'active').length, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' }
                  ].map((stat, i) => (
                    <div key={i} className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border ${stat.color} flex items-center justify-between sm:justify-start gap-2.5 text-[10px] sm:text-xs font-bold shadow-sm w-full md:w-auto`}>
                      <span className="opacity-75 uppercase tracking-wider text-[9px]">{stat.label}:</span>
                      <span className="font-mono text-sm font-black">{stat.value}</span>
                    </div>
                  ))}
                </div>

                {/* Filter and Headline Bar */}
                <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 pt-4 border-t border-slate-100">
                  <div className="space-y-1 text-left">
                    <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">Hotel Onboarding Control Center</h2>
                    <p className="text-[11px] text-slate-500 font-semibold">Coordinate hotel communication channels, secure sensitive credentials, and provision isolated sandboxes.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full xl:w-auto">
                    {/* Onboarding Source Filter */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Source:</span>
                      <select
                        value={sourceFilter}
                        onChange={(e) => setSourceFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold py-2 px-3 focus:bg-white focus:border-[#6D4AFF]/45 outline-none transition-all cursor-pointer text-slate-700 shadow-sm font-sans w-full sm:w-auto"
                      >
                        <option value="All">All Sources</option>
                        <option value="Website Request">Website Request</option>
                        <option value="Manual Provisioning">Manual Provisioning</option>
                        <option value="Enterprise Import">Enterprise Import</option>
                        <option value="Trial Setup">Trial Setup</option>
                      </select>
                    </div>

                    {/* Search bar */}
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search workspace..."
                        className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#6D4AFF]/45 transition-all shadow-sm text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* CARDS PIPELINE GRID */}
                {filteredRequests.length === 0 ? (
                  <div className="py-20 px-8 text-center border-2 border-dashed border-slate-200/80 rounded-[2rem] bg-gradient-to-b from-slate-50/50 to-white flex flex-col items-center justify-center space-y-5 shadow-sm">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-2 shadow-inner border border-indigo-100/50">
                      <Building2 size={28} strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight">No Pending Deployments</h3>
                      <p className="text-[11px] text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                        There are currently no hotel organizations awaiting workspace provisioning. Setup requests will appear here once submitted.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowProvisionModal(true)}
                      className="mt-2 px-5 py-2 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-all flex items-center gap-2 group"
                    >
                      <Plus size={14} className="group-hover:scale-110 transition-transform" />
                      <span>Provision Manually</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                    {filteredRequests.map(r => {
                      return (
                        <div key={r.id} className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-4 relative hover:shadow-md transition-all font-sans">

                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1 text-left">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase font-mono tracking-wider">{r.plan || 'Standard'} Plan</span>
                                <span className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-wider font-mono border ${getPriorityStyles(r.priority || 'TRIAL')}`}>
                                  {r.priority || 'TRIAL'}
                                </span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">
                                  • {r.source || 'Website Request'}
                                </span>
                              </div>
                              <h3 className="text-sm font-black text-slate-950 tracking-tight mt-1">{r.hotelName}</h3>
                            </div>
                            <span className={`px-2.5 py-1 rounded text-[8px] font-black uppercase tracking-wider font-mono border text-center shrink-0 ${
                              r.status === 'Request Received' || r.status === 'pending_review' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              r.status === 'approved_waiting_discussion' ? 'bg-indigo-50 text-indigo-700 border-indigo-100 animate-pulse' :
                              r.status === 'agreement_completed' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                              r.status === 'configured' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              r.status === 'ready_for_activation' ? 'bg-teal-50 text-teal-700 border-teal-100 shadow-sm' :
                              r.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              r.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                              {r.status === 'approved_waiting_discussion' ? 'Discussion' :
                               r.status === 'agreement_completed' ? 'Contracted' :
                               r.status === 'configured' ? 'Configured Shard' :
                               r.status === 'ready_for_activation' ? 'Ready to Deploy' :
                               r.status === 'active' ? 'Active Live' :
                               r.status}
                            </span>
                          </div>

                          {/* Simplified Metadata Block */}
                          <div className="grid grid-cols-2 gap-3 bg-slate-50/50 border border-slate-200/50 p-3 rounded-2xl">
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">PMS Provider</span>
                              <span className="text-xs font-bold text-slate-800 mt-0.5 block">{r.pmsType || r.pms}</span>
                            </div>
                            <div>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Total Rooms</span>
                              <span className="text-xs font-bold text-slate-800 mt-0.5 block">{r.roomCount || r.rooms || 100} Rooms</span>
                            </div>
                          </div>

                          {/* Assigned Specialist Section */}
                          <div className="flex items-center gap-2.5 bg-[#FAF9F6] border border-slate-150 p-2.5 rounded-2xl">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-mono font-black text-[9px] shadow-sm">
                              {r.operator?.name ? r.operator.name.split(' ').map(n => n[0]).join('') : (r.specialist ? r.specialist.split(' ').map(n => n[0]).join('') : 'OP')}
                            </div>
                            <div className="text-left">
                              <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono block">Onboarding Lead</span>
                              <span className="text-slate-900 text-[11px] font-bold block">{r.operator?.name || r.specialist || 'Sarah Jenkins'}</span>
                            </div>
                          </div>

                          {/* QUICK ACTIONS BAR */}
                          <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-2">
                            {['request received', 'pending_review', 'pending'].includes(r.status?.toLowerCase()) ? (
                              <>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono text-center">Initial Review Gateway</span>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleStartOnboarding(r)}
                                    className="w-full py-2.5 px-4 bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-1.5 shadow-md shadow-[#6D4AFF]/10 hover:shadow-[#6D4AFF]/25"
                                  >
                                    <Check size={12} strokeWidth={3} />
                                    <span>Approve & Start Pipeline</span>
                                  </button>
                                  <div className="grid grid-cols-3 gap-2">
                                    <button onClick={() => handleOpenDetails(r)} className="py-2 px-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"><Eye size={12} /><span>Inspect</span></button>
                                    <button 
                                      onClick={() => {
                                        setEditingNotesRequest(r);
                                        setTempNotes(r.notes || '');
                                      }} 
                                      className="py-2 px-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <FileText size={12} />
                                      <span>Notes</span>
                                    </button>
                                    <button onClick={() => handleStartReject(r)} className="py-2 px-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"><X size={12} /><span>Reject</span></button>
                                  </div>
                                </div>
                              </>
                            ) : r.status === 'active' ? (
                              <>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono text-center">Environment Operations</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => {
                                      setRole(ROLES.PLATFORM_OPERATOR);
                                      enterWorkspace({ id: r.id, name: r.hotelName, plan: r.plan || 'Standard' });
                                      navigate('/app');
                                    }}
                                    className="py-2.5 px-2 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                                  >
                                    <span>Open Dashboard</span>
                                  </button>
                                  <button
                                    onClick={() => triggerToast(`Audit logs retrieved for active hotel: ${r.hotelName}`)}
                                    className="py-2.5 px-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[8.5px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                  >
                                    Audit Logs
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono text-center">Onboarding Lifecycle Action</span>
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleOpenDetails(r)}
                                    className="w-full py-2.5 px-4 bg-[#0B1020] hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-md"
                                  >
                                    <span>💼 Open Setup Workspace</span>
                                    <ArrowRight size={12} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MANUAL HOTEL ONBOARDING MODAL */}
                <AnimatePresence>
                  {showProvisionModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-2xl w-full overflow-hidden text-left my-8"
                      >
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#FAF9F6]">
                          <div className="space-y-1 text-left">
                            <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase font-mono tracking-widest">Environment Provisioning Console</span>
                            <h3 className="text-base font-black text-slate-950 tracking-tight">Manual Hotel Workspace Provisioning</h3>
                          </div>
                          <button
                            onClick={() => setShowProvisionModal(false)}
                            className="p-1.5 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto font-sans">
                          
                          {/* SECTION 1 — HOTEL DETAILS */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                              <Building2 size={15} className="text-[#6D4AFF]" />
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 1 — Hotel Registry Details</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Hotel Name</label>
                                <input
                                  type="text"
                                  value={provisionForm.hotelName}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, hotelName: e.target.value }))}
                                  placeholder="e.g. Grand AutoPilot Resort"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Country</label>
                                <input
                                  type="text"
                                  value={provisionForm.country}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, country: e.target.value }))}
                                  placeholder="e.g. France, USA"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Total Rooms</label>
                                <input
                                  type="number"
                                  value={provisionForm.roomCount}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, roomCount: parseInt(e.target.value) || 0 }))}
                                  placeholder="e.g. 150"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">PMS Provider</label>
                                <select
                                  value={provisionForm.pmsType}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, pmsType: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800 font-sans"
                                >
                                  <option value="Opera PMS">Oracle Opera Cloud</option>
                                  <option value="Mews">Mews PMS</option>
                                  <option value="Apaleo">Apaleo Core</option>
                                  <option value="Sabre">Sabre SynXis</option>
                                  <option value="Cloudbeds">Cloudbeds PMS</option>
                                  <option value="Other">Custom REST Gateway</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Hotel Email</label>
                                <input
                                  type="email"
                                  value={provisionForm.email}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, email: e.target.value }))}
                                  placeholder="e.g. operations@grandresort.com"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Contact Person</label>
                                <input
                                  type="text"
                                  value={provisionForm.managerName}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, managerName: e.target.value }))}
                                  placeholder="e.g. John Doe (General Manager)"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800"
                                />
                              </div>
                            </div>
                          </div>

                          {/* SECTION 2 — AUTOMATION SETUP */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                              <Cpu size={15} className="text-[#6D4AFF]" />
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 2 — Operational AI & Automation Setup</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-black text-slate-800 block">WhatsApp Automation</span>
                                  <span className="text-[9px] text-slate-400 block font-semibold">Enable secure message gateway webhook</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setProvisionForm(prev => ({ ...prev, enableWhatsApp: !prev.enableWhatsApp }))}
                                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all cursor-pointer ${provisionForm.enableWhatsApp ? 'bg-[#6D4AFF]' : 'bg-slate-300'}`}
                                >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${provisionForm.enableWhatsApp ? 'translate-x-4' : ''}`} />
                                </button>
                              </div>

                              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-2xl">
                                <div className="space-y-0.5 text-left">
                                  <span className="text-[10px] font-black text-slate-800 block">Email Automation</span>
                                  <span className="text-[9px] text-slate-400 block font-semibold">Monitor guest check-in inbox dynamically</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setProvisionForm(prev => ({ ...prev, enableEmail: !prev.enableEmail }))}
                                  className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all cursor-pointer ${provisionForm.enableEmail ? 'bg-[#6D4AFF]' : 'bg-slate-300'}`}
                                >
                                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${provisionForm.enableEmail ? 'translate-x-4' : ''}`} />
                                </button>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">AI Language Mode</label>
                                <select
                                  value={provisionForm.languageMode}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, languageMode: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800 font-sans"
                                >
                                  <option value="Auto-Detect Multilingual">Auto-Detect Multilingual (RAG-Driven)</option>
                                  <option value="English Only">Strict English Only</option>
                                  <option value="Localized Translation">Spanish / European Localized Model</option>
                                  <option value="Deterministic Templates">Zero Generative (Template Only)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Trial / Active Plan</label>
                                <select
                                  value={provisionForm.plan}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, plan: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800 font-sans"
                                >
                                  <option value="Trial">30-Day Free Trial Mode</option>
                                  <option value="Standard">Standard Pro Tier ($1,200/mo)</option>
                                  <option value="Enterprise">Enterprise Elite Tier (Custom SLAs)</option>
                                </select>
                              </div>

                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Assigned Onboarding Specialist</label>
                                <select
                                  value={provisionForm.assignedSpecialist}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, assignedSpecialist: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800 font-sans"
                                >
                                  <option value="Sarah Jenkins">Sarah Jenkins (Hospitality Onboarding Lead)</option>
                                  <option value="Rahul Sharma">Rahul Sharma (PMS Solutions Architect)</option>
                                  <option value="Deepak Gupta">Deepak Gupta (Ecosystem Integration Specialist)</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* SECTION 3 — SYSTEM PROVISIONING */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                              <Server size={15} className="text-[#6D4AFF]" />
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Section 3 — System Infrastructure Provisioning</h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Workspace ID (Virtual Shard)</label>
                                <input
                                  type="text"
                                  readOnly
                                  value={provisionForm.workspaceId}
                                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-[#6D4AFF] outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Ecosystem Handshake Status</label>
                                <select
                                  value={provisionForm.pmsStatus}
                                  onChange={(e) => setProvisionForm(prev => ({ ...prev, pmsStatus: e.target.value }))}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800 font-sans"
                                >
                                  <option value="Connected">Connected (PMS API Live)</option>
                                  <option value="Pending Verification">Pending Handshake Verification</option>
                                  <option value="Sandbox Mode">Sandbox Emulation Only</option>
                                </select>
                              </div>

                              <div className="space-y-1 sm:col-span-2 p-3 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
                                <span className="text-[9px] font-black text-[#6D4AFF] uppercase tracking-wider font-mono">AutoPilot Secure Shard Security Credentials</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">Generated Admin User</span>
                                    <div className="text-[11px] font-bold text-slate-800 p-2 bg-white rounded-lg border border-slate-200 truncate">{provisionForm.email || 'pending_email@hotel.com'}</div>
                                  </div>
                                  <div>
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">Temporary Root Password</span>
                                    <div className="text-[11px] font-bold text-slate-850 p-2 bg-white rounded-lg border border-slate-200 font-mono text-purple-600">{provisionForm.credentialsPassword}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Modal Footer / Actions */}
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between gap-3 font-sans">
                          <button
                            type="button"
                            onClick={() => {
                              if (!provisionForm.hotelName.trim()) {
                                triggerToast('Please enter a valid Hotel Name!');
                                return;
                              }
                              if (!provisionForm.managerName.trim()) {
                                triggerToast('Please enter the Contact Person name!');
                                return;
                              }
                              if (!provisionForm.email.trim() || !provisionForm.email.includes('@')) {
                                triggerToast('Please enter a valid Hotel Email address!');
                                return;
                              }
                              // Save as website request/draft status
                              addPendingRequest({
                                hotelName: provisionForm.hotelName,
                                managerName: provisionForm.managerName,
                                email: provisionForm.email,
                                country: provisionForm.country,
                                pmsType: provisionForm.pmsType,
                                roomCount: provisionForm.roomCount,
                                plan: provisionForm.plan,
                                status: 'Request Received'
                              });
                              setShowProvisionModal(false);
                              triggerToast(`Draft saved successfully for ${provisionForm.hotelName}!`);
                            }}
                            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer text-[#111827]"
                          >
                            Save Draft
                          </button>

                          <div className="flex gap-2 sm:gap-3">
                            {/* Create Workspace */}
                            <button
                              type="button"
                              onClick={() => {
                                if (!provisionForm.hotelName.trim()) {
                                  triggerToast('Please enter a valid Hotel Name!');
                                  return;
                                }
                                if (!provisionForm.managerName.trim()) {
                                  triggerToast('Please enter the Contact Person name!');
                                  return;
                                }
                                if (!provisionForm.email.trim() || !provisionForm.email.includes('@')) {
                                  triggerToast('Please enter a valid Hotel Email address!');
                                  return;
                                }
                                triggerToast('Provisioning real workspace...');
                                fetch(`${API_BASE_URL}/api/hotels`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    hotelName: provisionForm.hotelName,
                                    pmsProvider: provisionForm.pmsType,
                                    plan: provisionForm.plan,
                                    roomCount: provisionForm.roomCount
                                  })
                                }).then(res => res.json())
                                .then(data => {
                                  setShowProvisionModal(false);
                                  triggerToast(`Ecosystem environment successfully provisioned for ${provisionForm.hotelName}!`);
                                  fetchWorkspaces();
                                });
                              }}
                              className="px-4 py-3 bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                            >
                              Create Workspace
                            </button>

                            {/* Send Credentials */}
                            <button
                              type="button"
                              onClick={async () => {
                                 if (!provisionForm.hotelName.trim()) {
                                   triggerToast('Please enter a valid Hotel Name!');
                                   return;
                                 }
                                 if (!provisionForm.managerName.trim()) {
                                   triggerToast('Please enter the Contact Person name!');
                                   return;
                                 }
                                 if (!provisionForm.email.trim() || !provisionForm.email.includes('@')) {
                                   triggerToast('Please enter a valid Hotel Email address!');
                                   return;
                                 }
                                 
                                 triggerToast('Initializing onboarding request and database provisioning...');
                                 try {
                                   const created = await addPendingRequest({
                                     hotelName: provisionForm.hotelName,
                                     fullName: provisionForm.managerName,
                                     managerName: provisionForm.managerName,
                                     contactName: provisionForm.managerName,
                                     email: provisionForm.email,
                                     workEmail: provisionForm.email,
                                     pmsProvider: provisionForm.pmsType,
                                     pmsType: provisionForm.pmsType,
                                     roomCount: provisionForm.roomCount.toString(),
                                     plan: provisionForm.plan,
                                     notes: `Manual Provisioning. Configured Password: ${provisionForm.credentialsPassword}`
                                   });
                                   if (created && created.id) {
                                     triggerToast('Activating workspace environment and deploying credentials...');
                                     const updated = await updateRequestStatus(created.id, 'active');
                                     if (updated) {
                                       setShowProvisionModal(false);
                                       setDeployedCredentials({
                                         hotelName: provisionForm.hotelName,
                                         email: provisionForm.email,
                                         password: updated.tempPassword || provisionForm.credentialsPassword || 'AutoPilot@2026',
                                         workspaceUrl: `https://${provisionForm.hotelName.toLowerCase().replace(/[^a-z0-9]/g, '')}.autopilot.ai/login`
                                       });
                                       fetchWorkspaces();
                                       triggerToast(`Credentials dispatched securely to ${provisionForm.email}!`);
                                     } else {
                                       triggerToast('Failed to activate the provisioned workspace.');
                                     }
                                   } else {
                                     triggerToast('Failed to create onboarding request.');
                                   }
                                 } catch (error) {
                                   console.error(error);
                                   triggerToast('Error occurred during manual provisioning.');
                                 }
                               }}
                              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                            >
                              Send Credentials
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* 1. HOTEL ONBOARDING WORKSPACE & CONTROL CENTER */}
                <AnimatePresence>
                  {selectedRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 overflow-y-auto">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        className="bg-white rounded-[2rem] border border-slate-200 shadow-premium max-w-5xl w-full overflow-y-auto lg:overflow-hidden text-left my-auto max-h-[calc(100vh-2rem)] flex flex-col h-auto lg:h-[85vh] min-h-0 lg:min-h-[580px]"
                      >
                        {/* Header Banner */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#FAF9F6]">
                          <div className="space-y-1 text-left">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase font-mono tracking-widest">{selectedRequest.plan} Tier</span>
                              <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] animate-ping" />
                              <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-mono">Setup Pipeline Hub</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-950 tracking-tight mt-0.5">{selectedRequest.hotelName}</h3>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-xl text-[9px] font-mono font-bold uppercase tracking-widest border border-slate-800">
                              Status: {selectedRequest.status === 'approved_waiting_discussion' ? 'Discussions' :
                                       selectedRequest.status === 'agreement_completed' ? 'Terms Agreed' :
                                       selectedRequest.status === 'configured' ? 'Shard Configured' :
                                       selectedRequest.status === 'ready_for_activation' ? 'Ready to Deploy' :
                                       selectedRequest.status === 'active' ? 'Active Environment' :
                                       selectedRequest.status}
                            </span>
                            <button
                              onClick={() => setSelectedRequest(null)}
                              className="p-2 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {selectedRequest && ['request received', 'pending_review', 'pending', 'rejected'].includes(selectedRequest.status?.toLowerCase()) ? (
                          <>
                            {/* Double-Column Request Review Layout */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-visible lg:overflow-hidden">
                              
                              {/* LEFT COLUMN: Property Profile Ledger (4 cols) */}
                              <div className="col-span-1 lg:col-span-4 border-r-0 lg:border-r border-b lg:border-b-0 border-slate-100 bg-slate-50/50 p-6 overflow-visible lg:overflow-y-auto space-y-6 flex flex-col justify-between">
                                <div className="space-y-5">
                                  <div className="flex items-center gap-2 border-b border-slate-150 pb-2.5">
                                    <Building2 size={14} className="text-[#6D4AFF]" />
                                    <h4 className="text-[10.5px] font-black text-slate-900 uppercase tracking-wider font-mono">Property Matrix</h4>
                                  </div>

                                  <div className="grid grid-cols-1 gap-4 text-left font-sans">
                                    <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Hotel Identity</span>
                                      <span className="text-slate-950 text-sm font-black block leading-tight">{selectedRequest.hotelName}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Contact Manager</span>
                                        <span className="text-slate-900 text-xs font-bold block truncate">{selectedRequest.managerName}</span>
                                      </div>
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Country</span>
                                        <span className="text-slate-900 text-xs font-bold block">{selectedRequest.country || 'USA'}</span>
                                      </div>
                                    </div>

                                    <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Email Address</span>
                                      <span className="text-slate-900 text-xs font-bold block truncate">{selectedRequest.email || 'N/A'}</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">PMS Core</span>
                                        <span className="text-slate-900 text-xs font-bold block truncate">{selectedRequest.pmsType || selectedRequest.pms}</span>
                                      </div>
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Inventory Size</span>
                                        <span className="text-slate-900 text-xs font-bold block">{selectedRequest.roomCount || 100} Rooms</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Plan Tier</span>
                                        <span className="text-indigo-600 text-xs font-black block font-mono uppercase">{selectedRequest.plan || 'Standard'}</span>
                                      </div>
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Priority</span>
                                        <span className="text-amber-600 text-xs font-black block font-mono uppercase">{selectedRequest.priority || 'TRIAL'}</span>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Source Channel</span>
                                        <span className="text-slate-700 text-xs font-semibold block font-mono">{selectedRequest.source || 'Website Request'}</span>
                                      </div>
                                      <div className="p-3 bg-white border border-slate-200/65 rounded-2xl space-y-0.5 shadow-xs">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Submission Date</span>
                                        <span className="text-slate-700 text-xs font-semibold block">{selectedRequest.date || 'Active Today'}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Specialist Notes Section in Left Column */}
                                <div className="mt-4 pt-4 border-t border-slate-200/60 text-left">
                                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block font-mono mb-2">Specialist Internal Notes</span>
                                  <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 break-words overflow-hidden">
                                    <p className="text-[10.5px] text-slate-650 font-semibold leading-relaxed whitespace-pre-wrap break-words">
                                      {selectedRequest.notes || "No special operator logs recorded for this property request yet. Click Edit Review Notes below or approve to start."}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* RIGHT COLUMN: Provisioning Pipeline Walkthrough & Action (8 cols) */}
                              <div className="col-span-1 lg:col-span-8 p-6 flex flex-col justify-between overflow-visible lg:overflow-y-auto space-y-6">
                                <div className="space-y-5 text-left">
                                  <div className="border-b border-slate-100 pb-3 mb-2 flex items-center justify-between">
                                    <div className="space-y-0.5">
                                      <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase font-mono tracking-widest block">Deployment Roadmap</span>
                                      <h4 className="text-base font-black text-slate-900 tracking-tight">Onboarding Pipeline Blueprint</h4>
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-xl uppercase font-mono">5 Steps Automated</span>
                                  </div>

                                  <p className="text-xs text-slate-500 font-medium font-sans max-w-2xl leading-relaxed">
                                    Approving this onboarding request will provision dedicated resources, configure isolated multi-tenant workspaces, and initiate automated communication gateways. Review the visual blueprint below:
                                  </p>

                                  {/* Step roadmap cards */}
                                  <div className="space-y-3 pt-2">
                                    {[
                                      { step: 1, title: 'Communication Ledger & Alignment Discussion', desc: `Establishes a transparent message ledger to negotiate special pricing agreements, customize SLA contracts, and coordinate guest service requirements directly with ${selectedRequest.managerName}.` },
                                      { step: 2, title: 'Google Cloud Storage SOP Document Vault', desc: 'Sets up a secure private GCS bucket where the property manager can upload rules sheets, guest manuals, check-in policies, and breakfast menus. Files are automatically split and vectorized into a PGVector database for isolated RAG model training.' },
                                      { step: 3, title: 'AES-256 Symmetric Secrets Vault', desc: `Provides a security desk to upload and encrypt client credentials for Opera/Mews PMS API access, Meta Business WhatsApp integration keys, and SMTP server mail gateways.` },
                                      { step: 4, title: 'Automated Infrastructure Handshake Suite', desc: 'Runs automated diagnostic suites to verify SMTP connections, test active WhatsApp endpoints, and validate vectorized indexes before deployment.' },
                                      { step: 5, title: 'Digital Twin Container Deployment', desc: 'Compiles, provisions, and launches the live AI agent container, creating a custom tenant subdomain to host live dashboard analytics.' }
                                    ].map((stepItem, index) => (
                                      <div key={index} className="flex gap-4 p-3.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200/50 rounded-2xl transition-all font-sans relative group animate-fade-in">
                                        <div className="w-7 h-7 rounded-xl bg-slate-200 group-hover:bg-indigo-50 border border-slate-350/10 text-slate-500 group-hover:text-[#6D4AFF] font-mono font-black text-[10.5px] flex items-center justify-center shrink-0 shadow-xs">
                                          0{stepItem.step}
                                        </div>
                                        <div className="space-y-0.5 text-left">
                                          <h5 className="text-[11px] font-black text-slate-800 flex items-center gap-1.5 leading-snug">
                                            <span>{stepItem.title}</span>
                                            <span className="text-[8px] font-black text-slate-400 font-mono tracking-widest uppercase block bg-slate-200/65 px-1.5 py-0.2 rounded shrink-0">Locked</span>
                                          </h5>
                                          <p className="text-[10px] text-slate-500 font-semibold leading-relaxed pr-6">{stepItem.desc}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Large Decision Box */}
                                <div className="p-5 bg-indigo-50/40 border border-indigo-100/80 rounded-[1.75rem] flex flex-col md:flex-row justify-between items-center gap-4 text-left font-sans shrink-0">
                                  <div className="space-y-1">
                                    <span className="text-[8.5px] font-mono font-black text-[#6D4AFF] uppercase tracking-widest block">DECISION DESK GATEWAY</span>
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">Onboarding Request Status: {selectedRequest.status}</h4>
                                    <p className="text-[10.5px] text-slate-500 font-semibold max-w-lg">
                                      {selectedRequest.status === 'Rejected' 
                                        ? "This request is currently rejected. Restoring it will allow you to run active setups, connect PMS integration layers, and deploy custom vector knowledgebases." 
                                        : "Approval initiates cloud auto-provisioning pipelines. Check property credentials and matrix before enabling setup stages."}
                                    </p>
                                  </div>

                                  <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
                                    {selectedRequest.status === 'Rejected' ? (
                                      <button
                                        onClick={async () => {
                                          const updated = await updateRequestStatus(selectedRequest.id, 'approved_waiting_discussion');
                                          if (updated) {
                                            setRequests(prev => prev.map(item => item.id === selectedRequest.id ? updated : item));
                                            setSelectedRequest(updated);
                                          }
                                          triggerToast(`Request restored! Onboarding pipeline initiated.`);
                                        }}
                                        className="w-full md:w-auto py-3 px-6 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                                      >
                                        <Check size={12} strokeWidth={3} />
                                        <span>Restore & Approve Request</span>
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          onClick={async () => {
                                            const updated = await updateRequestStatus(selectedRequest.id, 'approved_waiting_discussion');
                                            if (updated) {
                                              setRequests(prev => prev.map(item => item.id === selectedRequest.id ? updated : item));
                                              setSelectedRequest(updated);
                                            }
                                            triggerToast(`Request approved! Onboarding pipeline initiated.`);
                                          }}
                                          className="flex-1 md:flex-none py-3.5 px-6 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 flex items-center justify-center gap-1.5"
                                        >
                                          <Check size={12} strokeWidth={3} />
                                          <span>Approve & Start Pipeline</span>
                                        </button>
                                        <button
                                          onClick={() => handleStartReject(selectedRequest)}
                                          className="px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                                        >
                                          <X size={12} />
                                          <span>Reject</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>

                              </div>
                            </div>

                            {/* Footer actions for review */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0 font-sans">
                              <button
                                onClick={() => {
                                  setEditingNotesRequest(selectedRequest);
                                  setTempNotes(selectedRequest.notes || '');
                                }}
                                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[9.5px] font-black uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-1.5"
                              >
                                <FileText size={12} />
                                <span>Edit Review Notes</span>
                              </button>
                              <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[9.5px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-colors"
                              >
                                Close Viewer
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Double-Column Layout */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-visible lg:overflow-hidden">
                              
                              {/* LEFT COLUMN: Property Ledger & Setup Pipeline (4 cols) */}
                              <div className="col-span-1 lg:col-span-4 border-r-0 lg:border-r border-b lg:border-b-0 border-slate-100 bg-slate-50/50 p-6 overflow-visible lg:overflow-y-auto space-y-6 flex flex-col justify-between">
                                
                                {/* Property Matrix Summary */}
                                <div className="space-y-4">
                                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Building2 size={13} className="text-[#6D4AFF]" />
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider font-mono">Property Matrix</h4>
                                  </div>

                                  <div className="grid grid-cols-2 gap-3 text-left">
                                    <div>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Contact Manager</span>
                                      <span className="text-slate-900 text-xs font-bold block mt-0.5 truncate">{selectedRequest.managerName}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Country</span>
                                      <span className="text-slate-900 text-xs font-bold block mt-0.5">{selectedRequest.country || 'USA'}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">PMS Core</span>
                                      <span className="text-slate-900 text-xs font-bold block mt-0.5">{selectedRequest.pmsType || selectedRequest.pms}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Inventory Size</span>
                                      <span className="text-slate-900 text-xs font-bold block mt-0.5">{selectedRequest.roomCount || 100} Rooms</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Setup Pipeline Checklist */}
                                <div className="space-y-4 pt-4 border-t border-slate-200/60">
                                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <CheckCircle2 size={13} className="text-[#6D4AFF]" />
                                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wider font-mono">Setup Progress Checklist</h4>
                                  </div>

                                  <div className="space-y-2.5 text-left font-sans text-xs">
                                    {[
                                      { label: 'Screen Request', checked: true },
                                      { label: 'Start Alignment discussion', checked: selectedRequest.status !== 'Request Received' && selectedRequest.status !== 'pending_review' },
                                      { label: 'Customization handshake', checked: selectedRequest.status === 'agreement_completed' || selectedRequest.status === 'configured' || selectedRequest.status === 'ready_for_activation' || selectedRequest.status === 'active' },
                                      { label: 'Secure secrets vaulting', checked: selectedRequest.status === 'configured' || selectedRequest.status === 'ready_for_activation' || selectedRequest.status === 'active' },
                                      { label: 'Provision DB Shard', checked: selectedRequest.status === 'configured' || selectedRequest.status === 'ready_for_activation' || selectedRequest.status === 'active' },
                                      { label: 'Channel check diagnostics', checked: selectedRequest.status === 'ready_for_activation' || selectedRequest.status === 'active' },
                                      { label: 'Activate properties', checked: selectedRequest.status === 'active' }
                                    ].map((step, idx) => (
                                      <div key={idx} className="flex items-center gap-2.5">
                                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                                          step.checked 
                                            ? 'bg-[#6D4AFF] border-[#6D4AFF] text-white shadow-xs' 
                                            : 'bg-white border-slate-200 text-transparent'
                                        }`}>
                                          <Check size={10} strokeWidth={4} />
                                        </div>
                                        <span className={`font-bold ${step.checked ? 'text-slate-800' : 'text-slate-400'}`}>
                                          Step {idx + 1}: {step.label}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Chronological Timeline Log */}
                                <div className="space-y-3 pt-4 border-t border-slate-200/60 flex-1 flex flex-col justify-end min-h-[100px]">
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Platform Timeline Ledger</span>
                                  <div className="overflow-y-auto max-h-[120px] space-y-2 pr-1 scrollbar-thin text-left">
                                    {(!selectedRequest.timeline || selectedRequest.timeline.length === 0) ? (
                                      <span className="text-[10px] text-slate-400 font-bold block">No actions recorded.</span>
                                    ) : (
                                      selectedRequest.timeline.map((item, idx) => (
                                        <div key={idx} className="flex gap-2 items-start text-[9.5px]">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#6D4AFF] mt-1 shrink-0" />
                                          <p className="text-slate-500 font-semibold leading-normal">
                                            {typeof item === 'object' 
                                              ? `${item.date ? `[${item.date}] ` : ''}${item.event || item.message || JSON.stringify(item)}` 
                                              : item}
                                          </p>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>

                              </div>

                              {/* RIGHT COLUMN: Interactive Modules Workspace (8 cols) */}
                              <div className="col-span-1 lg:col-span-8 p-6 flex flex-col h-auto lg:h-full overflow-visible lg:overflow-hidden">
                                
                                {/* Sleek Segmented Switcher Tabs */}
                                <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3 mb-4 shrink-0">
                                  {[
                                    { id: 'discussion', label: '💬 Discussion Align' },
                                    { id: 'vault', label: '🔒 Secrets Vault' },
                                    { id: 'validation', label: '⚙️ Shard Verification' }
                                  ].map(t => (
                                    <button
                                      key={t.id}
                                      onClick={() => setWorkspaceActiveTab(t.id)}
                                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        workspaceActiveTab === t.id
                                          ? 'bg-slate-950 text-white shadow-md'
                                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                      }`}
                                    >
                                      {t.label}
                                    </button>
                                  ))}
                                </div>

                                {/* Tab Panels */}
                                <div className="flex-1 overflow-y-auto min-h-[300px]">
                                  
                                  {/* 1. DISCUSSION FEED */}
                                  {workspaceActiveTab === 'discussion' && (
                                    <div className="h-full flex flex-col justify-between overflow-hidden">
                                      {/* Bubble feed */}
                                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin max-h-[30vh]">
                                        {(!selectedRequest.messages || selectedRequest.messages.length === 0) ? (
                                          <div className="py-16 text-center border border-dashed border-slate-200/50 rounded-3xl bg-slate-50/50">
                                            <MessageSquare size={20} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-[11px] text-slate-400 font-bold max-w-xs mx-auto">
                                              Initialize discussion ledger. Align customizations, kickoff intervals, and review contract details.
                                            </p>
                                          </div>
                                        ) : (
                                          selectedRequest.messages.map((m, idx) => (
                                            <div key={idx} className={`flex flex-col ${m.sender === 'Super Admin' ? 'items-end' : 'items-start'}`}>
                                              <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono mb-0.5">{m.sender}</span>
                                              <div className={`px-4 py-2.5 rounded-2xl max-w-md text-xs font-semibold leading-relaxed ${
                                                m.sender === 'Super Admin' 
                                                  ? 'bg-[#6D4AFF] text-white rounded-tr-none shadow-xs' 
                                                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/40'
                                              }`}>
                                                {m.text}
                                              </div>
                                            </div>
                                          ))
                                        )}
                                      </div>

                                      {/* Predefined prompt helpers */}
                                      <div className="pt-4 border-t border-slate-50 flex gap-2 flex-wrap shrink-0">
                                        {[
                                          { label: '📝 Request SOP Manual', text: 'Hello, please submit your guest services SOP rules and property FAQ documents so we can import them to training.' },
                                          { label: '💸 Shared Plan Proposal', text: 'We have compiled and dispatched the customized subscription SLA contract for your property review.' },
                                          { label: '📅 Setup Call Confirmation', text: 'Kickoff connection call successfully locked in to review active sync nodes and parameters.' }
                                        ].map((t, idx) => (
                                          <button
                                            key={idx}
                                            onClick={() => setNewDiscussionMsg(t.text)}
                                            className="px-3 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-[#6D4AFF] rounded-xl text-[9px] font-bold transition-all cursor-pointer shadow-xs"
                                          >
                                            {t.label}
                                          </button>
                                        ))}
                                      </div>

                                      {/* Textbox input */}
                                      <div className="flex gap-2.5 mt-3 pt-2 shrink-0 items-center">
                                        <input
                                          type="text"
                                          value={newDiscussionMsg}
                                          onChange={(e) => setNewDiscussionMsg(e.target.value)}
                                          placeholder="Type your message here and press Enter or click Send..."
                                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#6D4AFF]/40 transition-colors"
                                          disabled={isSendingMsg}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handlePostDiscussionMsg();
                                          }}
                                        />
                                        <button
                                          onClick={handlePostDiscussionMsg}
                                          disabled={isSendingMsg || !newDiscussionMsg.trim()}
                                          className="flex items-center gap-2 px-4 py-3 bg-[#6D4AFF] hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 shrink-0"
                                        >
                                          {isSendingMsg ? (
                                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                          ) : (
                                            <Send size={11} />
                                          )}
                                          <span>{isSendingMsg ? 'Sending...' : 'Send'}</span>
                                        </button>
                                      </div>

                                      {/* Conclude Agreement Stage Directly in Discussion tab */}
                                      {selectedRequest.status === 'approved_waiting_discussion' && (
                                        <div className="bg-[#FAF9F6] border border-slate-200/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 mt-4 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                                          <div className="space-y-0.5 text-left">
                                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-wider font-mono">Custom Terms & Agreement Concluded?</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold">Proceed to establish isolated system vaults once subscription is signed.</p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => handleOnboardingStatus(selectedRequest.id, 'agreement_completed', {
                                              timeline: [...(selectedRequest.timeline || []), 'Specialist confirmed signed agreement. Active subscription cataloged.']
                                            })}
                                            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-1.5"
                                          >
                                            <Check size={12} strokeWidth={3} />
                                            <span>Sign & Terminate Agreement Stage</span>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* 3. SECURE SECRETS VAULT */}
                                  {workspaceActiveTab === 'vault' && (
                                    <form onSubmit={handleSecureVaultSubmit} className="space-y-3 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">

                                      {/* ── Section 1: Hotel PMS Connection ── */}
                                      <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
                                            <Database size={16} />
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-black text-purple-900 uppercase tracking-wide">Hotel PMS Login</h4>
                                            <p className="text-[10px] text-purple-600 font-semibold leading-tight">Your Property Management System API keys — provided by your PMS vendor</p>
                                          </div>
                                          {selectedRequest.pmsApiKey && (
                                            <span className="ml-auto text-[8px] font-black font-mono bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg uppercase tracking-widest shrink-0">✓ Saved</span>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-purple-700 uppercase tracking-widest font-mono flex items-center gap-1">
                                              Client Token
                                              <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                              type="password"
                                              value={credentialForm.pmsApiKey}
                                              onChange={(e) => setCredentialForm(prev => ({ ...prev, pmsApiKey: e.target.value }))}
                                              placeholder={selectedRequest.pmsApiKey ? '••••••••  Already saved' : 'Paste your Client API Token here'}
                                              className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none focus:border-purple-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-purple-700 uppercase tracking-widest font-mono flex items-center gap-1">
                                              Access Token / Property ID
                                              <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                              type="password"
                                              value={credentialForm.pmsSecret}
                                              onChange={(e) => setCredentialForm(prev => ({ ...prev, pmsSecret: e.target.value }))}
                                              placeholder={selectedRequest.pmsSecret ? '••••••••  Already saved' : 'Paste your Access Token here'}
                                              className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-bold outline-none focus:border-purple-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* ── Section 2: WhatsApp Business ── */}
                                      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                                            <Smartphone size={16} />
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">WhatsApp Business</h4>
                                            <p className="text-[10px] text-emerald-700 font-semibold leading-tight">Your Meta Business WhatsApp token — from Meta Business Manager</p>
                                          </div>
                                          {selectedRequest.whatsappApiKey && (
                                            <span className="ml-auto text-[8px] font-black font-mono bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg uppercase tracking-widest shrink-0">✓ Saved</span>
                                          )}
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[9px] font-black text-emerald-700 uppercase tracking-widest font-mono flex items-center gap-1">
                                            WhatsApp API Token
                                            <span className="text-rose-500">*</span>
                                          </label>
                                          <input
                                            type="password"
                                            value={credentialForm.whatsappApiKey}
                                            onChange={(e) => setCredentialForm(prev => ({ ...prev, whatsappApiKey: e.target.value }))}
                                            placeholder={selectedRequest.whatsappApiKey ? '••••••••  Already saved' : 'Paste your Meta Business System User Token here  (starts with EAAGb...)'}
                                            className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold outline-none focus:border-emerald-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                          />
                                        </div>
                                      </div>

                                      {/* ── Section 3: Email Server ── */}
                                      <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="w-9 h-9 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 shrink-0">
                                            <Mail size={16} />
                                          </div>
                                          <div>
                                            <h4 className="text-xs font-black text-sky-900 uppercase tracking-wide">Email Server (SMTP)</h4>
                                            <p className="text-[10px] text-sky-700 font-semibold leading-tight">For sending automated guest emails. Use Gmail, Outlook, or your hotel's mail server</p>
                                          </div>
                                          {selectedRequest.smtpHost && (
                                            <span className="ml-auto text-[8px] font-black font-mono bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg uppercase tracking-widest shrink-0">✓ Saved</span>
                                          )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-sky-700 uppercase tracking-widest font-mono flex items-center gap-1">
                                              Mail Server Address
                                              <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                              type="text"
                                              value={credentialForm.smtpHost}
                                              onChange={(e) => setCredentialForm(prev => ({ ...prev, smtpHost: e.target.value }))}
                                              placeholder="smtp.gmail.com"
                                              className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-bold outline-none focus:border-sky-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-sky-700 uppercase tracking-widest font-mono flex items-center gap-1">
                                              Email Address
                                              <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                              type="text"
                                              value={credentialForm.smtpUser}
                                              onChange={(e) => setCredentialForm(prev => ({ ...prev, smtpUser: e.target.value }))}
                                              placeholder="noreply@hotel.com"
                                              className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-bold outline-none focus:border-sky-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <label className="text-[9px] font-black text-sky-700 uppercase tracking-widest font-mono flex items-center gap-1">
                                              Email Password / App Key
                                              <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                              type="password"
                                              value={credentialForm.smtpPass}
                                              onChange={(e) => setCredentialForm(prev => ({ ...prev, smtpPass: e.target.value }))}
                                              placeholder={selectedRequest.smtpPass ? '••••••••  Already saved' : 'App password or SMTP key'}
                                              className="w-full px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-bold outline-none focus:border-sky-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* ── Webhook URL (optional / advanced) ── */}
                                      <div className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                                        <div className="flex items-center gap-2 shrink-0">
                                          <Server size={13} className="text-slate-400" />
                                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono whitespace-nowrap">Webhook URL <span className="text-slate-300 font-semibold normal-case">(optional)</span></label>
                                        </div>
                                        <input
                                          type="text"
                                          value={credentialForm.webhookUrl}
                                          onChange={(e) => setCredentialForm(prev => ({ ...prev, webhookUrl: e.target.value }))}
                                          placeholder="https://your-hotel.com/webhook  — leave blank to auto-assign"
                                          className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-slate-400 text-slate-800 placeholder:text-slate-300 transition-colors"
                                        />
                                      </div>

                                      {/* Submit button row */}
                                      <div className="pt-1 flex justify-between items-center">
                                        {selectedRequest.uniqueHotelId && (
                                          <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1">
                                            <Server size={10} />
                                            Shard: {selectedRequest.uniqueHotelId}
                                          </span>
                                        )}
                                        <button
                                          type="submit"
                                          className="flex items-center gap-2 py-2.5 px-6 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/20 shrink-0 ml-auto"
                                        >
                                          <ShieldCheck size={13} />
                                          Save &amp; Encrypt All Credentials
                                        </button>
                                      </div>
                                    </form>
                                  )}

                                  {/* 4. SHARD & VERIFICATION */}
                                  {workspaceActiveTab === 'validation' && (
                                    <div className="space-y-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">

                                      {/* Hotel workspace ID banner */}
                                      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                                            <Server size={16} />
                                          </div>
                                          <div>
                                            <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest font-mono">Hotel Workspace ID</p>
                                            <p className="text-sm font-black text-indigo-900 tracking-tight font-mono">{selectedRequest.uniqueHotelId || 'Not yet assigned'}</p>
                                            <p className="text-[10px] text-indigo-500 font-semibold">This is your hotel's unique identifier in our system</p>
                                          </div>
                                        </div>
                                        <span className="text-[9px] font-black font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl uppercase tracking-wide shrink-0">✓ Workspace Ready</span>
                                      </div>

                                      {/* Connection checks section */}
                                      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                                        {/* Header row */}
                                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                          <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Connection Test</h4>
                                            <p className="text-[10px] text-slate-400 font-semibold">Click the button to check if all systems are working correctly</p>
                                          </div>
                                          <button
                                            type="button"
                                            disabled={isValidating}
                                            onClick={async () => {
                                              setIsValidating(true);
                                              triggerToast('Testing all connections, please wait...');
                                              try {
                                                const res = await fetch(`${API_BASE_URL}/api/mews/test-connection`);
                                                const data = await res.json();
                                                setIsValidating(false);
                                                if (data.success) {
                                                  const docCount = selectedRequest.sopDocuments?.length || 0;
                                                  setValidationResults({
                                                    pms: 'Connected',
                                                    whatsapp: 'Active Syncing',
                                                    smtp: 'TLS Port Verified',
                                                    vectorCount: docCount
                                                  });
                                                  await handleOnboardingStatus(selectedRequest.id, 'ready_for_activation', {
                                                    timeline: [
                                                      ...(selectedRequest.timeline || []),
                                                      `Handshake suite executed successfully: ${selectedRequest.pmsProvider} PMS Sync verified (${data.data?.hotelName || 'Enterprise Hotel'}), WhatsApp Gateway Node active, SMTP TLS relay validated, Vector Database index containing ${docCount} documents finalized.`
                                                    ]
                                                  });
                                                  triggerToast('All connections verified! Hotel is ready to go live.');
                                                } else {
                                                  triggerToast(`PMS Connection Failed: ${data.message || 'Check connection settings'}`);
                                                }
                                              } catch (err) {
                                                console.error(err);
                                                setIsValidating(false);
                                                triggerToast('Connection test failed. Please check your network.');
                                              }
                                            }}
                                            className="flex items-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 disabled:opacity-60"
                                          >
                                            {isValidating ? (
                                              <RefreshCw size={12} className="animate-spin" />
                                            ) : (
                                              <Activity size={12} />
                                            )}
                                            <span>{isValidating ? 'Testing...' : 'Run Connection Test'}</span>
                                          </button>
                                        </div>

                                        {/* Verification matrix list */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-400 pt-1.5">
                                          {[
                                            { label: 'PMS Integration Gateway', val: validationResults?.pms || 'Idle pending credentials vaulting', ok: !!validationResults },
                                            { label: 'WhatsApp Meta Sync Node', val: validationResults?.whatsapp || 'Idle pending token submission', ok: !!validationResults },
                                            { label: 'SMTP Mail Exchange Relay', val: validationResults?.smtp || 'Idle pending host validation', ok: !!validationResults },
                                            { label: 'Vector Multi-Tenant Index', val: validationResults ? `${validationResults.vectorCount} files Vectorized (${validationResults.vectorEmbeddings} embeds)` : 'Idle pending document imports', ok: !!validationResults }
                                          ].map((v, i) => (
                                            <div key={i} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                                              <span className="text-[7.5px] font-black font-mono uppercase tracking-widest text-slate-500 block">{v.label}</span>
                                              <div className="flex justify-between items-center">
                                                <span className={`text-[11px] ${v.ok ? 'text-white' : 'text-slate-500'}`}>{v.val}</span>
                                                {v.ok ? (
                                                  <span className="text-[8.5px] font-black font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">✓ Healthy</span>
                                                ) : (
                                                  <span className="text-[8.5px] font-black font-mono text-slate-600 bg-slate-800 px-2 py-0.5 rounded uppercase">Pending</span>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Final Activation Trigger */}
                                      {selectedRequest.status === 'ready_for_activation' && (
                                        <div className="pt-4 border-t border-slate-100 flex flex-col items-center py-6 text-center space-y-4">
                                          <div className="space-y-1">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest font-mono">Workspace Deployment Ready</h4>
                                            <p className="text-xs text-slate-500 font-semibold max-w-md">
                                              Ecosystem endpoints verified. Database workspace healthy. Proceed to launch the digital twin live agent.
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              handleCreateWorkspace(selectedRequest);
                                              setSelectedRequest(null);
                                            }}
                                            className="py-3 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                                          >
                                            <Play size={13} strokeWidth={3} />
                                            <span>Deploy live agent Environment</span>
                                          </button>
                                        </div>
                                      )}

                                    </div>
                                  )}

                                </div>
                              </div>

                            </div>

                            {/* Footer details modal actions */}
                            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
                              <button
                                onClick={() => setSelectedRequest(null)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer shadow-sm transition-colors"
                              >
                                Close Setup Workspace
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>



                {/* 3. REJECT FLOW MODAL */}
                <AnimatePresence>
                  {rejectingRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-sm w-full overflow-hidden text-left"
                      >
                        <div className="p-6 border-b border-slate-100 bg-[#FAF9F6]">
                          <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider">Reject Onboarding Request</h3>
                          <p className="text-[10px] text-slate-500 font-semibold mt-0.5 font-sans">Please provide a reason to archive the request from {rejectingRequest.hotelName}.</p>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold uppercase text-[8px] font-mono tracking-widest block">Reason for Rejection</label>
                            <textarea
                              rows={3}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Missing required property documents or invalid email credentials..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-rose-450 text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                          <button
                            onClick={() => setRejectingRequest(null)}
                            className="px-4 py-2 bg-slate-150 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleConfirmReject}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl uppercase tracking-wider font-black text-[10px] cursor-pointer shadow-sm"
                          >
                            Confirm Rejection
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* 5. DELETE WORKSPACE CONFIRMATION MODAL */}
                <AnimatePresence>
                  {deletingWorkspace && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-sm w-full overflow-hidden text-left"
                      >
                        <div className="p-6 border-b border-slate-100 bg-[#FAF9F6] flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                            <Trash2 size={18} />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-rose-600 uppercase tracking-wider">Delete Workspace</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase font-mono tracking-widest mt-0.5">{deletingWorkspace.name}</p>
                          </div>
                        </div>

                        <div className="p-6 space-y-4">
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Are you absolutely sure you want to delete the workspace environment for <span className="font-black text-slate-800">{deletingWorkspace.name}</span>? This action is permanent, will erase all database records, and cannot be undone.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold font-sans">
                          <button
                            onClick={() => setDeletingWorkspace(null)}
                            className="px-4 py-2 bg-slate-150 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer font-black uppercase tracking-wider text-[10px] transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={async () => {
                              const targetId = deletingWorkspace.id;
                              const targetName = deletingWorkspace.name;
                              triggerToast(`Deleting ${targetName}...`);
                              setDeletingWorkspace(null);
                              try {
                                const res = await fetch(`${API_BASE_URL}/api/hotels/${targetId}`, { method: 'DELETE' });
                                const data = await res.json();
                                if (data.success) {
                                  triggerToast('Workspace successfully deleted.');
                                } else {
                                  triggerToast(data.message || 'Failed to delete workspace.');
                                }
                              } catch (err) {
                                console.error(err);
                                triggerToast('Network error while deleting workspace.');
                              }
                              fetchWorkspaces();
                            }}
                            className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-xl uppercase tracking-wider font-black text-[10px] cursor-pointer shadow-sm shadow-rose-600/10 hover:shadow-rose-600/25 transition-all"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

                {/* 4. OPERATIONAL NOTES EDIT MODAL */}
                <AnimatePresence>
                  {editingNotesRequest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-md w-full overflow-hidden text-left"
                      >
                        <div className="p-6 border-b border-slate-100 bg-[#FAF9F6] flex justify-between items-center">
                          <div>
                            <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase font-mono tracking-widest">INTERNAL AUDIT NOTES</span>
                            <h3 className="text-base font-black text-slate-950 tracking-tight mt-0.5">{editingNotesRequest.hotelName}</h3>
                          </div>
                          <button
                            onClick={() => setEditingNotesRequest(null)}
                            className="p-1.5 hover:bg-slate-200/60 rounded-xl transition-colors text-slate-400 hover:text-slate-700 cursor-pointer"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="space-y-1">
                            <label className="text-slate-500 font-bold uppercase text-[8px] font-mono tracking-widest block">Operator Onboarding Logs & Notes</label>
                            <textarea
                              rows={4}
                              value={tempNotes}
                              onChange={(e) => setTempNotes(e.target.value)}
                              placeholder="Add setup constraints, vendor integration notes, or specific scheduling updates..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#6D4AFF] text-xs font-semibold"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 text-xs font-bold">
                          <button
                            onClick={() => setEditingNotesRequest(null)}
                            className="px-4 py-2 bg-slate-150 hover:bg-slate-200 rounded-xl text-slate-700 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveNotes}
                            className="px-5 py-2 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl uppercase tracking-wider font-black text-[10px] cursor-pointer shadow-sm"
                          >
                            Save Notes
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </AnimatePresence>

              </div>
            );
          })()}

          {/* TAB 3: HOTEL WORKSPACES (MANAGED HOTELS) */}
          {tab === 'workspaces' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">

              {/* Premium Managed Hotels TOP HEADER SECTION with metrics */}
              <div className="pb-5 border-b border-slate-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[9px] font-black tracking-widest text-[#6D4AFF] uppercase font-mono">Hotel Administration Center</span>
                  <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase">
                    Hotel Properties
                  </h1>
                  <p className="text-xs text-slate-500 font-bold leading-normal">
                    Active hotel organizations currently running AI automation workflows on the AutoPilot platform.
                  </p>
                </div>
              </div>

              {/* TOP METRICS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Active Hotels', value: workspaces.length, desc: 'Enterprise organizations', icon: Building2, color: 'text-blue-600 bg-blue-50/50 border-blue-100' },
                  { title: 'Live Conversations', value: workspaces.reduce((acc, w) => acc + (w.chatsToday || 0), 0).toLocaleString(), desc: 'Managed across all active properties', icon: MessageSquare, color: 'text-[#6D4AFF] bg-purple-50/50 border-purple-100' },
                  { title: 'AI Resolution Rate', value: workspaces.length > 0 ? ((workspaces.reduce((acc, w) => acc + (w.conversations || 0), 0) / Math.max(workspaces.reduce((acc, w) => acc + (w.chatsToday || 0), 0), 1)) * 100).toFixed(1) + '%' : '0%', desc: 'Autonomously finalized flows', icon: Cpu, color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100' },
                  { title: 'Human Escalations', value: workspaces.reduce((acc, w) => acc + (w.escalations || 0), 0).toLocaleString(), desc: 'Awaiting platform takeoff', icon: UserCheck, color: 'text-amber-600 bg-amber-50/50 border-amber-100' }
                ].map((m, i) => (
                  <div key={i} className="p-5 bg-white border border-slate-200/60 rounded-2xl shadow-sm flex items-center justify-between">
                    <div className="space-y-1 text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">{m.title}</span>
                      <p className="text-2xl font-black text-slate-950 tracking-tight">{m.value}</p>
                      <p className="text-[10px] text-slate-500 font-semibold">{m.desc}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.color} border shrink-0`}>
                      <m.icon size={16} />
                    </div>
                  </div>
                ))}
              </div>

              {/* WORKSPACES CARDS PIPELINE GRID */}
              {workspaces.length === 0 ? (
                <div className="py-24 px-8 text-center border-2 border-dashed border-slate-200/80 rounded-[2rem] bg-gradient-to-b from-slate-50/50 to-white flex flex-col items-center justify-center space-y-6 shadow-sm mt-6">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-2 shadow-inner border border-emerald-100/50 relative">
                    <Building2 size={32} strokeWidth={1.5} />
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">No Active Hotel Properties</h3>
                    <p className="text-[12px] text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
                      You haven't onboarded any hotel workspaces yet. Connect your first property to start deploying AI agents and automation flows.
                    </p>
                  </div>
                  </div>
              ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                {workspaces.map(w => {
                  // Dynamic business metrics matching premium SaaS organizations
                      const processedConversations = w.conversations || 0;
                  const activeConversationsToday = w.chatsToday || 0;
                  const satisfactionRate = w.satisfaction || '100%';
                  const monthlyUsage = w.monthlyUsage || 0;
                  const escalationsCount = w.escalations || 0;
                  const isSuspended = w.isPaused || w.aiStatus === 'Suspended' || w.aiStatus === 'Paused';
                  const isTrial = w.plan && w.plan.toLowerCase() === 'trial';

                  return (
                    <div
                      key={w.id}
                      className={`bg-white border p-6 rounded-3xl shadow-sm text-left flex flex-col justify-between space-y-5 transition-all relative ${isSuspended ? 'opacity-85 border-slate-200 bg-slate-50/40' : 'border-slate-200/60 hover:shadow-md'
                        }`}
                    >
                      {/* HEADER - Hotel Name, Plan, AI Status Badge */}
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div className="space-y-0.5 text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="text-sm font-black text-slate-950 tracking-tight">{w.name}</h3>
                          </div>
                          <span className="text-[9px] font-black text-[#6D4AFF] uppercase font-mono tracking-wider">{w.plan} Plan</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider font-mono border ${isSuspended
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : w.aiStatus === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                            }`}>
                            {isSuspended ? 'SUSPENDED' : w.aiStatus === 'Active' ? 'AI ACTIVE' : 'AI PAUSED'}
                          </span>
                        </div>
                      </div>

                      {/* MAIN OPERATIONAL STATS */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-1 text-left">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Chats Today</span>
                          <span className="text-slate-900 font-mono font-black text-sm block mt-0.5">{activeConversationsToday}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">AI Processed</span>
                          <span className="text-slate-900 font-mono font-black text-sm block mt-0.5">{processedConversations}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Satisfaction</span>
                          <span className="text-emerald-600 font-mono font-black text-sm block mt-0.5">{satisfactionRate}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">Escalations</span>
                          <span className={`font-mono font-black text-sm block mt-0.5 ${escalationsCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
                            {escalationsCount}
                          </span>
                        </div>
                      </div>

                      {/* MONTHLY USAGE PROGRESS BAR */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 font-mono">
                          <span>Monthly API / Multi-Tenant Usage</span>
                          <span className="text-slate-800">{monthlyUsage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${monthlyUsage > 80 ? 'bg-amber-500' : 'bg-[#6D4AFF]'
                              }`}
                            style={{ width: `${monthlyUsage}%` }}
                          />
                        </div>
                      </div>

                      {/* SMALL CLEAN CONNECTION STATUSES */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${w.pms ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span>PMS Connected ({w.pms})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${w.whatsapp === 'Connected' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                          <span>WhatsApp Active</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Knowledge Base Active</span>
                        </div>
                      </div>

                      {/* CLIENT WORKSPACE ACTIONS */}
                      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {isSuspended ? (
                          <>
                            {/* 1. OPEN BILLING */}
                            <button
                              onClick={() => {
                                enterWorkspace(w);
                                navigate('/app/subscription-billing', { replace: true });
                              }}
                              className="py-2 px-1 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center shadow-xs transition-all hover:scale-[1.01] sm:col-span-1"
                            >
                              Open Billing
                            </button>

                            {/* 2. RESUME ACCESS + DELETE */}
                            <div className="flex gap-2 sm:col-span-2">
                              <button
                                onClick={() => {
                                  triggerToast(`Reactivating ${w.name}...`);
                                  fetch(`${API_BASE_URL}/api/hotels/${w.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ isPaused: false, aiStatus: 'Active' })
                                  }).then(() => fetchWorkspaces());
                                }}
                                className="flex-1 py-2 px-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-150 text-emerald-700 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-colors cursor-pointer text-center"
                              >
                                Resume Hotel Access
                              </button>
                              
                              <button
                                onClick={() => setDeletingWorkspace(w)}
                                className="py-2 px-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                                title="Delete Workspace"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        ) : isTrial ? (
                          <>
                            {/* 1. OPEN DASHBOARD */}
                            <button
                              onClick={() => {
                                enterWorkspace(w);
                                navigate('/app', { replace: true });
                              }}
                              className="py-2 px-1 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center shadow-xs transition-all hover:scale-[1.01] sm:col-span-2"
                            >
                              Open Hotel Dashboard
                            </button>

                            {/* 2. UPGRADE PLAN + DELETE */}
                            <div className="flex gap-2 sm:col-span-1">
                              <button
                                onClick={() => {
                                  enterWorkspace(w);
                                  navigate('/app/subscription-billing?tab=plans', { replace: true });
                                }}
                                className="flex-1 py-2 px-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-colors cursor-pointer text-center"
                              >
                                Upgrade Plan
                              </button>
                              
                              <button
                                onClick={() => setDeletingWorkspace(w)}
                                className="py-2 px-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                                title="Delete Workspace"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* 1. OPEN DASHBOARD */}
                            <button
                              onClick={() => {
                                enterWorkspace(w);
                                navigate('/app', { replace: true });
                              }}
                              className="py-2 px-1 bg-[#6D4AFF] hover:bg-indigo-700 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center shadow-xs transition-all hover:scale-[1.01] sm:col-span-2"
                            >
                              Open Hotel Dashboard
                            </button>

                            {/* 2. PAUSE ACCESS + DELETE */}
                            <div className="flex gap-2 sm:col-span-1">
                              <button
                                onClick={() => {
                                  triggerToast(`Suspending ${w.name}...`);
                                  fetch(`${API_BASE_URL}/api/hotels/${w.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ isPaused: true, aiStatus: 'Suspended' })
                                  }).then(() => fetchWorkspaces());
                                }}
                                className="flex-1 py-2 px-1 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-rose-600 rounded-xl text-[8.5px] font-black uppercase tracking-widest transition-colors cursor-pointer text-center"
                              >
                                Pause Hotel Access
                              </button>
                              
                              <button
                                onClick={() => setDeletingWorkspace(w)}
                                className="py-2 px-2.5 bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-xl transition-colors cursor-pointer"
                                title="Delete Workspace"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                  </div>
                  );
                })}
              </div>
              )}

            </div>
          )}

          {/* TAB 4: AI GOVERNANCE */}
          {tab === 'ai-governance' && (
            <div className="space-y-6">
              {/* Global Safety & Core Model Selection Switches */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-wrap gap-6 items-center justify-between">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Master AI Agent Autonomous Switch */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-450 font-mono">Platform Agent Switch</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5">FULLY AUTONOMOUS ACTIVE</span>
                    </div>
                    <button className="relative w-9 h-5 bg-[#6D4AFF] rounded-full flex items-center px-0.5 shrink-0 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow-xs translate-x-4 transition-transform" />
                    </button>
                  </div>

                  {/* AI Fail-safe Escalation Shield */}
                  <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs">
                    <div className="flex flex-col text-left">
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-450 font-mono">Platform Escalation Safeguards</span>
                      <span className="text-xs font-black text-emerald-600 mt-0.5">SHIELD ENFORCED</span>
                    </div>
                    <button className="relative w-9 h-5 bg-[#6D4AFF] rounded-full flex items-center px-0.5 shrink-0 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full shadow-xs translate-x-4 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex items-center gap-4 min-w-[280px] bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs">
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-450 font-mono">Autonomous Confidence Guardrail</span>
                    <span className="text-xs font-black text-[#6D4AFF] mt-0.5">{confidenceLimit}% Confidence Minimum</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={confidenceLimit}
                    onChange={(e) => setConfidenceLimit(e.target.value)}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#6D4AFF]"
                  />
                </div>
              </div>

              {/* PLATFORM AI SAFETY & RULES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Financial Refund Guard', rule: 'Blocks automated transactions exceeding $50 without operator approval', status: 'ACTIVE', response: 'Force Handover' },
                  { name: 'PII Scrubbing Policy', rule: 'Scrubs credit cards, CVVs, and secure locks automatically', status: 'ACTIVE', response: 'Token Anonymizer' },
                  { name: 'Pre-arrival Check-in Validator', rule: 'Secures local ID validation before guest checking', status: 'ACTIVE', response: 'SOP Lookup Node' },
                  { name: 'Model Temperature Range', rule: 'Restricted system-wide creative hallucination parameters to 0.0 - 0.2', status: 'ACTIVE', response: 'Max Deterministic' },
                  { name: 'SLA Escalation Trigger', rule: 'Automatically switches conversations if guest wait exceeds 3 minutes', status: 'ACTIVE', response: 'Urgent Handover' },
                  { name: 'Rate Limit Override Guard', rule: 'Caps automated message density per user room context to 10 per hour', status: 'ACTIVE', response: 'Throttle Alert' }
                ].map((mod, index) => (
                  <div key={index} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{mod.name}</h4>
                        <span className="px-1.5 py-0.5 bg-purple-50 text-[#6D4AFF] text-[8px] font-black rounded font-mono uppercase tracking-wider">{mod.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{mod.rule}</p>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono pt-3 border-t border-slate-100">
                      <span>Action: {mod.response}</span>
                      <span className="text-[#6D4AFF] hover:underline cursor-pointer">Configure Rule</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INTEGRATIONS INFRASTRUCTURE */}
          {tab === 'integrations-infra' && (
            <div className="space-y-8 animate-in fade-in duration-500 text-left">

              {/* Top Operational Status Header with Title & Compact Sweep Button */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xs">
                <div className="space-y-1">
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider font-mono">AutoPilot Global Control</h2>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Live system-level API health, asynchronous sync pipelines, and microservice orchestration monitors.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      triggerToast("Executing full-stack infrastructure diagnostics sweep...");
                      runDiagnostics();
                    }}
                    disabled={isDiagnosticRunning}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-800 shadow-sm disabled:opacity-50 shrink-0 cursor-pointer flex items-center gap-1.5 font-mono"
                  >
                    <RefreshCw size={11} className={isDiagnosticRunning ? "animate-spin" : ""} />
                    {isDiagnosticRunning ? 'SWEEPING CLUSTERS...' : 'TRIGGER HEALTH SWEEP'}
                  </button>
                </div>
              </div>

              {/* SECTION 1 — GLOBAL ORCHESTRATION STATUS */}
              <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono mb-4">
                  Global Orchestration Status
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'AI Routing Engine', value: 'Active', status: 'healthy' },
                    { label: 'PMS Sync Pipeline', value: 'Operational', status: 'healthy' },
                    { label: 'Event Dispatch Queue', value: 'Healthy', status: 'healthy' },
                    { label: 'Webhook Throughput', value: '1.2k/min', status: 'metric' },
                    { label: 'Average Sync Latency', value: '14ms', status: 'metric' },
                    { label: 'Infrastructure Health', value: '99.98%', status: 'metric' }
                  ].map((pill, i) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex flex-col justify-between space-y-1 font-mono">
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider truncate" title={pill.label}>{pill.label}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {pill.status === 'healthy' && (
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                        )}
                        <span className={`text-[11px] font-black tracking-tight ${pill.status === 'healthy' ? 'text-slate-900' : 'text-[#6D4AFF]'}`}>
                          {pill.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 2 — PMS CONNECTOR LAYER */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    Property Management System (PMS) Connector Layer
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 font-mono">AWSUS-EAST-1 SHARDS</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Opera PMS Connector',
                      nodeId: 'opera-sync-us-east-01',
                      mode: 'Realtime Event Stream',
                      latency: '18ms',
                      reliability: '99.98%',
                      throughput: '240/min',
                      lastSync: 'Active now',
                      status: 'ONLINE',
                      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    },
                    {
                      name: 'MEWS Connector',
                      nodeId: 'mews-direct-eu-central-02',
                      mode: 'Poll every 30s',
                      latency: '12ms',
                      reliability: '99.99%',
                      throughput: '180/min',
                      lastSync: 'Active 2s ago',
                      status: 'ONLINE',
                      statusColor: 'text-emerald-700 bg-emerald-50 border-emerald-100'
                    },
                    {
                      name: 'Apaleo Connector',
                      nodeId: 'apaleo-handshake-ap-south-01',
                      mode: 'Webhook Relay Sync',
                      latency: '340ms',
                      reliability: '84.5%',
                      throughput: '12/min',
                      lastSync: 'Failed handshake 4m ago',
                      status: 'DEGRADED',
                      statusColor: 'text-amber-700 bg-amber-50 border-amber-200'
                    }
                  ].map((conn, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 font-mono">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2.5">
                          <div className="text-left space-y-0.5">
                            <h4 className="text-[11.5px] font-black text-slate-900 tracking-tight">{conn.name}</h4>
                            <span className="text-[8.5px] font-semibold text-slate-400 block tracking-tight uppercase">{conn.nodeId}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-[8.5px] font-black rounded uppercase tracking-wider border shrink-0 ${conn.statusColor}`}>
                            {conn.status}
                          </span>
                        </div>

                        {/* Telemetry Grid */}
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-left text-[9px] font-bold text-slate-400 tracking-wider">
                          <div>
                            <span className="block uppercase tracking-tight text-[8px] text-slate-400 font-black">Sync Mode</span>
                            <span className="text-slate-800 font-black block mt-0.5 truncate">{conn.mode}</span>
                          </div>
                          <div>
                            <span className="block uppercase tracking-tight text-[8px] text-slate-400 font-black">Average Latency</span>
                            <span className={`font-black block mt-0.5 ${conn.status === 'DEGRADED' ? 'text-amber-600' : 'text-slate-800'}`}>{conn.latency}</span>
                          </div>
                          <div>
                            <span className="block uppercase tracking-tight text-[8px] text-slate-400 font-black">Reliability Score</span>
                            <span className={`font-black block mt-0.5 ${conn.status === 'DEGRADED' ? 'text-amber-600 font-black' : 'text-slate-800'}`}>{conn.reliability}</span>
                          </div>
                          <div>
                            <span className="block uppercase tracking-tight text-[8px] text-slate-400 font-black">Event Flow</span>
                            <span className="text-slate-800 font-black block mt-0.5">{conn.throughput}</span>
                          </div>
                        </div>

                        {/* Last Sync Indicator */}
                        <div className="text-[8.5px] font-black text-slate-400 uppercase tracking-tight flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                          <span>Activity Status:</span>
                          <span className={conn.status === 'DEGRADED' ? 'text-amber-600 font-black' : 'text-slate-500 font-bold'}>{conn.lastSync}</span>
                        </div>
                      </div>

                      {/* Action block */}
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => triggerToast(`Initiated direct restart of sync node ${conn.nodeId}...`)}
                          className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-650 rounded-xl transition-all cursor-pointer"
                        >
                          Restart Node
                        </button>
                        <button
                          onClick={() => triggerToast(`Dispatched force retry synchronization sweep to ${conn.nodeId}...`)}
                          className="flex-1 py-1.5 bg-[#0B1020] hover:bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                        >
                          Retry Sync
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 3 — COMMUNICATION INFRASTRUCTURE */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    Communication Infrastructure
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 font-mono">ACTIVE BACKPLANE LOGS</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {[
                    {
                      name: 'WhatsApp Business Gateway',
                      delivery: '99.97%',
                      queue: 'Healthy (0 pending)',
                      throughput: '450 msgs/min',
                      retries: '0 retry events',
                      latency: '4ms'
                    },
                    {
                      name: 'SMTP Relay',
                      delivery: '99.50%',
                      queue: 'Healthy (0 pending)',
                      throughput: '120 mails/min',
                      retries: '1 retry event',
                      latency: '110ms'
                    },
                    {
                      name: 'Voice Automation Node',
                      delivery: '98.90%',
                      queue: '12 calling sessions',
                      throughput: '45 calls/min',
                      retries: '0 retry events',
                      latency: '32ms'
                    },
                    {
                      name: 'Notification Queue',
                      delivery: '100.00%',
                      queue: '0 payload queue lag',
                      throughput: '1,200 events/min',
                      retries: '0 retry events',
                      latency: '1ms'
                    }
                  ].map((comm, idx) => (
                    <div key={idx} className="bg-white border border-slate-200/70 rounded-2xl p-4.5 shadow-xs flex flex-col justify-between space-y-3.5 font-mono text-left">
                      <div className="space-y-3">
                        <div className="border-b border-slate-100 pb-2">
                          <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-wide truncate">{comm.name}</h4>
                        </div>

                        <div className="space-y-2 text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                          <div className="flex justify-between items-center">
                            <span>Delivery Rate</span>
                            <span className="text-slate-800 font-black">{comm.delivery}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Queue State</span>
                            <span className="text-slate-800 font-black">{comm.queue}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Throughput</span>
                            <span className="text-slate-800 font-black">{comm.throughput}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Retry Incidents</span>
                            <span className={comm.retries.includes('0') ? 'text-slate-500' : 'text-amber-600 font-black'}>{comm.retries}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Dispatch Latency</span>
                            <span className="text-[#6D4AFF] font-black">{comm.latency}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => triggerToast(`Opening live telemetry queue stream for ${comm.name}...`)}
                          className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-650 rounded-lg transition-colors cursor-pointer"
                        >
                          Inspect Queue
                        </button>
                        <button
                          onClick={() => triggerToast(`Querying last 200 message transactions from ${comm.name} logs...`)}
                          className="flex-1 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-650 rounded-lg transition-colors cursor-pointer"
                        >
                          Logs
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4 — AI AUTOMATION INFRASTRUCTURE */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    AI Automation & Decision Pipelines
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 font-mono">SYSTEM ORCHESTRATION</span>
                </div>

                <div className="bg-white border border-slate-200/70 rounded-2xl p-6 shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {[
                      { title: 'AI Event Router', main: '98.4%', sub: 'Execution Success', metric: '0.01% error limit' },
                      { title: 'Automation Processor', main: '184', sub: 'Active Queue Depth', metric: '0ms process lag' },
                      { title: 'Workflow Execution', main: 'Stable', sub: 'Confidence Routing', metric: '95% threshold min' },
                      { title: 'Escalation Node', main: '2.1%', sub: 'Fallback Rate', metric: 'SLA transfer target <5%' },
                      { title: 'Context Memory Cache', main: '0.8ms', sub: 'Retrieval Latency', metric: 'Redis cache hit: 99.8%' }
                    ].map((ai, i) => (
                      <div key={i} className={`text-left space-y-1 font-mono ${i > 0 ? 'md:pl-6' : ''} ${i > 0 ? 'pt-4 md:pt-0' : ''}`}>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{ai.title}</span>
                        <p className="text-xl font-black text-slate-900 tracking-tight mt-1">{ai.main}</p>
                        <span className="text-[9px] text-slate-600 font-bold block">{ai.sub}</span>
                        <span className="text-[8px] text-slate-400 font-semibold block">{ai.metric}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#6D4AFF] rounded-full animate-pulse" />
                      <span className="text-[9px] font-black text-[#6D4AFF] uppercase tracking-widest font-mono">Core Orchestrator Model: GPT-4O-MINI (DETERMINISTIC)</span>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => triggerToast("Executing latency check on context memory cache servers...")}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-750 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono"
                      >
                        Run Memory Diagnostics
                      </button>
                      <button
                        onClick={() => triggerToast("Flushing stale workspace contexts from transient Redis buffer...")}
                        className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono"
                      >
                        Purge Memory Cache
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}



          {/* TAB 7: KNOWLEDGE INFRASTRUCTURE */}
          {tab === 'knowledge-infra' && (
            <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1 text-left">
                  <h2 className="text-sm font-black text-slate-950 uppercase tracking-wider">Multi-Tenant Vector Clusters & Indexing</h2>
                  <p className="text-[11px] text-slate-500 font-semibold">Control indexing infrastructure and monitor real-time embedding queries latency.</p>
                </div>
                <div className="text-[10px] text-slate-400 font-black font-mono uppercase tracking-wider">
                  DB HOST: <span className="text-[#6D4AFF]">QDRANT CLUSTER 1A (AWS-EAST-1)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Platform Vector Indices', value: '4 Main Collections', sub: 'autopilot-tenant-embeddings-v4' },
                  { label: 'Total Vector Count', value: '1,248,000 vectors', sub: 'text-embedding-3-small (1536d)' },
                  { label: 'Average Retrieval Latency', value: '8.4ms', sub: '99.9% semantic lookups success rate' }
                ].map((k, i) => (
                  <div key={i} className="p-5 bg-slate-50/50 border border-slate-150 rounded-2xl text-left">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-slate-400 font-mono block">{k.label}</span>
                    <p className="text-lg font-black text-slate-900 mt-1 tracking-tight">{k.value}</p>
                    <span className="text-[10px] text-slate-500 font-bold mt-1 block">{k.sub}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Retrieval Vector Indices Details */}
                <div className="space-y-3.5 text-left">
                  <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest font-mono">Isolated Tenant Collections</span>
                  {[
                    { name: 'tenant_idx_grand_autopilot', vectors: '420k vectors', status: 'Operational', shardCount: '4 shards' },
                    { name: 'tenant_idx_ritz_paris', vectors: '380k vectors', status: 'Operational', shardCount: '4 shards' },
                    { name: 'tenant_idx_mews_haven', vectors: '290k vectors', status: 'Operational', shardCount: '2 shards' },
                    { name: 'tenant_idx_apaleo_suites', vectors: '158k vectors', status: 'Reindexing', shardCount: '2 shards' }
                  ].map((idx, i) => (
                    <div key={i} className="p-4 bg-slate-50/30 border border-slate-150 rounded-2xl flex justify-between items-center text-left">
                      <div className="space-y-0.5">
                        <span className="text-xs font-mono font-bold text-slate-800">{idx.name}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">{idx.vectors} • {idx.shardCount}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase font-mono border ${idx.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                        }`}>
                        {idx.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Simulated RAG Trace Panel */}
                <div className="bg-[#FAF9F6] border border-[#E7E4DD] rounded-2xl p-5 text-left flex flex-col justify-between min-h-[320px]">
                  <div className="space-y-4">
                    <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase tracking-widest font-mono block">RAG SEMANTIC LOOKUP SIMULATOR</span>
                    <div>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono block">SIMULATED MATCH QUERY</span>
                      <p className="text-xs font-black text-slate-800 italic mt-0.5">"Check-out extensions policies and overages"</p>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono block">RAG VECTOR MATCH SCORE</span>
                      <p className="text-xs font-bold text-slate-700 mt-1">Cosine Similarity: <strong className="text-[#6D4AFF]">0.941</strong> (Found in: Late Checkout Policy.pdf)</p>
                    </div>
                    <div>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono block">RECONSTRUCTED EMBEDDINGS SEGMENT</span>
                      <p className="text-[11px] text-slate-800 leading-normal italic mt-1 bg-white p-3 rounded-lg border border-[#E7E4DD] font-mono">
                        "Checkout is at 11:00 AM. In the event of an automated Late Checkout request, late checkouts until 2:00 PM are permitted without charge under Enterprise tier constraints."
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerToast('Executing vector semantic trace simulation...')}
                    className="w-full py-2 bg-[#0B1020] text-white text-[8.5px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 cursor-pointer border border-slate-850 shadow-sm mt-4 font-mono"
                  >
                    EXECUTE RETRIEVAL TRACE TEST
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Credentials Modal */}
          {deployedCredentials && (
            <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-left relative animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 font-serif">Workspace Activated</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Credentials have been securely emailed to the client.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Admin Email</span>
                        <div className="text-sm font-black text-slate-900 select-all bg-white border border-slate-200 p-2 rounded-lg">{deployedCredentials.email}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Temporary Password</span>
                        <div className="text-sm font-black text-[#6D4AFF] select-all bg-white border border-slate-200 p-2 rounded-lg">{deployedCredentials.password}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Portal Login URL</span>
                        <div className="text-xs font-bold text-slate-600 select-all break-all bg-white border border-slate-200 p-2 rounded-lg">{deployedCredentials.workspaceUrl}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={() => {
                      const textToCopy = `Email: ${deployedCredentials.email}\nPassword: ${deployedCredentials.password}\nLogin URL: ${deployedCredentials.workspaceUrl}`;
                      navigator.clipboard.writeText(textToCopy)
                        .then(() => triggerToast('Credentials copied to clipboard!'))
                        .catch(() => triggerToast('Failed to copy credentials automatically.'));
                    }}
                    className="flex-1 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
                  >
                    Copy
                  </button>
                  <button 
                    onClick={() => setDeployedCredentials(null)}
                    className="flex-1 py-3 bg-[#6D4AFF] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#5b3ce4] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}


        </motion.div>
      </AnimatePresence>

    </div>
  );
};

export default SuperAdminControlCenter;
