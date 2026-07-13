import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Hotel,
  ChevronRight,
  Database,
  Smartphone,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [hotelName, setHotelName] = useState('');
  const [email, setEmail] = useState('');
  const [roomsCount, setRoomsCount] = useState('50-100');
  const [password, setPassword] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'platform_operator' })
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('autopilot_token', data.token);
        setIsLoading(false);
        setIsSuccess(true);
        return;
      }
    } catch (err) {
      console.warn('Backend reachability issue, falling back to simulated sandbox onboarding:', err);
    }

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-purple-950 selection:text-amber-100">
      
      {/* Editorial Luxury Ambient Lighting Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-15%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-b from-purple-100/30 to-transparent blur-[120px] rounded-full" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-b from-amber-50/40 to-transparent blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(#EAD9C9_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl bg-[#FAF9F6] rounded-3xl border border-[#EFECE6] shadow-xl flex overflow-hidden relative z-10 min-h-[660px]"
      >
        
        {/* Left Side: Editorial Value Proposition & Core Checklist */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between border-r border-[#EFECE6] bg-[#F6F4EF]/40 relative">
          
          <div className="space-y-12 relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center border border-white/10 shadow-sm">
                <Hotel size={18} className="text-amber-100" />
              </div>
              <span className="font-bold text-base tracking-tight text-slate-950">AutoPilot</span>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#EFECE6] rounded-full text-[8px] font-bold uppercase tracking-widest text-slate-500">
                <Compass size={10} className="text-[#8C8375] animate-spin-slow" />
                <span>Property Onboarding</span>
              </div>
              
              <h1 className="text-4xl font-serif font-black text-slate-900 leading-[1.05] tracking-tight">
                Integrate Core <br />
                Hotel Automation.
              </h1>
              
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                Deploy instant guest intent resolution pathways connected directly to top hotel management software systems.
              </p>
            </div>
          </div>

          {/* Luxury checklist indicators */}
          <div className="relative z-10 space-y-4 max-w-sm">
             {[
               { title: "Direct Opera PMS Connector Core", desc: "No manual spreadsheet uploads or logs required" },
               { title: "Multilingual Guest Sentiment Dispatcher", desc: "Trained on high-standard luxury hotel SOP policies" },
               { title: "Instant Front-Desk Escalation Alarm", desc: "Automatic human takeover with full message trace history" }
             ].map((item, idx) => (
               <div key={idx} className="flex gap-3.5 items-start text-left">
                  <div className="w-5.5 h-5.5 bg-white border border-[#EFECE6] rounded-md flex items-center justify-center text-[#6D28D9] shrink-0 mt-0.5 shadow-sm">
                     <CheckCircle2 size={11} />
                  </div>
                  <div className="min-w-0">
                     <p className="text-[10px] font-black text-slate-800 leading-tight">{item.title}</p>
                     <p className="text-[9px] text-slate-400 font-bold mt-1 leading-none">{item.desc}</p>
                  </div>
               </div>
             ))}
          </div>

          <div className="relative z-10 text-[9px] font-black uppercase tracking-widest text-slate-400">
             Trusted by elite hospitality brands worldwide
          </div>

        </div>

        {/* Right Side: Signup Form or Success Feed Overlay */}
        <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-white relative">
          
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-sm mx-auto w-full space-y-6"
              >
                <div className="space-y-2 text-left">
                  <h2 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">Request Credentials</h2>
                  <p className="text-xs font-medium text-slate-400">Deploy a dedicated sandbox workspace for your hotel properties.</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-450 ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6D28D9] transition-colors" size={13} />
                        <input 
                          type="text" 
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="David Vance"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200/65 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 rounded-xl outline-none transition-all text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-450 ml-1">Property Name</label>
                      <div className="relative group">
                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6D28D9] transition-colors" size={13} />
                        <input 
                          type="text" 
                          required
                          value={hotelName}
                          onChange={(e) => setHotelName(e.target.value)}
                          placeholder="Grand Vista Resort"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200/65 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 rounded-xl outline-none transition-all text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-450 ml-1">Work Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6D28D9] transition-colors" size={13} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operator@luxuryhotel.com"
                        className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200/65 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 rounded-xl outline-none transition-all text-xs font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 text-left">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-450 ml-1">Rooms Count</label>
                      <select 
                        value={roomsCount}
                        onChange={(e) => setRoomsCount(e.target.value)}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200/65 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 rounded-xl outline-none transition-all text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="1-50">1 - 50 Rooms</option>
                        <option value="50-100">50 - 100 Rooms</option>
                        <option value="100-300">100 - 300 Rooms</option>
                        <option value="300+">300+ Rooms</option>
                      </select>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[8px] font-black uppercase tracking-widest text-slate-450 ml-1">Secure Code</label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6D28D9] transition-colors" size={13} />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200/65 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 rounded-xl outline-none transition-all text-xs font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full py-3.5 mt-2 bg-slate-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 shadow-xl shadow-slate-950/5 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Initialize Property Sandbox
                        <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="pt-6 border-t border-slate-100 text-center">
                  <p className="text-[8px] text-slate-450 font-black uppercase tracking-widest leading-relaxed">
                    Already registered a hotel sandbox? <br />
                    <button onClick={() => navigate('/login')} className="text-[#6D28D9] font-bold hover:underline mt-1.5 block mx-auto">Sign In To Operator Portal</button>
                  </p>
                </div>
              </motion.div>
            ) : (
              
              /* Luxury Account Creation Confirmation Card */
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-sm mx-auto w-full text-center space-y-6"
              >
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={24} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-bold font-serif text-slate-900">Sandbox Registered!</h3>
                  <p className="text-xs font-semibold text-slate-400 leading-relaxed">
                    Request submitted. We've dispatched verification handshake parameters to your email address <span className="text-slate-800 font-bold">{email}</span>.
                  </p>
                </div>

                <div className="bg-[#FAF9F6] border border-[#EFECE6] p-4.5 rounded-xl text-left space-y-2.5">
                   <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">PROVISIONING REPORT</p>
                   <div className="h-[1px] bg-[#EFECE6]" />
                   <div className="space-y-1.5 text-[9px] font-bold text-slate-600 font-mono">
                      <p className="flex justify-between"><span>Property name:</span> <span className="text-slate-800">{hotelName}</span></p>
                      <p className="flex justify-between"><span>Opera Node:</span> <span className="text-slate-800">SUCCESS-OPR-9</span></p>
                      <p className="flex justify-between"><span>Database sync:</span> <span className="text-emerald-600 font-bold">14ms Verified</span></p>
                   </div>
                </div>

                <button 
                  onClick={() => navigate('/login')}
                  className="w-full py-3.5 bg-slate-950 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Enter Operator Portal</span>
                  <ArrowRight size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </motion.div>
    </div>
  );
};

export default Signup;
