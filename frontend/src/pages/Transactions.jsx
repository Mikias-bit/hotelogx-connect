import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter,
  Download,
  ChevronRight,
  Smartphone,
  Mail,
  X,
  AlertCircle,
  TrendingUp,
  Database,
  ExternalLink,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Zap,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const initialTransactions = [
  { 
    id: 'AUT-1024', 
    guest: 'Sarah Jenkins', 
    service: 'Late Checkout Fee', 
    amount: 30.00, 
    status: 'Paid', 
    date: '10:45 AM', 
    channel: 'WhatsApp', 
    source: 'Late Checkout Request #LC-928',
    convId: 1,
    pmsSync: 'Synced to Opera PMS',
    workflow: 'Auto Checkout Fee'
  },
  { 
    id: 'AUT-1023', 
    guest: 'Michael Chen', 
    service: 'Spa Massage Booking', 
    amount: 120.00, 
    status: 'Paid', 
    date: '09:20 AM', 
    channel: 'Email', 
    source: 'Amenity Inquiry #SPA-112',
    convId: 2,
    pmsSync: 'Synced to Opera PMS',
    workflow: 'Spa Booking Automation'
  },
  { 
    id: 'AUT-1022', 
    guest: 'Emma Wilson', 
    service: 'Early Check-in Surcharge', 
    amount: 25.00, 
    status: 'Paid', 
    date: 'Yesterday', 
    channel: 'WhatsApp', 
    source: 'Early Arrival Request #EC-304',
    convId: 1,
    pmsSync: 'Synced to Mews PMS',
    workflow: 'AI Service Recommendation'
  },
  { 
    id: 'AUT-1021', 
    guest: 'James Bond', 
    service: 'Minibar Surcharges', 
    amount: 45.00, 
    status: 'Failed', 
    date: 'Yesterday', 
    channel: 'WhatsApp', 
    source: 'Minibar Refill Request #MB-902',
    convId: 2,
    pmsSync: 'PMS posting failed',
    workflow: 'Minibar Detection'
  },
  { 
    id: 'AUT-1020', 
    guest: 'Sophia Loren', 
    service: 'Premium Suite Upgrade', 
    amount: 85.00, 
    status: 'Paid', 
    date: '2 days ago', 
    channel: 'WhatsApp', 
    source: 'Upsell Offer #UP-502',
    convId: 1,
    pmsSync: 'Synced to Mews PMS',
    workflow: 'AI Upsell'
  },
  { 
    id: 'AUT-1019', 
    guest: 'David Vance', 
    service: 'Airport Shuttle Surcharge', 
    amount: 50.00, 
    status: 'Paid', 
    date: '2 days ago', 
    channel: 'Email', 
    source: 'Airport Pickup Guide #AP-11',
    convId: 2,
    pmsSync: 'Charge added to folio',
    workflow: 'AI Service Recommendation'
  }
];

