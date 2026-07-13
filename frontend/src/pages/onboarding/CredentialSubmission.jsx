import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { API_BASE_URL } from '../../config';
import { 
  Shield, 
  Key, 
  CheckCircle, 
  Database, 
  Phone, 
  Mail, 
  CreditCard, 
  ArrowRight, 
  Sparkles, 
  MessageSquare, 
  Send, 
  X,
  Plus,
  Landmark,
  Lock,
  Check,
  RefreshCw
} from 'lucide-react';

export const CredentialSubmission = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [targetRequest, setTargetRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    pmsApiKey: '',
    pmsSecret: '',
    whatsappApiKey: '',
    smtpHost: '',
    smtpUser: '',
    smtpPass: '',
    webhookUrl: '',
    stripeAccountId: ''
  });

  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  // Fetch initial request details
  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/requests/onboarding/${token}`)
      .then(res => res.json())
      .then(data => {
        const requestData = data.data?.request || data.request;
        if (data.success && requestData) {
          setTargetRequest(requestData);
          setMessages(requestData.messages || []);
          setForm(prev => ({ 
            ...prev, 
            pmsApiKey: requestData.pmsApiKey || '',
            pmsSecret: requestData.pmsSecret || '',
            whatsappApiKey: requestData.whatsappApiKey || '',
            smtpHost: requestData.smtpHost || '',
            smtpUser: requestData.smtpUser || '',
            smtpPass: requestData.smtpPass || '',
            webhookUrl: `https://api.autopilot.ai/v1/webhooks/${requestData.requestId || requestData.id}`,
            stripeAccountId: requestData.stripeAccountId || ''
          }));
          setBankForm(prev => ({
            ...prev,
            billingEmail: requestData.email || ''
          }));
        } else {
          setError(data.message || 'Invalid onboarding link');
        }
      })
      .catch(err => setError('Server connection failed'))
      .finally(() => setIsLoading(false));
  }, [token]);

  // Dynamic Polling for Super Admin updates
  React.useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetch(`${API_BASE_URL}/api/requests/onboarding/${token}`)
        .then(res => res.json())
        .then(data => {
          const pollData = data.data?.request || data.request;
          if (data.success && pollData) {
            setMessages(pollData.messages || []);
          }
        })
        .catch(() => {});
    }, 4000); // Polling every 4 seconds
    return () => clearInterval(interval);
  }, [token]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wizardStep, setWizardStep] = useState(1); // 1 = Creds Form, 2 = Plan & Bank ACH, 3 = Complete!

  const [selectedPlan, setSelectedPlan] = useState('Professional');
  const [bankForm, setBankForm] = useState({
    bankAccountName: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    billingEmail: '',
    billingAddress: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Dynamic MEWS Connection Verification
    if (targetRequest && (targetRequest.pmsProvider === 'Mews' || targetRequest.pms === 'Mews')) {
      try {
        const testRes = await fetch(`${API_BASE_URL}/api/mews/test-connection?clientToken=${encodeURIComponent(form.pmsApiKey)}&accessToken=${encodeURIComponent(form.pmsSecret)}`);
        const testData = await testRes.json();
        if (testData.success) {
          addToast(`PMS Connection Verified: ${testData.hotelName || 'Connected'}`, 'success');
        } else {
          addToast(`PMS Verification Failed: ${testData.details || testData.message || 'Failed'}`, 'error');
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        addToast('Connection test failed: PMS unreachable', 'error');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/onboarding/${token}/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setWizardStep(2);
        addToast('Integration credentials encrypted & saved securely!', 'success');
      } else {
        addToast(data.message || 'Submission failed', 'error');
      }
    } catch (err) {
      addToast('Connection error during submission', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBankSubmit = async (e) => {
    e.preventDefault();
    if (!bankForm.bankAccountName || !bankForm.bankAccountNumber || !bankForm.bankRoutingNumber) {
      addToast('Please complete all direct debit routing fields.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/billing/hotel/${targetRequest.requestId}/subscription`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bankForm,
          subscriptionPlan: selectedPlan,
          totalRooms: parseInt(targetRequest.roomCount) || 50
        })
      });
      const data = await res.json();
      if (data.success) {
        setWizardStep(3);
        addToast('SaaS Subscription and ACH Direct Debit Authorized!', 'success');
      } else {
        addToast(data.message || 'Failed to authorize bank details', 'error');
      }
    } catch (err) {
      addToast('Connection error during direct debit setup', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMsg.trim() || sendingMsg) return;
    setSendingMsg(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/onboarding/${token}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMsg.trim() })
      });
      const data = await res.json();
      const msgData = data.data?.request || data.request;
      if (data.success && msgData) {
        setMessages(msgData.messages || []);
        setNewMsg('');
        addToast('Comment sent directly to Super Admin dashboard!', 'success');
      } else {
        addToast(data.message || 'Failed to post comment', 'error');
      }
    } catch (err) {
      addToast('Connection error posting message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-mono text-[10px] font-black uppercase tracking-widest">
          Securing Gateway Tunnel...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-rose-100 p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-100">
            <X size={24} />
          </div>
          <h2 className="text-lg font-black text-slate-900">Link Expired or Invalid</h2>
          <p className="text-xs text-slate-500 font-medium">{error}</p>
          <button onClick={() => navigate('/')} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Return Home</button>
        </div>
      </div>
    );
  }

  if (wizardStep === 3) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] text-[#111827] flex items-center justify-center p-6 text-left selection:bg-purple-950 selection:text-amber-100">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#E7E4DD] p-8 shadow-2xl space-y-6 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-purple-50 text-[#6D4AFF] rounded-full flex items-center justify-center border border-purple-100 animate-bounce shadow-lg">
            <CheckCircle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black font-serif text-slate-900">Onboarding Setup Complete</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Thank you! Your property connection credentials have been encrypted and saved securely.
            </p>
            <p className="text-xs text-slate-400 font-medium font-sans">
              Onboarding credentials submitted! The system is verifying your integration. Once the Super Admin deploys your isolated workspace, you will receive temporary credentials to login and authorize your recurring monthly billing.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#111827] py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-purple-950 selection:text-amber-100">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 bg-white/50 backdrop-blur-xl p-6 rounded-3xl border border-[#E7E4DD] shadow-xs">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-[#6D4AFF] border border-purple-100 rounded text-[8px] font-black uppercase tracking-widest font-mono">
              <Shield size={10} />
              <span>Secure Gateway Tunnel</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 font-serif tracking-tight">{targetRequest.hotelName}</h1>
            <p className="text-slate-500 mt-1 text-xs font-semibold">
              Complete your Property Management System & WhatsApp API integration securely.
            </p>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-[9px] font-mono font-black uppercase text-slate-700 border border-slate-200">
            {targetRequest.plan} Tier
          </div>
        </div>

        {/* Double-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Metadata panels & Alignment Chat Box (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Security Notice */}
            <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center shrink-0 border border-purple-200">
                <Key size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-purple-950 uppercase tracking-tight">AES-256 Cloud Encryption Active</h4>
                <p className="text-[11px] text-purple-800 leading-relaxed font-medium">
                  These credentials are encrypted at rest and in transit. Only authorized AutoPilot system background procedures can retrieve these details to perform secure database sync requests.
                </p>
              </div>
            </div>

            {/* Pricing Info */}
            <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0 border border-emerald-200">
                <CreditCard size={18} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-emerald-950 uppercase tracking-tight">Your Calculated Plan</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  Based on your property size of **{targetRequest.roomCount || 50} rooms**, your monthly subscription is calculated at **${(targetRequest.roomCount || 50) * 1}/month** ($1 per room).
                </p>
              </div>
            </div>

            {/* DISCUSSION HUBS & CHAT FEED */}
            <div className="bg-white rounded-3xl border border-[#E7E4DD] shadow-xs overflow-hidden flex flex-col min-h-[460px] max-h-[500px]">
              
              {/* Chat Title bar */}
              <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-900 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare size={13} className="text-[#6D4AFF]" />
                  <span className="text-[9px] font-black uppercase tracking-widest font-mono">Alignment Discussion Hub</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[8px] font-mono font-bold text-slate-400 uppercase">Synchronized</span>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 text-left scrollbar-thin">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-2">
                    <MessageSquare size={24} className="text-slate-200 animate-bounce" />
                    <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto">
                      Private discussion tunnel ready. Chat with our onboarding specialist to coordinate PMS syncs, scheduling, and custom alignments.
                    </p>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} className={`flex flex-col ${m.sender === 'Hotel Representative' ? 'items-end' : 'items-start'}`}>
                      <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono mb-0.5">{m.sender}</span>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-xs font-semibold leading-relaxed ${
                        m.sender === 'Hotel Representative' 
                          ? 'bg-[#6D4AFF] text-white rounded-tr-none shadow-xs' 
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/40'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Predefined prompt templates */}
              <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex gap-2 flex-wrap shrink-0">
                {[
                  { label: '📞 Request Call', text: 'Hello, please schedule a call with us to guide us through our Opera PMS configuration.' },
                  { label: '📄 Credentials Submitted', text: 'We have submitted our secure access tokens. Please run connection checks.' },
                  { label: '❓ Custom SOP Help', text: 'Can you assist us in uploading our custom properties rules PDF?' }
                ].map((btn, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewMsg(btn.text)}
                    className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-500 hover:text-[#6D4AFF] rounded-lg text-[9px] font-bold transition-all cursor-pointer shadow-3xs"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Text box */}
              <div className="p-4 bg-slate-100/50 border-t border-slate-200/50 flex gap-2 shrink-0 items-center">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Ask questions or coordinate with Admin..."
                  className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#6D4AFF]/40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={sendingMsg}
                  className="p-2.5 bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center shrink-0"
                >
                  <Send size={12} />
                </button>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Secure integration gateway forms (lg:col-span-7) */}
          <div className="lg:col-span-7">
            {wizardStep === 1 ? (
              <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] border border-[#E7E4DD] p-8 shadow-xs space-y-8">
                
                {/* PMS Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <Database size={16} className="text-[#6D4AFF]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-mono">{targetRequest.pms || 'Opera PMS'} Integration</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">PMS API Token</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••••••••••••••"
                        value={form.pmsApiKey}
                        onChange={e => setForm({...form, pmsApiKey: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">PMS Secret / Property ID</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. SECRET_8291"
                        value={form.pmsSecret}
                        onChange={e => setForm({...form, pmsSecret: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Webhook URL (Read Only)</label>
                    <input
                      type="text"
                      readOnly
                      value={form.webhookUrl}
                      className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp API Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <Phone size={16} className="text-[#6D4AFF]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-mono">Meta WhatsApp Business API</h3>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Meta System User Access Token</label>
                    <input
                      type="password"
                      required
                      placeholder="EAAGb..."
                      value={form.whatsappApiKey}
                      onChange={e => setForm({...form, whatsappApiKey: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                    />
                  </div>
                </div>

                {/* Email Dispatch Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <Mail size={16} className="text-[#6D4AFF]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-mono">SMTP Email Server Dispatch</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">SMTP Host</label>
                      <input
                        type="text"
                        required
                        placeholder="smtp.gmail.com"
                        value={form.smtpHost}
                        onChange={e => setForm({...form, smtpHost: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">SMTP User</label>
                      <input
                        type="email"
                        required
                        placeholder="user@hotel.com"
                        value={form.smtpUser}
                        onChange={e => setForm({...form, smtpUser: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">SMTP Password</label>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={form.smtpPass}
                        onChange={e => setForm({...form, smtpPass: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Stripe Payments Integration */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <CreditCard size={16} className="text-[#6D4AFF]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-mono">Stripe Payments (Optional)</h3>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Stripe Connected Account ID</label>
                    <input
                      type="text"
                      placeholder="acct_1..."
                      value={form.stripeAccountId || ''}
                      onChange={e => setForm({...form, stripeAccountId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Encrypting & Saving Credentials...' : 'Submit Credentials Securely'}
                    <ArrowRight size={12} />
                  </button>
                </div>

              </form>
            ) : (
              <form onSubmit={handleBankSubmit} className="bg-white rounded-[2rem] border border-[#E7E4DD] p-8 shadow-xs space-y-8">
                
                {/* Plan Selection Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <Sparkles size={16} className="text-[#6D4AFF]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-mono">Select SaaS Subscription Tier</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'Starter', name: 'Starter', price: 199, desc: 'Up to 50 Rooms' },
                      { id: 'Professional', name: 'Professional', price: 399, desc: 'Up to 150 Rooms' },
                      { id: 'Enterprise', name: 'Enterprise', price: 799, desc: 'Unlimited Rooms' }
                    ].map((plan) => {
                      const isActive = selectedPlan === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                            isActive 
                              ? 'border-[#6D4AFF] bg-purple-50/20 ring-1 ring-purple-100' 
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-800">{plan.name}</p>
                            <p className="text-[9px] font-semibold text-slate-400 mt-0.5">{plan.desc}</p>
                          </div>
                          <p className="text-lg font-black text-slate-900 mt-2">${plan.price}<span className="text-[9px] text-slate-400 font-bold font-mono">/mo</span></p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ACH Direct Debit Authorization Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                    <Landmark size={16} className="text-[#6D4AFF]" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-mono">Direct Debit (ACH) Routing</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Billing Email Address</label>
                        <input
                          type="email"
                          required
                          value={bankForm.billingEmail}
                          onChange={e => setBankForm({...bankForm, billingEmail: e.target.value})}
                          placeholder="billing@hotel.com"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Bank Account Name</label>
                        <input
                          type="text"
                          required
                          value={bankForm.bankAccountName}
                          onChange={e => setBankForm({...bankForm, bankAccountName: e.target.value})}
                          placeholder="e.g. Grand Palace Hotel LLC"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">9-Digit Routing Number</label>
                        <input
                          type="text"
                          required
                          maxLength={9}
                          pattern="\d{9}"
                          value={bankForm.bankRoutingNumber}
                          onChange={e => setBankForm({...bankForm, bankRoutingNumber: e.target.value})}
                          placeholder="e.g. 121000248"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Bank Account Number</label>
                        <input
                          type="text"
                          required
                          value={bankForm.bankAccountNumber}
                          onChange={e => setBankForm({...bankForm, bankAccountNumber: e.target.value})}
                          placeholder="e.g. 1029384756"
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 font-mono block">Billing Legal Address</label>
                      <input
                        type="text"
                        required
                        value={bankForm.billingAddress}
                        onChange={e => setBankForm({...bankForm, billingAddress: e.target.value})}
                        placeholder="e.g. 100 Main St, New York, NY"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white outline-none focus:border-[#6D4AFF] transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-2.5">
                    <Lock size={14} className="text-[#6D4AFF] shrink-0 mt-0.5" />
                    <p className="text-[9px] font-semibold text-slate-500 leading-relaxed text-left">
                      By checking out, you authorize AutoPilot.ai to issue direct debits to your account for subscription dues on a monthly basis. Direct debits are processed via secure ACH clearing house.
                    </p>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="animate-spin" size={12} />
                        Authorizing ACH Direct Debit...
                      </>
                    ) : (
                      <>
                        Authorize & Complete Onboarding <ArrowRight size={12} />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
