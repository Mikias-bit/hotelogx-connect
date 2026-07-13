import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Clock,
  Smartphone,
  Mail,
  Database,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp, ROLES } from '../context/AppContext';
import { SuperAdminControlCenter } from './super-admin/SuperAdminControlCenter';
import { API_BASE_URL } from '../config';

const Dashboard = () => {
  const { role } = useApp();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [stats, setStats] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  };

  React.useEffect(() => {
    if (role !== ROLES.SUPER_ADMIN) {
      fetchStats();
    }
  }, [role]);

  if (role === ROLES.SUPER_ADMIN) {
    return <SuperAdminControlCenter defaultTab="overview" />;
  }

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats().then(() => {
      setIsRefreshing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const activityFeed = stats?.activity || [];
  const metrics = stats?.metrics || {
    activeConversations: 0,
    pendingTakeovers: 0,
    handlingRate: 0,
    revenueToday: 0
  };
  const integrations = stats?.integrations || {
    pms: false,
    whatsapp: false,
    email: false
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 relative pb-16 text-left selection:bg-purple-950 selection:text-amber-100">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span className="font-bold text-[10px] uppercase tracking-widest text-white font-mono">Overview Data Refreshed</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hospitality Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">Dashboard</h1>
          <p className="text-[#667085] font-medium text-xs leading-relaxed max-w-xl">
            Monitor hotel operations, guest activity and AI performance.
          </p>
        </div>

        <div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E7E4DD] hover:border-slate-300 text-[#111827] rounded-xl font-bold text-[9px] uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer font-mono"
          >
            <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Overview'}
          </button>
        </div>
      </div>

      {/* High-Level Core Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
        {/* Active Guest Conversations */}
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => navigate('/app/conversations')}
          className="p-5 bg-white rounded-2xl border border-[#E7E4DD] shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 bg-[#FAF9F6] border border-[#E7E4DD] text-[#6D4AFF] rounded-xl flex items-center justify-center">
              <MessageSquare size={15} />
            </div>
            <span className="text-[8px] font-bold uppercase font-mono bg-purple-50/50 text-[#6D4AFF] px-2.5 py-1 rounded-md border border-[#E7E4DD]">Live Chat</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#667085] uppercase tracking-wider font-mono mb-1.5">Active Conversations</p>
            <p className="text-3xl font-normal font-serif text-[#111827] tracking-tight">{metrics.activeConversations}</p>
            <p className="text-[11px] text-[#667085] font-semibold mt-1.5">Currently being processed</p>
          </div>
        </motion.div>

        {/* Pending Human Takeovers */}
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => navigate('/app/takeover-queue')}
          className="p-5 bg-white rounded-2xl border border-[#E7E4DD] shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 bg-[#FAF9F6] border border-[#E7E4DD] text-amber-600 rounded-xl flex items-center justify-center">
              <Clock size={15} />
            </div>
            <span className={`text-[8px] font-bold uppercase font-mono bg-amber-50/50 text-amber-700 px-2.5 py-1 rounded-md border border-amber-100 ${metrics.pendingTakeovers > 0 ? 'animate-pulse' : ''}`}>
              {metrics.pendingTakeovers > 0 ? 'Action Required' : 'All Clear'}
            </span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#667085] uppercase tracking-wider font-mono mb-1.5">Pending Takeovers</p>
            <p className="text-3xl font-normal font-serif text-[#111827] tracking-tight">{metrics.pendingTakeovers}</p>
            <p className="text-[11px] text-[#667085] font-semibold mt-1.5">Awaiting hotel team response</p>
          </div>
        </motion.div>

        {/* AI Handling percentage */}
        <motion.div 
          whileHover={{ y: -3 }}
          className="p-5 bg-white rounded-2xl border border-[#E7E4DD] shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 bg-[#FAF9F6] border border-[#E7E4DD] text-emerald-600 rounded-xl flex items-center justify-center">
              <Bot size={15} />
            </div>
            <span className="text-[8px] font-bold uppercase font-mono bg-emerald-50/50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-100">Performance</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#667085] uppercase tracking-wider font-mono mb-1.5">AI Handling Rate</p>
            <p className="text-3xl font-normal font-serif text-[#111827] tracking-tight">{metrics.handlingRate}%</p>
            <p className="text-[11px] text-[#667085] font-semibold mt-1.5">Resolved autonomously by AI</p>
          </div>
        </motion.div>

        {/* Ancillary Revenue Postings */}
        <motion.div 
          whileHover={{ y: -3 }}
          onClick={() => navigate('/app/transactions')}
          className="p-5 bg-white rounded-2xl border border-[#E7E4DD] shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-9 h-9 bg-[#FAF9F6] border border-[#E7E4DD] text-blue-600 rounded-xl flex items-center justify-center">
              <DollarSign size={15} />
            </div>
            <span className="text-[8px] font-bold uppercase font-mono bg-blue-50/50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">Revenue</span>
          </div>
          <div>
            <p className="text-[9px] font-bold text-[#667085] uppercase tracking-wider font-mono mb-1.5">Automated Revenue</p>
            <p className="text-3xl font-normal font-serif text-[#111827] tracking-tight">${metrics.revenueToday}</p>
            <p className="text-[11px] text-[#667085] font-semibold mt-1.5">Posted directly to guest folios today</p>
          </div>
        </motion.div>
      </div>

      {/* Channel & Platform Integration Status Row */}
      <div className="bg-white p-5 rounded-2xl border border-[#E7E4DD] shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-normal text-slate-900 tracking-tight font-serif">Integration & Channel Status</h2>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-mono">Live connection overview</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* PMS Integration card */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E7E4DD] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-white text-[#6D4AFF] border border-[#E7E4DD] rounded-xl flex items-center justify-center shrink-0">
                <Database size={15} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-[#111827]">Mews PMS Connector</p>
                <p className="text-[10px] text-slate-400 font-semibold">Guest profiles & folio mapping</p>
              </div>
            </div>
            <span className={`px-3 py-1 ${integrations.pms ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} border rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm font-mono`}>
              <span className={`w-1 h-1 ${integrations.pms ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} />
              {integrations.pms ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* WhatsApp Integration card */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E7E4DD] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-white text-emerald-600 border border-[#E7E4DD] rounded-xl flex items-center justify-center shrink-0">
                <Smartphone size={15} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-[#111827]">WhatsApp Business</p>
                <p className="text-[10px] text-slate-400 font-semibold">Active direct messaging channel</p>
              </div>
            </div>
            <span className={`px-3 py-1 ${integrations.whatsapp ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} border rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm font-mono`}>
              <span className={`w-1 h-1 ${integrations.whatsapp ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} />
              {integrations.whatsapp ? 'Connected' : 'Offline'}
            </span>
          </div>

          {/* Email Gateway integration card */}
          <div className="p-4 bg-[#FAF9F6] border border-[#E7E4DD] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-white text-blue-600 border border-[#E7E4DD] rounded-xl flex items-center justify-center shrink-0">
                <Mail size={15} />
              </div>
              <div className="text-left min-w-0">
                <p className="text-xs font-bold text-[#111827]">Email Gateway</p>
                <p className="text-[10px] text-slate-400 font-semibold">Inquiries and booking alerts</p>
              </div>
            </div>
            <span className={`px-3 py-1 ${integrations.email ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} border rounded-full text-[8.5px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm font-mono`}>
              <span className={`w-1 h-1 ${integrations.email ? 'bg-emerald-500' : 'bg-rose-500'} rounded-full`} />
              {integrations.email ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Split Operational Overview & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left items-stretch">
        
        {/* Left Section: Today's Automation Summaries */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white p-5 rounded-2xl border border-[#E7E4DD] shadow-sm relative overflow-hidden">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-normal text-slate-900 tracking-tight font-serif">Today's Performance Summary</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-mono">High-level operational metrics</p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Conversations Tracked</p>
                  <p className="text-lg font-normal font-serif text-[#111827] mt-0.5">{metrics.activeConversations + metrics.pendingTakeovers} Sessions</p>
                </div>
                <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold rounded-md flex items-center gap-1 font-mono border border-emerald-100 shadow-sm">
                  <TrendingUp size={12} />
                  Live
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">AI Resolution Health</p>
                  <p className="text-lg font-normal font-serif text-[#111827] mt-0.5">{metrics.handlingRate}%</p>
                </div>
                <div className="px-2.5 py-1 bg-purple-50 text-[#6D4AFF] text-[9px] font-bold rounded-md font-mono border border-purple-100 shadow-sm">
                  Stable
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Mews API Status</p>
                  <p className="text-lg font-normal font-serif text-[#111827] mt-0.5">{integrations.pms ? 'Active' : 'Offline'}</p>
                </div>
                <div className={`px-2.5 py-1 ${integrations.pms ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} text-[9px] font-bold rounded-md font-mono border shadow-sm`}>
                  {integrations.pms ? 'Synchronized' : 'Issue'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Recent Activity Feed (Clean & Simple) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E7E4DD] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-normal text-slate-900 tracking-tight font-serif">Recent AI Actions</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1 font-mono">Simple automation activity overview</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#6D4AFF] rounded-full animate-pulse" />
                <span className="text-[8.5px] font-bold uppercase text-[#6D4AFF] tracking-wider font-mono">Active Live Feed</span>
              </div>
            </div>

            <div className="divide-y divide-[#E7E4DD] mt-4">
              {activityFeed.length > 0 ? activityFeed.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl ${item.action === 'AI Response' ? 'bg-purple-50 text-[#6D4AFF] border-purple-100' : 'bg-amber-50 text-amber-600 border-amber-100'} flex items-center justify-center shrink-0 border`}>
                    {item.action === 'AI Response' ? <Bot size={14} /> : <Clock size={14} />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-[#111827]">{item.guestName} (Room {item.roomNumber})</p>
                      <span className="text-[10px] text-slate-400 font-semibold font-mono">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {item.details}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400 font-medium italic">No recent activity detected.</div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E7E4DD] flex justify-between items-center">
            <button 
              onClick={() => navigate('/app/conversations')}
              className="text-[9px] font-bold text-[#6D4AFF] hover:text-[#5b21b6] uppercase tracking-wider flex items-center gap-1.5 group font-mono cursor-pointer"
            >
              Open Conversations
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
