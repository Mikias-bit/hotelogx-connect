import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, LogOut, Settings as SettingsIcon, User, Bed, Calendar, Globe, Building, Menu, MessageSquare, Cpu, Library, Sliders, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp, ROLES } from '../../context/AppContext';
import { useClickOutside } from '../../hooks/useClickOutside';
import { cn } from '../../utils/cn';

export const Navbar = () => {
  const { role, setRole, user, notifications, markNotificationRead, setIsAuthenticated, hotels, platformUsers, guests, rooms, bookings, otas, toggleSidebar, activeWorkspace, exitWorkspace } = useApp();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useClickOutside(notificationRef, () => setShowNotifications(false));
  useClickOutside(profileRef, () => setShowProfile(false));

  const rawQuery = searchQuery.toLowerCase().trim();

  const searchResults = rawQuery.length > 1 ? [
    { id: 'C1', name: 'Sarah Jenkins', subtext: 'WhatsApp • Active', type: 'Conversation', icon: MessageSquare, path: '/app/conversations' },
    { id: 'W1', name: 'Late Checkout', subtext: 'Automation Workflow', type: 'Cpu', path: '/app/automation-engine' },
    { id: 'K1', name: 'AI Late Checkout Rule', subtext: 'AI Communication Rule', type: 'Automation Rule', icon: Sliders, path: '/app/knowledge-base' },
  ].filter(r => r.name.toLowerCase().includes(rawQuery)).slice(0, 6) : [];

  useEffect(() => {
    setSelectedIndex(-1);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectResult(searchResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  const handleSelectResult = (result) => {
    navigate(result.path);
    setSearchQuery('');
    setSelectedIndex(-1);
    searchInputRef.current?.blur();
  };

  const getRoleBadge = (currentRole) => {
    switch (currentRole) {
      case ROLES.SUPER_ADMIN: return 'bg-purple-100 text-purple-700';
      case ROLES.PLATFORM_OPERATOR: return 'bg-blue-100 text-blue-700';
      case ROLES.MANAGER: return 'bg-emerald-100 text-emerald-700';
      case ROLES.GUEST_ASSISTANT: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getRoleLabel = (currentRole) => {
    if (currentRole === ROLES.SUPER_ADMIN) return 'Admin';
    if (currentRole === ROLES.PLATFORM_OPERATOR) return 'Operator';
    return currentRole.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const userName = (user?.name && user.name !== 'John Doe') ? user.name : (role === ROLES.SUPER_ADMIN ? 'System Admin' : 'Satyam Goswami');
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
    <header className="h-16 bg-[#F7F6F3]/95 backdrop-blur-md border-b border-[#E7E4DD] fixed top-0 right-0 left-0 lg:left-64 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-sm">
      {isMobileSearchOpen ? (
        <div className="flex-1 flex items-center gap-3 animate-in slide-in-from-top-1 duration-200">
          <button 
            onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(''); }}
            className="p-2 text-slate-500 hover:text-[#111827] rounded-xl"
          >
            <ChevronDown className="rotate-90" size={20} />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6D4AFF] w-4 h-4" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E4DD] focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 rounded-xl outline-none text-xs font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-premium border border-[#E7E4DD] overflow-hidden z-50 max-h-[80vh] overflow-y-auto">
                <div className="p-1">
                  {searchResults.map((res, i) => {
                    const Icon = res.icon;
                    return (
                      <div 
                        key={res.id} 
                        className={cn(
                          "p-3 rounded-xl cursor-pointer flex justify-between items-center transition-colors",
                          selectedIndex === i ? "bg-purple-50/50" : "hover:bg-[#FAF9F6]"
                        )} 
                        onClick={() => { handleSelectResult(res); setIsMobileSearchOpen(false); }}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            selectedIndex === i ? "bg-purple-100/50 text-[#6D4AFF]" : "bg-[#FAF9F6] text-slate-500"
                          )}>
                            <Icon size={16} />
                          </div>
                          <div className="flex flex-col text-left">
                            <span className={cn("text-xs font-bold", selectedIndex === i ? "text-slate-900" : "text-slate-800")}>{res.name}</span>
                            <span className="text-[9px] text-slate-500 font-medium">{res.subtext}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 max-w-xl flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-slate-500 hover:text-[#111827] hover:bg-white border border-transparent hover:border-[#E7E4DD] rounded-xl transition-colors"
            >
              <Menu size={20} />
            </button>
            {role === ROLES.SUPER_ADMIN && (
              <div className="hidden md:flex items-center gap-3 text-[9.5px] font-bold text-slate-500 font-mono pl-1 animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5 bg-white border border-[#E7E4DD] px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Webhooks: <strong className="text-emerald-600 uppercase">Active</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-[#E7E4DD] px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Sys Latency: <strong className="text-slate-800 uppercase">14ms</strong></span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-[#E7E4DD] px-3 py-1.5 rounded-xl shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  <span>Ecosystem Health: <strong className="text-[#6D4AFF] uppercase">100%</strong></span>
                </div>
              </div>
            )}
            {role !== ROLES.SUPER_ADMIN && (
              <div className="relative group flex-1 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-[#6D4AFF] transition-colors" />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search conversations, workflows, knowledge..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7E4DD] focus:border-[#6D4AFF] focus:ring-1 focus:ring-[#6D4AFF]/30 rounded-xl transition-all outline-none text-xs font-semibold text-[#111827]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-premium border border-[#E7E4DD] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 bg-[#FAF9F6] border-b border-[#E7E4DD] text-[9px] font-bold text-slate-400 uppercase tracking-wider flex justify-between font-mono">
                    <span>Top Results</span>
                    <span className="hidden md:inline-block">Use ↑↓ arrows to navigate, Enter to select</span>
                  </div>
                  <div className="p-1">
                    {searchResults.map((res, i) => {
                      const Icon = res.icon;
                      return (
                        <div 
                          key={res.id} 
                          className={cn(
                            "p-3 rounded-xl cursor-pointer flex justify-between items-center transition-colors",
                            selectedIndex === i ? "bg-purple-50/50" : "hover:bg-[#FAF9F6]"
                          )} 
                          onClick={() => handleSelectResult(res)}
                          onMouseEnter={() => setSelectedIndex(i)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              selectedIndex === i ? "bg-purple-100/50 text-[#6D4AFF]" : "bg-[#FAF9F6] text-slate-500"
                            )}>
                              <Icon size={16} />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className={cn("text-xs font-bold", selectedIndex === i ? "text-slate-950" : "text-slate-800")}>{res.name}</span>
                              <span className="text-[9px] text-slate-400 font-medium">{res.subtext}</span>
                            </div>
                          </div>
                          <span className={cn(
                            "text-[8px] px-2 py-1 rounded-md font-bold uppercase tracking-wider font-mono border",
                            selectedIndex === i ? "bg-white text-[#6D4AFF] border-[#E7E4DD] shadow-sm" : "bg-[#FAF9F6] text-slate-400 border-transparent"
                          )}>
                            {res.type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              </div>
            )}
            
            {/* Mobile Search Icon Only */}
            {role !== ROLES.SUPER_ADMIN && (
              <button 
                onClick={() => setIsMobileSearchOpen(true)}
                className="sm:hidden p-2 text-slate-500 hover:text-[#111827] hover:bg-white border border-transparent hover:border-[#E7E4DD] rounded-xl transition-colors"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all group"
              >
                <Bell size={20} className="group-hover:scale-110 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-80 bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button className="text-xs text-primary-600 font-semibold hover:underline">Mark all read</button>
                  </div>
                  <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)} className={cn(
                        "p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 border-b border-slate-50 last:border-0",
                        !n.read && "bg-primary-50/30"
                      )}>
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                        )}></div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{n.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-slate-50 text-center">
                    <button className="text-xs font-semibold text-slate-500 hover:text-slate-900">View All Notifications</button>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block h-8 w-[1px] bg-slate-200"></div>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center gap-3 p-1 pr-3 hover:bg-slate-50 rounded-xl transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-primary-500/20">
                  {userInitials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-slate-800 leading-none truncate max-w-[120px]">{userName}</p>
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block",
                    getRoleBadge(role)
                  )}>
                    {getRoleLabel(role)}
                  </span>
                </div>
                <ChevronDown size={14} className={cn("text-slate-400 transition-transform duration-200", showProfile && "rotate-180")} />
              </button>

              {showProfile && (
                <div className="fixed left-4 right-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-3 w-auto sm:w-64 bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-lg">
                      {userInitials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{userName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{getRoleLabel(role)}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { 
                        const settingsPath = role === ROLES.SUPER_ADMIN ? '/app/platform-settings' : '/app/settings';
                        navigate(settingsPath); 
                        setShowProfile(false);  
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <SettingsIcon size={16} /> Settings
                    </button>
                    <div className="h-[1px] bg-slate-100 my-2"></div>
                    <button 
                      onClick={() => setIsAuthenticated(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>

    {/* Workspace Impersonation Banner */}
    {activeWorkspace && (
      <div className="fixed top-16 right-0 left-0 lg:left-64 h-11 bg-gradient-to-r from-[#6D4AFF] via-[#5B39E3] to-[#4F2DDE] text-white px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-[0_4px_20px_rgba(109,74,255,0.15)] border-t border-white/10" style={{ zIndex: 29 }}>
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-2 h-2 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] font-mono text-purple-100 opacity-90">Viewing Workspace:</span>
          <span className="text-xs font-black text-white px-2.5 py-1 bg-white/10 border border-white/10 rounded-xl shadow-inner font-mono">{activeWorkspace.name}</span>
          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shadow-sm font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            {activeWorkspace.plan} Plan
          </span>
        </div>
        <button 
          onClick={() => {
            exitWorkspace();
            navigate('/app/workspaces');
          }}
          className="px-4 py-1.5 bg-white hover:bg-[#FAF9F6] text-[#6D4AFF] hover:scale-[1.02] active:scale-[0.98] border border-white/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-200 shadow-md shadow-purple-950/20 flex items-center gap-2 cursor-pointer font-mono group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
          Back to Admin Panel
        </button>
      </div>
    )}
    </>
  );
};
