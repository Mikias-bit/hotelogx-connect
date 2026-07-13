import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bot,
  User,
  Send,
  Calendar,
  Smartphone,
  Mail,
  Zap,
  CheckCircle2,
  X,
  Plus,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Info,
  RefreshCw,
  AlertCircle,
  Phone,
  PhoneCall,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const initialConversations = [];

const Conversations = () => {
  const navigate = useNavigate();
  const [convs, setConvs] = useState(initialConversations);
  const [selectedId, setSelectedId] = useState(null);
  const [activeChannel, setActiveChannel] = useState('ALL');
  const [inputMsg, setInputMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileView, setMobileView] = useState('list'); // 'list', 'chat', 'info'

  // Create conversation Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null); // 'whatsapp', 'email'
  const [formGuestName, setFormGuestName] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formInitialMsg, setFormInitialMsg] = useState('');
  const [formMode, setFormMode] = useState('AI'); // 'AI' or 'HUMAN'

  // Fetch all conversations from live backend database endpoints
  useEffect(() => {
    const fetchAllConversations = async () => {
      try {
        const statuses = ['escalated', 'In Progress', 'active', 'resolved'];
        const promises = statuses.map(status =>
          fetch(`${API_BASE_URL}/api/conversations?status=${encodeURIComponent(status)}`)
            .then(res => res.json())
        );
        const results = await Promise.all(promises);
        
        let allConvs = [];
        results.forEach((data, idx) => {
          if (data.success && Array.isArray(data.data)) {
            const transformed = data.data.map(c => ({
              id: c.id,
              guest: c.guestName || 'Unknown Guest',
              lastMsg: c.lastMessage || 'No messages yet',
              time: c.waitingDuration || 'Just now',
              mode: (c.status === 'active' || c.status === 'resolved') ? 'AI' : 'HUMAN',
              channel: (c.channel || 'whatsapp').toLowerCase(),
              room: c.roomNumber || 'N/A',
              status: c.loyaltyTier || 'Standard Member',
              stay: c.checkoutDate ? `Until ${c.checkoutDate}` : 'Active Stay',
              confidence: (c.status === 'active' || c.status === 'resolved') ? '98%' : 'N/A',
              messages: [] // messages will be fetched on demand below
            }));
            allConvs = [...allConvs, ...transformed];
          }
        });

        // Always set conversations, even if empty
        setConvs(prevConvs => {
          return allConvs.map(newC => {
            const existing = prevConvs.find(p => p.id === newC.id);
            return {
              ...newC,
              messages: existing ? existing.messages : []
            };
          });
        });
        
        if (allConvs.length > 0) {
          if (!allConvs.find(c => c.id === selectedId)) {
            setSelectedId(allConvs[0].id);
          }
        } else {
          setSelectedId(null);
        }
      } catch (err) {
        console.warn('Backend offline or database unseeded, keeping simulated demo conversations:', err.message);
      }
    };

    fetchAllConversations();
    const interval = setInterval(fetchAllConversations, 5000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Fetch messages dynamically when selectedId changes
  useEffect(() => {
    if (!selectedId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/${selectedId}/messages`);
        const data = await response.json();
        if (data.success && Array.isArray(data.messages)) {
          const formattedMessages = data.messages
            .filter(m => m.senderType !== 'tool' && !(m.senderType === 'ai' && (!m.content || !m.content.trim())))
            .map(m => ({
              id: m.id,
              sender: m.senderType === 'human' ? 'human' : m.senderType === 'ai' ? 'ai' : m.senderType === 'system' ? 'system_event' : 'guest',
              text: m.content,
              time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));

          setConvs(prev => prev.map(c =>
            c.id === selectedId ? { ...c, messages: formattedMessages } : c
          ));
        }
      } catch (err) {
        console.warn('Failed to fetch live messages:', err.message);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedId]);

  const activeConv = convs.find(c => c.id === selectedId) || convs[0] || {
    id: 1,
    guest: 'No Conversations',
    lastMsg: '',
    time: '',
    mode: 'AI',
    channel: 'whatsapp',
    room: 'N/A',
    status: '',
    stay: '',
    confidence: '0%',
    messages: []
  };
  const messagesEndRef = useRef(null);
  const chatFeedRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);
  const previousSelectedIdRef = useRef(selectedId);
  const previousMessageCountRef = useRef(activeConv.messages.length);

  // Voice Calling states
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callState, setCallState] = useState('Calling...'); // 'Calling...', 'Incoming Call', 'Active Call', 'Ended'
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [guestSpeaking, setGuestSpeaking] = useState(false);
  const [currentCallId, setCurrentCallId] = useState(null);
  const [callTranscript, setCallTranscript] = useState([]);

  const handleStartCall = async () => {
    setIsCallModalOpen(true);
    setCallState('Calling...');
    setCallDuration(0);
    setIsMuted(false);
    setAiSpeaking(false);
    setGuestSpeaking(false);
    setCallTranscript([{ sender: 'sys', text: 'Initiating secure WebRTC voice stream...' }]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/voice/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId: activeConv.id,
          guestName: activeConv.guest,
          roomNumber: activeConv.room
        })
      });
      const data = await res.json();
      if (data.success && data.call) {
        setCurrentCallId(data.call.callId);
      }
    } catch (err) {
      console.warn('Voice start API fallback:', err);
      setCurrentCallId('CALL-SIM-' + Date.now());
    }

    setTimeout(() => {
      setCallState('Incoming Call');
      setTimeout(() => {
        setCallState('Active Call');
        setAiSpeaking(true);
        setCallTranscript(prev => [...prev, { sender: 'ai', text: `Hello ${activeConv.guest}, this is AutoPilot AI. How can I assist you today?` }]);
        setTimeout(() => setAiSpeaking(false), 3000);
      }, 2000);
    }, 1500);
  };

  useEffect(() => {
    let timer;
    if (callState === 'Active Call') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  const handleSimulateSpeech = async (scenario) => {
    setGuestSpeaking(true);
    let speechText = '';
    let confidence = 0.95;
    let sentiment = 'neutral';
    let billing = 0;
    let humanReq = false;

    if (scenario === 'normal') {
      speechText = 'Can I request a late checkout tomorrow around 2 PM?';
    } else if (scenario === 'angry') {
      speechText = 'This is ridiculous! My room is not cleaned properly and I am very frustrated!';
      sentiment = 'angry';
    } else if (scenario === 'billing') {
      speechText = 'I want a $300 refund for the resort fee that I was wrongly charged.';
      billing = 300;
    } else if (scenario === 'human') {
      speechText = 'I want to speak to a real human manager right now.';
      humanReq = true;
    }

    setCallTranscript(prev => [...prev, { sender: 'guest', text: speechText }]);
    setTimeout(() => setGuestSpeaking(false), 2000);

    try {
      const res = await fetch(`${API_BASE_URL}/api/voice/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: currentCallId,
          transcriptText: speechText,
          confidence,
          sentiment,
          billingAmount: billing,
          humanRequest: humanReq
        })
      });
      const data = await res.json();
      if (data.success) {
        if (data.escalated || data.data?.escalated) {
          const respText = data.aiResponse || data.data?.aiResponse || "I am transferring you to a human operator right away.";
          const reasonText = data.reason || data.data?.reason || "Escalation criteria met";
          setAiSpeaking(true);
          setCallTranscript(prev => [...prev, { sender: 'ai', text: respText }]);
          setTimeout(() => {
            setAiSpeaking(false);
            handleTransferToHuman(respText, reasonText);
          }, 3000);
        } else {
          const respText = data.aiResponse || data.data?.aiResponse || "I've processed your request.";
          setAiSpeaking(true);
          setCallTranscript(prev => [...prev, { sender: 'ai', text: respText }]);
          setTimeout(() => setAiSpeaking(false), 4000);
        }
      }
    } catch (err) {
      console.warn('Voice process API fallback:', err);
      if (scenario !== 'normal') {
        handleTransferToHuman('Transferring to human operator due to policy limit.', `Guest scenario: ${scenario}`);
      } else {
        setAiSpeaking(true);
        setCallTranscript(prev => [...prev, { sender: 'ai', text: "I've processed your request successfully in Opera PMS." }]);
        setTimeout(() => setAiSpeaking(false), 3000);
      }
    }
  };

  const handleTransferToHuman = (aiResp = 'Transferring to human operator.', reason = 'Requested human operator') => {
    const takeoverList = JSON.parse(localStorage.getItem('autopilot_voice_takeover') || '[]');
    takeoverList.push({
      id: Date.now(),
      guestName: activeConv.guest,
      roomNumber: activeConv.room,
      loyaltyTier: activeConv.status,
      duration: `${Math.floor(callDuration / 60)}m ${callDuration % 60}s`,
      status: 'Live Call',
      escalationReason: reason,
      transcript: callTranscript.map(t => `${t.sender.toUpperCase()}: ${t.text}`).join('\n'),
      aiSuggestion: aiResp,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('autopilot_voice_takeover', JSON.stringify(takeoverList));
    setCallState('Ended');
    setTimeout(() => {
      setIsCallModalOpen(false);
      navigate('/app/takeover-queue');
    }, 1500);
  };

  const handleEndCall = async () => {
    setCallState('Ended');
    try {
      await fetch(`${API_BASE_URL}/api/voice/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId: currentCallId })
      });
    } catch (e) {}
    setTimeout(() => setIsCallModalOpen(false), 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isNearBottom = () => {
    const feed = chatFeedRef.current;
    if (!feed) return true;
    return feed.scrollHeight - feed.scrollTop - feed.clientHeight < 80;
  };

  const handleChatScroll = () => {
    shouldAutoScrollRef.current = isNearBottom();
  };

  useEffect(() => {
    const messageCount = activeConv.messages.length;
    const selectedChanged = previousSelectedIdRef.current !== selectedId;
    const messageAdded = messageCount > previousMessageCountRef.current;

    if (selectedChanged || shouldAutoScrollRef.current || messageAdded && isNearBottom()) {
      scrollToBottom();
    }

    previousSelectedIdRef.current = selectedId;
    previousMessageCountRef.current = messageCount;
  }, [activeConv.messages, selectedId]);

  const handleSelectChat = (id) => {
    shouldAutoScrollRef.current = true;
    setSelectedId(id);
    setMobileView('chat');
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || activeConv.mode === 'AI') return;

    const currentMsg = inputMsg;
    setInputMsg('');
    shouldAutoScrollRef.current = true;

    try {
      const response = await fetch(`${API_BASE_URL}/api/conversations/${selectedId}/human-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: currentMsg,
          operatorName: 'David'
        })
      });
      const data = await response.json();
      if (data.success && data.message) {
        const newMsg = {
          id: data.message.id,
          sender: 'human',
          text: data.message.content,
          time: new Date(data.message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setConvs(prev => prev.map(c =>
          c.id === selectedId ? {
            ...c,
            messages: [...c.messages, newMsg],
            lastMsg: currentMsg,
            time: 'Just now',
            mode: 'HUMAN'
          } : c
        ));
      }
    } catch (err) {
      console.warn('Failed to send live operator reply, using local fallback:', err.message);
      const fallbackMsg = {
        id: Date.now(),
        sender: 'human',
        text: currentMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setConvs(prev => prev.map(c =>
        c.id === selectedId ? { ...c, messages: [...c.messages, fallbackMsg], lastMsg: currentMsg, time: 'Just now' } : c
      ));
    }
  };

  // Switch between AI and Human manually (or trigger simulated escalation)
  const handleToggleMode = async (id, newMode) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    shouldAutoScrollRef.current = true;

    if (newMode === 'AI') {
      try {
        const response = await fetch(`${API_BASE_URL}/api/conversations/${id}/return-to-ai`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success) {
          setConvs(prev => prev.map(c =>
            c.id === id ? {
              ...c,
              mode: 'AI',
              messages: [...c.messages, { id: `sys-esc-${Date.now()}`, sender: 'system_event', text: 'AI automation resumed', time: timeNow }]
            } : c
          ));
        }
      } catch (err) {
        console.warn('Failed to return conversation to AI, applying local transition:', err.message);
        setConvs(prev => prev.map(c =>
          c.id === id ? {
            ...c,
            mode: 'AI',
            messages: [...c.messages, { id: `sys-esc-${Date.now()}`, sender: 'system_event', text: 'AI automation resumed', time: timeNow }]
          } : c
        ));
      }
    } else {
      setConvs(prev => prev.map(c =>
        c.id === id ? {
          ...c,
          mode: 'HUMAN',
          messages: [
            ...c.messages,
            { id: `sys-esc-${Date.now()}-1`, sender: 'system_event', text: 'Conversation escalated due to policy safeguard', time: timeNow },
            { id: `sys-esc-${Date.now()}-2`, sender: 'system_event', text: 'Assigned to Front Desk Manager', time: timeNow },
            { id: `sys-esc-${Date.now()}-3`, sender: 'system_event', text: 'Human operator joined', time: timeNow }
          ]
        } : c
      ));
    }
  };

  const handleStartConversation = (e) => {
    e.preventDefault();
    if (!formGuestName.trim()) return;

    const newId = Date.now();
    const newConv = {
      id: newId,
      guest: formGuestName,
      lastMsg: formInitialMsg.trim() || 'Conversation initialized',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: formMode,
      channel: selectedChannel,
      room: formRoom || 'N/A',
      status: 'Standard Guest',
      stay: 'Active Stay',
      confidence: formMode === 'AI' ? '95%' : '0%',
      messages: [
        ...(formInitialMsg.trim() ? [{
          id: Date.now(),
          sender: 'guest',
          text: formInitialMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }] : [])
      ]
    };

    setConvs(prev => [newConv, ...prev]);
    setSelectedId(newId);

    // Auto activate tab
    setActiveChannel(selectedChannel.toUpperCase());

    // Close modal & reset
    setIsCreateModalOpen(false);
    setSelectedChannel(null);
    setFormGuestName('');
    setFormRoom('');
    setFormContact('');
    setFormInitialMsg('');
    setFormMode('AI');
  };

  return (
    <div className="h-full min-h-0 flex bg-white rounded-2xl shadow-lg overflow-hidden animate-in fade-in duration-700 relative text-left">


      {/* 1. LEFT PANEL: Guest Channels List */}
      <div className={`
        ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
        w-full md:w-[17rem] lg:w-72 flex-col border-r border-slate-100 bg-slate-50/10 h-full min-h-0 shrink-0
      `}>
        <div className="px-4 py-3 border-b border-slate-100/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-slate-950 tracking-tight">Guest Conversations</h1>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">View and manage all guest communications.</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg hover:scale-105 transition-transform shadow-md shrink-0"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Channel Filters */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1 overflow-x-auto shrink-0">
            {['ALL', 'WHATSAPP', 'EMAIL'].map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`flex-1 px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeChannel === ch ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {ch}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-350" size={14} />
            <input
              type="text"
              placeholder="Search guests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold focus:ring-4 focus:ring-purple-500/5 transition-all outline-none"
            />
          </div>
        </div>

        {/* Guest Conversation Scroll */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-2.5 space-y-2">
          {convs
            .filter(c => {
              const matchesSearch = c.guest.toLowerCase().includes(searchTerm.toLowerCase());
              if (activeChannel === 'ALL') return matchesSearch;
              return matchesSearch && c.channel.toLowerCase() === activeChannel.toLowerCase();
            })
            .map((chat) => {
              const isSelected = selectedId === chat.id;
              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full p-3 rounded-xl flex gap-3 transition-all border text-left relative overflow-hidden group ${isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/5'
                      : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-800 shadow-sm'
                    }`}
                >
                  <div className="relative shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {chat.guest[0]}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center shadow-sm ${isSelected ? 'border-slate-900 bg-white text-slate-900' : 'border-white bg-slate-900 text-white'
                      }`}>
                      {chat.channel === 'whatsapp' ? (
                        <Smartphone size={9} />
                      ) : (
                        <Mail size={9} />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <span className="font-bold truncate text-xs">{chat.guest}</span>
                      <span className="text-[9px] font-semibold opacity-60 shrink-0">{chat.time}</span>
                    </div>
                    <p className={`text-[11px] truncate font-medium mb-1.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {chat.lastMsg}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${chat.mode === 'AI' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <span className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-slate-350' : 'text-slate-500'}`}>
                        {chat.mode === 'AI' ? 'AI Auto-Pilot' : 'Human Active'}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* 2. CENTER PANEL: Live Chat Area */}
      <div className={`
        ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}
        flex-1 flex-col bg-white h-full min-h-0
      `}>
        {/* Workspace Chat Header */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-white z-10 text-left">
          <div className="flex items-center gap-3 min-w-0 text-left">
            <button
              onClick={() => setMobileView('list')}
              className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors shrink-0"
            >
              <RefreshCw className="rotate-90" size={16} />
            </button>
            <div className="hidden sm:flex w-9 h-9 bg-slate-50 rounded-xl items-center justify-center text-slate-900 border border-slate-150 shadow-inner shrink-0">
              <User size={16} />
            </div>

            <div className="min-w-0 text-left animate-in fade-in duration-500">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-slate-900 leading-none truncate">{activeConv.guest}</h3>
                <div className={`px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ${activeConv.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                  {activeConv.channel === 'whatsapp' ? <Smartphone size={8} /> : <Mail size={8} />}
                  <span className="text-[7px] font-black uppercase tracking-widest">{activeConv.channel}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeConv.mode === 'AI' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-[0.1em] truncate ${activeConv.mode === 'AI' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {activeConv.mode === 'AI' ? 'AI AUTO-PILOT ACTIVE' : 'HUMAN OPERATOR ACTIVE'}
                  </span>
                </div>

                {activeConv.mode === 'HUMAN' && (
                  <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-650 px-2 py-0.5 rounded font-black uppercase tracking-wider shrink-0">
                    Front Desk Manager Joined
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeConv.mode === 'HUMAN' && (
              <button
                onClick={() => handleToggleMode(activeConv.id, 'AI')}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-600 rounded-xl font-black text-[8px] uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-md"
              >
                <Bot size={12} />
                <span>Return Conversation to AI</span>
              </button>
            )}
            <button
              onClick={() => setMobileView('info')}
              className="md:hidden p-2 text-slate-450 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all shrink-0"
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Live Chat Thread Feed */}
        <div ref={chatFeedRef} onScroll={handleChatScroll} className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-5 sm:px-5 space-y-4 bg-slate-50/20">
          {activeConv.messages.map((msg) => {
            if (!msg.text || !msg.text.trim()) return null;

            // Inline Status Badges
            if (msg.sender === 'system_event') {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-slate-100/90 border border-slate-200/55 rounded-full shadow-sm text-slate-500">
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{msg.text}</span>
                    <span className="text-[8px] font-mono text-slate-400 ml-1">({msg.time})</span>
                  </div>
                </div>
              );
            }

            const isGuest = msg.sender === 'guest';
            const isAI = msg.sender === 'ai';

            return (
              <div key={msg.id} className={`flex flex-col ${isGuest ? 'items-start' : 'items-end'}`}>
                <div className={`flex gap-2.5 max-w-[88%] sm:max-w-[78%] ${isGuest ? '' : 'flex-row-reverse'}`}>
                  <div className={`hidden sm:flex w-8 h-8 rounded-xl items-center justify-center shrink-0 shadow-sm ${isGuest ? 'bg-slate-200 text-slate-600' : isAI ? 'bg-emerald-500 text-white' : 'bg-[#6D28D9] text-white'}`}>
                    {isGuest ? <span className="font-black text-[10px]">{activeConv.guest[0]}</span> : isAI ? <Bot size={15} /> : <User size={15} />}
                  </div>
                  <div className="space-y-1">
                    <div className={`px-3.5 py-3 rounded-xl text-[13px] leading-relaxed ${isGuest
                        ? 'bg-slate-100 text-slate-800 rounded-tl-none shadow-sm font-semibold text-left'
                        : isAI
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tr-none text-left shadow-sm font-semibold'
                          : 'bg-[#6D28D9] text-white rounded-tr-none text-left shadow-sm font-semibold'
                      }`}>
                      <p>{msg.text}</p>
                    </div>
                    <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-450 ${isGuest ? 'justify-start' : 'justify-end'}`}>
                      <span>{isGuest ? activeConv.guest : isAI ? 'AI Response' : 'Operator (David)'}</span>
                      <span className="opacity-50">•</span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Bar */}
        <div className="p-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-3 border-t border-slate-100 bg-white shrink-0">
          <form onSubmit={handleSendMessage}>
            {/* Interactive Simulation Handoff Helper */}
            {activeConv.mode === 'AI' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-purple-50/70 border border-purple-100 rounded-xl px-3 py-2 text-left mb-1 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-[10px] text-purple-800 font-bold">
                  <Bot size={12} className="text-[#6D28D9] animate-pulse" />
                  <span>AI Autopilot is actively managing this guest.</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleMode(activeConv.id, 'HUMAN')}
                  className="px-2.5 py-1 bg-[#6D28D9] hover:bg-purple-700 text-white text-[8px] font-black uppercase tracking-widest rounded-lg transition-all shadow-sm shrink-0"
                >
                  Trigger Simulated Handoff (Test)
                </button>
              </div>
            )}

            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={activeConv.mode === 'AI' ? "AI is handling this conversation" : "Type a direct response..."}
                disabled={activeConv.mode === 'AI'}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200/60 rounded-xl text-[13px] font-bold focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-[#6D28D9]/40 outline-none transition-all shadow-sm placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleStartCall}
                className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-md shrink-0 flex items-center gap-1.5 cursor-pointer"
                title="Start Voice Call"
              >
                <Phone size={16} />
              </button>
              <button
                type="submit"
                disabled={activeConv.mode === 'AI' || !inputMsg.trim()}
                className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 3. RIGHT PANEL: Simple Guest Context Panel */}
      <div className={`
        ${mobileView === 'info' ? 'flex' : 'hidden lg:flex'}
        ${mobileView === 'info' ? 'fixed inset-0 z-[60] bg-white' : 'w-[17rem] lg:w-72 xl:w-[19rem]'}
        flex-col border-l border-slate-100 bg-slate-50/10 overflow-y-auto scrollbar-hide h-full min-h-0 shrink-0 text-left
      `}>
        {/* Mobile Info Header */}
        <div className="lg:hidden p-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <h3 className="text-sm font-black text-slate-900 tracking-tight">Guest Information</h3>
          <button onClick={() => setMobileView('chat')} className="p-1.5 bg-slate-50 rounded-lg text-slate-900">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-5 text-left">

          {/* Guest Profile Details */}
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              Guest Context
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-left">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-[#6D28D9] border border-purple-100 shadow-sm shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-900 leading-tight truncate">{activeConv.guest}</p>
                  <span className="text-[8.5px] font-black text-[#6D28D9] uppercase tracking-widest mt-1 inline-block">{activeConv.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Room No.</p>
                  <p className="text-xs font-black text-slate-900">{activeConv.room}</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Stay Dates</p>
                  <p className="text-[10px] font-black text-slate-900 truncate">{activeConv.stay}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Confidence Score */}
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
              Automation Confidence
            </h3>
            <div className="bg-slate-900 rounded-xl p-4 text-white shadow-md relative overflow-hidden text-left">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence Rating</p>
                  <p className="text-xl font-black text-emerald-400 tracking-tight">{activeConv.confidence}</p>
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                  <ShieldCheck size={16} />
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: activeConv.confidence }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/guest-profile')}
            className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Open PMS Profile</span>
            <ExternalLink size={10} />
          </button>
        </div>
      </div>

      {/* 4. MODAL LAYER: Create Conversation Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">

            {/* Choose Channel Modal */}
            {selectedChannel === null ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-2xl border border-slate-150 shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Create New Conversation</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Select guest channel to initialize automation workspace.</p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
                    className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-455 hover:text-slate-900 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  {[
                    {
                      id: 'whatsapp',
                      title: 'WhatsApp Conversation',
                      desc: 'Direct mobile messaging with PMS profile tracking.',
                      icon: Smartphone,
                      color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    },
                    {
                      id: 'email',
                      title: 'Email Conversation',
                      desc: 'Formal correspondence and automated folio attachments.',
                      icon: Mail,
                      color: 'bg-blue-50 text-blue-600 border-blue-100'
                    }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setSelectedChannel(opt.id)}
                      className="w-full p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 flex gap-4 text-left transition-all group"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${opt.color} group-hover:scale-105 transition-transform`}>
                        <opt.icon size={16} />
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-xs font-black text-slate-900">{opt.title}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (

              /* Initialization Form Modal */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="w-full max-w-md bg-white rounded-2xl border border-slate-150 shadow-2xl overflow-hidden text-left"
              >
                <form onSubmit={handleStartConversation}>
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        {selectedChannel === 'whatsapp' ? <Smartphone size={16} className="text-emerald-500" /> : <Mail size={16} className="text-blue-500" />}
                        New {selectedChannel} Chat
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Initialize live communication channel and parameters.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedChannel(null)}
                      className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-455 hover:text-slate-900 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Guest Name</label>
                        <input
                          type="text"
                          required
                          value={formGuestName}
                          onChange={(e) => setFormGuestName(e.target.value)}
                          placeholder="e.g. Robert Downey"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-[#6D28D9] transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Room Number</label>
                        <input
                          type="text"
                          value={formRoom}
                          onChange={(e) => setFormRoom(e.target.value)}
                          placeholder="e.g. 305"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-[#6D28D9] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        {selectedChannel === 'email' ? 'Email Address' : 'Phone / Contact'}
                      </label>
                      <input
                        type="text"
                        value={formContact}
                        onChange={(e) => setFormContact(e.target.value)}
                        placeholder={selectedChannel === 'email' ? 'guest@example.com' : '+1 (555) 019-2834'}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-[#6D28D9] transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Initial Message</label>
                      <textarea
                        rows="2"
                        value={formInitialMsg}
                        onChange={(e) => setFormInitialMsg(e.target.value)}
                        placeholder="Type first query or greeting..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:ring-4 focus:ring-purple-500/5 focus:border-[#6D28D9] transition-all resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Operational Mode Assignment</label>
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setFormMode('AI')}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${formMode === 'AI'
                              ? 'border-emerald-500 bg-emerald-50/25 text-emerald-800 font-bold'
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/30 text-slate-500'
                            }`}
                        >
                          <Bot size={18} className={formMode === 'AI' ? 'text-emerald-600' : 'text-slate-400'} />
                          <span className="text-[10px] uppercase tracking-wider">AI Auto-Pilot</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormMode('HUMAN')}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${formMode === 'HUMAN'
                              ? 'border-[#6D28D9] bg-purple-50/25 text-purple-800 font-bold'
                              : 'border-slate-100 hover:border-slate-200 bg-slate-50/30 text-slate-500'
                            }`}
                        >
                          <User size={18} className={formMode === 'HUMAN' ? 'text-[#6D28D9]' : 'text-slate-400'} />
                          <span className="text-[10px] uppercase tracking-wider">Human Control</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedChannel(null)}
                      className="px-4 py-2 bg-white border border-slate-250 text-slate-500 hover:text-slate-800 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-slate-900/10"
                    >
                      Start Conversation
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* VOICE CALL MODAL PANEL */}
        {isCallModalOpen && (
          <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden flex flex-col text-left"
            >
              {/* Call Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-emerald-400 border border-white/10 shadow-inner">
                    <PhoneCall size={24} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight leading-tight">{activeConv.guest}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">Room {activeConv.room} • {activeConv.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                    callState === 'Active Call' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse' : 'bg-white/10 text-slate-300 border-white/10'
                  }`}>
                    {callState}
                  </span>
                  {callState === 'Active Call' && (
                    <p className="text-xs font-mono font-bold text-slate-300 mt-1">
                      {Math.floor(callDuration / 60)}:{callDuration % 60 < 10 ? '0' : ''}{callDuration % 60}
                    </p>
                  )}
                </div>
              </div>

              {/* Indicators & Interactive Speech Simulator */}
              <div className="p-6 space-y-6 bg-slate-50/50 flex-1 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    aiSpeaking ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    <Bot size={20} className={aiSpeaking ? 'text-emerald-600 animate-bounce' : 'text-slate-400'} />
                    <div className="min-w-0">
                      <p className="text-xs font-black">AI Voice Engine</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{aiSpeaking ? 'Speaking...' : 'Listening'}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    guestSpeaking ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-sm' : 'bg-white border-slate-200 text-slate-500'
                  }`}>
                    <User size={20} className={guestSpeaking ? 'text-[#6D28D9] animate-bounce' : 'text-slate-400'} />
                    <div className="min-w-0">
                      <p className="text-xs font-black">Guest Audio</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{guestSpeaking ? 'Speaking...' : 'Listening'}</p>
                    </div>
                  </div>
                </div>

                {/* Live Transcript Stream */}
                <div className="space-y-2 text-left bg-white p-4 rounded-xl border border-slate-150 min-h-[120px] max-h-[200px] overflow-y-auto shadow-inner">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1">Live Call Transcript</p>
                  {callTranscript.map((t, idx) => (
                    <div key={idx} className="text-xs leading-relaxed font-medium">
                      <span className={`font-bold ${t.sender === 'ai' ? 'text-emerald-600' : t.sender === 'guest' ? 'text-purple-700' : 'text-slate-400'}`}>
                        {t.sender.toUpperCase()}: 
                      </span> <span className="text-slate-700">{t.text}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Simulator Triggers */}
                {callState === 'Active Call' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulate Guest Speech Input (STT to AI):</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleSimulateSpeech('normal')}
                        disabled={guestSpeaking || aiSpeaking}
                        className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 text-left transition-all shadow-sm flex items-center justify-between disabled:opacity-50 cursor-pointer"
                      >
                        <span>Late Checkout Req</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-black">Normal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSpeech('angry')}
                        disabled={guestSpeaking || aiSpeaking}
                        className="p-2.5 bg-white hover:bg-red-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 text-left transition-all shadow-sm flex items-center justify-between disabled:opacity-50 cursor-pointer"
                      >
                        <span>Angry Frustration</span>
                        <span className="text-[9px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-black">Escalate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSpeech('billing')}
                        disabled={guestSpeaking || aiSpeaking}
                        className="p-2.5 bg-white hover:bg-amber-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 text-left transition-all shadow-sm flex items-center justify-between disabled:opacity-50 cursor-pointer"
                      >
                        <span>$300 Refund Req</span>
                        <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-black">Escalate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSimulateSpeech('human')}
                        disabled={guestSpeaking || aiSpeaking}
                        className="p-2.5 bg-white hover:bg-purple-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 text-left transition-all shadow-sm flex items-center justify-between disabled:opacity-50 cursor-pointer"
                      >
                        <span>Req Real Manager</span>
                        <span className="text-[9px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-black">Escalate</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Controls Footer */}
              <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isMuted ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTransferToHuman('Transferring to live support queue.', 'Manual Operator Transfer')}
                    className="px-4 py-3 bg-[#6D28D9] hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus size={16} />
                    <span>Transfer to Human</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEndCall}
                    className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    title="End Call"
                  >
                    <PhoneOff size={16} />
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

export default Conversations;
