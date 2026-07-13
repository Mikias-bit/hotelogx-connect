import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Mail, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Save, 
  RefreshCw, 
  SlidersHorizontal, 
  Users, 
  Lock, 
  Bell 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';

const SuperAdminSettings = () => {
  const { addToast } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [settingsId, setSettingsId] = useState(1);

  // States matching backend schema
  const [globalAutomation, setGlobalAutomation] = useState(true);
  const [confidence, setConfidence] = useState(85);
  const [takeoverToggle, setTakeoverToggle] = useState(true);
  const [escalationLimit, setEscalationLimit] = useState(65);
  const [billingWaiver, setBillingWaiver] = useState(30);
  const [occupancyLimit, setOccupancyLimit] = useState(90);

  const [alerts, setAlerts] = useState({
    systemInterruption: true,
    takeoverPush: true
  });

  // Fetch settings from backend
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const s = data.data;
          setSettingsId(s.id);
          setGlobalAutomation(s.globalAutomation);
          setConfidence(s.confidenceThreshold);
          setTakeoverToggle(s.humanTakeoverEnabled);
          setEscalationLimit(s.escalationThreshold);
          setBillingWaiver(s.billingWaiverLimit);
          setOccupancyLimit(s.occupancyTrigger);
          setAlerts({
            systemInterruption: s.systemAlertsEnabled,
            takeoverPush: s.pushAlertsEnabled
          });
        }
      })
      .catch(err => console.error('Failed to fetch settings:', err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
      globalAutomation,
      confidenceThreshold: confidence,
      humanTakeoverEnabled: takeoverToggle,
      escalationThreshold: escalationLimit,
      billingWaiverLimit: parseFloat(billingWaiver),
      occupancyTrigger: occupancyLimit,
      systemAlertsEnabled: alerts.systemInterruption,
      pushAlertsEnabled: alerts.takeoverPush
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast('System Configurations Synchronized with Database', 'success');
      } else {
        addToast('Failed to save settings', 'error');
      }
    } catch (err) {
      addToast('Backend connectivity issue', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700 pb-16 text-left selection:bg-purple-950 selection:text-amber-100">
      
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 text-left">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-serif tracking-tight">System Settings</h1>
          <p className="text-xs text-slate-400 mt-1 font-semibold">Manage core hotel automation systems, messaging routes, and operational parameters.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md"
        >
          {isSaving ? <RefreshCw size={12} className="animate-spin text-[#A78BFA]" /> : <Save size={12} />}
          {isSaving ? 'Deploying...' : 'Save System Settings'}
        </button>
      </div>

      <div className="space-y-6 text-xs text-slate-600 font-bold">
        
        {/* Row Group 1: Connection & Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Smartphone size={16} className="text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">Communication Channels & PMS</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {/* WhatsApp */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-slate-900 font-black">WhatsApp Business Gateway</p>
                <p className="text-[10px] text-slate-400 font-semibold">Primary outgoing template delivery</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" /> Connected
                </span>
              </div>
            </div>

            {/* Email Gateway */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-slate-900 font-black">Email Reservation Inbox</p>
                <p className="text-[10px] text-slate-400 font-semibold">Automated reservation tracking via email</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full" /> Connected
                </span>
              </div>
            </div>

            {/* PMS Integration */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-slate-900 font-black">Connected PMS: Oracle Opera Cloud</p>
                <p className="text-[10px] text-slate-400 font-semibold">Permissions: Read / Write • Last Synced: 2m ago</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[8px] font-black uppercase tracking-widest">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row Group 2: Team Access & Alerts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Users size={16} className="text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">Team, Permissions & Alerts</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Staff Roles */}
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <p className="text-slate-900 font-black">Active Staff Roles</p>
                <p className="text-[10px] text-slate-400 font-semibold">Super Admin, Hotel Admin, Front Desk, Housekeeping</p>
              </div>
            </div>

            {/* Notification Alert 1 */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left max-w-lg">
                <p className="text-slate-900 font-black">System Interruption email alerts</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Alert administrator group via email immediately if PMS sync fails.</p>
              </div>
              <button 
                onClick={() => setAlerts(prev => ({ ...prev, systemInterruption: !prev.systemInterruption }))}
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 ${alerts.systemInterruption ? 'bg-[#6D28D9]' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${alerts.systemInterruption ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Notification Alert 2 */}
            <div className="py-3.5 flex items-center justify-between gap-4">
              <div className="space-y-0.5 text-left max-w-lg">
                <p className="text-slate-900 font-black">In-app Push Alerts on Takeover</p>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Trigger desktop notifications when any guest session escalates to human takeover.</p>
              </div>
              <button 
                onClick={() => setAlerts(prev => ({ ...prev, takeoverPush: !prev.takeoverPush }))}
                className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 ${alerts.takeoverPush ? 'bg-[#6D28D9]' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${alerts.takeoverPush ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Row Group 3: System Telemetry diagnostics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Activity size={16} className="text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">System Uptime & Health</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-650">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Automation Engine</p>
                <p className="text-slate-950 font-black mt-0.5">99.98% Uptime</p>
              </div>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-650">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PMS Sync Health</p>
                <p className="text-slate-950 font-black mt-0.5">Stable Sync</p>
              </div>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs font-bold text-slate-650">
              <div className="text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">API Connectivity</p>
                <p className="text-slate-950 font-black mt-0.5">Active Link</p>
              </div>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Row Group 4: Account Credentials */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
            <Lock size={16} className="text-purple-600" />
            <h3 className="text-sm font-black text-slate-900">Super Admin Credentials</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 text-left">
               <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Email Address</label>
               <input 
                 type="email" 
                 defaultValue="admin@autopilot.ai"
                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-purple-500/20"
               />
            </div>

            <div className="space-y-1 text-left">
               <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Current Password</label>
               <input 
                 type="password"
                 placeholder="••••••••"
                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-purple-500/20"
               />
            </div>

            <div className="space-y-1 text-left">
               <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">New Password</label>
               <input 
                 type="password"
                 placeholder="••••••••"
                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-purple-500/20"
               />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default SuperAdminSettings;
