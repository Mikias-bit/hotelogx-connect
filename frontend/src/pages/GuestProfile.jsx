import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Calendar, 
  CreditCard, 
  Award, 
  Heart, 
  Clock, 
  ArrowLeft, 
  Database, 
  Activity, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Sparkles,
  Bot,
  MessageSquare,
  FileText,
  DollarSign,
  Layers,
  AlertTriangle,
  Zap,
  Globe,
  Lock,
  Wifi,
  RefreshCw,
  TrendingUp,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GuestProfile = () => {
  const navigate = useNavigate();
  
  // Simulated active RAG index sync indicator
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  
  const triggerSync = () => {
    setIsSyncing(true);
    setToastMsg('Refreshing live MEWS PMS connection & vector indices...');
    setTimeout(() => {
      setIsSyncing(false);
      setToastMsg('MEWS PMS synchronized. RAG vector context is up-to-date.');
    }, 1500);
  };

  // AI Automation Governance permissions state
  const [governance, setGovernance] = useState({
    autoLateCheckout: true,
    autoDisputeResolution: true,
    loyaltyAutopilot: true,
    operatorTakeoverRequired: false
  });

  const toggleGovernance = (key) => {
    setGovernance(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="px-0 pt-4 pb-24 sm:p-6 max-w-[1600px] mx-auto space-y-6 font-sans text-left bg-slate-50/25">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#0B1020] border border-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 font-sans"
          >
            <CheckCircle2 size={16} className="text-[#A78BFA] shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. AI GUEST CONTEXT HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-4 text-left">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
          </button>
          
          <div className="text-left space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black tracking-widest text-[#6D28D9] uppercase flex items-center gap-1">
                <Cpu size={10} className="animate-pulse" />
                AI OPERATIONAL CONTEXT LAYER
              </span>
              <span className="px-1.5 py-0.5 bg-purple-50 text-[#6D28D9] text-[8px] font-black uppercase tracking-wider rounded border border-purple-100/50 flex items-center gap-1 shrink-0">
                <span className="w-1 h-1 bg-[#6D28D9] rounded-full animate-ping" />
                MEWS PMS SYNC ACTIVE
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-950 tracking-tight">AI Guest Context Hub</h1>
            <p className="text-xs text-slate-500 font-bold leading-normal">
              Real-time RAG context, active automation traces, and MEWS PMS communication layer telemetry.
            </p>
          </div>
        </div>

        {/* Real-time Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border border-slate-200/80 px-3.5 py-2 rounded-xl shadow-sm">
             <Database size={13} className="text-purple-600 shrink-0" />
             <span>MEWS ID: <strong className="text-slate-800 font-mono">#MEWS-9204A</strong></span>
          </div>

          <button 
            onClick={triggerSync}
            disabled={isSyncing}
            className="p-2.5 bg-white border border-slate-250 hover:bg-slate-50 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-2 text-xs font-bold text-slate-600"
          >
            <RefreshCw size={13} className={`text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync MEWS</span>
          </button>
        </div>
      </div>

      {/* THREE-COLUMN COMPARTMENT GRID */}
      <div className="grid grid-cols-12 gap-5 lg:gap-6 items-stretch">
        
        {/* ====================================================
            LEFT COLUMN: GUEST IDENTITY & COMMUNICATION CHANNEL
            ==================================================== */}
        <div className="col-span-12 lg:col-span-4 space-y-5 lg:space-y-6 flex flex-col justify-start">
           
           {/* SECTION 1: AI GUEST IDENTIFICATION */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Guest Profile</span>
                 <User size={14} className="text-slate-400" />
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-tr from-[#6D28D9] to-purple-500 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md">
                       SJ
                    </div>
                    <div>
                       <h2 className="text-sm font-black text-slate-900 tracking-tight">Sarah Jenkins</h2>
                       <div className="flex items-center gap-1 mt-0.5">
                          <Award size={11} className="text-amber-500 fill-amber-500" />
                          <span className="text-[9px] font-black tracking-widest text-amber-600 uppercase">GOLD VIP STATUS</span>
                       </div>
                    </div>
                 </div>

                 <div className="h-[1px] bg-slate-100" />

                 <div className="space-y-2 text-xs font-bold text-slate-600">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-semibold">Stay Status</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded uppercase border border-emerald-100/50">In-House (Room 502)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Primary Phone</span> 
                      <span className="text-slate-900 font-mono">+1 (555) 019-2834</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Email Channel</span> 
                      <span className="text-slate-900 font-mono">s.jenkins@goldmail.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Total MEWS Stays</span> 
                      <span className="text-slate-900">14 visits</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* SECTION 2: COMMUNICATION CONTEXT PANEL */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Communication Intelligence</span>
                 <MessageSquare size={14} className="text-slate-400" />
              </div>

              <div className="space-y-3.5">
                 <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-left">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Active Channel</span>
                       <span className="text-[10.5px] font-black text-[#6D28D9] uppercase flex items-center gap-1 mt-1 font-mono">
                          <MessageCircle size={11} className="fill-[#6D28D9]/10" /> WhatsApp
                       </span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl text-left">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">AI Response Speed</span>
                       <span className="text-xs font-black text-slate-900 block mt-1 font-mono">450ms Latency</span>
                    </div>
                 </div>

                 <div className="p-3 bg-purple-50/15 border border-purple-100/50 rounded-xl text-left space-y-1">
                    <span className="text-[8px] font-black text-[#6D28D9] uppercase tracking-wider flex items-center gap-1">
                       <Bot size={10} /> Last Outbound AI Message
                    </span>
                    <p className="text-[11px] text-purple-950 font-bold leading-normal italic">
                       "Hello Sarah! Since you are a Gold VIP, I've confirmed late checkout until 2:00 PM free of charge."
                    </p>
                 </div>

                 <div className="space-y-2 text-xs font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Language Preference</span> 
                      <span className="text-slate-900">English (US)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Sentiment Analysis</span> 
                      <span className="text-emerald-600">Positive (92%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Active Autopilot State</span> 
                      <span className="text-slate-900">Autopilot Engaged</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">Takeover Queue History</span> 
                      <span className="text-slate-900 font-mono">0 Hand-offs</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* SECTION 3: STAY RESERVATION BLOCK */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3.5 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MEWS Stay Details</span>
                 <Calendar size={14} className="text-slate-400" />
              </div>

              <div className="space-y-2.5 text-xs font-bold text-slate-600">
                 <p className="flex justify-between"><span>Check-In Date</span> <span className="text-slate-900 font-mono">May 07, 2026</span></p>
                 <p className="flex justify-between"><span>Check-Out Date</span> <span className="text-slate-900 font-mono">May 10, 2026</span></p>
                 <p className="flex justify-between"><span>Room Type Booked</span> <span className="text-slate-900">Executive Ocean Suite</span></p>
                 <p className="flex justify-between"><span>Occupancy Rates</span> <span className="text-slate-900">2 Adults, 0 Children</span></p>
                 <p className="flex justify-between"><span>Booking Channel</span> <span className="text-slate-900">Direct MEWS Portal</span></p>
              </div>
           </div>

        </div>

        {/* ====================================================
            CENTER COLUMN: AI POLICY & RAG LAYER + SERVICE LEDGER
            ==================================================== */}
        <div className="col-span-12 lg:col-span-4 space-y-5 lg:space-y-6 flex flex-col justify-start">
           
           {/* SECTION 4: AI POLICY & RAG CONTEXT (KNOWLEDGE LAYER) */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={11} className="text-purple-600 animate-pulse" />
                    AI Knowledge &amp; RAG Layer
                 </span>
                 <FileText size={14} className="text-slate-400" />
              </div>

              <div className="space-y-3.5 text-left">
                 <div className="p-3 bg-purple-50/15 border border-purple-100/40 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                       <span className="text-[8px] font-black text-[#6D28D9] uppercase tracking-wider">Vector Query Match</span>
                       <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">96% Conf.</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-800">"Late checkout rule for VIP Gold Member on check-out date"</p>
                 </div>

                 <div className="space-y-2">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Retrieved SOP Reference Documents</span>
                    <div className="space-y-2">
                       {[
                         { name: 'LateCheckoutPolicy.pdf', size: '142 KB', status: 'RAG Hit' },
                         { name: 'VIPGuestBenefitsGuide.pdf', size: '210 KB', status: 'RAG Hit' }
                       ].map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                             <div className="flex items-center gap-2 min-w-0">
                                <FileText size={12} className="text-slate-400 shrink-0" />
                                <span className="text-xs font-semibold text-slate-700 truncate">{doc.name}</span>
                             </div>
                             <span className="text-[8px] font-black text-[#6D28D9] bg-purple-50 border border-purple-100/50 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">{doc.status}</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Orchestrator Decision Trace</span>
                    <p className="text-[11.5px] font-bold text-slate-700 mt-1">
                       "Complimentary late checkout until 2:00 PM matches Gold VIP rule in SOP guide."
                    </p>
                 </div>
              </div>
           </div>

           {/* SECTION 5: OPERATIONAL SERVICE LEDGER & PAYMENTS */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Operational Service Ledger</span>
                 <CreditCard size={14} className="text-slate-400" />
              </div>

              <div className="space-y-4 text-left">
                 {/* Financial Summary Block */}
                 <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                    <div>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Pending Balance</span>
                       <span className="text-lg font-black text-slate-900 font-mono">$1,050.00</span>
                    </div>
                    <div>
                       <span className="text-[8px] font-black text-purple-600 uppercase tracking-wider block">AI Generated Revenue</span>
                       <span className="text-lg font-black text-[#6D28D9] font-mono">+$35.00</span>
                    </div>
                 </div>

                 {/* Posted ledger transactions */}
                 <div className="space-y-2.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Postings Timeline (MEWS Ledger)</span>
                    
                    {[
                      { item: 'Late Checkout Surcharge', price: '$35.00', status: 'Posted to MEWS', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                      { item: 'Room rate charge - Night 3', price: '$350.00', status: 'Settled on Checkout', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                      { item: 'Spa Upgrade Adjustment', price: '$90.00', status: 'Awaiting Payment', color: 'bg-amber-50 text-amber-700 border-amber-100' }
                    ].map((tx, idx) => (
                       <div key={idx} className="flex items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-150 rounded-xl">
                          <div className="text-left min-w-0">
                             <p className="text-[11.5px] font-black text-slate-800 truncate">{tx.item}</p>
                             <span className={`inline-block text-[7.5px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider mt-1 ${tx.color}`}>
                                {tx.status}
                             </span>
                          </div>
                          <span className="text-xs font-black text-slate-950 font-mono shrink-0">{tx.price}</span>
                       </div>
                    ))}
                 </div>

                 {/* Payment Automation Trigger Block */}
                 <div className="p-3 bg-purple-50/25 border border-[#6D28D9]/20 rounded-xl flex items-center justify-between gap-3">
                    <div className="text-left">
                       <span className="text-[8px] font-black text-[#6D28D9] uppercase tracking-wider block">Payment Automation</span>
                       <p className="text-[10px] text-slate-500 font-bold mt-0.5">MEWS payment link generated</p>
                    </div>
                    <span className="px-2 py-0.5 bg-purple-100/50 text-[#6D28D9] text-[8.5px] font-black rounded uppercase border border-purple-200/50">LINK ACTIVE</span>
                 </div>
              </div>
           </div>

        </div>

        {/* ====================================================
            RIGHT COLUMN: GOVERNANCE LAYER & OPERATIONAL EVENT TIMELINE
            ==================================================== */}
        <div className="col-span-12 lg:col-span-4 space-y-5 lg:space-y-6 flex flex-col justify-start">
           
           {/* SECTION 6: AI AUTOMATION GOVERNANCE LAYER */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Automation Governance</span>
                 <ShieldCheck size={14} className="text-slate-400" />
              </div>

              <div className="space-y-3">
                 {[
                   { key: "autoLateCheckout", title: "Late Checkout Autopilot", desc: "Allows AI to auto-approve extended checkout fees if occupancy is under 90%." },
                   { key: "autoDisputeResolution", title: "Incident Dispute Auto-Settle", desc: "Allows AI to automatically resolve and credit guest folios for disputes < $25." },
                   { key: "loyaltyAutopilot", title: "Loyalty Tier Incentives", desc: "AI can auto-issue premium spa and breakfast upgrades to VIP/Gold members." },
                   { key: "operatorTakeoverRequired", title: "Strict Operator Override", desc: "Requires manual human intervention for all billing and folio posting updates." }
                 ].map((gov) => {
                    const isChecked = governance[gov.key];
                    return (
                       <div key={gov.key} className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-left space-y-2 flex flex-col justify-between">
                          <div>
                             <div className="flex items-center justify-between">
                                <span className="text-[11.5px] font-black text-slate-900">{gov.title}</span>
                                <button
                                  onClick={() => toggleGovernance(gov.key)}
                                  className="text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                                >
                                   {isChecked ? (
                                     <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded uppercase">ACTIVE</span>
                                   ) : (
                                     <span className="text-[9px] font-black text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase font-mono">PAUSED</span>
                                   )}
                                </button>
                             </div>
                             <p className="text-[10px] text-slate-400 font-bold mt-1 leading-relaxed">
                                {gov.desc}
                             </p>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>

           {/* SECTION 7: LIVE OPERATIONAL TIMELINE EVENT STREAM */}
           <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Operational Event Stream</span>
                 <Activity size={14} className="text-slate-400 animate-pulse" />
              </div>

              <div className="space-y-4 relative pl-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100">
                 {[
                   { title: "RAG VIP late checkout matched", sub: "Matched policy VIPGuestBenefits.pdf. Approval rating generated: 96% confidence.", time: "10:24 AM", label: "RAG SEARCH" },
                   { title: "AI approved late checkout to 2 PM", sub: "Occupancy requirements evaluated (84% occupied). System within bounds.", time: "10:24 AM", label: "ORCHESTRATOR" },
                   { title: "MEWS Folio updated automatically", sub: "Added late checkout surcharge posting of $35.00 to folio #MEWS-9204A.", time: "10:25 AM", label: "PMS POST" },
                   { title: "MEWS payment link generated", sub: "System auto-generated WhatsApp payment checkout links. Sent webhook.", time: "10:25 AM", label: "FINANCE" },
                   { title: "Guest folio payment completed", sub: "Stripe transaction webhook received. Folio settlement synced with MEWS.", time: "10:26 AM", label: "STRIPE SYNC" }
                 ].map((t, idx) => (
                    <div key={idx} className="relative space-y-1">
                       <span className="absolute -left-[17px] top-1.5 w-1.5 h-1.5 rounded-full bg-purple-600 border border-white" />
                       <div className="flex justify-between items-center">
                          <span className="text-[10.5px] font-black text-slate-900 leading-tight">{t.title}</span>
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider font-mono shrink-0 ml-2">{t.time}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 font-bold leading-normal">{t.sub}</p>
                       <span className="inline-block text-[7.5px] font-black text-[#6D28D9] tracking-widest uppercase font-mono mt-1">
                          [{t.label}]
                       </span>
                    </div>
                 ))}
              </div>
           </div>

        </div>

      </div>

    </div>
  );
};

export default GuestProfile;
