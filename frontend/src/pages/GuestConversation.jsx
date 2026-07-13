import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerUpLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const GuestConversation = () => {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const messagesEndRef = useRef(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialise conversation on mount
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guest-conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Guest', phone: 'anonymous' }),
        });
        const json = await res.json();
        if (json.success) {
          setConversationId(json.conversationId);
        } else {
          triggerToast('Failed to start conversation');
        }
      } catch (e) {
        console.error(e);
        triggerToast('Error initializing chat');
      }
    };
    init();
  }, []);

  // Fetch conversation details when id is ready
  useEffect(() => {
    if (!conversationId) return;
    const fetch = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/guest-conversations/${conversationId}`);
        const json = await res.json();
        if (json.success) {
          setMessages(json.data.messages);
          scrollToBottom();
        }
      } catch (e) {
        console.error(e);
        triggerToast('Error loading messages');
      }
    };
    fetch();
  }, [conversationId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      // Post guest message
      await fetch(`${API_BASE_URL}/api/guest-conversations/${conversationId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, sender: 'guest' }),
      });
      // Trigger AI reply
      const aiRes = await fetch(`${API_BASE_URL}/api/guest-conversations/${conversationId}/ai-reply`, {
        method: 'POST',
      });
      const aiJson = await aiRes.json();
      // Refresh messages
      const refreshed = await fetch(`${API_BASE_URL}/api/guest-conversations/${conversationId}`);
      const refreshedJson = await refreshed.json();
      if (refreshedJson.success) {
        setMessages(refreshedJson.data.messages);
        scrollToBottom();
      }
      setInput('');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to send message');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 font-sans bg-slate-50/20 rounded-xl shadow-xl">
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-semibold flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-[#A78BFA]" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-slate-900">Guest AI Chat</h1>
        <div className="flex items-center gap-2">
          <Search size={18} className="text-slate-400" />
          <CornerUpLeft size={18} className="text-slate-400 cursor-pointer" onClick={() => window.history.back()} />
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto mb-4 max-h-[60vh] space-y-4 p-2 bg-white rounded-lg shadow-inner">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'guest' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'guest' ? 'bg-white border border-slate-200 text-slate-900' : 'bg-[#6D28D9] text-white'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          className="flex-1 p-3 border rounded-md focus:outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-[#6D28D9] text-white rounded-md hover:bg-[#5B21B6] transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default GuestConversation;
