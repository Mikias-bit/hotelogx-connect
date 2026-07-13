import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Search, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  FileText, 
  X, 
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { API_BASE_URL } from '../config';

const KnowledgeBase = () => {
  const { activeWorkspace, user } = useApp();
  const currentHotelId = activeWorkspace?.id || user?.hotelId || 5;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // File input triggers
  const fileInputRef = useRef(null);
  const [selectedFileSize, setSelectedFileSize] = useState('140 KB');
  const [isUploading, setIsUploading] = useState(false);

  // Re-indexing row specific animation state
  const [reindexingId, setReindexingId] = useState(null);

  // Modal and toast states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    docType: 'SOP',
    category: 'Policy',
    connectedFlows: 'Late Checkout Automation',
    appliesTo: 'All Guests',
    priority: 'Medium',
    autoApproval: true,
    humanApproval: false,
    summary: '',
    confidenceThreshold: '85%',
    tags: ''
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const fetchDocs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/documents?hotelId=${currentHotelId}`);
      if (response.ok) {
        const data = await response.json();
        // Format the database payload to the expected frontend schema
        const formatted = data.map(d => ({
          id: d.id,
          name: d.filename || 'Unknown Document.pdf',
          category: d.docType || 'Policy',
          status: d.isVectorized ? 'Indexed' : 'Processing',
          lastIndexed: d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : 'Just now'
        }));
        setDocs(formatted);
      }
    } catch (error) {
      // Fetch error handled silently or via UI
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [currentHotelId]);

  // Polling effect: auto-refresh document statuses if any document is in the 'Processing' (Syncing) state
  useEffect(() => {
    const hasProcessing = docs.some(d => d.status === 'Processing');
    if (!hasProcessing) return;

    const interval = setInterval(() => {
      fetchDocs();
    }, 3000);

    return () => clearInterval(interval);
  }, [docs]);

  // Re-index trigger
  const handleReindex = async (id, name) => {
    // Instantly set status to 'Processing' (Syncing) in local state to trigger polling
    setDocs(prev => prev.map(d => d.id === id ? { ...d, status: 'Processing' } : d));
    triggerToast(`Syncing "${name}" rules with active AI response layers...`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/reindex/${id}`, {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        triggerToast(data.message || 'Rules sync complete.');
      } else {
        const errText = await response.text();
        triggerToast(`Sync failed: ${errText}`);
      }
    } catch (error) {
      triggerToast('Network error during sync.');
    } finally {
      fetchDocs()
        .finally(() => {
          setReindexingId(null);
        });
    }
  };

  // Delete handlers
  const confirmDeleteDoc = (doc) => {
    setDocToDelete(doc);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/rag/documents/${docToDelete.id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setDocs(prev => prev.filter(d => d.id !== docToDelete.id));
        triggerToast(`"${docToDelete.name}" removed from AI response rules.`);
      } else {
        triggerToast(`Failed to remove "${docToDelete.name}".`);
      }
    } catch (error) {
      triggerToast('Network error while deleting document');
    } finally {
      setDeleteConfirmOpen(false);
      setDocToDelete(null);
    }
  };

  // Handle file picker selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const sizeKB = (file.size / 1024).toFixed(0);
      setSelectedFileSize(`${sizeKB} KB`);
      setUploadForm(prev => ({ ...prev, name: file.name }));
      triggerToast(`Selected file: "${file.name}"`);
    }
  };

  // Submit Upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.name) return;
  
    setIsUploading(true);
    const docName = uploadForm.name.endsWith('.pdf') ? uploadForm.name : `${uploadForm.name}.pdf`;
  
    try {
      const formData = new FormData();
      // Append the actual file selected via ref
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        formData.append('file', file);
      } else {
        triggerToast('No file selected');
        setIsUploading(false);
        return;
      }
      // Append metadata
      formData.append('filename', docName);
      formData.append('docType', uploadForm.category);
      formData.append('hotelId', currentHotelId);
  
      const response = await fetch(`${API_BASE_URL}/api/rag/upload`, {
        method: 'POST',
        body: formData // browser sets multipart/form-data
      });
  
      if (response.ok) {
        triggerToast(`"${docName}" is now active in AI response rules.`);
        fetchDocs();
      } else {
        const errText = await response.text();
        triggerToast(`Failed to upload document: ${errText}`);
      }
    } catch (error) {
      triggerToast('Network error while uploading');
    } finally {
      setIsUploading(false);
      setIsUploadOpen(false);
      setUploadForm({ name: '', category: 'Policy', connectedFlows: 'General Operations' });
      setSelectedFileSize('140 KB');
    }
  };

  // Policy rules details mapping
  const getDocDetails = (name) => {
    const map = {
      'Late Checkout Policy.pdf': {
        purpose: 'AI late checkout validation limits',
        flow: 'Late Checkout Automation'
      },
      'Spa Service Pricing.pdf': {
        purpose: 'Spa pricing and booking upsells',
        flow: 'Spa Upsell Automation'
      },
      'VIP Guest SOP.pdf': {
        purpose: 'VIP gold and platinum loyalty privileges',
        flow: 'VIP Guest Workflow'
      },
      'Restaurant Timing Guide.pdf': {
        purpose: 'Food hours & room service details',
        flow: 'Dining Upsell Automation'
      },
      'Billing Rules.pdf': {
        purpose: 'Dispute limits & incidental charges validation',
        flow: 'Billing Dispute Resolution'
      },
      'Housekeeping FAQ.pdf': {
        purpose: 'Room requests and cleaning priorities',
        flow: 'Housekeeping Priority Dispatch'
      }
    };
    return map[name] || {
      purpose: 'Hotel operational guideline context',
      flow: 'General Operations'
    };
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-0 pt-4 pb-24 sm:p-6 max-w-[1400px] mx-auto space-y-6 font-sans text-left bg-slate-50/10">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-md text-xs font-semibold flex items-center gap-2"
          >
            <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
         <div className="text-left space-y-0.5">
            <h1 className="text-xl font-bold text-slate-950 tracking-tight">Hotel Policies & Knowledge</h1>
            <p className="text-xs text-slate-500 font-medium">
               Manage SOPs, policies and operational documents.
            </p>
         </div>

         <button 
           onClick={() => setIsUploadOpen(true)}
           className="px-3 py-1.5 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 cursor-pointer border border-slate-800 transition-all shadow-sm shrink-0"
         >
            <Upload size={11} className="text-purple-300" />
            <span>Upload Policy / SOP</span>
         </button>
      </div>

      {/* MINIMAL HORIZONTAL STATUS INDICATORS */}
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs text-slate-500 font-medium py-3 border-y border-slate-100 bg-white/20 px-1 rounded-lg">
         <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Active Response Rules: <strong className="text-slate-900">{docs.length} SOPs</strong></span>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Response Accuracy: <strong className="text-slate-900">98%</strong></span>
         </div>
         <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Guideline Sync Status: <strong className="text-slate-900">Healthy</strong></span>
         </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
         <div className="relative w-full sm:max-w-xs text-left">
            <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
            <input 
              type="text" 
              placeholder="Search policies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7.5 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:border-purple-500/30 outline-none transition-all"
            />
         </div>

         <select 
           value={selectedCategory} 
           onChange={(e) => setSelectedCategory(e.target.value)}
           className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-650 focus:border-purple-500/30 outline-none cursor-pointer"
         >
            <option value="All">All Policies & SOPs</option>
            <option value="Policy">Core Policies</option>
            <option value="Spa">Spa & Pricing</option>
            <option value="Operations">Operations SOPs</option>
            <option value="Billing">Billing Rules</option>
         </select>
      </div>

      {/* OPERATIONAL KNOWLEDGE SOURCES TABLE */}
      <div className="space-y-2 text-left">
         <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">AI Operational Guidelines</h2>
         
         <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-semibold text-slate-650">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                     <th className="px-4 py-3">Document</th>
                     <th className="px-4 py-3">Purpose</th>
                     <th className="px-4 py-3">AI Status</th>
                     <th className="px-4 py-3">Last Used</th>
                     <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredDocs.map((doc) => {
                     const details = getDocDetails(doc.name);
                     const isReindexing = reindexingId === doc.id;
                     
                     // Minimal status dot mapper
                     const statusDot = 
                       doc.status === 'Needs Review' ? 'bg-orange-500' :
                       doc.status === 'Processing' ? 'bg-purple-500 animate-pulse' :
                       'bg-emerald-500';

                     return (
                       <tr key={doc.id} className="hover:bg-slate-50/20 transition-colors">
                          {/* Document Name */}
                          <td className="px-4 py-3.5 max-w-[220px]">
                             <div className="flex flex-col text-left">
                                <span className="font-bold text-slate-900 truncate">{doc.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                                   Connected to: {details.flow}
                                </span>
                             </div>
                          </td>

                          {/* Purpose */}
                          <td className="px-4 py-3.5 text-slate-600 font-medium">
                             {details.purpose}
                          </td>

                          {/* AI Status */}
                          <td className="px-4 py-3.5">
                             <div className="flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                                <span className="text-slate-700 text-xs font-semibold">
                                   {doc.status === 'Indexed' ? 'Active' : doc.status === 'Needs Review' ? 'Needs Review' : 'Syncing'}
                                </span>
                             </div>
                          </td>

                          {/* Last Used */}
                          <td className="px-4 py-3.5 text-slate-400 font-mono text-[10px]">
                             {doc.lastIndexed || '2 mins ago'}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => handleReindex(doc.id, doc.name)}
                                  disabled={isReindexing}
                                  className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"
                                  title="Sync Policy"
                                >
                                   <RefreshCw size={11} className={isReindexing ? 'animate-spin text-purple-600' : ''} />
                                </button>
                                <button 
                                  onClick={() => confirmDeleteDoc(doc)}
                                  className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Remove Rules"
                                >
                                   <Trash2 size={11} />
                                </button>
                             </div>
                          </td>
                       </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>

      {/* INLINE HEALTH & ACTIVITY SUBSECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
         {/* Recent AI Usage Feed */}
         <div className="space-y-2.5 text-left">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">Recent Policy Approvals</h3>
            <div className="space-y-2">
               {[
                 { time: '2 mins ago', doc: 'Late Checkout Policy.pdf', action: 'Approved guest checkout extension request' },
                 { time: '10 mins ago', doc: 'Spa Service Pricing.pdf', action: 'Verified Swedish Massage rates for chat' },
                 { time: '1 hour ago', doc: 'Billing Rules.pdf', action: 'Validated incidental charge refund limits' }
               ].map((item, idx) => (
                 <div key={idx} className="flex items-start gap-2.5 text-[11px] leading-normal text-slate-650 font-semibold">
                    <span className="text-slate-400 font-mono text-[9.5px] shrink-0 mt-0.5">{item.time}</span>
                    <span className="text-slate-950 font-bold">{item.doc}</span>
                    <span className="text-slate-400 font-medium">•</span>
                    <span className="text-slate-500 font-medium">{item.action}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Knowledge Health Check */}
         <div className="space-y-2.5 text-left">
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">AI Status Health Checks</h3>
            <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-2 text-left">
               <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Guideline Sync</span>
                  <p className="text-xs font-bold text-emerald-600">Synced</p>
               </div>
               <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Active Rules</span>
                  <p className="text-xs font-bold text-slate-900">{docs.length} SOPs</p>
               </div>
               <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold block">Decision Success</span>
                  <p className="text-xs font-bold text-purple-600">98.4% OK</p>
               </div>
            </div>
         </div>
      </div>

      {/* AI RETRIEVAL PREVIEW — SINGLE SIMPLE FLOW */}
      <div className="space-y-3 text-left pt-6 border-t border-slate-100">
         <h3 className="text-xs font-bold text-slate-800 tracking-tight">AI Decision-Making Pipeline Preview</h3>
         
         <div className="bg-slate-50/50 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs border border-slate-100">
            
            <div className="flex items-center gap-2.5 text-left w-full md:w-auto">
               <span className="w-5 h-5 rounded-full bg-slate-200/60 text-slate-650 flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
               <div>
                  <p className="font-bold text-slate-900">Guest asks for late checkout</p>
                  <span className="text-[10px] text-slate-400 block leading-none">WhatsApp message received</span>
               </div>
            </div>

            <div className="text-slate-300 hidden md:block">➜</div>

            <div className="flex items-center gap-2.5 text-left w-full md:w-auto">
               <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
               <div>
                  <p className="font-bold text-purple-600">AI retrieves late checkout policy</p>
                  <span className="text-[10px] text-slate-400 block leading-none">Scans LateCheckoutPolicy.pdf</span>
               </div>
            </div>

            <div className="text-slate-300 hidden md:block">➜</div>

            <div className="flex items-center gap-2.5 text-left w-full md:w-auto">
               <span className="w-5 h-5 rounded-full bg-slate-200/60 text-slate-650 flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
               <div>
                  <p className="font-bold text-slate-900">AI validates VIP eligibility</p>
                  <span className="text-[10px] text-slate-400 block leading-none">Checks loyalty database rules</span>
               </div>
            </div>

            <div className="text-slate-300 hidden md:block">➜</div>

            <div className="flex items-center gap-2.5 text-left w-full md:w-auto">
               <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">4</span>
               <div>
                  <p className="font-bold text-emerald-700">AI approves & responds</p>
                  <span className="text-[10px] text-slate-400 block leading-none">Dispatched complimentary check-out</span>
               </div>
            </div>

         </div>
      </div>

      {/* FOOTER SYSTEM LINKS */}
      <div className="pt-4 text-center text-[10px] text-slate-400 font-medium border-t border-slate-50">
         Connected with: Conversations • Automation Engine • Revenue Automation • Escalation Queue
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      <AnimatePresence>
         {isUploadOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-2xl w-full overflow-hidden text-left font-sans"
              >
                 <input 
                   type="file" 
                   ref={fileInputRef}
                   onChange={handleFileChange}
                   accept=".pdf,.doc,.docx,.txt"
                   className="hidden" 
                 />

                 <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                       <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Upload Operational Policy</h3>
                    </div>
                    <button 
                      onClick={() => setIsUploadOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-650 transition-colors cursor-pointer"
                    >
                       <X size={14} />
                    </button>
                 </div>

                 <form onSubmit={handleUploadSubmit} className="p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
                     <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1 text-left col-span-2">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Document Name</label>
                           <input 
                             type="text" 
                             required
                             placeholder="e.g. Early Check-In Guidelines"
                             value={uploadForm.name}
                             onChange={(e) => setUploadForm({...uploadForm, name: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all"
                           />
                        </div>

                        <div className="space-y-1 text-left">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Document Type</label>
                           <select 
                             value={uploadForm.docType}
                             onChange={(e) => setUploadForm({...uploadForm, docType: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all cursor-pointer"
                           >
                              <option value="SOP">SOP</option>
                              <option value="Policy">Policy</option>
                              <option value="Pricing">Pricing</option>
                              <option value="FAQ">FAQ</option>
                           </select>
                        </div>

                        <div className="space-y-1 text-left">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Category</label>
                           <select 
                             value={uploadForm.category}
                             onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all cursor-pointer"
                           >
                              <option value="Policy">Core Policies</option>
                              <option value="Spa">Spa & Pricing</option>
                              <option value="Operations">Operations SOPs</option>
                              <option value="Billing">Billing Rules</option>
                           </select>
                        </div>

                        <div className="space-y-1 text-left">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Target Flow</label>
                           <select 
                             value={uploadForm.connectedFlows}
                             onChange={(e) => setUploadForm({...uploadForm, connectedFlows: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all cursor-pointer"
                           >
                              <option value="Late Checkout Automation">Late Checkout</option>
                              <option value="Spa Upsell Automation">Spa Upsell</option>
                              <option value="Billing Dispute Resolution">Dispute Resolution</option>
                              <option value="General Operations">General Operations</option>
                           </select>
                        </div>

                        <div className="space-y-1 text-left">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Applies To</label>
                           <select 
                             value={uploadForm.appliesTo}
                             onChange={(e) => setUploadForm({...uploadForm, appliesTo: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all cursor-pointer"
                           >
                              <option value="All Guests">All Guests</option>
                              <option value="VIP Only">VIP Only</option>
                              <option value="Loyalty Members">Loyalty Members</option>
                           </select>
                        </div>

                        <div className="space-y-1 text-left">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Priority Level</label>
                           <select 
                             value={uploadForm.priority}
                             onChange={(e) => setUploadForm({...uploadForm, priority: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all cursor-pointer"
                           >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                           </select>
                        </div>

                        <div className="space-y-1 text-left">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Confidence Threshold</label>
                           <input 
                             type="text" 
                             value={uploadForm.confidenceThreshold}
                             onChange={(e) => setUploadForm({...uploadForm, confidenceThreshold: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all"
                           />
                        </div>

                        <div className="space-y-1 text-left flex items-center justify-between col-span-2 pt-1">
                           <div className="flex items-center gap-1.5">
                              <input 
                                type="checkbox" 
                                checked={uploadForm.autoApproval}
                                onChange={(e) => setUploadForm({...uploadForm, autoApproval: e.target.checked})}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <label className="text-[10px] font-bold text-slate-700">Auto Approval</label>
                           </div>
                           <div className="flex items-center gap-1.5">
                              <input 
                                type="checkbox" 
                                checked={uploadForm.humanApproval}
                                onChange={(e) => setUploadForm({...uploadForm, humanApproval: e.target.checked})}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <label className="text-[10px] font-bold text-slate-700">Human Approval Required</label>
                           </div>
                        </div>

                        <div className="space-y-1 text-left col-span-2">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Rule Summary</label>
                           <textarea 
                             placeholder="Summarize the core rule (e.g., Allow late checkout up to 2 PM for gold members)."
                             value={uploadForm.summary}
                             onChange={(e) => setUploadForm({...uploadForm, summary: e.target.value})}
                             rows={2}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all resize-none"
                           />
                        </div>

                        <div className="space-y-1 text-left col-span-2">
                           <label className="text-[9px] font-bold text-slate-400 uppercase block">Tags</label>
                           <input 
                             type="text" 
                             placeholder="e.g. checkout, vip, gold"
                             value={uploadForm.tags}
                             onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                             className="w-full px-2.5 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all"
                           />
                        </div>
                     </div>

                     {/* Clickable Drag & Drop box */}
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="border border-dashed border-slate-200 hover:border-purple-500 rounded-xl p-4 bg-slate-50/30 text-center space-y-1 cursor-pointer transition-all hover:bg-purple-50/10 group"
                     >
                        <Upload size={14} className="text-[#6D28D9] mx-auto group-hover:scale-105 transition-transform" />
                        <p className="text-[9px] font-bold text-slate-700 uppercase">Select Policy PDF file</p>
                        <span className="text-[8px] text-slate-400 block font-medium">Click to select guidelines file from device</span>
                     </div>                

                     <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsUploadOpen(false)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-650 transition-colors"
                        >
                           Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer min-w-[150px]"
                        >
                           {isUploading ? (
                              <>
                                <RefreshCw size={10} className="animate-spin text-purple-300" />
                                <span>Analyzing & Indexing...</span>
                              </>
                           ) : (
                              <span>Analyze & Index SOP</span>
                           )}
                        </button>
                     </div>
                  </form>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
         {deleteConfirmOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden text-left font-sans"
              >
                 <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                          <Trash2 size={20} />
                       </div>
                       <div className="text-left">
                          <h3 className="text-sm font-bold text-slate-900">Delete Knowledge SOP</h3>
                          <p className="text-xs text-slate-500 font-medium">This action cannot be undone.</p>
                       </div>
                    </div>
                    
                    <p className="text-xs text-slate-650 font-semibold leading-relaxed">
                       Are you sure you want to remove <span className="text-slate-900 font-bold">"{docToDelete?.name}"</span> from the AI response rules? This will immediately purge it from the vector RAG pipeline.
                    </p>

                    <div className="flex justify-end gap-2.5 pt-2">
                       <button
                         type="button"
                         onClick={() => {
                           setDeleteConfirmOpen(false);
                           setDocToDelete(null);
                         }}
                         className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 transition-colors cursor-pointer"
                       >
                          Cancel, Keep SOP
                       </button>
                       <button
                         type="button"
                         onClick={handleConfirmDelete}
                         className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                       >
                          Confirm & Delete
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default KnowledgeBase;
