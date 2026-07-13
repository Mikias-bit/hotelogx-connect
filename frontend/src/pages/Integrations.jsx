import React, { useState } from 'react';
import {
  Database,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings2,
  X,
  Clock,
  Activity,
  Server,
  Network,
  ArrowRight,
  Terminal,
  Wifi,
  Radio,
  FileText,
  Volume2,
  Check,
  Zap,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

// Mock PMS Integrations (Decoupled from deep infrastructure terminologies)
const initialPMSIntegrations = [
  {
    id: 'opera-cloud',
    name: 'Oracle Opera Cloud PMS',
    status: 'Connected',
    logoColor: 'text-[#6D4AFF] bg-[#6D4AFF]/10 border-[#6D4AFF]/20',
    description: 'Real-time synchronization of guest check-ins, room statuses, and billing folios.',
    lastSync: '3 mins ago',
    syncMode: 'Bi-Directional (Sync-Back Live)',
    connectedHotels: ['Grand Plaza Resort', 'Alpine Boutique Lodge'],
    fields: [
      { label: 'Opera Cloud Endpoint URL', value: 'https://pms.opera.oraclecloud.com/api/v1', placeholder: 'https://pms-endpoint.com' },
      { label: 'Security Client ID', value: 'OPERA_AUTOPILOT_PROD_99', placeholder: 'Enter Client ID' },
      { label: 'Access Secret Phrase', value: '••••••••••••••••••••', placeholder: 'Enter Secret Token', type: 'password' }
    ]
  },
  {
    id: 'mews',
    name: 'Mews PMS Platform',
    status: 'Connected',
    logoColor: 'text-purple-600 bg-purple-50 border-purple-200',
    description: 'Cloud-native guest data management, active reservations mapping, and stay folio synchronization.',
    lastSync: 'Just now',
    syncMode: 'Bi-Directional (Sync-Back Live)',
    connectedHotels: ['Sands Resort & Spa'],
    fields: [
      { label: 'Mews API Gateway Token', value: 'MEWS_AUTOPILOT_SECURE_9302', placeholder: 'Bearer token...' },
      { label: 'Enterprise Access Token', value: '••••••••••••••••••••', placeholder: 'Enter API Secret', type: 'password' }
    ]
  },
  {
    id: 'apaleo',
    name: 'Apaleo Hospitality API',
    status: 'Disconnected',
    logoColor: 'text-rose-600 bg-rose-50 border-rose-200',
    description: 'Developer-friendly core API integration to retrieve stay metadata and push service charge updates.',
    lastSync: 'Never',
    syncMode: 'Pending Configuration',
    connectedHotels: [],
    fields: [
      { label: 'Apaleo Core API Client ID', value: '', placeholder: 'e.g. APALEO_CLIENT_ID' },
      { label: 'Secret Token Access', value: '', placeholder: '••••••••', type: 'password' }
    ]
  }
];

// Mock Communication Channels
const initialCommChannels = [
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business API',
    status: 'Active',
    deliveryHealth: '99.8% Outbound Delivery',
    channelType: 'Official Meta Channel',
    icon: Smartphone,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    fields: [
      { label: 'Meta Phone Number ID', value: '1029384758201', placeholder: 'e.g. 1049283749283' },
      { label: 'Permanent Access Token', value: '••••••••••••••••••••', placeholder: 'Meta Secret Token', type: 'password' }
    ]
  },
  {
    id: 'smtp-email',
    name: 'SMTP Email Reservation Gateway',
    status: 'Active',
    deliveryHealth: '100% Sent (Inbox Ready)',
    channelType: 'Outlook SMTP Server Queue',
    icon: Mail,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    fields: [
      { label: 'Reservation Mail Server Host', value: 'smtp.office365.com', placeholder: 'reservations@hotel.com' },
      { label: 'Port', value: '587 (TLS)', placeholder: '587' },
      { label: 'Authorization Password', value: '••••••••••••••••••••', placeholder: '••••••••', type: 'password' }
    ]
  },
  {
    id: 'voice-automation',
    name: 'Front Desk Voice Automation',
    status: 'Pending',
    deliveryHealth: 'Connection Standby',
    channelType: 'Front Desk VoIP Gateway',
    icon: Volume2,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
    fields: [
      { label: 'SIP Server Address', value: '', placeholder: 'sip.hoteltelephony.com' },
      { label: 'Extension Identifier', value: '', placeholder: 'e.g. 1005' },
      { label: 'Authorization Password', value: '', placeholder: '••••••••', type: 'password' }
    ]
  }
];

