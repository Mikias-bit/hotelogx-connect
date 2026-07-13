import React, { useState } from 'react';
import { 
  Building2, 
  CreditCard, 
  Bell, 
  User, 
  Save,
  Lock
} from 'lucide-react';
import { Card, Button, Badge } from '../components/common/UI';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

const HotelSettings = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState('Hotel Info');
  
  const [hotelInfo, setHotelInfo] = useState({
    name: 'Grand AutoPilot Resort',
    location: 'New York, USA',
    contact: '+1 234 567 8900',
    email: 'contact@grandresort.com'
  });

  const [billingSettings, setBillingSettings] = useState({
    taxPercentage: 12,
    currency: 'USD',
    invoicePrefix: 'INV-',
    methods: { cash: true, card: true, upi: false }
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    bookingConfirmations: true,
    paymentReminders: false
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { title: 'Hotel Info', icon: Building2, desc: 'Basic property details' },
    { title: 'Billing Settings', icon: CreditCard, desc: 'Tax and payment rules' },
    { title: 'Notifications', icon: Bell, desc: 'System alert preferences' },
    { title: 'Profile', icon: User, desc: 'Account security' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    addToast(`${activeTab} updated successfully!`, 'success');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Hotel Info':
        return (
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Hotel Name</label>
                <input type="text" className="input-field h-12" value={hotelInfo.name} onChange={e => setHotelInfo({...hotelInfo, name: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                <input type="text" className="input-field h-12" value={hotelInfo.location} onChange={e => setHotelInfo({...hotelInfo, location: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Contact Number</label>
                <input type="text" className="input-field h-12" value={hotelInfo.contact} onChange={e => setHotelInfo({...hotelInfo, contact: e.target.value})} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Email Address</label>
                <input type="email" className="input-field h-12" value={hotelInfo.email} onChange={e => setHotelInfo({...hotelInfo, email: e.target.value})} />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button type="submit" className="gap-2 px-8 h-12"><Save size={16} /> Save Details</Button>
            </div>
          </form>
        );

      case 'Billing Settings':
        return (
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tax Percentage (%)</label>
                <input type="number" className="input-field h-12" value={billingSettings.taxPercentage} onChange={e => setBillingSettings({...billingSettings, taxPercentage: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Currency</label>
                <select className="input-field h-12" value={billingSettings.currency} onChange={e => setBillingSettings({...billingSettings, currency: e.target.value})}>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Invoice Prefix</label>
                <input type="text" className="input-field h-12" value={billingSettings.invoicePrefix} onChange={e => setBillingSettings({...billingSettings, invoicePrefix: e.target.value})} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Accepted Payment Methods</label>
              <div className="space-y-3">
                {[
                  { key: 'cash', label: 'Cash Payments' },
                  { key: 'card', label: 'Credit / Debit Cards' },
                  { key: 'upi', label: 'UPI / Digital Wallets' }
                ].map((method) => (
                  <div key={method.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{method.label}</span>
                    <button 
                      type="button"
                      onClick={() => setBillingSettings({...billingSettings, methods: {...billingSettings.methods, [method.key]: !billingSettings.methods[method.key]}})}
                      className={cn(
                        "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative",
                        billingSettings.methods[method.key] ? "bg-primary-600" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 bg-white rounded-full transition-all shadow-sm absolute top-1",
                        billingSettings.methods[method.key] ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <Button type="submit" className="gap-2 px-8 h-12"><Save size={16} /> Save Billing</Button>
            </div>
          </form>
        );

      case 'Notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {[
                { key: 'emailAlerts', label: 'Global Email Alerts', desc: 'Receive system alerts via email' },
                { key: 'bookingConfirmations', label: 'Booking Confirmations', desc: 'Alert when a new booking is created' },
                { key: 'paymentReminders', label: 'Payment Reminders', desc: 'Alert for pending or failed payments' }
              ].map((notif) => (
                <div key={notif.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{notif.label}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{notif.desc}</p>
                  </div>
                  <button 
                    onClick={() => setNotifications({...notifications, [notif.key]: !notifications[notif.key]})}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 cursor-pointer transition-colors relative",
                      notifications[notif.key] ? "bg-primary-600" : "bg-slate-300"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 bg-white rounded-full transition-all shadow-sm absolute top-1",
                      notifications[notif.key] ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Profile':
        return (
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            addToast('Password updated successfully!', 'success');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
          }}>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3 mb-6">
              <Lock className="text-amber-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                Change your account password below. For your security, you will be logged out of all other active sessions after changing your password.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Current Password</label>
                <input type="password" required className="input-field h-12" value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">New Password</label>
                <input type="password" required className="input-field h-12" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Confirm New Password</label>
                <input type="password" required className="input-field h-12" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} />
              </div>
            </div>
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Button type="submit" className="gap-2 px-8 h-12"><Lock size={16} /> Update Password</Button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hotel Settings</h1>
        <p className="text-slate-500 mt-1">Manage essential hotel configuration and preferences.</p>
      </div>

      {/* Mobile Nav */}
      <div className="lg:hidden flex flex-nowrap overflow-x-auto gap-2 pb-4 scrollbar-hide">
        {tabs.map((tab) => (
          <button 
            key={tab.title} 
            onClick={() => setActiveTab(tab.title)}
            className={cn(
              "px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
              activeTab === tab.title ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-slate-100 text-slate-400"
            )}
          >
            {tab.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button 
              key={tab.title} 
              onClick={() => setActiveTab(tab.title)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left group border-2",
                activeTab === tab.title 
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" 
                  : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl transition-colors",
                activeTab === tab.title ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              )}>
                <tab.icon size={20} />
              </div>
              <div>
                <p className={cn("text-sm font-black", activeTab === tab.title ? "text-white" : "text-slate-700")}>{tab.title}</p>
                <p className={cn("text-[10px] font-bold mt-0.5", activeTab === tab.title ? "text-slate-400" : "text-slate-400")}>{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Card className="p-6 md:p-8 border-slate-100 shadow-xl shadow-slate-200/50 rounded-3xl bg-white">
            <div className="mb-8 border-b border-slate-100 pb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                {React.createElement(tabs.find(t => t.title === activeTab)?.icon || Building2, { size: 24 })}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{activeTab}</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">{tabs.find(t => t.title === activeTab)?.desc}</p>
              </div>
            </div>
            
            {renderContent()}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HotelSettings;
