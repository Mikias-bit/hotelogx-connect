import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, Zap, Shield, Check, AlertCircle, Building, 
  Download, Calendar, Activity, Lock, RefreshCw, Landmark, 
  FileText, CheckCircle2, ArrowUpRight, Ban, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { Card, Badge, Button, Modal, ConfirmModal } from '../components/common/UI';
import { API_BASE_URL } from '../config';
const PLAN_TIERS = [
  {
    id: 'Starter',
    name: 'Starter Tier',
    price: 199,
    rooms: 'Up to 50 Rooms',
    features: [
      'Core AI Guest Assistant',
      'Basic PMS SOP Syncer',
      'WhatsApp Message Gateway',
      'Weekly Performance Logs'
    ],
    color: 'text-blue-600',
    border: 'hover:border-blue-200'
  },
  {
    id: 'Professional',
    name: 'Professional Tier',
    price: 399,
    rooms: 'Up to 150 Rooms',
    features: [
      'Autonomous Resolution Node',
      'Deep Mews PMS Integration',
      'Dual WhatsApp & Email Gateway',
      'Custom RAG SOP Uploads',
      '24/7 Priority SLA Response'
    ],
    color: 'text-primary-600',
    border: 'border-[#6D4AFF] shadow-md ring-2 ring-primary-100',
    popular: true
  },
  {
    id: 'Enterprise',
    name: 'Enterprise Tier',
    price: 799,
    rooms: 'Unlimited Rooms',
    features: [
      'Dedicated Custom AI LLM Shard',
      'Full Multi-Property Control',
      'Custom Integrations API Core',
      'VIP Concierge Handler SOP',
      'Dedicated Account Architect'
    ],
    color: 'text-purple-600',
    border: 'hover:border-purple-200'
  }
];