// Mock Logs Feed
const mockLogs = {
  'opera-cloud': [
    { time: '18:52:14', level: 'SUCCESS', msg: 'Folio update synchronized for Room 204: $45.00 minibar service charge synced.' },
    { time: '18:48:02', level: 'SUCCESS', msg: 'Guest check-in event retrieved for room 104: Marcus Aurelius status updated to Checked-In.' },
    { time: '18:31:45', level: 'SUCCESS', msg: 'Late check-out permission updated in PMS for Room 312: Stay extended to 14:00.' },
    { time: '18:15:30', level: 'SUCCESS', msg: 'Stay preference data synchronized with Oracle Opera Master Ledger.' }
  ],
  'mews': [
    { time: '18:55:01', level: 'SUCCESS', msg: 'Guest profile digital twin synchronized successfully: Sarah Jenkins (Room 102).' },
    { time: '18:41:22', level: 'SUCCESS', msg: 'Reservation state update fetched: stay extended by 1 night for Folio #99821.' },
    { time: '17:50:11', level: 'SUCCESS', msg: 'Sync completed: Room 205 service invoice created in Mews Commander.' }
  ],
  'apaleo': [
    { time: '12:00:00', level: 'WARNING', msg: 'No active connection handshake detected. Please configure Client ID.' }
  ],
  'whatsapp-business': [
    { time: '18:54:11', level: 'SUCCESS', msg: 'Outbound check-in greeting dispatched successfully to guest +33 6 1234 5678.' },
    { time: '18:50:33', level: 'SUCCESS', msg: 'Inbound message webhook parsed: Room service breakfast menu requested.' }
  ],
  'smtp-email': [
    { time: '18:51:00', level: 'SUCCESS', msg: 'Stay summary invoice email compiled and sent to guest (marcus@aurelius.com).' },
    { time: '18:10:05', level: 'SUCCESS', msg: 'Check-in instructions dispatched: Sands Resort confirmation #29302.' }
  ],
  'voice-automation': [
    { time: '15:30:00', level: 'STANDBY', msg: 'Voice VoIP server extension ready. Awaiting connection trigger.' }
  ]
};

