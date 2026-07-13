import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  TrendingUp, Users, AlertOctagon, DollarSign, Activity, 
  Building, Landmark, ShieldAlert, FileText, Settings, Download,
  Play, Ban, RefreshCw, ChevronRight, Edit2, Plus, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { Card, Badge, Button, Modal, ConfirmModal } from '../../components/common/UI';
import { API_BASE_URL } from '../../config';

const BillingManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  
  const { 
    adminRevenueMetrics, 
    fetchAdminRevenue,
    adminSubscriptions, 
    fetchAdminSubscriptions,
    adminFailedPayments, 
    fetchAdminFailedPayments,
    adminInvoices, 
    fetchAdminInvoices,
    pauseSubscription,
    changePlan,
    plans,
    fetchPlans,
    addPlan,
    deletePlan
  } = useApp();

  const [loading, setLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [actionType, setActionType] = useState('pause'); // pause, resume, upgrade
  const [selectedPlan, setSelectedPlan] = useState('Professional');
  const [customPrice, setCustomPrice] = useState('');
  const [submittingAction, setSubmittingAction] = useState(false);

  // New plan state
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    price: '',
    duration: 'Monthly',
    features: ''
  });
  const [addingPlan, setAddingPlan] = useState(false);

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAdminRevenue(),
        fetchAdminSubscriptions(),
        fetchAdminFailedPayments(),
        fetchAdminInvoices(),
        fetchPlans()
      ]);
    } catch (err) {
      console.error('Failed to load super admin billing metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (hotel, type) => {
    setSelectedHotel(hotel);
    setActionType(type);
    setSelectedPlan(hotel.planName || 'Professional');
    setCustomPrice(hotel.price ? hotel.price.toString() : '');
    setIsActionModalOpen(true);
  };

  const handleExecuteAction = async () => {
    if (!selectedHotel) return;
    setSubmittingAction(true);
    try {
      if (actionType === 'pause') {
        await pauseSubscription(selectedHotel.id, true);
      } else if (actionType === 'resume') {
        await pauseSubscription(selectedHotel.id, false);
      } else if (actionType === 'upgrade') {
        await changePlan(selectedHotel.id, selectedPlan, customPrice ? parseFloat(customPrice) : null);
      }
      setIsActionModalOpen(false);
      await loadAllData();
    } catch (err) {
      console.error('Error executing admin action:', err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleExecuteAddPlan = async (e) => {
    e.preventDefault();
    if (!newPlanForm.name || !newPlanForm.price) return;
    setAddingPlan(true);
    try {
      await addPlan({
        name: newPlanForm.name,
        price: parseFloat(newPlanForm.price),
        duration: newPlanForm.duration,
        features: newPlanForm.features
      });
      setIsAddPlanModalOpen(false);
      setNewPlanForm({ name: '', price: '', duration: 'Monthly', features: '' });
      await loadAllData();
    } catch (err) {
      console.error('Error creating plan:', err);
    } finally {
      setAddingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="text-primary-600 animate-spin" size={32} />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">Loading Revenue Core Ledger...</p>
      </div>
    );
  }

  const metrics = adminRevenueMetrics || {
    mrr: 0,
    activeCount: 0,
    failedCount: 0,
    lifetimeRevenue: 0,
    planCounts: { Starter: 0, Professional: 0, Pro: 0, Standard: 0, Enterprise: 0 },
    totalSubscriptions: 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left selection:bg-purple-950 selection:text-amber-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E4DD] pb-6">
        <div>
          <h1 className="text-3xl font-normal font-serif text-[#111827] tracking-tight">Billing & Revenue Infrastructure</h1>
          <p className="text-xs text-[#667085] font-medium mt-1">Super Admin platform pricing, active hotel subscriptions and MRR metrics.</p>
        </div>
        <Button onClick={loadAllData} variant="secondary" className="gap-2 text-[10px] uppercase font-mono py-2 bg-white">
          <RefreshCw size={12} /> Sync Ledger
        </Button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-[#E7E4DD] overflow-x-auto scrollbar-hide py-1">
        {[
          { id: 'overview', name: 'Revenue Overview', icon: TrendingUp },
          { id: 'subscriptions', name: 'Hotel Subscriptions', icon: Building },
          { id: 'failed', name: 'Failed Payments', icon: ShieldAlert },
          { id: 'invoices', name: 'Invoices Audit', icon: FileText },
          { id: 'plans', name: 'Plans & Pricing', icon: Settings }
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

      {/* Tab Content Rendering */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* TAB 1: REVENUE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Aggregate Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Monthly Recurring Revenue</p>
                      <p className="text-3xl font-normal font-serif text-[#111827] mt-1">${metrics.mrr.toLocaleString()}</p>
                      <span className="text-[10px] text-emerald-600 font-bold font-mono mt-1 block">Live MRR Ledger</span>
                    </div>
                    <div className="w-10 h-10 bg-primary-50 text-[#6D4AFF] border border-primary-100 rounded-xl flex items-center justify-center">
                      <TrendingUp size={16} />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Cumulative Platform Revenue</p>
                      <p className="text-3xl font-normal font-serif text-[#111827] mt-1">${metrics.lifetimeRevenue.toLocaleString()}</p>
                      <span className="text-[10px] text-slate-400 font-bold font-mono mt-1 block">Settled ACH volume</span>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center">
                      <DollarSign size={16} />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Subscriptions</p>
                      <p className="text-3xl font-normal font-serif text-[#111827] mt-1">{metrics.activeCount}</p>
                      <span className="text-[10px] text-slate-400 font-bold font-mono mt-1 block">Live deployments</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl flex items-center justify-center">
                      <Users size={16} />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Failed Payment Alerts</p>
                      <p className={`text-3xl font-normal font-serif mt-1 ${metrics.failedCount > 0 ? 'text-rose-600 font-bold' : 'text-[#111827]'}`}>{metrics.failedCount}</p>
                      <span className="text-[10px] text-slate-400 font-bold font-mono mt-1 block">Overdue accounts</span>
                    </div>
                    <div className={`w-10 h-10 ${metrics.failedCount > 0 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-slate-50 text-slate-400'} border rounded-xl flex items-center justify-center`}>
                      <AlertOctagon size={16} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Plan Distribution Visualizer */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8 flex flex-col justify-between">
                  <Card title="Plan tier distributions" subtitle="Analysis of standard plan counts and pricing mix across the platform.">
                    <div className="space-y-6 py-4">
                      {[
                        { name: 'Starter Tier ($199/mo)', count: metrics.planCounts.Starter || 0, color: 'bg-blue-500' },
                        { name: 'Professional Tier ($399/mo)', count: (metrics.planCounts.Professional || 0) + (metrics.planCounts.Pro || 0) + (metrics.planCounts.Standard || 0), color: 'bg-primary-500' },
                        { name: 'Enterprise Tier ($799/mo)', count: metrics.planCounts.Enterprise || 0, color: 'bg-purple-500' }
                      ].map((tier, idx) => {
                        const total = metrics.totalSubscriptions || 1;
                        const pct = Math.round((tier.count / total) * 100);
                        return (
                          <div key={idx} className="space-y-2 text-left">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span>{tier.name}</span>
                              <span>{tier.count} Properties ({pct}%)</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-4 flex flex-col justify-between">
                  <Card title="Recent Activity" subtitle="Global financial audit.">
                    <div className="space-y-4 py-2 text-left">
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Platform Health Status</p>
                        <p className="text-base font-normal font-serif text-[#111827] mt-1">Excellent (No Blockages)</p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Dynamic direct debit nodes active.</span>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Next Auto-Billing Cycle</p>
                        <p className="text-base font-normal font-serif text-[#111827] mt-1">Daily Automated Ledger Check</p>
                        <span className="text-[10px] text-slate-400 font-semibold mt-1 block">Processes outstanding ACH files.</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HOTEL SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <Card title="Property Subscription Workspaces" subtitle="Direct access control and billing configuration for hotel environments.">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Hotel Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Plan Tier</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Billing Cycle</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Last Settlement</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Health</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminSubscriptions.map((hotel) => (
                      <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-900">{hotel.hotelName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold font-mono">{hotel.hotelCode || `ID: ${hotel.id}`}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-700">
                          {hotel.planName || 'Professional'}
                          <span className="text-[10px] text-slate-400 block font-normal">${hotel.price}/mo</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-bold font-mono uppercase tracking-wider">{hotel.billingCycle || 'Monthly'}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {hotel.lastPaymentDate ? new Date(hotel.lastPaymentDate).toLocaleDateString() : 'Pending Direct Debit'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={hotel.paymentHealth === 'Healthy' ? 'success' : 'error'}>
                            {hotel.paymentHealth || 'Healthy'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={hotel.status === 'Active' ? 'success' : hotel.status === 'Trial' ? 'indigo' : 'error'}>
                            {hotel.status}
                          </Badge>
                          {hotel.isPaused && <span className="text-[9px] font-bold text-amber-500 block font-mono">PAUSED</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button 
                              variant="secondary"
                              onClick={() => handleActionClick(hotel, 'upgrade')}
                              className="px-2 py-1.5 text-[9px] uppercase font-mono shadow-sm bg-white"
                            >
                              Upgrade
                            </Button>
                            {hotel.status === 'Suspended' || hotel.isPaused ? (
                              <Button 
                                onClick={() => handleActionClick(hotel, 'resume')}
                                className="px-2 py-1.5 text-[9px] uppercase font-mono bg-emerald-600 text-white hover:bg-emerald-700"
                              >
                                Resume
                              </Button>
                            ) : (
                              <Button 
                                variant="danger"
                                onClick={() => handleActionClick(hotel, 'pause')}
                                className="px-2 py-1.5 text-[9px] uppercase font-mono text-white bg-amber-600 hover:bg-amber-700 border-none"
                              >
                                Pause
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {adminSubscriptions.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-medium italic">No workspaces registered.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 3: FAILED PAYMENTS */}
          {activeTab === 'failed' && (
            <Card title="Payment Failures & Overdue Accounts" subtitle="Critical workspaces requiring invoice reconciliations or collection.">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Hotel Property</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Billing Contact</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Price Tier</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Payment Health</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Action Ledger</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminFailedPayments.map((hotel) => (
                      <tr key={hotel.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{hotel.hotelName}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 font-mono">{hotel.billingEmail || hotel.email || 'billing@property.com'}</td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">${hotel.price}/mo</td>
                        <td className="px-6 py-4">
                          <Badge variant="error">{hotel.paymentHealth || 'Critical'}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button 
                            variant="danger" 
                            onClick={() => handleActionClick(hotel, 'pause')}
                            className="px-3 py-1.5 text-[9px] uppercase font-mono bg-rose-600 text-white hover:bg-rose-700"
                          >
                            Suspend Workspace
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {adminFailedPayments.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-400 font-medium italic">All accounts are in good standing. Outstanding balance is $0.00.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 4: INVOICES AUDIT */}
          {activeTab === 'invoices' && (
            <Card title="Global Invoice Ledger" subtitle="Complete central registry of tax and direct debit receipts issued across the ecosystem.">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Reference</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Property</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Settlement Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Plan Tier</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider font-mono text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-slate-900 font-mono">{inv.invoiceNumber || inv.reference}</td>
                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{inv.hotelName}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {new Date(inv.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900">${inv.amount.toFixed(2)}</td>
                        <td className="px-6 py-4"><Badge variant="slate">{inv.planName || 'Professional'}</Badge></td>
                        <td className="px-6 py-4">
                          <Badge variant={inv.status === 'Paid' ? 'success' : 'warning'}>{inv.status}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a 
                            href={`${API_BASE_URL}/api/billing/invoices/${encodeURIComponent(inv.invoiceNumber || inv.reference)}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E7E4DD] hover:border-slate-300 bg-white rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-700 hover:text-slate-950 transition-all font-mono shadow-sm cursor-pointer"
                          >
                            <Download size={10} /> PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                    {adminInvoices.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-slate-400 font-medium italic">No ledger invoices filed.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* TAB 5: PLANS & PRICING */}
          {activeTab === 'plans' && (
            <div className="space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-normal font-serif text-slate-900">Standard Plan Packaging</h3>
                  <p className="text-xs text-slate-500 mt-1">Configure pricing points and metadata for the AutoPilot Hotelogx integration packages.</p>
                </div>
                <Button 
                  onClick={() => setIsAddPlanModalOpen(true)}
                  className="gap-1.5 text-xs font-mono uppercase py-2.5 px-4 bg-[#6D4AFF] hover:bg-[#5b3ce0] text-white font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer animate-pulse"
                >
                  <Plus size={14} /> Add New Plan Tier
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const featureList = plan.features ? plan.features.split(',').map(f => f.trim()) : [];
                  const activeCount = plan.name === 'Starter' ? metrics.planCounts.Starter || 0 :
                                      plan.name === 'Professional' || plan.name === 'Pro' || plan.name === 'Standard' ? (metrics.planCounts.Professional || 0) + (metrics.planCounts.Pro || 0) + (metrics.planCounts.Standard || 0) :
                                      metrics.planCounts[plan.name] || 0;
                  return (
                    <Card key={plan.id} className="relative overflow-hidden group border-2 hover:border-[#6D4AFF]/30 transition-all rounded-2xl flex flex-col justify-between h-full bg-white shadow-sm">
                      <div className="space-y-6 text-left">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-black text-slate-800">{plan.name} Tier</h4>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono mt-1">
                              {plan.duration} Subscription
                            </p>
                          </div>
                          <button 
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to delete the "${plan.name}" plan?`)) {
                                await deletePlan(plan.id);
                                await loadAllData();
                              }
                            }}
                            className="text-slate-300 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Delete Plan Tier"
                          >
                            <Ban size={14} />
                          </button>
                        </div>
                        <p className="text-3.5xl font-black text-primary-600">
                          ${plan.price}
                          <span className="text-xs text-slate-400 font-bold font-mono">/mo</span>
                        </p>
                        
                        <div className="h-[1px] bg-slate-100"></div>
                        
                        <ul className="space-y-2">
                          {featureList.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-650 font-semibold leading-relaxed">
                              <span className="text-[#6D4AFF] shrink-0 mt-1">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Properties</span>
                        <span className="text-sm font-black text-[#111827] bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">{activeCount}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Super Admin Control Actions Modal */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={
          actionType === 'pause' ? 'Confirm Workspace Suspension' :
          actionType === 'resume' ? 'Confirm Workspace Reactivation' :
          `Configure Subscription for ${selectedHotel?.hotelName}`
        }
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsActionModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleExecuteAction}
              disabled={submittingAction}
              variant={actionType === 'pause' ? 'danger' : 'primary'}
              className="font-mono uppercase text-xs py-2 min-w-[120px]"
            >
              {submittingAction ? 'Processing...' : 'Apply Details'}
            </Button>
          </>
        }
      >
        {selectedHotel && (
          <div className="space-y-6 text-left">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
              <h4 className="text-sm font-bold text-slate-900">{selectedHotel.hotelName}</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedHotel.billingEmail || 'billing@property.com'}</p>
            </div>

            {actionType === 'pause' && (
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                Are you sure you want to suspend this hotel workspace? The live AI assistant will be deactivated, blocking all message streams and guest folios. You can restore their environment at any time.
              </p>
            )}

            {actionType === 'resume' && (
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                Are you sure you want to resume this hotel workspace? Direct debit checks and live PMS integrations will trigger immediately.
              </p>
            )}

            {actionType === 'upgrade' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Standard Plan Tier</label>
                  <select 
                    className="input-field" 
                    value={selectedPlan} 
                    onChange={e => setSelectedPlan(e.target.value)}
                  >
                    <option value="Starter">Starter ($199/mo)</option>
                    <option value="Professional">Professional ($399/mo)</option>
                    <option value="Enterprise">Enterprise ($799/mo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Override Custom Pricing (Optional)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={customPrice} 
                    onChange={e => setCustomPrice(e.target.value)} 
                    placeholder="Enter custom overriding price (USD)" 
                  />
                  <span className="text-[9px] font-bold text-slate-400 block mt-1.5 uppercase font-mono">Overrides standard list pricing. Leave blank for standard rates.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Subscription Plan Modal */}
      <Modal
        isOpen={isAddPlanModalOpen}
        onClose={() => setIsAddPlanModalOpen(false)}
        title="Add New Subscription Tier"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsAddPlanModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleExecuteAddPlan}
              disabled={addingPlan}
              className="gap-2 text-xs font-mono uppercase py-2.5 px-5 bg-[#6D4AFF] hover:bg-[#5b3ce0] text-white font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              {addingPlan ? 'Creating Shard...' : 'Create Plan Tier'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleExecuteAddPlan} className="space-y-4 text-left font-sans">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Plan Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Growth"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all"
              value={newPlanForm.name}
              onChange={e => setNewPlanForm({...newPlanForm, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Pricing (USD / mo)</label>
              <input 
                type="number" 
                required
                placeholder="e.g. 299"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all"
                value={newPlanForm.price}
                onChange={e => setNewPlanForm({...newPlanForm, price: e.target.value})}
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Billing Interval</label>
              <select
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all cursor-pointer"
                value={newPlanForm.duration}
                onChange={e => setNewPlanForm({...newPlanForm, duration: e.target.value})}
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Plan Features (Comma-Separated)</label>
            <textarea 
              required
              rows={3}
              placeholder="e.g. Up to 100 Rooms, Deep PMS Integration, 24/7 Priority SLA Response"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all resize-none"
              value={newPlanForm.features}
              onChange={e => setNewPlanForm({...newPlanForm, features: e.target.value})}
            />
            <span className="text-[9px] font-bold text-slate-400 block mt-1.5 uppercase font-mono">Note: Use 'Up to X Rooms' to set the room limits for this plan in the backend automatically.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BillingManagement;
