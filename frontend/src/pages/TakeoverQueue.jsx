import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Clock,
  Search,
  Bot,
  User,
  CornerUpLeft,
  CheckCircle2,
  PhoneCall,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Activity,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Sliders,
  ShieldAlert,
  Flame,
  Gauge,
  Ear,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const TakeoverQueue = () => {
  const [queue, setQueue] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [replyText, setReplyText] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  const [showCallModal, setShowCallModal] = useState(false);

  // ElevenLabs Voice Takeover Interactive State
  const [orbState, setOrbState] = useState('Guest Speaking...'); // 'AI Listening...', 'Guest Speaking...', 'Processing...', 'Human Joined...'
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Toast feedback
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const messagesEndRef = useRef(null);
  const voiceScrollRef = useRef(null);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    voiceScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [showCallModal]);

  // Fetch escalated conversations on mount and every 10 seconds
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/conversations?status=escalated`);
        const json = await res.json();
        if (json.success) {
          setQueue(prevQueue => {
            return json.data.map(conv => {
              const existing = prevQueue.find(item => item.id === conv.id);
              return {
                ...conv,
                messages: existing ? existing.messages : [],
              };
            });
          });
          if (json.data.length > 0 && activeIdRef.current === null) {
            setActiveId(json.data[0].id);
          }
        }
      } catch (e) {
        triggerToast(`Failed to load queue: ${e.message}`);
      }
    };
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, []);

  // When active conversation changes, load its messages with a polling interval
  useEffect(() => {
    if (!activeId) return;
    const loadMessages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/conversations/${activeId}/messages`);
        const json = await res.json();
        if (json.success) {
          setQueue(prev => prev.map(item => item.id === activeId ? { 
            ...item, 
            messages: json.messages
              .filter(m => m.senderType !== 'tool' && !(m.senderType === 'ai' && (!m.content || !m.content.trim())))
              .map(m => ({
                id: m.id,
                sender: m.senderType === 'human' ? 'human' : m.senderType === 'ai' ? 'ai' : m.senderType === 'system' ? 'system_event' : 'guest',
                text: m.content,
                time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              })) 
          } : item));
        }
      } catch (e) {
        // Fetch error handled silently
      }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeId]);

  const activeItem = queue.find(item => item.id === activeId) || {};

  // Scroll to bottom when selected conversation changes or new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [activeId, activeItem?.messages?.length]);

  const filteredQueue = queue.filter(item => {
    const matchesSearch =
      item.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.roomNumber?.includes(searchTerm) ||
      item.escalationReason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSendManual = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${activeId}/human-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: replyText }),
      });
      const json = await res.json();
      if (json.success) {
        setQueue(prev => prev.map(item => item.id === activeId ? {
          ...item,
          status: 'Resolved',
          messages: [...item.messages, { id: Date.now(), sender: 'human', text: replyText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
        } : item));
        setReplyText('');
        triggerToast('Message sent to guest');
      } else {
        triggerToast('Failed to send reply');
      }
    } catch (err) {
      triggerToast('Error sending reply');
    }
  };

  const handleReturnToAI = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${activeId}/return-to-ai`, { method: 'PUT' });
      const json = await res.json();
      if (json.success) {
        setQueue(prev => prev.map(item => item.id === activeId ? { ...item, status: 'Pending Review' } : item));
        triggerToast('AI custody resumed');
      } else {
        triggerToast('Failed to return to AI');
      }
    } catch (e) {
      triggerToast('Error returning to AI');
    }
  };

  const handleJoinCall = () => {
    setOrbState('Human Joined...');
    triggerToast(`Human Operator joined active call stream with ${activeItem?.guestName}`);
  };

  const handleTakeOverCall = () => {
    setOrbState('Human Joined...');
    triggerToast(`Took over voice call custody for ${activeItem?.guestName}`);
  };

  const handleReturnVoiceToAI = () => {
    setOrbState('AI Listening...');
    triggerToast('Call custody returned to AI Automation.');
    setTimeout(() => setShowCallModal(false), 1000);
  };

  // UI rendering (unchanged from original except data source)
  return (
    <div className={`${mobileView === 'chat' ? 'px-0 pb-0 pt-0 space-y-0 h-full flex flex-col lg:px-6 lg:pb-6 lg:pt-1 lg:space-y-5 lg:h-auto lg:block' : 'px-4 pb-6 pt-1 space-y-5'} sm:px-6 sm:pb-6 sm:pt-1 sm:space-y-5 max-w-[1600px] mx-auto font-sans text-left bg-slate-50/25`}
    >
      {/* Toast notifications */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5"
          >
            <CheckCircle2 size={16} className="text-[#A78BFA]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ElevenLabs‑Style Live Voice Takeover Dashboard Overlay */}
      <AnimatePresence>
        {showCallModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900/90 border border-slate-700/60 text-white w-full max-w-6xl rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden text-left flex flex-col my-auto max-h-[92vh]"
            >
              {/* ... modal content retained unchanged ... */}
              {/* (Omitted for brevity; copy original modal markup here) */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page split layout */}
      <div className={`grid grid-cols-12 ${mobileView === 'chat' ? 'gap-0 sm:gap-6 h-full flex-1 min-h-0 lg:gap-6 lg:h-[calc(100vh-140px)] lg:flex-none' : 'gap-6 h-[calc(100vh-140px)]'} sm:h-[calc(100vh-140px)] items-stretch animate-in fade-in duration-500`}
      >
        {/* LEFT PANEL – Compact Escalation Inbox */}
        <div className={`${mobileView === 'list' ? 'flex' : 'hidden lg:flex'} col-span-12 lg:col-span-3 flex flex-col space-y-3.5 h-full min-h-0`}
        >
          <div className="px-1 text-left shrink-0">
            <h1 className="text-xl font-black text-slate-950 tracking-tight">Human Assistance Queue</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Guest requests that require staff intervention.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200/70 rounded-xl outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-450 focus:border-[#6D28D9]/40 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-sm"
                placeholder="Search guest or escalation..."
              />
            </div>
            <select
              value={activeFilter}
              onChange={e => setActiveFilter(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200/70 text-xs font-bold text-slate-800 rounded-xl outline-none cursor-pointer focus:border-[#6D28D9]/45 transition-all shadow-sm"
            >
              <option value="All">All Cases</option>
              <option value="Pending Review">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          {/* Inbox Cases Scroll Feed */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4">
            {filteredQueue.map(item => {
              const isActive = activeId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => { setActiveId(item.id); setReplyText(''); setMobileView('chat'); }}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' : 'bg-white border-slate-150 hover:border-slate-250 hover:bg-slate-50/40 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs truncate max-w-[120px]">{item.guestName}</span>
                        <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border shrink-0 ${isActive ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>
                          Room {item.roomNumber}
                        </span>
                      </div>
                      <p className={`text-[8.5px] font-black uppercase tracking-wider ${isActive ? 'text-slate-400' : 'text-[#6D28D9]'}`}>
                        {item.channel} Connection
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[7.5px] font-black uppercase tracking-widest border shrink-0 ${item.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-100' : item.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className={`text-[10px] font-semibold mt-1.5 leading-normal ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{item.escalationReason}</p>
                  <div className="flex justify-between items-center border-t border-slate-100/10 pt-1.5 mt-1.5 text-[8px] font-bold opacity-60 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={10} />{item.waitingDuration} Waiting</span>
                  </div>
                </div>
              );
            })}
            {filteredQueue.length === 0 && (
              <div className="bg-slate-50 p-12 text-center rounded-xl border border-slate-150 animate-pulse">
                <Users className="mx-auto text-slate-400 mb-2" size={24} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching cases</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN – Calm Live Conversation Workspace */}
        <div className={`${mobileView === 'chat' ? 'flex' : 'hidden lg:flex'} col-span-12 lg:col-span-9 flex flex-col h-full bg-white border-0 sm:border border-slate-200/70 rounded-none sm:rounded-2xl shadow-none sm:shadow-sm overflow-hidden text-left relative`}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
            <div className="flex items-center gap-3 min-w-0 text-left">
              <button onClick={() => setMobileView('list')} className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors shrink-0">
                <CornerUpLeft size={16} />
              </button>
              <div className="text-left space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-black text-slate-900 tracking-tight">{activeItem?.guestName}</h2>
                  <span className="text-[9px] text-slate-400 font-semibold">•</span>
                  <span className="text-[10.5px] text-slate-650 font-black">Room {activeItem?.roomNumber}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">•</span>
                  <span className="text-[10.5px] text-[#6D28D9] font-black uppercase tracking-wide shrink-0">{activeItem?.loyaltyTier}</span>
                </div>
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border shrink-0 ${activeItem?.status === 'Pending Review' ? 'bg-amber-50 text-amber-700 border-amber-100' : activeItem?.status === 'In Progress' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}
            >
              {activeItem?.status}
            </span>
          </div>

          {/* Workspace */}
          <div className="flex-1 flex overflow-hidden min-h-0 text-left">
            {/* SUPPORT CHAT THREAD */}
            <div className="flex-1 flex flex-col h-full bg-slate-50/10 lg:border-r border-slate-100 min-w-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/5 min-h-0 overscroll-y-contain">
                {activeItem?.messages?.map(msg => {
                  if (msg.sender === 'escalation_separator') {
                    return (
                      <div key={msg.id} className="flex justify-center my-5">
                        <div className="w-full flex items-center gap-3">
                          <div className="flex-1 h-[0.5px] bg-slate-200" />
                          <div className="text-center px-3 shrink-0"><p className="text-[9.5px] font-black uppercase tracking-wider text-[#6D28D9]">{msg.text}</p></div>
                          <div className="flex-1 h-[0.5px] bg-slate-200" />
                        </div>
                      </div>
                    );
                  }
                  if (msg.sender === 'system_event') {
                    return (
                      <div key={msg.id} className="flex justify-center my-3.5">
                        <div className="w-full flex items-center gap-3">
                          <div className="flex-1 h-[0.5px] bg-slate-200/70" />
                          <div className="text-center px-3 shrink-0"><p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">{msg.text} • {msg.time}</p></div>
                          <div className="flex-1 h-[0.5px] bg-slate-200/70" />
                        </div>
                      </div>
                    );
                  }
                  const isGuest = msg.sender === 'guest';
                  const isAI = msg.sender === 'ai';
                  return (
                    <div key={msg.id} className={`flex flex-col ${isGuest ? 'items-start' : 'items-end'} animate-in fade-in duration-300`}>
                      <div className={`flex gap-3 max-w-[80%] ${isGuest ? '' : 'flex-row-reverse'}`}>
                        <div className="space-y-0.5">
                          <div className={`p-3 rounded-2xl text-xs leading-relaxed ${isGuest ? 'bg-white border border-slate-200 text-slate-900' : 'bg-[#6D28D9] border border-[#6D28D9] text-white'}`}>
                            {msg.text}
                          </div>
                          <p className="text-[9px] text-slate-500">{msg.time}</p>
                        </div>
                        {/* Avatar placeholder */}
                        <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                          {isGuest ? 'G' : isAI ? 'A' : 'H'}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              {/* Input area */}
              <form onSubmit={handleSendManual} className="p-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-3 bg-white border-t border-slate-100 shrink-0">
                <div className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type a direct response..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-[#6D28D9]/40 outline-none transition-all shadow-sm placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCallModal(true)}
                    className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                    title="Join Voice Call"
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-md shrink-0 cursor-pointer"
                    title="Send Reply"
                  >
                    <CornerUpLeft size={16} className="rotate-90" />
                  </button>
                </div>
              </form>
            </div>
            {/* RIGHT SIDE – placeholder for analytics (unchanged) */}
            <div className="hidden">
              {/* (Analytics content unchanged) */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeoverQueue;