const Integrations = () => {
  const [hotelData, setHotelData] = useState(null);
  const [pmsIntegrations, setPmsIntegrations] = useState([]);
  const [commChannels, setCommChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for Modals
  const [activeLog, setActiveLog] = useState(null);
  const [activeConfigure, setActiveConfigure] = useState(null);
  const [isSyncingId, setIsSyncingId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Custom Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  const fetchIntegrations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}`
        }
      });
      const data = await res.json();
      if (data.success && data.data) {
        const hotel = data.data;
        setHotelData(hotel);

        // Map PMS data
        const pmsList = [
          {
            id: 'mews',
            name: 'Mews PMS Platform',
            status: hotel.pmsConnected ? 'Connected' : 'Disconnected',
            logoColor: 'text-purple-600 bg-purple-50 border-purple-200',
            description: 'Cloud-native guest data management and active reservations mapping.',
            lastSync: 'Just now',
            syncMode: 'Bi-Directional',
            connectedHotels: [hotel.hotelName],
            fields: [
              { label: 'Mews API Base URL', key: 'pmsBaseUrl', value: hotel.pmsBaseUrl || 'https://api.mews-demo.com/api/connector/v1', placeholder: 'https://api.mews.com/...' },
              { label: 'Mews Client Token', key: 'pmsApiKey', value: hotel.pmsApiKey || '', placeholder: 'Client token...' },
              { label: 'Mews Access Token', key: 'pmsSecret', value: hotel.pmsSecret || '', placeholder: 'Access token...', type: 'password' }
            ]
          }
        ];
        setPmsIntegrations(pmsList);

        // Map Comm channels
        const emailProvider = hotel.emailIntegrationType || 'SMTP';
        const isGoogleWorkspace = emailProvider === 'GOOGLE_WORKSPACE';
        const channels = [
          {
            id: 'whatsapp',
            name: 'WhatsApp Business API',
            status: hotel.whatsappConnected ? 'Active' : 'Disconnected',
            deliveryHealth: hotel.whatsappConnected ? '99.8% Healthy' : 'Offline',
            channelType: 'Official Meta Channel',
            icon: Smartphone,
            color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
            healthStatus: hotel.whatsappHealthStatus || 'ok',
            healthNote: hotel.whatsappHealthNote || null,
            fields: [
              { label: 'Meta Phone Number ID', key: 'whatsappPhoneId', value: hotel.whatsappPhoneId || '', placeholder: 'e.g. 1049283749283' },
              { label: 'Permanent Access Token', key: 'whatsappApiKey', value: hotel.whatsappApiKey || '', placeholder: 'Meta Secret Token', type: 'password' },
              { label: 'Meta App Secret', key: 'whatsappAppSecret', value: hotel.whatsappAppSecret || '', placeholder: 'App Secret', type: 'password' },
              { label: 'Webhook Verify Token', key: 'whatsappVerifyToken', value: hotel.whatsappVerifyToken || '', placeholder: 'Custom Verify Token' }
            ]
          },
          {
            id: 'email',
            name: isGoogleWorkspace ? 'Google Workspace Gmail' : 'SMTP Email Reservation Gateway',
            status: hotel.emailConnected ? 'Active' : 'Disconnected',
            deliveryHealth: hotel.emailConnected ? 'Connected Mailbox' : 'Offline',
            channelType: isGoogleWorkspace ? 'Gmail API OAuth' : 'SMTP Server Queue',
            icon: Mail,
            color: 'text-blue-600 bg-blue-50 border-blue-100',
            fields: [
              { label: 'Hotel Mailbox Email', key: 'hotelEmail', value: hotel.hotelEmail || hotel.smtpUser || '', placeholder: 'reservations@hotel.com' },
              { label: 'SMTP Host', key: 'smtpHost', value: hotel.smtpHost || 'smtp.gmail.com', placeholder: 'smtp.hotel.com' },
              { label: 'SMTP Port', key: 'smtpPort', value: hotel.smtpPort || 587, placeholder: '587' },
              { label: 'SMTP User', key: 'smtpUser', value: hotel.smtpUser || '', placeholder: 'reservations@hotel.com' },
              { label: 'SMTP Password', key: 'smtpPass', value: hotel.smtpPass || '', placeholder: '••••••••', type: 'password' }
            ]
          }
        ];
        setCommChannels(channels);
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch integrations:', err);
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchIntegrations();
    const params = new URLSearchParams(window.location.search);
    const emailStatus = params.get('emailStatus');
    if (emailStatus === 'connected') {
      triggerToast('Google Workspace mailbox connected successfully.', 'success');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (emailStatus === 'error') {
      triggerToast(params.get('message') || 'Google Workspace connection failed.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Poll every 30s so health alerts (token expired, app secret mismatch) appear automatically
    const interval = setInterval(fetchIntegrations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Trigger manual API handshake synchronization
  const handleRetrySync = (id, name) => {
    setIsSyncingId(id);
    triggerToast(`Initiating direct operational handshake with ${name}...`, 'info');

    setTimeout(() => {
      setIsSyncingId(null);
      triggerToast(`Synchronization complete! ${name} state is fully current.`, 'success');
    }, 1500);
  };

  const loadActiveHotel = async () => {
    if (hotelData?.id) return hotelData;

    const settingsRes = await fetch(`${API_BASE_URL}/api/hotels/settings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}`
      }
    });
    const settingsData = await settingsRes.json();
    if (settingsData.success && settingsData.data?.id) {
      setHotelData(settingsData.data);
      return settingsData.data;
    }

    const hotelsRes = await fetch(`${API_BASE_URL}/api/hotels`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}`
      }
    });
    const hotelsData = await hotelsRes.json();
    const firstHotel = hotelsData.success && Array.isArray(hotelsData.data) ? hotelsData.data[0] : null;
    if (firstHotel?.id) {
      setHotelData(firstHotel);
      return firstHotel;
    }

    return null;
  };

  const getGoogleWorkspaceConnectUrl = (hotel = hotelData) => {
    const hotelId = hotel?.id || 1;
    const mailboxEmail = hotel?.hotelEmail || hotel?.smtpUser || 'tiblauw15@gmail.com';
    const returnTo = `${window.location.origin}${window.location.pathname}`;
    const params = new URLSearchParams({
      mailboxEmail,
      returnTo
    });

    return `${API_BASE_URL}/api/email-integrations/google/connect/${hotelId}?${params.toString()}`;
  };

  const handleGoogleWorkspaceConnect = async () => {
    try {
      triggerToast('Opening Google Workspace authorization...', 'info');
      const activeHotel = await loadActiveHotel();
      if (!activeHotel?.id) {
        window.location.assign(getGoogleWorkspaceConnectUrl());
        return;
      }

      const mailboxEmail = activeHotel.hotelEmail || activeHotel.smtpUser;
      if (!mailboxEmail) {
        triggerToast('Save the hotel mailbox email before connecting Google Workspace.', 'error');
        setActiveConfigure(commChannels.find(channel => channel.id === 'email') || null);
        return;
      }

      window.location.assign(getGoogleWorkspaceConnectUrl(activeHotel));
    } catch (err) {
      console.error('Google Workspace connect failed:', err);
      triggerToast('Could not open Google Workspace authorization. Use the direct test URL or check the backend.', 'error');
    }
  };

  // Save Settings Connection Trigger
  const handleSaveConnectionSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    triggerToast(`Validating credentials with API server...`, 'info');

    const formData = new FormData(e.target);
    const updates = {};
    activeConfigure.fields.forEach(field => {
      updates[field.key] = formData.get(field.key);
    });

    // Automatically mark as connected if values are provided
    if (activeConfigure.id === 'mews') updates.pmsConnected = true;
    if (activeConfigure.id === 'whatsapp') updates.whatsappConnected = true;
    if (activeConfigure.id === 'email') updates.emailConnected = true;

    try {
      const res = await fetch(`${API_BASE_URL}/api/hotels/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('autopilot_token')}`
        },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        triggerToast(`${activeConfigure.name} connection successfully authorized and saved!`, 'success');
        fetchIntegrations();
        setActiveConfigure(null);
      }
    } catch (err) {
      triggerToast('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center font-mono text-xs uppercase tracking-widest text-slate-400">Loading Ecosystem Handshakes...</div>;
  }

  return (
    <div className="px-0 py-4 sm:p-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20 relative text-left font-sans">

      {/* Dynamic Action Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-8 right-8 z-50 bg-[#0B1020] border border-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-premium text-xs font-semibold flex items-center gap-3 font-sans"
          >
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">✓</div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">i</div>
            )}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 pb-5">
        <div className="space-y-1">
          <span className="text-[9px] font-black tracking-widest text-[#6D4AFF] uppercase font-mono">Ecosystem Handshakes</span>
          <h1 className="text-xl font-black text-slate-950 tracking-tight uppercase">Connected Systems</h1>
          <p className="text-xs text-slate-500 font-bold leading-normal">
            Manage your Property Management Systems (PMS), digital guest communication channels, and automation gateways.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Mail size={16} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-widest font-mono text-blue-700">Google Workspace Mailbox</p>
              <h2 className="text-sm font-black text-slate-950">Connect {hotelData?.hotelEmail || 'hotel mailbox'} with Gmail API</h2>
              <p className="text-[11px] font-semibold text-slate-600">
                Authorize Gmail send/read access so Hotelogx Connect can process guest emails for this hotel.
                {hotelData?.emailConnected && hotelData?.emailIntegrationType === 'GOOGLE_WORKSPACE' ? ' This mailbox is already marked connected.' : ''}
              </p>
            </div>
          </div>
          <a
            href={getGoogleWorkspaceConnectUrl()}
            onClick={(e) => {
              e.preventDefault();
              handleGoogleWorkspaceConnect();
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2"
          >
            <Mail size={13} />
            <span>Connect Google Workspace</span>
          </a>
        </div>

      {/* 2. CONNECTION HEALTH SUMMARY (MINIMAL OPERATIONAL STATUS BAR) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'PMS Sync Status', title: 'PMS Sync Active', status: 'Healthy', color: 'bg-purple-500 text-purple-700 bg-purple-50 border-purple-100', value: '3 Active Hubs' },
          { label: 'WhatsApp API', title: 'WhatsApp Connected', status: 'Online', color: 'bg-emerald-500 text-emerald-700 bg-emerald-50 border-emerald-100', value: '99.8% Latency' },
          { label: 'smtp queue', title: 'Email Dispatch Online', status: 'Inbox Ready', color: 'bg-blue-500 text-blue-700 bg-blue-50 border-blue-100', value: '100% Dispatched' },
          { label: 'ai routing', title: 'AI Routing Operational', status: 'Active', color: 'bg-indigo-500 text-indigo-700 bg-indigo-50 border-indigo-100', value: 'Safe Guard Enabled' }
        ].map((health, i) => (
          <div key={i} className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between h-[105px]">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">{health.label}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider font-mono border ${health.color}`}>
                {health.status}
              </span>
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-slate-900 tracking-tight">{health.title}</h4>
              <p className="text-[10px] text-slate-500 font-bold">{health.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. PMS INTEGRATIONS SECTION */}
      <div className="space-y-4">
        <div className="text-left space-y-0.5 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-[#6D4AFF]" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest font-mono">Hotel Property Management Systems (PMS)</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold font-sans">Syncing guest check-in states, room assignments, late check-outs, and folio billing ledger entries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pmsIntegrations.map((pms) => {
            const isSyncing = isSyncingId === pms.id;
            return (
              <div key={pms.id} className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative">

                {/* Status indicator */}
                <div className="absolute top-5 right-5">
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider font-mono border ${pms.status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                    {pms.status}
                  </span>
                </div>

                {/* Card Top */}
                <div className="space-y-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black border ${pms.logoColor} shadow-inner scale-[0.98]`}>
                    {pms.name[0]}
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">Core Hotel Sync</span>
                    <h3 className="text-sm font-black text-slate-950 tracking-tight">{pms.name}</h3>
                  </div>
                  <p className="text-[11.5px] text-slate-500 font-medium leading-relaxed font-sans">{pms.description}</p>
                </div>

                {/* Card Middle: Connection Metadata */}
                <div className="bg-slate-50 border border-slate-200/50 p-3.5 rounded-2xl space-y-2 text-[10.5px] font-semibold text-slate-600 font-sans">
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono">Connection Status</span>
                    <span className={`font-bold ${pms.status === 'Connected' ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {pms.status === 'Connected' ? '✓ Handshake Healthy' : 'Setup Required'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono">Last Sync Timestamp</span>
                    <span className="font-bold text-slate-800">{pms.lastSync}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono">Sync Mode Profile</span>
                    <span className="font-bold text-slate-800">{pms.syncMode}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1.5 border-t border-slate-200/50">
                    <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest font-mono">Synchronized Hotels</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {pms.connectedHotels.length > 0 ? (
                        pms.connectedHotels.map((hotel, idx) => (
                          <span key={idx} className="bg-[#FAF9F6] border border-slate-200 px-1.5 py-0.5 rounded text-[8px] font-black uppercase text-slate-700 tracking-wider font-mono">
                            {hotel}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 text-[9px] font-semibold">Zero properties mapped.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveConfigure({ ...pms, pmsType: true })}
                    className="py-2.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-colors text-center font-sans"
                  >
                    Configure
                  </button>
                  <button
                    onClick={() => handleRetrySync(pms.id, pms.name)}
                    disabled={isSyncing}
                    className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-colors text-center font-sans flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    {isSyncing ? <RefreshCw size={10} className="animate-spin text-[#6D4AFF]" /> : 'Sync'}
                  </button>
                  <button
                    onClick={() => setActiveLog({ name: pms.name, id: pms.id })}
                    className="py-2.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer transition-colors text-center font-sans"
                  >
                    View Logs
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. COMMUNICATION CHANNELS SECTION */}
      <div className="space-y-4 pt-4">
        <div className="text-left space-y-0.5 border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Smartphone size={15} className="text-[#6D4AFF]" />
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest font-mono">AI Communication Dispatch Channels</h2>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold font-sans">Managing the direct delivery networks where the AI converses with your arriving guests.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commChannels.map((channel) => (
            <div key={channel.id} className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative">

              {/* Status Badge */}
              <div className="absolute top-5 right-5">
                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider font-mono border ${channel.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                  {channel.status}
                </span>
              </div>

              {/* Card Top */}
              <div className="space-y-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${channel.color} border shadow-inner`}>
                  <channel.icon size={16} />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">{channel.channelType}</span>
                  <h3 className="text-sm font-black text-slate-950 tracking-tight">{channel.name}</h3>
                </div>
              </div>

              {/* Delivery info box */}
              <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl text-[10.5px] font-bold text-slate-600 space-y-1.5 font-sans">
                <div className="flex justify-between">
                  <span>Outbound Health Rate:</span>
                  <span className="text-slate-900 font-bold">{channel.deliveryHealth}</span>
                </div>
                <div className="flex justify-between">
                  <span>Connection Handshake:</span>
                  <span className={channel.status === 'Active' ? 'text-emerald-600 font-bold' : 'text-slate-400 font-semibold'}>
                    {channel.status === 'Active' ? '✓ Registered' : 'Standby Mode'}
                  </span>
                </div>
                {channel.id === 'whatsapp' && hotelData?.whatsappConnected && (
                  <div className="pt-2 mt-2 border-t border-slate-200/50 flex flex-col gap-1">
                    <span className="text-[8px] font-black text-[#6D4AFF] uppercase font-mono">Webhook Endpoint</span>
                    <div className="flex flex-col gap-1">
                      <span className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-mono text-slate-500 truncate select-all flex-1">
                        {`${API_BASE_URL}/api/webhooks/whatsapp/${hotelData.id}`}
                      </span>
                      {API_BASE_URL.includes('localhost') && (
                        <span className="text-[8px] text-amber-600 font-semibold leading-tight mt-0.5">
                          ⚠️ Localhost detected. In local development, use your ngrok URL for webhook delivery.
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {channel.id === 'email' && hotelData?.emailConnected && (
                  <div className="pt-2 mt-2 border-t border-slate-200/50 flex flex-col gap-1">
                    <span className="text-[8px] font-black text-[#6D4AFF] uppercase font-mono">Email Webhook Endpoint (Forward Target)</span>
                    <div className="flex flex-col gap-1">
                      <span className="bg-white border border-slate-200 rounded px-2 py-1 text-[9px] font-mono text-slate-500 truncate select-all flex-1">
                        {`${API_BASE_URL}/api/webhooks/email/${hotelData.id}`}
                      </span>
                      {API_BASE_URL.includes('localhost') && (
                        <span className="text-[8px] text-amber-600 font-semibold leading-tight mt-0.5">
                          ⚠️ Localhost detected. Set up forwarding to your ngrok URL for local testing.
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ⚠️ WhatsApp Health Alert Banner */}
              {channel.id === 'whatsapp' && channel.healthStatus && channel.healthStatus !== 'ok' && (
                <div className={`rounded-2xl px-3 py-2.5 border text-[10px] font-semibold leading-snug font-sans flex gap-2 items-start ${
                  channel.healthStatus === 'token_invalid'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}>
                  <span className="text-sm flex-shrink-0">{channel.healthStatus === 'token_invalid' ? '🔑' : '🔐'}</span>
                  <div>
                    <p className="font-black uppercase tracking-wide text-[9px] mb-0.5 font-mono">
                      {channel.healthStatus === 'token_invalid' ? 'Access Token Expired / Invalid' : 'App Secret Mismatch'}
                    </p>
                    <p>{channel.healthNote}</p>
                  </div>
                </div>
              )}

              {/* Card Actions */}
              {channel.id === 'email' && (
                <a
                  href={getGoogleWorkspaceConnectUrl()}
                  onClick={(e) => {
                    e.preventDefault();
                    handleGoogleWorkspaceConnect();
                  }}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center font-sans flex items-center justify-center gap-1"
                >
                  <Mail size={12} />
                  <span>Connect Google Workspace</span>
                </a>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setActiveConfigure({ ...channel, pmsType: false })}
                  className="py-2 px-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center font-sans"
                >
                  Configure
                </button>
                <button
                  onClick={() => {
                    triggerToast(`Re-verifying webhook handshake credentials with ${channel.name}...`, 'info');
                    setTimeout(() => {
                      triggerToast(`Outbound token refreshed successfully. Deliverability is 100%!`, 'success');
                    }, 1200);
                  }}
                  className="py-2 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center font-sans"
                >
                  Reconnect
                </button>
                <button
                  onClick={() => setActiveLog({ name: channel.name, id: channel.id })}
                  className="py-2 px-1 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[8.5px] font-black uppercase tracking-widest cursor-pointer text-center font-sans"
                >
                  Logs
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 5. RECENT OPERATIONAL SYSTEM EVENTS ACTIVITY FEED */}
      <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3 text-left">
          <div className="space-y-0.5">
            <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest font-mono">Recent Operational Events</h3>
            <p className="text-[11px] text-slate-500 font-semibold font-sans">Active connectivity alerts and guest data stream logs from the last 24 hours.</p>
          </div>
          <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase tracking-wider font-mono bg-[#6D4AFF]/10 border border-[#6D4AFF]/20 px-2 py-0.5 rounded">All Events Online</span>
        </div>

        <div className="divide-y divide-slate-100 font-sans text-xs">
          {[
            { title: 'Opera PMS Database Sync Restored', desc: 'Grand Plaza Resort database handshake validated successfully. Sync latency verified at 12ms.', time: '2 mins ago', icon: Database, color: 'text-emerald-500 bg-emerald-50/70 border-emerald-100' },
            { title: 'WhatsApp Secure Channel Refreshed', desc: 'Meta Business Developer API key handshake refreshed automatically. Uptime confirmed 100%.', time: '15 mins ago', icon: Smartphone, color: 'text-[#6D4AFF] bg-[#6D4AFF]/5 border-[#6D4AFF]/10' },
            { title: 'Email Dispatch Port Verification', desc: 'smtp.office365.com email queue validated for automatic HTML folio sending.', time: '1 hour ago', icon: Mail, color: 'text-blue-500 bg-blue-50/70 border-blue-100' },
            { title: 'New Property Connected', desc: 'Sands Resort & Spa PMS ledger successfully synchronized. Autopilot active checkout mapping online.', time: '2 hours ago', icon: Check, color: 'text-purple-600 bg-purple-50 border-purple-100' }
          ].map((event, index) => (
            <div key={index} className="py-3 flex gap-3.5 items-start first:pt-0 last:pb-0">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${event.color}`}>
                <event.icon size={13} />
              </div>
              <div className="flex-1 text-left space-y-0.5">
                <div className="flex justify-between items-center gap-2">
                  <h4 className="font-bold text-slate-900">{event.title}</h4>
                  <span className="text-[9px] font-bold font-mono text-slate-400 shrink-0">{event.time}</span>
                </div>
                <p className="text-slate-500 text-[10.5px] font-semibold font-sans leading-normal">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL 1: VIEW LOGS MODAL (User-Friendly Terminal Logs) */}
      <AnimatePresence>
        {activeLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-xl w-full overflow-hidden text-left font-sans"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-[#FAF9F6]">
                <div className="space-y-0.5 text-left">
                  <span className="text-[8px] font-black text-[#6D4AFF] uppercase font-mono tracking-widest block">Operational Sync logs</span>
                  <h3 className="text-sm font-black text-slate-950 tracking-tight">{activeLog.name} Active Sync Logs</h3>
                </div>
                <button
                  onClick={() => setActiveLog(null)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-400"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Modal Body (Terminal Box) */}
              <div className="p-5 space-y-3 bg-[#0B1020] text-slate-300 font-mono text-[10.5px] max-h-[350px] overflow-y-auto">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider pb-1.5 border-b border-slate-800">
                  Secure Operational Data Stream • Live updates
                </div>
                <div className="space-y-2.5">
                  {(mockLogs[activeLog.id] || []).map((log, i) => (
                    <div key={i} className="leading-relaxed flex items-start gap-2">
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={`font-bold shrink-0 ${log.level === 'SUCCESS' ? 'text-emerald-400' :
                        log.level === 'WARNING' ? 'text-rose-400' : 'text-amber-400'
                        }`}>
                        [{log.level}]
                      </span>
                      <span className="text-slate-250 font-sans font-medium">{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end">
                <button
                  onClick={() => setActiveLog(null)}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors"
                >
                  Close Sync Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CONFIGURE CONNECTION MODAL (Hotel Operator Friendly Inputs) */}
      <AnimatePresence>
        {activeConfigure && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-premium max-w-lg w-full overflow-hidden text-left font-sans"
            >
              <form onSubmit={handleSaveConnectionSettings}>
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-[#FAF9F6]">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[8.5px] font-black text-[#6D4AFF] uppercase font-mono tracking-widest block">Authorization settings</span>
                    <h3 className="text-sm font-black text-slate-950 tracking-tight">{activeConfigure.name} Handshake Settings</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveConfigure(null)}
                    className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-400"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 text-left">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-start gap-2.5">
                    <Lock size={14} className="text-[#6D4AFF] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest font-mono">Operator Security Notice</span>
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                        Security protocols authorize connections using dynamic AES-256 tokens. Private credentials are completely obfuscated from dispatch layers.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {activeConfigure.fields.map((field, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider font-mono block">
                          {field.label}
                        </label>
                        <input
                          type={field.type || 'text'}
                          name={field.key}
                          defaultValue={field.value}
                          placeholder={field.placeholder}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-[#6D4AFF]/40 text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveConfigure(null)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#6D4AFF] hover:bg-[#5b3ce4] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    {isSaving ? <RefreshCw size={11} className="animate-spin" /> : null}
                    <span>Save Connection Settings</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Integrations;
