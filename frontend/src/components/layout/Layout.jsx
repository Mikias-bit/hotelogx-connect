import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useApp, ROLES } from '../../context/AppContext';
import { ToastContainer } from '../common/UI';
import { Lock, ShieldAlert, ArrowRight } from 'lucide-react';

export const Layout = () => {
  const { toasts, activeWorkspace, role, hotelSubscription } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const isEdgeToEdge = location.pathname.includes('/conversations') || location.pathname.includes('/takeover-queue') || location.pathname.includes('/takeover_queue');

  const isLocked = role !== ROLES.SUPER_ADMIN && hotelSubscription && (
    hotelSubscription.status === 'Trial' || 
    hotelSubscription.status === 'Suspended' || 
    hotelSubscription.status === 'Failed Payment' ||
    hotelSubscription.status === 'Payment Pending'
  );

  const isBillingRoute = location.pathname.includes('/subscription-billing') || location.pathname.includes('/subscription_billing');
  const showLockScreen = isLocked && !isBillingRoute;
  const edgeTopClass = activeWorkspace ? 'top-[108px]' : 'top-16';
  const mainClassName = isEdgeToEdge
    ? `fixed ${edgeTopClass} left-0 right-0 bottom-0 lg:left-64 overflow-hidden px-0 pt-0 sm:pt-2 sm:px-6 lg:px-8 lg:pt-2 pb-2 transition-all`
    : `flex-1 ${activeWorkspace ? 'mt-[108px]' : 'mt-16'} overflow-x-hidden px-2 pt-1.5 sm:pt-2 sm:px-6 lg:px-8 lg:pt-2 pb-8 transition-all relative`;

  const renderLockScreen = () => {
    const isSuspended = hotelSubscription?.status === 'Suspended' || hotelSubscription?.status === 'Failed Payment';
    return (
      <div className="absolute inset-0 bg-[#F7F6F3]/50 backdrop-blur-sm z-40 flex items-center justify-center p-4 sm:p-8 select-none">
        <div className="max-w-2xl w-full bg-white/95 border border-[#E7E4DD] rounded-[32px] p-6 sm:p-12 shadow-2xl text-center space-y-6 sm:space-y-8 relative overflow-hidden">
          {/* Accent high-end top border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-[#6D4AFF] to-purple-600" />
          
          {/* Large elegant pulsing lock / shield */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#6D4AFF]/10 rounded-3xl blur-xl animate-pulse" />
              <div className="w-16 h-16 bg-[#0B1020] text-white rounded-2xl flex items-center justify-center border border-white/10 shadow-lg relative z-10">
                {isSuspended ? (
                  <ShieldAlert className="w-8 h-8 text-rose-500 animate-bounce" />
                ) : (
                  <Lock className="w-8 h-8 text-[#6D4AFF]" />
                )}
              </div>
            </div>
          </div>
          
          {/* Header Typography */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-[#6D4AFF] uppercase font-mono bg-purple-50 px-3 py-1 rounded-full border border-purple-100">
              {isSuspended ? 'Service Suspension Alert' : 'System Deployment Successful'}
            </span>
            <h1 className="text-2xl sm:text-4xl font-normal font-serif text-[#111827] tracking-tight leading-tight">
              {isSuspended ? (
                <>Your AI Automation Engine is <span className="italic font-light text-rose-600">suspended</span></>
              ) : (
                <>Your workspace is provisioned. <br/>Awaiting <span className="italic font-light text-[#6D4AFF]">billing activation</span></>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium leading-relaxed">
              {isSuspended ? (
                "Your automated live agents, WhatsApp nodes, and PMS channels have been deactivated due to failed monthly payment. Update your direct debit authorization to restore operational access."
              ) : (
                "Excellent! The Super Admin has provisioned your dedicated isolated virtual database shard and integrated Mews & WhatsApp. To activate recurring monthly autopilot customer interactions, please authorize your recurring monthly direct debit subscription."
              )}
            </p>
          </div>

          {/* Integration Node Visual Hierarchy (Premium Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
            <div className="bg-[#FAF9F6] border border-[#E7E4DD] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-sm">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">Workspace Node</span>
              <span className="text-xs font-bold text-slate-800 truncate" title={hotelSubscription?.hotelName || activeWorkspace?.name || 'Grand Resort'}>
                {hotelSubscription?.hotelName || activeWorkspace?.name || 'Grand Resort'}
              </span>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E7E4DD] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-sm">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">PMS Sync</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">Connected</span>
              </div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E7E4DD] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-sm">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">WhatsApp Node</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">Ready</span>
              </div>
            </div>
            <div className="bg-[#FAF9F6] border border-[#E7E4DD] rounded-2xl p-4 flex flex-col justify-between space-y-2 shadow-sm">
              <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">AI Agent Status</span>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 ${isSuspended ? 'bg-rose-500' : 'bg-amber-500'} rounded-full`} />
                <span className={`text-xs font-bold ${isSuspended ? 'text-rose-700' : 'text-amber-700'} uppercase tracking-wider font-mono`}>
                  {isSuspended ? 'Offline' : 'Standby'}
                </span>
              </div>
            </div>
          </div>

          {/* Premium Call to Action */}
          <div className="pt-2 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate('/app/subscription-billing?tab=method')}
              className="px-8 py-4 bg-[#6D4AFF] hover:bg-purple-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg hover:shadow-xl shadow-purple-200 cursor-pointer w-full sm:w-auto justify-center"
            >
              {isSuspended ? 'Update Billing Details' : 'Authorize direct debit to activate'}
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/app/subscription-billing?tab=plans')}
              className="px-8 py-4 bg-[#FAF9F6] hover:bg-[#F7F6F3] text-slate-700 border border-[#E7E4DD] rounded-2xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer w-full sm:w-auto justify-center"
            >
              View Service Plans
            </button>
          </div>
          
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            🔒 AutoPilot Multi-Tenant Secure Payment Shield
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-[#F7F6F3] flex min-w-0">
      <Sidebar />
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col min-w-0 relative">
        <Navbar />
        <main className={mainClassName}>
          <div className={`max-w-[1600px] mx-auto w-full ${isEdgeToEdge ? 'h-full min-h-0' : 'min-h-[calc(100vh-160px)]'} relative`}>
            <div className={`${showLockScreen ? "filter blur-[3px] pointer-events-none select-none" : ""} ${isEdgeToEdge ? 'h-full min-h-0' : ''}`}>
              <Outlet />
            </div>
            {showLockScreen && renderLockScreen()}
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
};
