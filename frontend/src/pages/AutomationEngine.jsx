import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';
import { 
  Cpu,
  Settings2, 
  Lock,
  Database,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  ShieldAlert,
  Save,
  ChevronDown,
  MessageSquare,
  Mail,
  Key,
  Clock,
  Calendar,
  Sparkles,
  Zap,
  ConciergeBell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AUTO_APPROVE_OPTIONS = [
  "Default active guidelines",
  "Confidence >= 90%",
  "Confidence >= 85%",
  "Confidence >= 80%"
];

const OCCUPANCY_OPTIONS = [
  "95%",
  "90%",
  "85%",
  "80%",
  "No Limit"
];

const LOYALTY_OPTIONS = [
  "All registered guest list",
  "VIP & Elite Members Only",
  "Platinum & Gold Tiers Only",
  "Platinum Tiers Only"
];

const getWorkflowIcon = (name = '', channel = '') => {
  const n = name.toLowerCase();
  if (n.includes('check-in') || n.includes('check in')) return Key;
  if (n.includes('checkout') || n.includes('check out')) return Clock;
  if (n.includes('room') || n.includes('service') || n.includes('bell')) return ConciergeBell;
  if (n.includes('booking') || n.includes('reservation')) return Calendar;
  if (n.includes('vip') || n.includes('loyalty') || n.includes('gold') || n.includes('platinum')) return Sparkles;
  if (channel.toLowerCase() === 'whatsapp') return MessageSquare;
  if (channel.toLowerCase() === 'email') return Mail;
  return Cpu;
};

const getWorkflowColor = (name = '', channel = '') => {
  const n = name.toLowerCase();
  if (channel.toLowerCase() === 'whatsapp') return 'text-emerald-600 bg-emerald-50/60 border border-emerald-100/50';
  if (channel.toLowerCase() === 'email') return 'text-blue-600 bg-blue-50/60 border border-blue-100/50';
  if (n.includes('vip') || n.includes('loyalty') || n.includes('gold') || n.includes('platinum')) return 'text-amber-600 bg-amber-50/60 border border-amber-100/50';
  return 'text-[#6D28D9] bg-purple-50/60 border border-purple-100/50';
};


const AutomationEngine = () => {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isAutoPilot, setIsAutoPilot } = useApp();
  const autoReply = isAutoPilot;
  const setAutoReply = setIsAutoPilot;
  
  const [confidence, setConfidence] = useState(85);
  const [safeguardMode, setSafeguardMode] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [editRulesForm, setEditRulesForm] = useState(null);
  const [customAutoApprove, setCustomAutoApprove] = useState(false);
  const [customOccupancy, setCustomOccupancy] = useState(false);
  const [customLoyalty, setCustomLoyalty] = useState(false);

  const [newFlowForm, setNewFlowForm] = useState({
    name: '',
    purpose: '',
    trigger: '',
    channel: 'WhatsApp',
    policy: 'StandardSOP.pdf',
    escalationCondition: 'Confidence < 85% or Occupancy > 90%'
  });

  const [availableDocs, setAvailableDocs] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/rag/documents`);
        if (response.ok) {
          const data = await response.json();
          setAvailableDocs(data);
        }
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    fetchDocuments();
  }, []);

  // Simple feedback toast
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/workflows`);
        if (response.ok) {
          const data = await response.json();
          // Transform data to match frontend requirements
          const formatted = data.map(w => ({
            id: w.id,
            name: w.name,
            purpose: w.purpose,
            channel: w.channel,
            policy: w.policySource,
            escalationCondition: w.escalationTrigger,
            status: w.status,
            lastAction: 'Just now',
            icon: getWorkflowIcon(w.name, w.channel),
            color: getWorkflowColor(w.name, w.channel),
            rules: {
              autoApproveLimit: w.autoApproveLimit || 'Default active guidelines',
              occupancyThreshold: w.occupancyThreshold || '95%',
              loyaltyRequired: w.loyaltyRequired || 'All registered guest list'
            }
          }));
          
          if (formatted.length === 0) {
            setModules([]);
            setSelectedModule(null);
          } else {
            setModules(formatted);
            const firstMod = formatted[0];
            setSelectedModule(firstMod);
            setCustomAutoApprove(!AUTO_APPROVE_OPTIONS.includes(firstMod.rules.autoApproveLimit));
            setCustomOccupancy(!OCCUPANCY_OPTIONS.includes(firstMod.rules.occupancyThreshold));
            setCustomLoyalty(!LOYALTY_OPTIONS.includes(firstMod.rules.loyaltyRequired));
            setEditRulesForm({
              id: firstMod.id,
              name: firstMod.name,
              autoApproveLimit: firstMod.rules.autoApproveLimit,
              occupancyThreshold: firstMod.rules.occupancyThreshold,
              loyaltyRequired: firstMod.rules.loyaltyRequired
            });
          }
        } else {
            setModules([]);
            setSelectedModule(null);
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
        setModules([]);
        setSelectedModule(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const toggleModuleStatus = async (id) => {
    const modToUpdate = modules.find(m => m.id === id);
    if (!modToUpdate) return;
    const nextStatus = modToUpdate.status === 'Active' ? 'Inactive' : 'Active';

    try {
      const response = await fetch(`${API_BASE_URL}/api/workflows/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      
      if(response.ok) {
        setModules(prev => prev.map(mod => {
          if (mod.id === id) {
            triggerToast(`"${mod.name}" is now ${nextStatus === 'Active' ? 'Active' : 'Paused'}.`);
            return { ...mod, status: nextStatus };
          }
          return mod;
        }));
      }
    } catch (e) {
       console.error(e);
       triggerToast('Failed to update status in DB (using fallback UI)');
    }
  };

  useEffect(() => {
    if (selectedModule && modules.length > 0) {
      const updatedSelected = modules.find(m => m.id === selectedModule.id);
      if (updatedSelected) {
        setSelectedModule(updatedSelected);
      }
    }
  }, [modules]);

  const handleModuleClick = (mod) => {
    setSelectedModule(mod);
    setCustomAutoApprove(!AUTO_APPROVE_OPTIONS.includes(mod.rules.autoApproveLimit));
    setCustomOccupancy(!OCCUPANCY_OPTIONS.includes(mod.rules.occupancyThreshold));
    setCustomLoyalty(!LOYALTY_OPTIONS.includes(mod.rules.loyaltyRequired));
    setEditRulesForm({
      id: mod.id,
      name: mod.name,
      autoApproveLimit: mod.rules.autoApproveLimit,
      occupancyThreshold: mod.rules.occupancyThreshold,
      loyaltyRequired: mod.rules.loyaltyRequired
    });
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    
    try {
      await fetch(`${API_BASE_URL}/api/workflows/${editRulesForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          autoApproveLimit: editRulesForm.autoApproveLimit,
          occupancyThreshold: editRulesForm.occupancyThreshold,
          loyaltyRequired: editRulesForm.loyaltyRequired
        })
      });

      setModules(prev => prev.map(m => {
        if (m.id === editRulesForm.id) {
          return {
            ...m,
            rules: {
              autoApproveLimit: editRulesForm.autoApproveLimit,
              occupancyThreshold: editRulesForm.occupancyThreshold,
              loyaltyRequired: editRulesForm.loyaltyRequired
            }
          };
        }
        return m;
      }));
      triggerToast('Automation boundaries successfully updated.');
    } catch (e) {
      console.error(e);
      triggerToast('Failed to save to database (Network error)');
    }
  };

  const handleCreateFlow = async (e) => {
    e.preventDefault();
    if (!newFlowForm.name) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/workflows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFlowForm.name,
          purpose: newFlowForm.purpose || 'Custom operational workflow matched dynamically using RAG parameters.',
          channel: newFlowForm.channel,
          policySource: newFlowForm.policy,
          escalationTrigger: newFlowForm.escalationCondition,
          autoApproveLimit: 'Default active guidelines',
          occupancyThreshold: '95%',
          loyaltyRequired: 'All registered guest list'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create workflow');
      }
      
      const dbFlow = await response.json();

      const newFlow = {
        id: dbFlow.id,
        name: dbFlow.name,
        purpose: dbFlow.purpose,
        channel: dbFlow.channel,
        policy: dbFlow.policySource,
        escalationCondition: dbFlow.escalationTrigger,
        lastAction: 'Just now',
        status: dbFlow.status,
        icon: getWorkflowIcon(dbFlow.name, dbFlow.channel),
        color: getWorkflowColor(dbFlow.name, dbFlow.channel),
        rules: {
          autoApproveLimit: dbFlow.autoApproveLimit || 'Default active guidelines',
          occupancyThreshold: dbFlow.occupancyThreshold || '95%',
          loyaltyRequired: dbFlow.loyaltyRequired || 'All registered guest list'
        }
      };

      setModules(prev => [newFlow, ...prev]);
      handleModuleClick(newFlow);
      setIsCreateModalOpen(false);
      setNewFlowForm({
        name: '',
        purpose: '',
        trigger: '',
        channel: 'WhatsApp',
        policy: 'StandardSOP.pdf',
        escalationCondition: 'Confidence < 85% or Occupancy > 90%'
      });
      triggerToast(`"${newFlow.name}" created and deployed successfully.`);
    } catch (e) {
      console.error(e);
      triggerToast('Failed to create flow in Database');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 font-semibold text-xs">Loading Workflows Engine...</div>;
  }

  return (
    <div className="px-0 pt-4 pb-24 sm:p-6 max-w-[1600px] mx-auto space-y-6 font-sans text-left bg-slate-50/15">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
         <div className="text-left space-y-0.5">
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">AI Workflows</h1>
            <p className="text-xs text-slate-500 font-medium">Configure how AI handles guest requests and automation.</p>
         </div>
         <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span>MEWS Connected</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-slate-600 shadow-sm">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
               <span>WhatsApp Active</span>
            </div>
         </div>
      </div>

      {/* 2. OPERATIONAL METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Automations', value: modules.filter(m => m.status === 'Active').length, sub: `${modules.length} total flows`, color: 'text-purple-600', dot: 'bg-purple-500' },
          { label: 'AI Resolution Rate', value: '94.2%', sub: '+0.4% this week', color: 'text-emerald-600', dot: 'bg-emerald-500' },
          { label: 'Escalation Rate', value: '5.8%', sub: 'Direct handoffs', color: 'text-rose-500', dot: 'bg-rose-400' },
          { label: 'Avg Response Time', value: '450ms', sub: 'Webhook latency clear', color: 'text-blue-600', dot: 'bg-blue-500' }
        ].map((m, mIdx) => (
          <div key={mIdx} className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm">
             <div className="flex items-center gap-1.5 mb-1">
               <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{m.label}</span>
             </div>
             <p className={`text-2xl font-black font-mono tracking-tight ${m.color}`}>{m.value}</p>
             <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* 3. GOVERNANCE CONTROLS */}
      <div className="bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
         <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
               <Zap size={11} className="text-[#6D28D9]" />
               <span className="text-slate-400 text-[10px] font-bold">Autopilot:</span>
               <button 
                 onClick={() => { setAutoReply(!autoReply); triggerToast(`Autopilot is now ${!autoReply ? 'ON' : 'OFF'}.`); }}
                 className="flex items-center gap-1.5 cursor-pointer"
               >
                  <div className={`relative w-7 h-3.5 rounded-full transition-colors duration-300 ${autoReply ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-sm transition-all duration-300 ${autoReply ? 'left-3.5' : 'left-0.5'}`} />
                  </div>
                  <span className={`text-[10px] font-black ${autoReply ? 'text-emerald-600' : 'text-slate-400'}`}>{autoReply ? 'ON' : 'OFF'}</span>
               </button>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 min-w-[200px]">
               <span className="text-slate-400 text-[10px] font-bold shrink-0">Confidence:</span>
               <span className="text-[#6D28D9] font-black text-[10px] shrink-0 w-7">{confidence}%</span>
               <input type="range" min="50" max="95" value={confidence} onChange={(e) => setConfidence(e.target.value)} className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-[#6D28D9]" />
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
               <ShieldAlert size={11} className={safeguardMode ? 'text-emerald-600' : 'text-slate-400'} />
               <span className="text-slate-400 text-[10px] font-bold">Safeguards:</span>
               <button onClick={() => { setSafeguardMode(!safeguardMode); triggerToast(`Safeguard rules are now ${!safeguardMode ? 'Active' : 'Bypassed'}.`); }} className={`font-black text-[10px] ${safeguardMode ? 'text-emerald-600' : 'text-slate-400'} cursor-pointer`}>
                  {safeguardMode ? 'ACTIVE' : 'BYPASSED'}
               </button>
            </div>
         </div>
         <button onClick={() => setIsCreateModalOpen(true)} className="px-3 py-1.5 bg-gradient-to-r from-[#0B1020] to-[#1E1B4B] hover:from-slate-900 hover:to-slate-950 text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-[#6D4AFF]/10 self-start lg:self-auto">
            <Plus size={11} className="text-purple-300" />
            <span>Create Flow</span>
         </button>
      </div>

      {/* MAIN TWO COLUMN GRID */}
      {modules.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm">
           <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 mb-4">
              <Database size={20} className="text-slate-400" />
           </div>
           <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">No Active Workflows</h3>
           <p className="text-xs text-slate-500 font-semibold max-w-sm mb-6">Your hotel automation system is empty. Create a workflow to define how the AI should respond to guest requests.</p>
           <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-[#6D28D9] text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer">
              <Plus size={12} /><span>Create First Flow</span>
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-5 items-start">
           
           {/* LEFT COLUMN: AUTOMATION CARDS */}
           <div className="col-span-12 lg:col-span-7 flex flex-col space-y-3">
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Active Workflows</h2>
                 <span className="text-[10px] font-black text-slate-400 uppercase font-mono">{modules.length} Registered</span>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[620px] pr-0 sm:pr-0.5 pb-2">
                 {modules.map((mod) => {
                    const isSelected = selectedModule?.id === mod.id;
                    const CardIcon = mod.icon;
                    const isActive = mod.status === 'Active';
                    const channelColor = mod.channel === 'WhatsApp'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : mod.channel === 'Email'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                    return (
                      <motion.div 
                        key={mod.id}
                        layout
                        onClick={() => handleModuleClick(mod)}
                        className={`p-4 rounded-xl bg-white border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-[#6D28D9] shadow-[0_0_0_3px_rgba(109,40,217,0.08)] shadow-md' 
                            : 'border-slate-200/80 shadow-sm hover:border-slate-300 hover:shadow-md'
                        } ${!autoReply ? 'opacity-60' : ''}`}
                      >
                        <div className="space-y-3">
                           <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${mod.color}`}>
                                    <CardIcon size={15} />
                                 </div>
                                 <div className="min-w-0">
                                   <h3 className="text-xs font-black text-slate-950 truncate">{mod.name}</h3>
                                   <span className={`inline-flex items-center text-[8px] font-black px-1.5 py-0.5 rounded border uppercase font-mono tracking-wide mt-0.5 ${channelColor}`}>
                                     {mod.channel}
                                   </span>
                                 </div>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0">
                                 <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase font-mono tracking-wider ${
                                   isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                 }`}>
                                    {isActive ? 'ACTIVE' : 'PAUSED'}
                                 </span>
                                 <button 
                                   onClick={(e) => { if (autoReply) { e.stopPropagation(); toggleModuleStatus(mod.id); } }}
                                   disabled={!autoReply}
                                   title={autoReply ? (isActive ? 'Pause workflow' : 'Activate workflow') : 'Enable Autopilot to toggle'}
                                   className={`relative w-9 h-5 rounded-full transition-all duration-300 flex items-center px-0.5 shrink-0 ${
                                      isActive ? 'bg-emerald-500' : 'bg-slate-200'
                                   } ${!autoReply ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                 >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-300 ${isActive ? 'translate-x-4' : ''}`} />
                                 </button>
                              </div>
                           </div>

                           <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">{mod.purpose}</p>

                           <div className="pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2">
                              <div>
                                 <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Policy Source</span>
                                 <span className="text-[10px] text-[#6D28D9] font-mono font-bold truncate block" title={mod.policy}>{mod.policy}</span>
                              </div>
                              <div>
                                 <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Escalation</span>
                                 <span className="text-[10px] text-slate-700 font-semibold truncate block" title={mod.escalationCondition}>{mod.escalationCondition || 'Conf < 85%'}</span>
                              </div>
                              <div>
                                 <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Last Action</span>
                                 <span className="text-[10px] text-slate-400 font-mono">{mod.lastAction}</span>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    );
                 })}
              </div>
           </div>

           {/* RIGHT COLUMN: WORKFLOW CONFIGURATION DETAILS */}
           <div className="col-span-12 lg:col-span-5 flex flex-col space-y-3">
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Configuration</h2>
                 {selectedModule && (
                   <span className="text-[9px] bg-[#6D28D9]/10 text-[#6D28D9] px-2 py-0.5 rounded font-black uppercase tracking-wide truncate max-w-[160px]">
                      {selectedModule.name}
                   </span>
                 )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-left overflow-hidden">
                 {!selectedModule || !editRulesForm ? (
                    <div className="flex flex-col items-center justify-center py-14 text-center space-y-3 px-6">
                       <Settings2 size={22} className="text-slate-300 animate-spin" style={{ animationDuration: '4s' }} />
                       <p className="text-xs font-semibold text-slate-400">Select a workflow to view and edit its operational configuration.</p>
                    </div>
                 ) : (
                    <div>
                      {/* Header strip */}
                      <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selectedModule.color}`}>
                          {React.createElement(selectedModule.icon, { size: 16 })}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-900 leading-tight">{selectedModule.name}</h3>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed line-clamp-2 mt-0.5">{selectedModule.purpose}</p>
                        </div>
                      </div>

                      <form onSubmit={handleSaveRules} className="px-5 py-4 space-y-4">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                           <Settings2 size={10} className="text-[#6D28D9]"/> Operational Parameters
                         </p>

                         {/* Auto-Approve Limit */}
                         <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Auto-Approve Limit</label>
                               <span className="text-[8px] text-[#6D28D9] font-bold">Confidence Trigger</span>
                            </div>
                            {!customAutoApprove ? (
                              <div className="relative">
                                <select
                                  value={AUTO_APPROVE_OPTIONS.includes(editRulesForm.autoApproveLimit) ? editRulesForm.autoApproveLimit : AUTO_APPROVE_OPTIONS[0]}
                                  onChange={(e) => {
                                    if (e.target.value === '__custom__') { setCustomAutoApprove(true); setEditRulesForm({...editRulesForm, autoApproveLimit: ''}); }
                                    else { setEditRulesForm({...editRulesForm, autoApproveLimit: e.target.value}); }
                                  }}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 outline-none transition-all appearance-none pr-8 cursor-pointer"
                                >
                                  {AUTO_APPROVE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                  <option value="__custom__">Custom value...</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                            ) : (
                              <div className="flex gap-1.5">
                                <input type="text" autoFocus value={editRulesForm.autoApproveLimit} onChange={(e) => setEditRulesForm({...editRulesForm, autoApproveLimit: e.target.value})} placeholder="e.g. Confidence >= 88%" className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 outline-none transition-all" />
                                <button type="button" onClick={() => { setCustomAutoApprove(false); setEditRulesForm({...editRulesForm, autoApproveLimit: AUTO_APPROVE_OPTIONS[0]}); }} className="px-2 py-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors">↩</button>
                              </div>
                            )}
                            <p className="text-[9px] text-slate-400 font-medium">Minimum confidence for autopilot to approve without human review.</p>
                         </div>

                         {/* Occupancy Threshold */}
                         <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Max Occupancy Threshold</label>
                               <span className="text-[8px] text-[#6D28D9] font-bold">Escalation Trigger</span>
                            </div>
                            {!customOccupancy ? (
                              <div className="relative">
                                <select
                                  value={OCCUPANCY_OPTIONS.includes(editRulesForm.occupancyThreshold) ? editRulesForm.occupancyThreshold : OCCUPANCY_OPTIONS[0]}
                                  onChange={(e) => {
                                    if (e.target.value === '__custom__') { setCustomOccupancy(true); setEditRulesForm({...editRulesForm, occupancyThreshold: ''}); }
                                    else { setEditRulesForm({...editRulesForm, occupancyThreshold: e.target.value}); }
                                  }}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 outline-none transition-all appearance-none pr-8 cursor-pointer"
                                >
                                  {OCCUPANCY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                  <option value="__custom__">Custom value...</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                            ) : (
                              <div className="flex gap-1.5">
                                <input type="text" autoFocus value={editRulesForm.occupancyThreshold} onChange={(e) => setEditRulesForm({...editRulesForm, occupancyThreshold: e.target.value})} placeholder="e.g. 88%" className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 outline-none transition-all" />
                                <button type="button" onClick={() => { setCustomOccupancy(false); setEditRulesForm({...editRulesForm, occupancyThreshold: OCCUPANCY_OPTIONS[0]}); }} className="px-2 py-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors">↩</button>
                              </div>
                            )}
                            <p className="text-[9px] text-slate-400 font-medium">AI escalates to human operators when hotel occupancy exceeds this level.</p>
                         </div>

                         {/* Loyalty Requirement */}
                         <div className="space-y-1">
                            <div className="flex justify-between items-baseline">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Loyalty Requirement</label>
                               <span className="text-[8px] text-[#6D28D9] font-bold">Target Cohort</span>
                            </div>
                            {!customLoyalty ? (
                              <div className="relative">
                                <select
                                  value={LOYALTY_OPTIONS.includes(editRulesForm.loyaltyRequired) ? editRulesForm.loyaltyRequired : LOYALTY_OPTIONS[0]}
                                  onChange={(e) => {
                                    if (e.target.value === '__custom__') { setCustomLoyalty(true); setEditRulesForm({...editRulesForm, loyaltyRequired: ''}); }
                                    else { setEditRulesForm({...editRulesForm, loyaltyRequired: e.target.value}); }
                                  }}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 outline-none transition-all appearance-none pr-8 cursor-pointer"
                                >
                                  {LOYALTY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                  <option value="__custom__">Custom value...</option>
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                              </div>
                            ) : (
                              <div className="flex gap-1.5">
                                <input type="text" autoFocus value={editRulesForm.loyaltyRequired} onChange={(e) => setEditRulesForm({...editRulesForm, loyaltyRequired: e.target.value})} placeholder="e.g. Gold & Platinum Only" className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/10 outline-none transition-all" />
                                <button type="button" onClick={() => { setCustomLoyalty(false); setEditRulesForm({...editRulesForm, loyaltyRequired: LOYALTY_OPTIONS[0]}); }} className="px-2 py-1.5 text-[9px] font-black text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg transition-colors">↩</button>
                              </div>
                            )}
                            <p className="text-[9px] text-slate-400 font-medium">Restricts automated execution to guests meeting the specified loyalty tier.</p>
                         </div>

                         <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                               <Database size={10} />
                               <span>Persisted to database</span>
                            </div>
                            <button type="submit" className="px-4 py-2 bg-[#6D28D9] hover:bg-purple-800 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:shadow-lg hover:shadow-purple-100">
                               <Save size={11} /> Save
                            </button>
                         </div>
                      </form>

                      {autoReply && selectedModule.status === 'Active' && (
                        <div className="mx-4 mb-4 flex items-start gap-2.5 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                           <ShieldAlert className="text-rose-500 shrink-0 mt-0.5 animate-pulse" size={13} />
                           <p className="text-[10px] font-bold text-rose-700 leading-normal">
                              <span className="font-black uppercase mr-1">Safeguard Active —</span>
                              Escalates to Takeover Queue if confidence drops below {confidence}%.
                           </p>
                        </div>
                      )}
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* CREATE AUTOMATION MODAL */}
      <AnimatePresence>
         {isCreateModalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-left font-sans"
              >
                 <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Create New Workflow</h3>
                       <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Define guest trigger parameters and connected policy constraints.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsCreateModalOpen(false);
                        setNewFlowForm({
                          name: '',
                          purpose: '',
                          trigger: '',
                          channel: 'WhatsApp',
                          policy: 'StandardSOP.pdf',
                          escalationCondition: 'Confidence < 85% or Occupancy > 90%'
                        });
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                       <X size={15} />
                    </button>
                 </div>

                 <form onSubmit={handleCreateFlow} className="p-5 space-y-3.5">
                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Workflow Name</label>
                       <input 
                         type="text" 
                         required
                         placeholder="e.g. Early Check-In Approval"
                         value={newFlowForm.name}
                         onChange={(e) => setNewFlowForm({...newFlowForm, name: e.target.value})}
                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#6D28D9]/40 outline-none transition-all"
                       />
                    </div>

                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Trigger Intent Match</label>
                       <input 
                         type="text" 
                         required
                         placeholder="Guest asks to check in early"
                         value={newFlowForm.trigger}
                         onChange={(e) => setNewFlowForm({...newFlowForm, trigger: e.target.value})}
                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#6D28D9]/40 outline-none transition-all"
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">SOP File (RAG)</label>
                          <select 
                            required
                            value={newFlowForm.policy}
                            onChange={(e) => setNewFlowForm({...newFlowForm, policy: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#6D28D9]/40 outline-none transition-all"
                          >
                            <option value="">Select SOP PDF...</option>
                            {availableDocs.map(doc => (
                              <option key={doc.id} value={doc.filename}>{doc.filename}</option>
                            ))}
                            {availableDocs.length === 0 && (
                              <>
                                <option value="StandardSOP.pdf">StandardSOP.pdf</option>
                                <option value="LateCheckoutPolicy.pdf">LateCheckoutPolicy.pdf</option>
                                <option value="DisputeResolutionSOP.pdf">DisputeResolutionSOP.pdf</option>
                              </>
                            )}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Channel</label>
                          <select 
                            value={newFlowForm.channel}
                            onChange={(e) => setNewFlowForm({...newFlowForm, channel: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#6D28D9]/40 outline-none transition-all"
                          >
                             <option value="WhatsApp">WhatsApp</option>
                             <option value="Email">Email</option>
                             <option value="Multi-Channel">Multi-Channel</option>
                          </select>
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Short Description</label>
                       <textarea 
                         placeholder="Handles guest arrivals before check-in hour using hotel occupancy checks."
                         value={newFlowForm.purpose}
                         onChange={(e) => setNewFlowForm({...newFlowForm, purpose: e.target.value})}
                         rows={2}
                         className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-[#6D28D9]/40 outline-none transition-all resize-none"
                       />
                    </div>

                    <div className="pt-3.5 flex justify-end gap-2 border-t border-slate-100">
                       <button
                         type="button"
                         onClick={() => {
                           setIsCreateModalOpen(false);
                           setNewFlowForm({
                             name: '',
                             purpose: '',
                             trigger: '',
                             channel: 'WhatsApp',
                             policy: 'StandardSOP.pdf',
                             escalationCondition: 'Confidence < 85% or Occupancy > 90%'
                           });
                         }}
                         className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-600 transition-colors"
                       >
                          Cancel
                       </button>
                       <button
                         type="submit"
                         className="px-4 py-2 bg-[#0B1020] text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-all shadow-md"
                       >
                          Deploy Flow
                       </button>
                    </div>
                 </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default AutomationEngine;