const SubscriptionBilling = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { 
    user, 
    activeWorkspace, 
    hotels, 
    hotelSubscription, 
    fetchHotelSubscription, 
    updateHotelSubscription, 
    changePlan, 
    pauseSubscription, 
    fetchHotelInvoices,
    plans,
    fetchPlans
  } = useApp();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = useState(false);
  const [isPlanConfirmOpen, setIsPlanConfirmOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [changingPlan, setChangingPlan] = useState(false);

  // Bank Authorization State
  const [bankData, setBankData] = useState({
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    billingEmail: '',
    billingAddress: ''
  });

  const currentHotelId = activeWorkspace?.id || user?.hotelId || hotels[0]?.id;

  useEffect(() => {
    if (currentHotelId) {
      loadData();
    }
  }, [currentHotelId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sub, invs] = await Promise.all([
        fetchHotelSubscription(currentHotelId),
        fetchHotelInvoices(currentHotelId),
        fetchPlans()
      ]);
      setInvoices(invs || []);
      if (sub) {
        setBankData({
          bankAccountName: sub.bankAccountName || '',
          bankAccountNumber: sub.bankAccountNumber ? sub.bankAccountNumber.replace('••••', '') : '',
          bankRoutingNumber: sub.bankRoutingNumber || '',
          billingEmail: sub.billingEmail || sub.email || '',
          billingAddress: sub.billingAddress || ''
        });
      }
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    if (!bankData.bankAccountName || !bankData.bankAccountNumber || !bankData.bankRoutingNumber) {
      return;
    }
    setSaving(true);
    try {
      await updateHotelSubscription(currentHotelId, bankData);
      await loadData(); // Reload refreshed data
    } catch (err) {
      console.error('Error saving bank data:', err);
    } finally {
      setSaving(false);
    }
  };
  const handleConfirmPlanChange = async () => {
    if (!selectedPlan) return;
    setChangingPlan(true);
    try {
      const updated = await changePlan(currentHotelId, selectedPlan.id);
      await loadData();
      setIsPlanConfirmOpen(false);
      
      const isAuthorized = updated?.bankAuthorized ?? sub.bankAuthorized;
      
      if (!isAuthorized) {
        setSearchParams({ tab: 'method' });
      } else {
        setSearchParams({ tab: 'overview' });
      }
    } catch (err) {
      console.error('Error changing plan:', err);
    } finally {
      setChangingPlan(false);
      setSelectedPlan(null);
    }
  };

  const handleTogglePause = async () => {
    try {
      const isCurrentlyPaused = hotelSubscription?.isPaused || hotelSubscription?.status === 'Suspended';
      await pauseSubscription(currentHotelId, !isCurrentlyPaused);
      setIsPauseConfirmOpen(false);
      await loadData();
    } catch (err) {
      console.error('Error pausing subscription:', err);
    }
  };

  const getPlanDetails = (planName) => {
    const plans = {
      Starter: { rooms: 50, price: 199, desc: 'Ideal for boutique hotels & guest houses.' },
      Professional: { rooms: 150, price: 399, desc: 'Advanced AI automation for growing hotels.' },
      Pro: { rooms: 150, price: 399, desc: 'Advanced AI automation for growing hotels.' },
      Standard: { rooms: 150, price: 399, desc: 'Advanced AI automation for growing hotels.' },
      Enterprise: { rooms: 'Unlimited', price: 799, desc: 'Complete enterprise workspace integration.' }
    };
    return plans[planName] || plans.Professional;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="text-primary-600 animate-spin" size={32} />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Loading Subscription Portal...</p>
      </div>
    );
  }

  const sub = hotelSubscription || {
    planName: 'Professional',
    price: 399,
    status: 'Active',
    paymentHealth: 'Healthy',
    roomCount: 150,
    bankAuthorized: true
  };

  const planDetails = getPlanDetails(sub.planName);

  const currentPlans = plans.length > 0 ? plans.map(p => ({
    id: p.name,
    name: `${p.name} Tier`,
    price: p.price,
    rooms: p.features.toLowerCase().includes('rooms') ? p.features.split(',').find(f => f.toLowerCase().includes('rooms')).trim() : 'Standard Allocation',
    features: p.features ? p.features.split(',').map(f => f.trim()) : [],
    color: p.name === 'Starter' ? 'text-blue-600' : p.name === 'Enterprise' ? 'text-purple-600' : 'text-primary-600',
    border: p.name === 'Professional' || p.name === 'Standard' || p.name === 'Pro' ? 'border-[#6D4AFF] shadow-md ring-2 ring-primary-100' : 'hover:border-purple-200',
    popular: p.name === 'Professional' || p.name === 'Standard' || p.name === 'Pro'
  })) : PLAN_TIERS;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left selection:bg-purple-950 selection:text-amber-100">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E4DD] pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">Subscription & Billing Control Center</h1>
          <p className="text-xs text-[#667085] font-medium mt-1">Manage your active Hotelogx product plans, automated direct debit, and invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Status:</span>
          <Badge variant={sub.status === 'Active' ? 'success' : sub.status === 'Trial' ? 'indigo' : 'error'}>
            {sub.status || 'Active'}
          </Badge>
          {sub.isPaused && <Badge variant="warning">Paused</Badge>}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-[#E7E4DD] overflow-x-auto scrollbar-hide py-1">
        {[
          { id: 'overview', name: 'Overview', icon: Building },
          { id: 'history', name: 'Payment History', icon: Activity },
          { id: 'invoices', name: 'Invoices', icon: FileText },
          { id: 'plans', name: 'Plan Management', icon: Zap },
          { id: 'method', name: 'Payment Method', icon: Landmark }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'border-[#6D4AFF] text-[#6D4AFF]' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={14} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Active Plan Card */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="relative overflow-hidden border-2 border-primary-200">
                  <div className="absolute top-0 right-0 p-6">
                    <Zap className="text-primary-500 animate-pulse" size={24} />
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Current Plan</p>
                      <h2 className="text-3xl font-normal font-serif text-[#111827] mt-1">AutoPilot {sub.planName || 'Professional'}</h2>
                      <p className="text-xs text-[#667085] mt-1">{planDetails.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-[#E7E4DD]">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Monthly Cost</p>
                        <p className="text-lg font-black text-slate-900 mt-1">${sub.price || 399}/mo</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Total Rooms</p>
                        <p className="text-lg font-black text-slate-900 mt-1">{sub.roomCount || 150} Rooms</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Payment Health</p>
                        <div className="mt-1">
                          <Badge variant={sub.paymentHealth === 'Healthy' ? 'success' : 'error'}>
                            {sub.paymentHealth || 'Healthy'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Renewal Date</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">
                          {sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-6 border-t border-[#E7E4DD]">
                      <Button onClick={() => setSearchParams({ tab: 'plans' })} className="gap-2 text-[10px] uppercase font-mono py-2.5">
                        <Zap size={14} /> Change Shard Plan
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={() => setIsPauseConfirmOpen(true)} 
                        className="gap-2 text-[10px] uppercase font-mono py-2.5"
                      >
                        {sub.isPaused ? <Play size={14} className="text-emerald-600" /> : <Ban size={14} className="text-amber-600" />}
                        {sub.isPaused ? 'Resume Subscription' : 'Pause Subscription'}
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Visual Billing Lifecycle & Workspace Flow */}
                <Card 
                  title="Workspace Onboarding & Billing Lifecycle" 
                  subtitle="Visual roadmap of how this integration was initialized by Super Admin and activated via Bank Direct Debit."
                >
                  <div className="pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                      {/* Step 1: Workspace Setup */}
                      <div className="flex flex-col space-y-2.5 relative p-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-left">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-200 text-[#6D4AFF] text-[10px] font-black font-mono flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">1. Workspace Setup</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                          Super Admin reviewed the onboarding request, verified Mews/WhatsApp integration API credentials, and activated your dedicated multi-tenant container environment.
                        </p>
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider w-fit">
                          Activated by Admin
                        </span>
                      </div>

                      {/* Step 2: Bank Authorization */}
                      <div className={`flex flex-col space-y-2.5 relative p-4 border rounded-2xl text-left transition-all ${sub.bankAuthorized ? 'bg-slate-50/50 border-slate-100' : 'bg-amber-50/10 border-amber-100 ring-1 ring-amber-100/30'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full text-[10px] font-black font-mono flex items-center justify-center shrink-0 ${sub.bankAuthorized ? 'bg-indigo-50 border-indigo-200 text-[#6D4AFF]' : 'bg-amber-50 border border-amber-200 text-amber-600 animate-pulse'}`}>
                            {sub.bankAuthorized ? <Check size={11} strokeWidth={3} /> : '02'}
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">2. Bank ACH Link</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                          Property manager submits bank direct debit details using the secure ACH authorization form below to link billing.
                        </p>
                        {sub.bankAuthorized ? (
                          <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider w-fit">
                            ACH Linked
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider w-fit animate-pulse">
                            Action Required
                          </span>
                        )}
                      </div>

                      {/* Step 3: Automated Billing */}
                      <div className={`flex flex-col space-y-2.5 relative p-4 border rounded-2xl text-left transition-all ${sub.bankAuthorized && sub.status === 'Active' ? 'bg-indigo-50/20 border-indigo-150 ring-1 ring-indigo-100/50' : 'bg-slate-50/30 border-slate-100 opacity-75'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full text-[10px] font-black font-mono flex items-center justify-center shrink-0 ${sub.bankAuthorized && sub.status === 'Active' ? 'bg-[#6D4AFF] text-white border border-[#6D4AFF]' : 'bg-slate-100 border border-slate-200 text-slate-400'}`}>
                            {sub.bankAuthorized && sub.status === 'Active' ? <RefreshCw size={10} className="animate-spin" /> : '03'}
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">3. Auto-Billing Ledger</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                          Automatic monthly billing becomes active. Direct debit receipts are generated instantly and logged in Payment History.
                        </p>
                        {sub.bankAuthorized && sub.status === 'Active' ? (
                          <span className="text-[8px] font-black text-[#6D4AFF] bg-indigo-50 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider w-fit">
                            Active Cycle
                          </span>
                        ) : (
                          <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md uppercase font-mono tracking-wider w-fit">
                            Awaiting Step 2
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Direct Debit Bank Status */}
                <Card title="Bank Direct Debit Authorization" subtitle="Automated clearing house (ACH) setup.">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-[#FAF9F6] border border-[#E7E4DD] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl border border-[#E7E4DD] flex items-center justify-center text-slate-700">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {sub.bankAuthorized ? `Bank ACH Transfer (Authorized)` : 'Direct Debit Not Authorized'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {sub.bankAccountNumber ? `Account Ending in ${sub.bankAccountNumber}` : 'Please configure direct debit credentials.'}
                        </p>
                      </div>
                    </div>
                    {sub.bankAuthorized ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider font-mono">
                        <CheckCircle2 size={12} /> Active Debit
                      </span>
                    ) : (
                      <Button onClick={() => setSearchParams({ tab: 'method' })} className="text-[10px] font-mono py-2">
                        Authorize Now
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              {/* Sidebar Usage Gauge */}
              <div className="lg:col-span-4 space-y-6">
                <Card title="AI Message Volumetrics" subtitle="Monthly transaction quota.">
                  {(() => {
                    const getPlanQuota = (planName) => {
                      const quotas = {
                        Starter: 2000,
                        Professional: 10000,
                        Pro: 10000,
                        Standard: 10000,
                        Enterprise: 50000
                      };
                      return quotas[planName] || 10000;
                    };

                    const quotaMax = getPlanQuota(sub.planName);
                    // Use database monthlyUsage if populated, else seed realistic metrics dynamically based on hotel ID
                    const currentUsage = Math.min(quotaMax, Math.round(sub.monthlyUsage || ((currentHotelId * 980) % (quotaMax - 1000)) + 1500));
                    const usagePercentage = Math.round((currentUsage / quotaMax) * 100);
                    
                    return (
                      <div className="flex flex-col items-center py-6 text-center space-y-6">
                        {/* circular progress bar container */}
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Track circle */}
                            <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                            {/* Active gauge gradient */}
                            <circle cx="50" cy="50" r="40" stroke="#6D4AFF" strokeWidth="8" fill="transparent"
                              strokeDasharray="251.2"
                              strokeDashoffset={251.2 - (251.2 * usagePercentage) / 100}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-3xl font-normal font-serif text-slate-900">{usagePercentage}%</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono mt-0.5">Usage</span>
                          </div>
                        </div>

                        <div className="space-y-1 w-full text-left font-sans">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>Messages Transacted</span>
                            <span>{currentUsage.toLocaleString()} / {quotaMax.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-[#6D4AFF] rounded-full" style={{ width: `${usagePercentage}%` }}></div>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold italic mt-1.5">Quota resets in 12 days.</p>
                        </div>
                      </div>
                    );
                  })()}
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Payment Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-white border border-[#E7E4DD] rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Payment Channel</span>
                    <span className="text-xs font-black text-slate-900 mt-1 block">Secure ACH Direct Debit</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#6D4AFF]">
                    <Landmark size={14} />
                  </div>
                </div>
                <div className="p-4 bg-white border border-[#E7E4DD] rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Ledger History</span>
                    <span className="text-xs font-black text-slate-900 mt-1 block">{invoices.length} Transactions Settled</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#6D4AFF]">
                    <Activity size={14} />
                  </div>
                </div>
                <div className="p-4 bg-white border border-[#E7E4DD] rounded-2xl flex items-center justify-between shadow-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Billing Gateway Status</span>
                    <span className="text-xs font-black text-emerald-700 mt-1 block flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Active & Secure</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#6D4AFF]">
                    <Shield size={14} />
                  </div>
                </div>
              </div>

              <Card title="Payment & Settlement History" subtitle="List of real-time transactions processed via Direct Debit.">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Reference</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Settlement Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Payment Method</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Amount (USD)</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 font-mono">{inv.reference}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-bold uppercase tracking-wider font-mono">
                          {inv.paymentMethod || 'Bank Transfer'}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">${inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>
                            {inv.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">No settlement history found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            </div>
          )}

          {/* TAB 3: INVOICES */}
          {activeTab === 'invoices' && (
            <Card title="Downloadable Tax Invoices" subtitle="Retrieve official tax receipts for your records.">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Invoice ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Billing Cycle</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Plan Tier</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                          <FileText size={16} className="text-slate-400" />
                          <span className="font-mono">{inv.invoiceNumber || inv.reference}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(inv.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="slate">{inv.planName || 'Professional'}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">${inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <a 
                            href={`${API_BASE_URL}/api/billing/invoices/${encodeURIComponent(inv.invoiceNumber || inv.reference)}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E4DD] hover:border-slate-300 bg-white rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 transition-all font-mono shadow-sm cursor-pointer"
                          >
                            <Download size={12} /> Receipt
                          </a>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">No dynamic invoices available.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: PLAN MANAGEMENT */}
          {activeTab === 'plans' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-normal font-serif text-slate-900">Select AutoPilot Subscription Tier</h3>
                <p className="text-xs text-slate-500 mt-1">Upgrade or downgrade your live integration shard instantly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {currentPlans.map((plan) => {
                  const isCurrent = sub.planName === plan.id || (plan.id === 'Professional' && (sub.planName === 'Pro' || sub.planName === 'Standard'));
                  return (
                    <Card 
                      key={plan.id} 
                      className={`relative flex flex-col justify-between h-full bg-white transition-all duration-300 border-2 ${plan.border}`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0 transform translate-x-[-16px] translate-y-[-12px]">
                          <Badge variant="primary">Popular Choice</Badge>
                        </div>
                      )}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xl font-black text-slate-800">{plan.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mt-1">{plan.rooms}</p>
                        </div>

                        <div className="flex items-baseline">
                          <span className="text-4xl font-black text-slate-900">${plan.price}</span>
                          <span className="text-xs text-slate-400 font-bold font-mono">/mo</span>
                        </div>

                        <div className="h-[1px] bg-slate-100"></div>

                        <ul className="space-y-3.5">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                              <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-8">
                        {isCurrent ? (
                          <div className="w-full py-2.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider font-mono rounded-xl text-center">
                            Currently Active
                          </div>
                        ) : (
                          <Button 
                            onClick={() => {
                              setSelectedPlan(plan);
                              setIsPlanConfirmOpen(true);
                            }}
                            className="w-full gap-2 text-xs font-mono uppercase py-2.5"
                          >
                            Select Shard Tier <ArrowUpRight size={14} />
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT METHOD */}
          {activeTab === 'method' && (() => {
            const activePlanTier = currentPlans.find(p => p.id === sub.planName) || 
                                   currentPlans.find(p => p.id === 'Professional') || 
                                   currentPlans[1] || PLAN_TIERS[1];
            return (
              <div className="space-y-6">
                {/* Selected Plan Premium Banner */}
                <div className="p-6 bg-gradient-to-br from-indigo-50/60 via-purple-50/60 to-pink-50/40 border border-indigo-100 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-indigo-100 flex items-center justify-center text-[#6D4AFF] shadow-xs shrink-0">
                      <Zap className="animate-pulse" size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#6D4AFF] uppercase tracking-widest font-mono">Selected SaaS Integration Plan</span>
                        <Badge variant="indigo" className="text-[8px] px-2 py-0.5 font-mono font-bold tracking-wider">Awaiting Authorization</Badge>
                      </div>
                      <h4 className="text-lg font-black text-slate-800 mt-1">
                        AutoPilot {activePlanTier.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        {activePlanTier.rooms} • Dedicated multi-tenant isolated database container Shard active
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white border border-[#E7E4DD] px-4.5 py-2.5 rounded-2xl w-fit">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Rate:</span>
                    <span className="text-xl font-black text-slate-900">${activePlanTier.price}</span>
                    <span className="text-xs text-slate-400 font-bold font-mono">/mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-8">
                  <Card title="Bank Direct Debit Authorization" subtitle="Complete the ACH authorization to establish automatic monthly billing.">
                    <form onSubmit={handleSaveBankDetails} className="space-y-6 text-left">
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Billing Email Address</label>
                          <input 
                            type="email" 
                            required
                            className="input-field" 
                            value={bankData.billingEmail} 
                            onChange={e => setBankData({...bankData, billingEmail: e.target.value})} 
                            placeholder="billing@hotelproperty.com" 
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bank Account Name</label>
                            <input 
                              type="text" 
                              required
                              className="input-field" 
                              value={bankData.bankAccountName} 
                              onChange={e => setBankData({...bankData, bankAccountName: e.target.value})} 
                              placeholder="e.g. Grand Palace Hotels LLC" 
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Routing Transit Number (9 digits)</label>
                            <input 
                              type="text" 
                              required
                              maxLength={9}
                              pattern="\d{9}"
                              className="input-field" 
                              value={bankData.bankRoutingNumber} 
                              onChange={e => setBankData({...bankData, bankRoutingNumber: e.target.value})} 
                              placeholder="e.g. 121000248" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Bank Account Number</label>
                            <input 
                              type="text" 
                              required
                              className="input-field" 
                              value={bankData.bankAccountNumber} 
                              onChange={e => setBankData({...bankData, bankAccountNumber: e.target.value})} 
                              placeholder="e.g. 1029384756" 
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Billing Legal Address</label>
                            <input 
                              type="text" 
                              required
                              className="input-field" 
                              value={bankData.billingAddress} 
                              onChange={e => setBankData({...bankData, billingAddress: e.target.value})} 
                              placeholder="e.g. 500 Luxury Ave, Suite 10, New York, NY" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* Direct Debit Consent Notice */}
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                        <Shield className="text-[#6D4AFF] shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                          By submitting this form, you authorize AutoPilot.ai (Hotelogx Shard Ecosystem) to electronically debit your bank account for monthly subscription fees on the renewal date. You confirm you possess the power to bind the organization and authorized bank account details.
                        </p>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-[#E7E4DD]">
                        <Button 
                          type="submit" 
                          disabled={saving}
                          className="gap-2 text-xs uppercase font-mono py-2.5 min-w-[160px]"
                        >
                          {saving ? (
                            <>
                              <RefreshCw className="animate-spin" size={12} />
                              Authorizing...
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> Save & Authorize ACH
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-4 space-y-6">
                  <Card title="Subscription Summary" subtitle="Billing details for your active container Shard.">
                    <div className="space-y-6 pt-2 text-left">
                      {/* Plan Specs Header */}
                      <div className="p-5 bg-gradient-to-br from-indigo-50/40 to-purple-50/40 border border-indigo-100 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Zap size={40} className="text-[#6D4AFF]" />
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Selected Tier</p>
                        <h4 className="text-lg font-black text-slate-800 mt-1">AutoPilot {activePlanTier.id}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mt-0.5">{activePlanTier.rooms}</p>
                        <div className="flex items-baseline mt-4">
                          <span className="text-3.5xl font-black text-[#6D4AFF]">${activePlanTier.price}</span>
                          <span className="text-xs text-slate-400 font-bold font-mono">/mo</span>
                        </div>
                      </div>

                      {/* Plan Features */}
                      <div className="space-y-3 pb-6 border-b border-slate-100">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Features Included:</p>
                        <ul className="space-y-2.5">
                          {activePlanTier.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-[11px] text-slate-600 font-medium">
                              <Check size={13} className="text-[#6D4AFF] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recur pricing summary */}
                      <div className="space-y-2.5 text-xs font-semibold">
                        <div className="flex justify-between text-slate-500">
                          <span>Monthly Service Charge</span>
                          <span>${activePlanTier.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                          <span>Setup / Integration Fee</span>
                          <span className="text-emerald-600 font-bold">FREE</span>
                        </div>
                        <div className="h-[1px] bg-slate-100 my-2"></div>
                        <div className="flex justify-between text-slate-900 font-bold">
                          <span>Recurring Charge</span>
                          <span className="text-[#6D4AFF]">${activePlanTier.price.toFixed(2)}/mo</span>
                        </div>
                      </div>

                      {/* SSL notice */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 justify-center">
                        <Lock size={12} className="text-slate-400 shrink-0" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                          Bank-Grade 256-Bit SSL Security
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              </div>
            );
          })()}
        </motion.div>
      </AnimatePresence>

      {/* Subscription Pause Confirm Modal */}
      <ConfirmModal
        isOpen={isPauseConfirmOpen}
        onClose={() => setIsPauseConfirmOpen(false)}
        onConfirm={handleTogglePause}
        title={sub.isPaused ? 'Resume Subscription' : 'Pause Shard Subscription'}
        message={
          sub.isPaused 
            ? 'Are you sure you want to resume your subscription? Your monthly billing cycle and live AI guest responses will reactivate immediately.'
            : 'Are you sure you want to pause your subscription? This will suspend all autonomous live guest messaging on Mews PMS and WhatsApp channels.'
        }
        confirmText={sub.isPaused ? 'Resume Now' : 'Pause Workspace'}
        variant={sub.isPaused ? 'primary' : 'danger'}
      />

      {/* Plan Selection Confirmation Modal */}
      <Modal
        isOpen={isPlanConfirmOpen}
        onClose={() => {
          if (!changingPlan) {
            setIsPlanConfirmOpen(false);
            setSelectedPlan(null);
          }
        }}
        title="Confirm Shard Plan Selection"
        footer={
          <>
            <Button 
              variant="secondary" 
              onClick={() => {
                setIsPlanConfirmOpen(false);
                setSelectedPlan(null);
              }}
              disabled={changingPlan}
              className="px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-slate-500 hover:text-slate-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmPlanChange}
              disabled={changingPlan}
              className="gap-2 text-xs font-mono uppercase py-2.5 px-5 bg-[#6D4AFF] hover:bg-[#5b3ce0] text-white font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              {changingPlan ? (
                <>
                  <RefreshCw className="animate-spin" size={12} />
                  Updating Shard...
                </>
              ) : (
                <>
                  Confirm Plan <Check size={14} />
                </>
              )}
            </Button>
          </>
        }
      >
        {selectedPlan && (
          <div className="space-y-6 text-left">
            {/* Plan Comparison Info */}
            <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100 rounded-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Current Active Shard</p>
                  <p className="text-sm font-black text-slate-800">AutoPilot {sub.planName || 'Professional'}</p>
                  <p className="text-xs font-mono text-slate-500">${sub.price || 399}/mo</p>
                </div>
                <div className="p-2.5 bg-indigo-50 rounded-xl text-[#6D4AFF] shrink-0">
                  <ArrowUpRight size={20} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">New Target Shard</p>
                  <p className="text-sm font-black text-[#6D4AFF]">AutoPilot {selectedPlan.id}</p>
                  <p className="text-xs font-mono text-[#6D4AFF]">${selectedPlan.price}/mo</p>
                </div>
              </div>
            </div>

            {/* Feature Highlights of selected plan */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Selected Plan Features:</p>
              <ul className="grid grid-cols-1 gap-2.5">
                {selectedPlan.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                    <Check size={14} className="text-[#6D4AFF] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lifecycle Guidance Alert */}
            {!sub.bankAuthorized ? (
              <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider font-mono">Direct Debit Authorization Required</p>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                    Your preference has been set to the <strong className="text-slate-900 font-bold">{selectedPlan.name}</strong>. However, as this workspace is still in trial mode, you must authorize bank direct debit to activate your recurring monthly billing and fully unlock your live agent environment.
                  </p>
                  <p className="text-[10px] text-[#6D4AFF] font-bold mt-1.5 flex items-center gap-1">
                    Next step: You will be redirected to the Payment Method tab.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider font-mono">Immediate Automated Transition</p>
                  <p className="text-[10.5px] text-slate-600 leading-relaxed font-medium">
                    Your active direct debit is already authorized. Confirming this action will immediately transition your container shard to the <strong className="text-slate-900 font-bold">{selectedPlan.name}</strong>. Your updated rate of <strong className="text-slate-900 font-bold">${selectedPlan.price}/mo</strong> will apply starting the next billing cycle.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SubscriptionBilling;