const Transactions = () => {
  const navigate = useNavigate();
  const [trxs, setTrxs] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/revenue`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrxs(data.data);
          setTotalRevenue(data.totalRevenue);
        }
      })
      .catch(err => console.error('Error fetching revenue:', err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['John Doe', 'Alice Smith', 'Bob Brown', 'Eva Green'];
      const services = ['Late Checkout Fee', 'Spa Massage Booking', 'Early Check-in Surcharge', 'Minibar Surcharges'];
      const amounts = [30.00, 120.00, 25.00, 45.00];
      const channels = ['WhatsApp', 'Email'];
      const workflows = ['Auto Checkout Fee', 'Spa Booking Automation', 'AI Service Recommendation', 'Minibar Detection'];
      
      const randomIndex = Math.floor(Math.random() * names.length);
      
      const newTrx = {
        id: `AUT-${Math.floor(1000 + Math.random() * 9000)}`,
        guest: names[randomIndex],
        service: services[randomIndex],
        amount: amounts[randomIndex],
        status: Math.random() > 0.1 ? 'Paid' : 'Failed',
        date: 'Just now',
        channel: channels[Math.floor(Math.random() * channels.length)],
        source: `Live Request #${Math.floor(100 + Math.random() * 900)}`,
        convId: Math.floor(1 + Math.random() * 2),
        pmsSync: Math.random() > 0.1 ? 'Synced to Opera PMS' : 'PMS posting failed',
        workflow: workflows[randomIndex]
      };

      setTrxs(prev => [newTrx, ...prev.slice(0, 9)]); // Keep last 10
      if (newTrx.status === 'Paid') {
        setTotalRevenue(prev => prev + newTrx.amount);
      }
    }, 15000); // Every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredTrxs = trxs.filter(t => 
    t.guest.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.workflow.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }, 1200);
  };

  const handleOpenChat = (convId) => {
    navigate('/app/conversations');
  };

  const handleRetryPayment = (id) => {
    setTrxs(prev => prev.map(t => t.id === id ? { ...t, status: 'Pending', pmsSync: 'Awaiting PMS confirmation' } : t));
    setTimeout(() => {
      setTrxs(prev => prev.map(t => t.id === id ? { ...t, status: 'Paid', pmsSync: 'Synced to Mews PMS' } : t));
    }, 1500);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500 relative pb-16 text-left max-w-[1400px] mx-auto">
      
      {/* Toast Feedback */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-10 right-10 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold">Revenue logs successfully exported.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-3">
         <div className="text-left">
            <h1 className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2">
               Revenue & Service Charges
               <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-bold uppercase rounded-md">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Live
               </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Track AI-generated revenue and service charges.</p>
         </div>
         <button 
           onClick={handleExport}
           disabled={isExporting}
           className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.75 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer shadow-sm border border-slate-800"
         >
            {isExporting ? <RefreshCw size={12} className="animate-spin text-purple-300" /> : <Download size={12} />}
            <span>{isExporting ? 'Syncing...' : 'Export Revenue Logs'}</span>
         </button>
      </div>

      {/* COMPACT REVENUE METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { label: 'Automated Revenue', value: `$${totalRevenue.toFixed(2)}`, sub: 'Ancillary posts this week', color: 'text-emerald-600', icon: DollarSign, bg: 'bg-emerald-50' },
           { label: 'PMS Sync Success', value: '98.8%', sub: 'Charge post completions', icon: CheckCircle2, color: 'text-purple-600', bg: 'bg-purple-50' },
           { label: 'AI Upsells', value: '142 Posts', sub: 'Autopilot conversion rate', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
         ].map((stat, i) => (
           <div 
             key={i} 
             className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm flex items-center justify-between"
           >
             <div className="space-y-0.5 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{stat.label}</span>
                <p className="text-lg font-black text-slate-950 font-mono tracking-tight">{stat.value}</p>
                <span className="text-[10px] text-slate-400 font-semibold block">{stat.sub}</span>
             </div>
             <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={15} />
             </div>
           </div>
         ))}
      </div>

      {/* COMPACT INSIGHT BAR (AI dynamic visibility) */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-slate-500 font-medium py-2.5 border-y border-slate-100 bg-white/20 px-1 rounded-lg">
         <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Late checkout automation generated <strong>$820 this week</strong></span>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>Most revenue generated from <strong>WhatsApp upsells</strong></span>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>PMS sync operating normally <strong>(100% active)</strong></span>
         </div>
      </div>

      {/* AI REVENUE FLOW STRIP */}
      <div className="space-y-2 text-left">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">AI Operational Revenue Flow</span>
         <div className="bg-slate-50 border border-slate-200/60 p-3.5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-650">
            
            <div className="flex items-center gap-2">
               <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-[10px]">1</span>
               <span>Guest Request</span>
            </div>

            <span className="text-slate-300 hidden md:block">➜</span>

            <div className="flex items-center gap-2">
               <span className="w-5 h-5 rounded-full bg-purple-100 text-[#6D28D9] flex items-center justify-center font-bold text-[10px]">2</span>
               <span className="text-[#6D28D9]">AI Offer/Upsell</span>
            </div>

            <span className="text-slate-300 hidden md:block">➜</span>

            <div className="flex items-center gap-2">
               <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-[10px]">3</span>
               <span>Guest Approval</span>
            </div>

            <span className="text-slate-300 hidden md:block">➜</span>

            <div className="flex items-center gap-2">
               <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-650 flex items-center justify-center font-bold text-[10px]">4</span>
               <span>PMS Charge Posted</span>
            </div>

            <span className="text-slate-300 hidden md:block">➜</span>

            <div className="flex items-center gap-2">
               <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">5</span>
               <span className="text-emerald-700 font-bold">Revenue Logged</span>
            </div>

         </div>
      </div>

      {/* TRANSACTION CONTAINER */}
      <div className="space-y-2 text-left">
         <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Automated Transaction Logs</span>

         <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            
            {/* Table Search & Filter Bar */}
            <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/20">
              <div className="relative w-full sm:max-w-xs text-left">
                <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Guest, Service or Source..." 
                  className="w-full pl-7.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-purple-500/30 outline-none transition-all"
                />
              </div>
              <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-650 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                 <Filter size={12} />
                 <span>Filter Transactions</span>
              </button>
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guest</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Service Details</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Channel</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3 text-[9px] font-bold text-slate-400 uppercase tracking-wider">PMS Sync Status</th>
                    <th className="px-5 py-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                  <AnimatePresence>
                  {filteredTrxs.map((trx) => {
                     const syncColor = trx.pmsSync === 'PMS posting failed' ? 'text-rose-600 bg-rose-50/50 border-rose-100' : 'text-slate-700 bg-slate-50 border-slate-100';
                     const syncDot = trx.pmsSync === 'PMS posting failed' ? 'bg-rose-500' : 'bg-emerald-500';

                     return (
                       <motion.tr 
                         key={trx.id}
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         onClick={() => setSelectedTrx(trx)}
                         className="hover:bg-slate-50/20 transition-colors cursor-pointer"
                       >
                         {/* Guest Name */}
                         <td className="px-5 py-3.5 text-slate-900 font-bold">
                            {trx.guest}
                         </td>

                         {/* Service & Workflow */}
                         <td className="px-5 py-3.5">
                            <div className="flex flex-col text-left">
                               <span className="text-slate-900 font-bold">{trx.service}</span>
                               <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                  via {trx.workflow}
                               </span>
                            </div>
                         </td>

                         {/* Amount */}
                         <td className="px-5 py-3.5 text-slate-950 font-bold font-mono">
                            ${trx.amount.toFixed(2)}
                         </td>

                         {/* Channel */}
                         <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 text-slate-500 text-[10px] uppercase font-bold">
                               {trx.channel === 'WhatsApp' ? <Smartphone size={11} className="text-emerald-500" /> : <Mail size={11} className="text-blue-500" />}
                               <span>{trx.channel}</span>
                            </div>
                         </td>

                         {/* Status */}
                         <td className="px-5 py-3.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                               trx.status === 'Paid' ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100' :
                               trx.status === 'Pending' ? 'text-amber-600 bg-amber-50/50 border-amber-100' :
                               'text-rose-600 bg-rose-50/50 border-rose-100'
                            }`}>
                               {trx.status}
                            </span>
                         </td>

                         {/* PMS Sync Status */}
                         <td className="px-5 py-3.5">
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 border rounded-md text-[10px] w-fit font-bold ${syncColor}`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${syncDot}`} />
                               <span>{trx.pmsSync}</span>
                            </div>
                         </td>

                         {/* Actions View Details */}
                         <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => setSelectedTrx(trx)}
                              className="px-2.5 py-1 text-[11px] font-bold text-[#6D28D9] hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                            >
                               View Details
                            </button>
                         </td>
                       </motion.tr>
                     );
                  })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* MOBILE SCROLL CARD LIST VIEW */}
            <div className="block md:hidden divide-y divide-slate-100 text-left">
               {filteredTrxs.map((trx) => {
                  const syncColor = trx.pmsSync === 'PMS posting failed' ? 'text-rose-600 bg-rose-50/50 border-rose-100' : 'text-slate-700 bg-slate-50 border-slate-100';
                  
                  return (
                    <div 
                      key={trx.id} 
                      onClick={() => setSelectedTrx(trx)}
                      className="p-4 space-y-3 hover:bg-slate-50/20 active:bg-slate-50 transition-all cursor-pointer"
                    >
                       <div className="flex items-start justify-between gap-2">
                          <div>
                             <h4 className="text-xs font-bold text-slate-950 leading-tight">{trx.guest}</h4>
                             <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                                {trx.service} • via {trx.workflow}
                             </span>
                          </div>
                          <span className="text-sm font-black font-mono text-slate-900 shrink-0">
                             ${trx.amount.toFixed(2)}
                          </span>
                       </div>

                       <div className="flex items-center justify-between gap-2 text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded-md border ${
                             trx.status === 'Paid' ? 'text-emerald-600 bg-emerald-50/50 border-emerald-100' : 'text-rose-600 bg-rose-50/50 border-rose-100'
                          }`}>
                             {trx.status}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md border ${syncColor}`}>
                             {trx.pmsSync}
                          </span>
                       </div>

                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setSelectedTrx(trx);
                         }}
                         className="w-full py-1.75 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10.5px] font-bold text-[#6D28D9] text-center"
                       >
                          View Details
                       </button>
                    </div>
                  );
               })}
            </div>

         </div>
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      <AnimatePresence>
        {selectedTrx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white w-full max-w-sm rounded-xl shadow-lg border border-slate-200 overflow-hidden text-left font-sans"
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-purple-50 text-purple-700 rounded-lg flex items-center justify-center shrink-0">
                       <CreditCard size={13} />
                    </div>
                    <div>
                       <h3 className="text-xs font-bold text-slate-900 leading-tight">Revenue Post Details</h3>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTrx(null)} className="p-1 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer">
                    <X size={14}/>
                 </button>
              </div>

              <div className="p-4 space-y-4">
                 <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-3 text-left font-semibold">
                       <div className="space-y-0.5">
                         <span className="text-[9px] text-slate-400 font-bold block uppercase">Guest</span>
                         <p className="text-slate-900 font-bold">{selectedTrx.guest}</p>
                       </div>
                       <div className="space-y-0.5">
                         <span className="text-[9px] text-slate-400 font-bold block uppercase">Service</span>
                         <p className="text-slate-900 font-bold">{selectedTrx.service}</p>
                       </div>
                    </div>
                    <div className="space-y-3 text-left font-semibold">
                       <div className="space-y-0.5">
                         <span className="text-[9px] text-slate-400 font-bold block uppercase">Value Charged</span>
                         <p className="text-sm font-black text-slate-900 font-mono">${selectedTrx.amount.toFixed(2)}</p>
                       </div>
                       <div className="space-y-0.5">
                         <span className="text-[9px] text-slate-400 font-bold block uppercase">AI Workflow Source</span>
                         <p className="text-slate-900 font-bold text-purple-600">{selectedTrx.workflow}</p>
                       </div>
                    </div>
                 </div>

                 {/* Minimal Explanation info box */}
                 <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2.5 text-xs text-left">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] text-slate-400 font-bold uppercase">Posting Context</span>
                       <span className="text-[10px] font-mono text-slate-400">{selectedTrx.id}</span>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed">
                       This charge was securely generated through conversational SOP compliance logic in session <span className="text-[#6D28D9] font-bold">"{selectedTrx.source}"</span> over {selectedTrx.channel}.
                    </p>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600 bg-white border border-slate-150 p-2 rounded-lg">
                       <Database size={11} className="text-purple-600" />
                       <span>{selectedTrx.pmsSync}</span>
                    </div>
                 </div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">
                 <button 
                   onClick={() => setSelectedTrx(null)}
                   className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 transition-colors shadow-sm"
                 >
                    Close View
                 </button>
                 {selectedTrx.status === 'Failed' && (
                   <button 
                     onClick={() => handleRetryPayment(selectedTrx.id)}
                     className="w-full py-2 bg-purple-600 text-white rounded-lg text-[10px] font-bold hover:bg-purple-700 transition-all shadow-sm"
                   >
                     Retry Post
                   </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Transactions;
