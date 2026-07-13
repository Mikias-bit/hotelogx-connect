import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Hotel, 
  ArrowRight, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  Database, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Activity, 
  Calendar, 
  Lock, 
  ShieldCheck,
  Zap,
  Clock,
  ArrowUpRight,
  X,
  Building2,
  Phone,
  Layers,
  MessageSquarePlus,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { addToast, addPendingRequest, subscriptions = [] } = useApp();
  const [activeSop, setActiveSop] = useState('checkout');
  const [demoEmail, setDemoEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enterprise Onboarding Modal States
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);
  const [isOnboardingSuccess, setIsOnboardingSuccess] = useState(false);
  const [onboardingForm, setOnboardingForm] = useState({
    fullName: '',
    hotelName: '',
    workEmail: '',
    pmsProvider: 'Opera PMS',
    roomCount: '',
    whatsapp: '',
    website: '',
    hotelType: 'Boutique',
    plan: 'Pro',
    notes: ''
  });

  // ESC Key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowOnboardingModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openOnboardingModal = (e, planName = 'Pro') => {
    if (e) e.preventDefault();
    setOnboardingForm({
      fullName: '',
      hotelName: '',
      workEmail: '',
      pmsProvider: 'Opera PMS',
      roomCount: '',
      whatsapp: '',
      website: '',
      hotelType: 'Boutique',
      plan: planName,
      notes: ''
    });
    setIsOnboardingSuccess(false);
    setShowOnboardingModal(true);
  };

  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    setIsOnboardingSubmitting(true);
    addPendingRequest({
      hotelName: onboardingForm.hotelName,
      workEmail: onboardingForm.workEmail,
      fullName: onboardingForm.fullName,
      pmsProvider: onboardingForm.pmsProvider,
      roomCount: onboardingForm.roomCount,
      whatsapp: onboardingForm.whatsapp,
      website: onboardingForm.website,
      hotelType: onboardingForm.hotelType,
      plan: onboardingForm.plan,
      notes: onboardingForm.notes
    }).then(() => {
      setIsOnboardingSubmitting(false);
      setIsOnboardingSuccess(true);
      addToast('Onboarding request received successfully!', 'success');
    }).catch(err => {
      setIsOnboardingSubmitting(false);
      addToast('Connection error during submission', 'error');
    });
  };

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDemoRequest = (e) => {
    e.preventDefault();
    if (!demoEmail) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setDemoEmail('');
      addToast('Onboarding request received. Our hospitality integration team will contact you.', 'success');
    }, 1200);
  };

  // Luxury workflow pipeline steps
  const sops = {
    checkout: {
      title: "Late Checkout Request",
      guestMsg: "Can we extend our stay in Room 308 for a late checkout tomorrow at 1:00 PM?",
      guestMeta: "Daniel Craig • Gold VIP Status • Room 308",
      channel: "WhatsApp Business API",
      intent: "late_checkout_extend",
      confidence: "98.7%",
      pmsCheck: "Scanned Oracle Opera PMS. No conflicting arrivals for Room 308 tomorrow. Next booking is matched at 4:00 PM. Room eligibility index: APPROVED.",
      action: "Updated room departure registry in Opera PMS to 13:00 PM & synchronized RFID door lock.",
      botReply: "Certainly, Mr. Craig. We have extended your checkout to 1:00 PM tomorrow free of charge as part of your Gold loyalty privileges. Your keys have been updated.",
      status: "Resolved Automatically",
      statusColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    },
    spa: {
      title: "Spa Amenity Booking",
      guestMsg: "Do you have any open slots for a deep tissue massage around 4:00 PM today?",
      guestMeta: "Emma Watson • Gold VIP • Room 502",
      channel: "WhatsApp Business API",
      intent: "amenity_booking_spa",
      confidence: "96.4%",
      pmsCheck: "Polled Spa Registry API. 1 Therapist available at 16:00 PM. Checked guest credit authorization limit on Opera Folio: APPROVED.",
      action: "Reserved massage slot, generated booking confirmation ID #88921, and posted $140 room charge.",
      botReply: "Certainly, Ms. Watson. We have reserved your 60-minute Deep Tissue Massage for 4:00 PM today. The $140 charge has been automatically posted to your room bill.",
      status: "Resolved Automatically",
      statusColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    },
    wifi: {
      title: "Premium WiFi Access",
      guestMsg: "How do I connect to the premium high-speed internet? I have an urgent Zoom meeting.",
      guestMeta: "Robert Downey • Executive VIP • Room 102",
      channel: "Email Reservation Gateway",
      intent: "faq_wifi_access",
      confidence: "99.8%",
      pmsCheck: "Queried Opera Guest Registry. Guest is registered in the Executive Suite. Priority network access: ENTITLED.",
      action: "Dispatched dedicated high-bandwidth passcodes to guest terminal.",
      botReply: "Welcome to the property, Mr. Downey. You have complimentary access to our Executive high-speed network. Please select 'Grand_Guest_Premium' and log in using your room number (102).",
      status: "Resolved Instantly",
      statusColor: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    },
    dispute: {
      title: "Billing Folio Dispute",
      guestMsg: "I just reviewed my draft invoice and see a $45 pool bar charge that I did not authorize.",
      guestMeta: "Scarlett J. • Platinum VIP • Room 404",
      channel: "WhatsApp Business API",
      intent: "billing_dispute_charge",
      confidence: "82.5% (Below Confidence Threshold)",
      pmsCheck: "Matched Folio #90812. Target charge identified. Confidence score (82.5%) falls below global auto-approval setting (85.0%). Guest sentiment: Frustrated.",
      action: "Halted autonomous response. Dispatched full session transcript to Front Desk Takeover Queue.",
      botReply: "I apologize for any billing confusion, Scarlett. I have flagged the pool bar charge and escalated this transaction directly to our Guest Relations team for immediate resolution.",
      status: "Escalated to Staff",
      statusColor: "text-purple-600 bg-purple-500/10 border-purple-500/20"
    }
  };

  const workflowSteps = [
    {
      eyebrow: '01 / Incoming',
      title: 'Guest request captured',
      icon: MessageSquare,
      accent: 'text-[#6D4AFF]',
      detail: sops[activeSop].guestMsg,
      meta: sops[activeSop].channel
    },
    {
      eyebrow: '02 / Analysis',
      title: 'Intent and confidence',
      icon: Sparkles,
      accent: 'text-[#6D4AFF]',
      detail: sops[activeSop].intent.replaceAll('_', ' '),
      meta: `${sops[activeSop].confidence} confidence`
    },
    {
      eyebrow: '03 / PMS Check',
      title: 'Hotel data verified',
      icon: Database,
      accent: 'text-slate-700',
      detail: sops[activeSop].pmsCheck,
      meta: 'Opera PMS sync'
    },
    {
      eyebrow: '04 / Action',
      title: 'Decision dispatched',
      icon: Zap,
      accent: 'text-[#6D4AFF]',
      detail: sops[activeSop].action,
      meta: 'Operational update'
    },
    {
      eyebrow: '05 / Reply',
      title: 'Guest response sent',
      icon: CheckCircle2,
      accent: sops[activeSop].status.includes('Escalated') ? 'text-purple-600' : 'text-emerald-600',
      detail: sops[activeSop].botReply,
      meta: sops[activeSop].status,
      statusColor: sops[activeSop].statusColor
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#111827] font-sans antialiased selection:bg-purple-950 selection:text-amber-100 relative overflow-x-hidden">
      
      {/* 1. SOPHISTICATED NAVIGATION */}
      <header className="fixed top-0 left-0 w-full bg-[#F7F6F3]/95 backdrop-blur-md border-b border-[#E7E4DD] z-50 transition-all duration-300 shadow-sm">
        {/* Editorial Luxury Top Border Gradient */}
        <div className="h-1 bg-gradient-to-r from-slate-900 via-[#6D4AFF] to-slate-900 w-full" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3.5 cursor-pointer shrink-0" onClick={() => navigate('/')}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#0B1020] rounded-lg flex items-center justify-center text-white border border-[#E7E4DD]/10 shrink-0">
              <Hotel className="text-[#6D4AFF] w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-[11.5px] sm:text-[12.5px] tracking-tight text-[#111827] uppercase tracking-wider font-mono">AutoPilot</span>
              <span className="hidden sm:block text-[7.5px] font-black tracking-widest text-[#667085] uppercase mt-0.5">Guest Orchestration</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-9">
            {[
              { label: 'System Setup', id: 'infrastructure' },
              { label: 'How It Works', id: 'workflow' },
              { label: 'Features', id: 'features' },
              { label: 'Live Activity', id: 'telemetry' },
              { label: 'Benefits', id: 'benefits' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={`#${item.id}`}
                onClick={(e) => scrollToSection(e, item.id)}
                className="text-[9.5px] font-black uppercase tracking-widest text-[#667085] hover:text-[#111827] transition-all relative py-1"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <button 
              onClick={() => navigate('/login')}
              className="text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-widest text-[#111827] hover:opacity-80 transition-all cursor-pointer px-1.5 py-1 hover:bg-slate-200/40 rounded-md"
            >
              Sign In
            </button>
            <button 
              onClick={(e) => openOnboardingModal(e)}
              className="px-3.5 py-2.5 sm:px-5 sm:py-3 bg-[#0B1020] hover:bg-slate-900 text-white rounded-lg text-[8.5px] sm:text-[9.5px] font-black uppercase tracking-widest border border-[#E7E4DD]/10 transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-32 sm:pt-36 pb-16 sm:pb-32 grid lg:grid-cols-12 gap-10 lg:gap-8 items-center relative z-10 text-left">
        
        {/* Left Headline Column */}
        <div className="lg:col-span-6 space-y-6 sm:space-y-8 order-2 lg:order-1 mt-8 lg:mt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-full border border-[#6D4AFF]/20 text-[9px] font-bold uppercase tracking-wider font-mono">
            <Sparkles size={10} />
            <span>Direct PMS Integration</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-[#111827] tracking-tight leading-[1.08] font-serif">
            Manage guest communication <br className="hidden sm:block" />
            <span className="italic font-light text-[#6D4AFF]">automatically with AI</span>
          </h1>

          <p className="text-[#667085] text-xs sm:text-sm leading-relaxed max-w-lg font-medium">
            Connect your hotel system and let AI handle guest requests, bookings, upgrades, and support automatically.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-3">
            <button 
              onClick={(e) => openOnboardingModal(e)}
              className="px-5 py-3 sm:px-7 sm:py-4 bg-[#0B1020] text-white hover:bg-slate-900 font-bold text-[9.5px] uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm border border-slate-800 cursor-pointer"
            >
              Get Started
              <ArrowRight size={11} />
            </button>
            <a 
              href="#workflow"
              onClick={(e) => scrollToSection(e, 'workflow')}
              className="px-5 py-3 sm:px-7 sm:py-4 bg-white hover:bg-[#FAF9F6] text-[#111827] font-bold text-[9.5px] uppercase tracking-widest rounded-xl border border-[#E7E4DD] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Right Dashboard Mockup Column */}
        <div className="lg:col-span-6 relative lg:pl-8 order-1 lg:order-2">
          <div className="absolute inset-4 bg-[#6D4AFF]/5 blur-[80px] rounded-3xl" />
          
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative bg-white rounded-3xl border border-[#E7E4DD] p-3 shadow-xl overflow-hidden group"
          >
            <div className="relative rounded-2xl overflow-hidden bg-[#FAF9F6]">
              <img 
                src="/luxury_hotel_ai_showcase.png" 
                alt="Luxury Hotel AI Automation" 
                className="w-full h-auto object-cover rounded-2xl transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1020]/80 via-transparent to-transparent opacity-90 flex flex-col justify-end p-6 text-white text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black tracking-widest text-emerald-300 uppercase font-mono">Live AI Sync</span>
                </div>
                <h4 className="text-lg font-serif font-bold tracking-tight">The Luminary Grand Resort</h4>
                <p className="text-xs text-slate-200 font-medium mt-1">Autonomous Room Automation & Guest Orchestration Active</p>
              </div>
            </div>

            {/* floating telemetry badge */}
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#E7E4DD] shadow-lg max-w-[160px] text-left space-y-1 hidden sm:block z-20">
              <span className="text-[7.5px] font-black text-[#667085] uppercase tracking-widest font-mono">Core Gateway</span>
              <p className="text-xs font-black text-[#111827]">Active Link</p>
              <span className="text-[8px] text-emerald-600 font-black flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Uptime 99.99%
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. HOTEL SYSTEM CONNECTIONS */}
      <section id="infrastructure" className="bg-white text-[#111827] py-28 relative z-10 border-y border-[#E7E4DD] text-left">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center pb-16 border-b border-[#E7E4DD]">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[9px] font-bold tracking-wider text-[#6D4AFF] uppercase font-mono">Platform Ecosystem</span>
              <h2 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-[#111827]">
                Hotel System <br />
                <span className="italic font-light text-[#6D4AFF]">Connections</span>
              </h2>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[#667085] text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
                Connect your hotel software, WhatsApp, and email so AI can work automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16">
            {/* Integration 1 */}
            <div className="space-y-4 text-left">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#E7E4DD] shadow-sm text-[#6D4AFF]">
                <Database size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Oracle Opera Cloud</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Bi-directional sync of guest registrations, folio transactions, check-in timelines, and housekeeping schedules.
              </p>
            </div>

            {/* Integration 2 */}
            <div className="space-y-4 text-left">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#E7E4DD] shadow-sm text-[#6D4AFF]">
                <Smartphone size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">WhatsApp Gateway</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Send check-in confirmations, upsell menus, and late checkout approvals directly to guests over verified channels.
              </p>
            </div>

            {/* Integration 3 */}
            <div className="space-y-4 text-left">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-[#E7E4DD] shadow-sm text-[#6D4AFF]">
                <Mail size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Email Sync</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Automatically read reservation amendments, respond to room queries, and deliver customized invoice folios.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 4. OPERATIONAL WORKFLOW SECTION */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 sm:px-8 py-28 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-4 pb-16">
          <span className="text-[9px] font-bold tracking-wider text-[#6D4AFF] uppercase font-mono">Interactive Demo</span>
          <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-slate-900 font-serif">
            How AutoPilot <span className="italic font-light text-[#6D4AFF]">works</span>
          </h2>
          <p className="text-[#667085] text-xs sm:text-sm max-w-lg mx-auto font-medium leading-relaxed">
            Select a guest scenario below to simulate how our PMS core identifies, evaluates, and dispatches responses.
          </p>
        </div>

        {/* Realistic operational selectors */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-12">
          {[
            { id: 'checkout', label: 'Late checkout extension' },
            { id: 'spa', label: 'Spa booking validation' },
            { id: 'wifi', label: 'High-speed WiFi auth' },
            { id: 'dispute', label: 'Folio billing dispute' }
          ].map((sop) => (
            <button 
              key={sop.id}
              onClick={() => setActiveSop(sop.id)}
              className={`px-5 py-3 rounded-xl text-[9.5px] font-black uppercase tracking-widest transition-all border cursor-pointer ${activeSop === sop.id ? 'bg-[#0B1020] text-white border-[#0B1020] shadow-sm' : 'bg-white hover:bg-[#F7F6F3] text-[#667085] border-[#E7E4DD]'}`}
            >
              {sop.label}
            </button>
          ))}
        </div>

        {/* Workflow Progression Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4 text-left items-stretch">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon;
            const isFinal = index === workflowSteps.length - 1;
            return (
              <div
                key={step.eyebrow}
                className="bg-white p-5 rounded-2xl border border-[#E7E4DD] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col min-h-[250px] relative overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isFinal && sops[activeSop].status.includes('Escalated') ? 'bg-purple-500' : isFinal ? 'bg-emerald-500' : 'bg-[#6D4AFF]'}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-10 h-10 rounded-xl border border-[#E7E4DD] bg-[#FAF9F6] flex items-center justify-center ${step.accent}`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[8px] font-black text-[#667085] uppercase tracking-wider">
                    {step.eyebrow}
                  </span>
                </div>

                <div className="mt-5 space-y-3 flex-1">
                  <h3 className="text-sm font-bold text-[#111827] tracking-tight leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-[11px] text-[#667085] font-medium leading-relaxed line-clamp-5">
                    {step.detail}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E7E4DD] flex items-center justify-between gap-2">
                  <span className={`text-[8px] font-black uppercase tracking-wide px-2 py-1 rounded-md border ${step.statusColor || 'bg-[#FAF9F6] text-[#667085] border-[#E7E4DD]'}`}>
                    {step.meta}
                  </span>
                  {index < workflowSteps.length - 1 && (
                    <ArrowRight size={13} className="text-[#6D4AFF] shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. AI OPERATIONAL FEATURES */}
      <section id="features" className="bg-white text-[#111827] py-28 relative z-10 border-y border-[#E7E4DD] text-left">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-4">
            <span className="text-[9px] font-bold tracking-wider text-[#6D4AFF] uppercase font-mono">Operations & Safety</span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-[#111827]">
              Everything your hotel staff needs
            </h2>
            <p className="text-[#667085] text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
              A comprehensive command suite designed for operators to manage automation limits, verify synchronization status, and manage live workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="p-7 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] space-y-4 hover:border-slate-350 transition-all shadow-sm">
              <div className="w-10 h-10 bg-white border border-[#E7E4DD] rounded-xl flex items-center justify-center text-[#6D4AFF] shadow-sm">
                <MessageSquare size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Automated Messages</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Connects across WhatsApp Business API and Email. Delivers context-driven answers based on actual checkout date, guest profiles, and reservation parameters.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-7 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] space-y-4 hover:border-slate-350 transition-all shadow-sm">
              <div className="w-10 h-10 bg-white border border-[#E7E4DD] rounded-xl flex items-center justify-center text-[#6D4AFF] shadow-sm">
                <Users size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Human Support Queue</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Whenever guest requirements demand staff attention, conversations are automatically transferred to human operators in real time.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-7 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] space-y-4 hover:border-slate-350 transition-all shadow-sm">
              <div className="w-10 h-10 bg-white border border-[#E7E4DD] rounded-xl flex items-center justify-center text-[#6D4AFF] shadow-sm">
                <Database size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Guest Request Tracking</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Continuous background cycles fetch reservation information directly from Opera or Mews, preventing dual booking discrepancies.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-7 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] space-y-4 hover:border-slate-350 transition-all shadow-sm">
              <div className="w-10 h-10 bg-white border border-[#E7E4DD] rounded-xl flex items-center justify-center text-[#6D4AFF] shadow-sm">
                <Calendar size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Service Charge Updates</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Posts transactions directly to the guest’s active hotel folio for authorized checkout extensions, spa slots, and premium amenity packages.
              </p>
            </div>

            {/* Card 5 */}
            <div className="p-7 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] space-y-4 hover:border-slate-350 transition-all shadow-sm">
              <div className="w-10 h-10 bg-white border border-[#E7E4DD] rounded-xl flex items-center justify-center text-[#6D4AFF] shadow-sm">
                <ShieldCheck size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">AI Rules & Settings</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Strict safety criteria evaluate guest histories and compliance rules before dispatching any automated confirmation or action.
              </p>
            </div>

            {/* Card 6 */}
            <div className="p-7 bg-[#FAF9F6] rounded-xl border border-[#E7E4DD] space-y-4 hover:border-slate-350 transition-all shadow-sm">
              <div className="w-10 h-10 bg-white border border-[#E7E4DD] rounded-xl flex items-center justify-center text-[#6D4AFF] shadow-sm">
                <Lock size={16} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827] font-mono">Escalation Control</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Lock down high-stakes changes—like billing disputes or room changes—requiring physical front desk approval.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 6. LIVE OPERATIONS INTELLIGENCE */}
      <section id="telemetry" className="max-w-7xl mx-auto px-6 sm:px-8 py-28 relative z-10 text-left">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[9px] font-bold tracking-wider text-[#6D4AFF] uppercase font-mono">System Performance</span>
            <h2 className="text-3xl font-normal tracking-tight text-slate-900 font-serif">
              Live Hotel Activity
            </h2>
            <p className="text-[#667085] text-xs sm:text-sm leading-relaxed font-medium">
              AutoPilot continuously monitors real-time transaction indices, response delay factors, database sync health, and automation dispatch ratios to ensure total system compliance.
            </p>

            <div className="divide-y divide-[#E7E4DD] text-xs font-bold text-[#667085]">
              <div className="py-4.5 flex justify-between items-center">
                <span>Core Automation Engine Uptime</span>
                <span className="text-emerald-600 font-mono font-bold">99.98% Active</span>
              </div>
              <div className="py-4.5 flex justify-between items-center">
                <span>Average Message Process Speed</span>
                <span className="text-[#111827] font-mono">1.2 seconds</span>
              </div>
              <div className="py-4.5 flex justify-between items-center">
                <span>PMS Folio Sync write latency</span>
                <span className="text-[#111827] font-mono">14ms average</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#FAF9F6] p-7 rounded-2xl border border-[#E7E4DD] grid grid-cols-2 sm:grid-cols-3 gap-5">
            
            <div className="p-5 bg-white border border-[#E7E4DD] rounded-xl space-y-1.5 shadow-sm text-left">
              <span className="text-[8px] font-bold text-[#667085] uppercase tracking-wider font-mono">AI Success Rate</span>
              <p className="text-2xl font-bold text-slate-900 font-serif tracking-tight">89.4%</p>
              <span className="text-[8px] text-emerald-600 font-bold tracking-wider uppercase font-mono">High autonomy</span>
            </div>

            <div className="p-5 bg-white border border-[#E7E4DD] rounded-xl space-y-1.5 shadow-sm text-left">
              <span className="text-[8px] font-bold text-[#667085] uppercase tracking-wider font-mono">Messages Processed</span>
              <p className="text-2xl font-bold text-slate-900 font-serif tracking-tight">142,850</p>
              <span className="text-[8px] text-emerald-600 font-bold tracking-wider uppercase font-mono">Continuous</span>
            </div>

            <div className="p-5 bg-white border border-[#E7E4DD] rounded-xl space-y-1.5 shadow-sm text-left">
              <span className="text-[8px] font-bold text-[#667085] uppercase tracking-wider font-mono">Active Conversations</span>
              <p className="text-2xl font-bold text-slate-900 font-serif tracking-tight">342</p>
              <span className="text-[8px] text-emerald-600 font-bold tracking-wider uppercase font-mono">Live</span>
            </div>

            <div className="p-5 bg-white border border-[#E7E4DD] rounded-xl space-y-1.5 shadow-sm text-left">
              <span className="text-[8px] font-bold text-[#667085] uppercase tracking-wider font-mono">Average Response Time</span>
              <p className="text-2xl font-bold text-slate-900 font-serif tracking-tight">1.2s</p>
              <span className="text-[8px] text-[#6D4AFF] font-bold tracking-wider uppercase font-mono">Instant</span>
            </div>

            <div className="p-5 bg-white border border-[#E7E4DD] rounded-xl space-y-1.5 shadow-sm text-left">
              <span className="text-[8px] font-bold text-[#667085] uppercase tracking-wider font-mono">Connected Hotels</span>
              <p className="text-2xl font-bold text-slate-900 font-serif tracking-tight">184</p>
              <span className="text-[8px] text-[#667085] font-bold tracking-wider uppercase font-mono">Active properties</span>
            </div>

            <div className="p-5 bg-white border border-[#E7E4DD] rounded-xl space-y-1.5 shadow-sm text-left">
              <span className="text-[8px] font-bold text-[#667085] uppercase tracking-wider font-mono">Revenue Generated</span>
              <p className="text-2xl font-bold text-slate-900 font-serif tracking-tight">$42,500</p>
              <span className="text-[8px] text-emerald-600 font-bold tracking-wider uppercase font-mono">Monthly upsells</span>
            </div>

          </div>

        </div>
      </section>

      {/* 7. HOSPITALITY BENEFITS SECTION */}
      <section id="benefits" className="bg-[#FAF9F6] border-y border-[#E7E4DD] py-28 relative z-10 text-left">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16">
          
          <div className="max-w-2xl space-y-4">
            <span className="text-[9px] font-bold tracking-wider text-[#6D4AFF] uppercase font-mono">Advantages</span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight font-serif text-slate-900">
              Why hotels use AutoPilot
            </h2>
            <p className="text-[#667085] text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
              Built exclusively for premium hotels to handle peak volumes, reduce friction, and elevate check-in and checkout flows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Benefit 1 */}
            <div className="space-y-4 text-left">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-[#6D4AFF] border border-[#E7E4DD] shadow-sm font-mono">01</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Faster Guest Support</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Guest questions are validated, checked against existing PMS rules, and resolved on active chat lines in under two seconds.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="space-y-4 text-left">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-[#6D4AFF] border border-[#E7E4DD] shadow-sm font-mono">02</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Reduce Staff Work</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Offloads up to 85% of repetitive requests—such as WiFi setup, check-out hours, and policy lookups—so desk agents can focus on in-person guest reception.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="space-y-4 text-left">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-[#6D4AFF] border border-[#E7E4DD] shadow-sm font-mono">03</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Increase Revenue</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Proactively offers premium dining reservations, late checkout extensions, and spa appointments to guests based on real-time availability indicator feeds.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="space-y-4 text-left">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-[#6D4AFF] border border-[#E7E4DD] shadow-sm font-mono">04</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Automatic Responses</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Seamlessly posts folio modifications, keycard authorization windows, and checkout reports back to Opera cloud registries automatically.
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="space-y-4 text-left">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-[#6D4AFF] border border-[#E7E4DD] shadow-sm font-mono">05</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Guest Satisfaction</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Maintains a professional, helpful brand voice across all active channels, strictly aligned with high-end concierge standard operating procedures.
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="space-y-4 text-left">
              <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-[#6D4AFF] border border-[#E7E4DD] shadow-sm font-mono">06</div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">Better Operations</h4>
              <p className="text-[10.5px] text-[#667085] font-semibold leading-relaxed">
                Includes permanent operation logs, read-only system backups, and specific human-override rules for secure operator oversight.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 8.5 SUBSCRIPTION PRICING PLANS */}
      <section id="pricing-tiers" className="py-24 border-t border-[#E7E4DD] bg-white relative overflow-hidden">
        {/* Subtle background luxury visual nodes */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#6D4AFF]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#6D4AFF]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
          <div className="max-w-2xl text-left space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-full border border-[#6D4AFF]/20 text-[8.5px] font-black uppercase tracking-widest font-mono">
              <Layers size={10} />
              <span>Tailored Platform Subscriptions</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight leading-tight font-serif text-[#111827]">
              Choose your plan
            </h2>
            <p className="text-[#667085] text-xs font-semibold leading-relaxed max-w-lg">
              Select a package based on hotel size and requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptions.map((plan) => {
              const isPro = plan.name.toLowerCase() === 'pro' || plan.price === 299;
              return (
                <div 
                  key={plan.id}
                  className={`bg-[#F7F6F3]/50 border rounded-3xl p-8 text-left relative flex flex-col justify-between transition-all hover:shadow-lg ${
                    isPro 
                      ? 'border-[#6D4AFF] ring-1 ring-[#6D4AFF]/20 shadow-sm animate-pulse-subtle' 
                      : 'border-[#E7E4DD]'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 right-6 px-3 py-1 bg-[#6D4AFF] text-white rounded-full text-[8px] font-black uppercase tracking-widest font-mono shadow-sm">
                      Most Popular
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">{plan.name} Plan</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="text-4xl font-normal font-serif text-[#111827]">${plan.price}</span>
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">/ {plan.duration === 'Monthly' ? 'Mo' : 'Yr'}</span>
                      </div>
                      <p className="text-[#667085] text-[10.5px] font-semibold mt-2">
                        Comprehensive sync tools for {plan.name.toLowerCase() === 'basic' ? 'boutique properties' : plan.name.toLowerCase() === 'pro' ? 'growing mid-scale hotels' : 'enterprise-grade luxury resorts'}.
                      </p>
                    </div>

                    <div className="h-px bg-[#E7E4DD]" />

                    <ul className="space-y-3">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex gap-2.5 items-start text-xs font-semibold text-[#111827]">
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={(e) => openOnboardingModal(e, plan.name)}
                    className={`w-full py-3.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all cursor-pointer mt-8 ${
                      isPro
                        ? 'bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white shadow-sm hover:scale-[1.01]'
                        : 'bg-[#0B1020] hover:bg-slate-900 text-white border border-[#E7E4DD]/10'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. PREMIUM FOOTER */}
      <footer className="bg-[#0B1020] text-slate-400 py-16 text-left relative z-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800/50">
          
          <div className="col-span-1 md:col-span-3 space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-8 h-8 bg-white/5 text-white rounded flex items-center justify-center border border-white/10 shadow-inner">
                <Hotel size={15} className="text-[#6D4AFF]" />
              </div>
              <span className="font-black text-xs uppercase tracking-wider font-mono">AutoPilot</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-semibold">
              Premium hotel communication automation databases and PMS synchronization gateways for resorts, boutique hotels, and luxury chains.
            </p>
          </div>

          {[
            { title: "Platform Modules", links: ["Opera PMS Sync", "WhatsApp Gateway", "SOP Workflows"] },
            { title: "Security & Safety", links: ["Confidence Checks", "Escalation Safeguards", "Audit History Logs"] }
          ].map((sec, i) => (
            <div key={i} className="space-y-3.5 col-span-1">
              <h4 className="text-white font-black text-[8px] uppercase tracking-widest font-mono">{sec.title}</h4>
              <ul className="space-y-2">
                {sec.links.map((link) => (
                  <li key={link}>
                    <a href="#workflow" className="text-xs text-slate-400 hover:text-white transition-colors font-semibold">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono">
          <span>© {new Date().getFullYear()} AutoPilot Technologies Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Contact Integration Group</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Registry</a>
            <a href="#" className="hover:text-white transition-colors">Security Protocols</a>
          </div>
        </div>
      </footer>

      {/* 10. LUXURY ENTERPRISE ONBOARDING MODAL */}
      <AnimatePresence>
        {showOnboardingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start md:items-center justify-center p-4 pb-20 md:pb-4 bg-black/50 backdrop-blur-md overflow-y-auto"
            onClick={() => setShowOnboardingModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-[540px] max-h-[calc(100vh-8rem)] md:max-h-[85vh] bg-[#F7F6F3] text-[#111827] rounded-2xl border border-[#E7E4DD] p-5 sm:p-7 shadow-2xl text-left overflow-hidden my-auto flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle Ambient Accent Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6D4AFF]/5 blur-[60px] rounded-full pointer-events-none" />

              {/* Header */}
              <div className="flex justify-between items-start relative z-10 pb-3 border-b border-[#E7E4DD]/60">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#6D4AFF]/10 text-[#6D4AFF] border border-[#6D4AFF]/20 rounded text-[8px] font-black uppercase tracking-widest font-mono">
                    <Sparkles size={9} />
                    <span>Enterprise Portal Setup</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-normal tracking-tight font-serif text-[#111827]">
                    Request Property Access
                  </h3>
                  <p className="text-[#667085] text-[10px] sm:text-xs font-semibold leading-relaxed max-w-sm">
                    Schedule onboarding for your hotel communication automation workspace.
                  </p>
                </div>
                <button 
                  onClick={() => setShowOnboardingModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              {!isOnboardingSuccess ? (
                <form onSubmit={handleOnboardingSubmit} className="mt-4 flex flex-col flex-1 overflow-hidden relative z-10">
                  {/* Scrollable Container */}
                  <div className="flex-1 overflow-y-auto py-2 space-y-3.5 pr-1.5 -mr-1.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="David Vance"
                          value={onboardingForm.fullName}
                          onChange={(e) => setOnboardingForm({...onboardingForm, fullName: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      {/* Hotel / Property Name */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Hotel / Property Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="The Luminary Grand"
                          value={onboardingForm.hotelName}
                          onChange={(e) => setOnboardingForm({...onboardingForm, hotelName: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Work Email */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Work Email</label>
                        <input 
                          type="email" 
                          required
                          placeholder="corporate@luminaryhotel.com"
                          value={onboardingForm.workEmail}
                          onChange={(e) => setOnboardingForm({...onboardingForm, workEmail: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      {/* Hotel Website */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Hotel Website</label>
                        <input 
                          type="url" 
                          required
                          placeholder="https://www.luminaryhotel.com"
                          value={onboardingForm.website}
                          onChange={(e) => setOnboardingForm({...onboardingForm, website: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* WhatsApp Contact */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">WhatsApp Contact</label>
                        <input 
                          type="text" 
                          required
                          placeholder="+1 (555) 019-2834"
                          value={onboardingForm.whatsapp}
                          onChange={(e) => setOnboardingForm({...onboardingForm, whatsapp: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      {/* Hotel Type */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Hotel Type</label>
                        <select 
                          value={onboardingForm.hotelType}
                          onChange={(e) => setOnboardingForm({...onboardingForm, hotelType: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] transition-all text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="Boutique">Boutique Hotel</option>
                          <option value="Resort">Luxury Resort</option>
                          <option value="Business">Business Hotel</option>
                          <option value="Suite">All-Suites Property</option>
                          <option value="Chain">Global Chain Affiliate</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Number of Rooms */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Number of Rooms</label>
                        <input 
                          type="number" 
                          required
                          placeholder="120"
                          value={onboardingForm.roomCount}
                          onChange={(e) => setOnboardingForm({...onboardingForm, roomCount: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none"
                        />
                      </div>

                      {/* PMS Provider (Dropdown) */}
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">PMS Provider</label>
                        <select 
                          value={onboardingForm.pmsProvider}
                          onChange={(e) => setOnboardingForm({...onboardingForm, pmsProvider: e.target.value})}
                          className="w-full px-3.5 py-2 bg-white text-[#111827] border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] transition-all text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          <option value="Mews">Mews</option>
                          <option value="Opera PMS">Opera PMS</option>
                          <option value="Apaleo">Apaleo</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Selected Plan Tier */}
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#6D4AFF] font-mono">Selected Plan Tier</label>
                      <select 
                        value={onboardingForm.plan}
                        onChange={(e) => setOnboardingForm({...onboardingForm, plan: e.target.value})}
                        className="w-full px-3.5 py-2 bg-white text-[#6D4AFF] border border-[#6D4AFF] rounded-lg focus:border-[#6D4AFF] transition-all text-xs font-black uppercase tracking-wider focus:outline-none cursor-pointer font-mono"
                      >
                        {subscriptions.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name} Plan — ${s.price} / {s.duration === 'Monthly' ? 'Monthly' : 'Yearly'}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Notes / Requirements */}
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[#667085] font-mono">Notes / Requirements</label>
                      <textarea 
                        rows={3}
                        placeholder="e.g. Seeking automated late checkout rules linked to our Oracle Opera cloud installation..."
                        value={onboardingForm.notes}
                        onChange={(e) => setOnboardingForm({...onboardingForm, notes: e.target.value})}
                        className="w-full px-3.5 py-2 bg-white text-[#111827] placeholder:text-slate-400 border border-[#E7E4DD] rounded-lg focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 transition-all text-xs font-semibold focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E4DD] mt-3">
                    <button 
                      type="button"
                      onClick={() => setShowOnboardingModal(false)}
                      className="px-5 py-2.5 bg-transparent hover:bg-slate-200/50 text-[#667085] hover:text-[#111827] rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isOnboardingSubmitting}
                      className="px-6 py-2.5 bg-[#6D4AFF] hover:bg-[#5B3CEE] text-white rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {isOnboardingSubmitting ? (
                        <>
                          <RefreshCw size={11} className="animate-spin text-purple-200" />
                          Processing...
                        </>
                      ) : (
                        'Start Onboarding'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-8 py-8 space-y-6 text-center relative z-10 flex flex-col items-center justify-center flex-1 overflow-y-auto">
                  <div className="w-16 h-16 bg-[#6D4AFF]/10 text-[#6D4AFF] rounded-full flex items-center justify-center border border-[#6D4AFF]/20 shadow-lg animate-bounce">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2 max-w-sm">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#111827] font-mono">Request Registered</h4>
                    <p className="text-[#667085] text-xs font-semibold leading-relaxed">
                      Your onboarding request has been received. Our technical group will contact you shortly to configure your WhatsApp, Email, and PMS synchronization pipelines.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowOnboardingModal(false)}
                    className="mt-2 px-6 py-2.5 bg-[#0B1020] hover:bg-slate-900 text-white rounded-lg text-[9.5px] font-black uppercase tracking-widest transition-all cursor-pointer"
                  >
                    Dismiss Workspace
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;
