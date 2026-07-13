import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Cpu,
  Library,
  CreditCard,
  Settings,
  Building2,
  Users,
  LogOut,
  Activity,
  UserCheck,
  Server,
  ShieldAlert,
  Database,
  Hotel,
  Lock
} from 'lucide-react';
import { useApp, ROLES } from '../../context/AppContext';
import { cn } from '../../utils/cn';

const platformNav = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/app', roles: [ROLES.PLATFORM_OPERATOR, ROLES.MANAGER, ROLES.HOTEL_ADMIN] },
  { name: 'Guest Conversations', icon: MessageSquare, path: '/app/conversations', roles: [ROLES.PLATFORM_OPERATOR, ROLES.MANAGER, ROLES.GUEST_ASSISTANT, ROLES.HOTEL_ADMIN] },
  { name: 'Human Assistance Queue', icon: UserCheck, path: '/app/takeover-queue', roles: [ROLES.PLATFORM_OPERATOR, ROLES.MANAGER, ROLES.GUEST_ASSISTANT, ROLES.HOTEL_ADMIN] },
  { name: 'AI Workflows', icon: Cpu, path: '/app/automation-engine', roles: [ROLES.PLATFORM_OPERATOR, ROLES.HOTEL_ADMIN] },
  { name: 'Hotel Policies & Knowledge', icon: Library, path: '/app/knowledge-base', roles: [ROLES.PLATFORM_OPERATOR, ROLES.MANAGER, ROLES.HOTEL_ADMIN] },
  {
    name: 'Subscription & Billing',
    icon: CreditCard,
    path: '/app/subscription-billing',
    roles: [ROLES.HOTEL_ADMIN, ROLES.PLATFORM_OPERATOR],
    subMenus: [
      { name: 'Overview', path: '/app/subscription-billing?tab=overview' },
      { name: 'Payment History', path: '/app/subscription-billing?tab=history' },
      { name: 'Invoices', path: '/app/subscription-billing?tab=invoices' },
      { name: 'Plan Management', path: '/app/subscription-billing?tab=plans' },
      { name: 'Payment Method', path: '/app/subscription-billing?tab=method' }
    ]
  },
  { name: 'Activity & Audit Logs', icon: Activity, path: '/app/activity-logs', roles: [ROLES.PLATFORM_OPERATOR, ROLES.MANAGER, ROLES.HOTEL_ADMIN] },
  { name: 'Connected Systems', icon: Server, path: '/app/integrations', roles: [ROLES.PLATFORM_OPERATOR, ROLES.HOTEL_ADMIN] },
  { name: 'Hotel Settings', icon: Settings, path: '/app/settings', roles: [ROLES.PLATFORM_OPERATOR, ROLES.HOTEL_ADMIN] },
];

const superAdminNav = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/app', roles: [ROLES.SUPER_ADMIN] },
  { name: 'Hotel Setup Requests', icon: Users, path: '/app/onboarding', roles: [ROLES.SUPER_ADMIN] },
  { name: 'Hotel Accounts', icon: Building2, path: '/app/workspaces', roles: [ROLES.SUPER_ADMIN] },
  {
    name: 'Billing Management',
    icon: CreditCard,
    path: '/app/billing-management',
    roles: [ROLES.SUPER_ADMIN],
    subMenus: [
      { name: 'Revenue Overview', path: '/app/billing-management?tab=overview' },
      { name: 'Hotel Subscriptions', path: '/app/billing-management?tab=subscriptions' },
      { name: 'Failed Payments', path: '/app/billing-management?tab=failed' },
      { name: 'Invoices', path: '/app/billing-management?tab=invoices' },
      { name: 'Plans', path: '/app/billing-management?tab=plans' }
    ]
  },
  { name: 'System Settings', icon: Settings, path: '/app/platform-settings', roles: [ROLES.SUPER_ADMIN] },
];

export const Sidebar = () => {
  const { role, isSidebarOpen, toggleSidebar, setIsAuthenticated, rolePermissions, activeWorkspace, exitWorkspace, hotelSubscription } = useApp();
  const location = useLocation();

  const isLocked = role !== ROLES.SUPER_ADMIN && hotelSubscription && (hotelSubscription.status === 'Trial' || hotelSubscription.status === 'Suspended' || hotelSubscription.status === 'Failed Payment');

  const navigation = role === ROLES.SUPER_ADMIN ? superAdminNav : platformNav;

  // Role-based filtering + Permission-based filtering
  const filteredNavigation = navigation.filter(item => {
    // Check if role is allowed to see this item (existing logic)
    const isRoleAllowed = item.roles.includes(role);
    if (!isRoleAllowed) return false;

    // Check custom permissions from AppContext
    const permissions = rolePermissions[role] || {};

    // Map sidebar names to permissions module names
    const nameMapping = {
      'Billing & Payments': 'Billing & Invoices',
      'Guest Management': 'Guest Experience',
      'Analytics': 'Analytics & Reports',
      'Global Analytics': 'Analytics & Reports',
      'System Settings': 'Settings',
      'Guest Conversations': 'Conversations',
      'Human Assistance Queue': 'Takeover Queue',
      'AI Workflows': 'Automation Engine',
      'Hotel Policies & Knowledge': 'Knowledge Base',
      'Revenue & Service Charges': 'Revenue Automation',
      'Activity & Audit Logs': 'Activity Logs',
      'Hotel Settings': 'Settings',
      'Connected Systems': 'Settings',
      'Hotel Setup Requests': 'Onboarding Requests',
      'Hotel Accounts': 'Tenant Workspaces',
      'Subscription & Billing': 'Billing',
      'System Settings': 'Platform Settings'
    };

    const moduleName = nameMapping[item.name] || item.name;
    const canView = permissions[moduleName]?.view ?? true; // Default to true if not found

    return canView;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Drawer */}
      <div className={cn(
        "flex flex-col h-full bg-white border-r border-[#E7E4DD] w-64 fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sleek, Premium Brand block with matching landing page branding */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-[#E7E4DD]/60">
          <div className="w-9 h-9 bg-[#0B1020] rounded-xl flex items-center justify-center text-white border border-[#E7E4DD]/10">
            <Hotel size={16} className="text-[#6D4AFF]" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-extrabold text-[12.5px] tracking-tight text-[#111827] uppercase tracking-wider font-mono">AutoPilot</span>
            <span className="text-[7.5px] font-bold tracking-widest text-[#667085] uppercase mt-0.5 font-mono">
              {activeWorkspace ? 'WORKSPACE VIEW' : role === ROLES.SUPER_ADMIN ? 'OPERATIONS' : 'AI HOTEL OPERATIONS'}
            </span>
            {activeWorkspace && (
              <span className="text-[8px] text-slate-500 font-bold mt-0.5 truncate max-w-[140px]" title={activeWorkspace.name}>
                {activeWorkspace.name}
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Nav section with improved spacing and hierarchy */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-3">
            <span className="text-[8.5px] font-bold text-slate-400 tracking-widest uppercase font-mono">
              Hotel Control Center
            </span>
          </div>
          {filteredNavigation.map((item) => {
            const hasSubmenus = item.subMenus && item.subMenus.length > 0;
            const isItemLocked = isLocked && item.name !== 'Subscription & Billing';
            return (
              <div key={item.name} className="space-y-1">
                <NavLink
                  to={item.path}
                  end={item.path === '/app'}
                  onClick={() => { if (window.innerWidth < 1024 && isSidebarOpen && !hasSubmenus) toggleSidebar(); }}
                  className={({ isActive }) => cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-150 group border-l-2 text-left relative",
                    isActive
                      ? "bg-purple-50/50 text-[#6D4AFF] font-bold border-[#6D4AFF]"
                      : "text-slate-500 hover:bg-[#FAF9F6] hover:text-[#111827] border-transparent",
                    isItemLocked && "opacity-60 hover:opacity-85"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <item.icon className={cn(
                      "w-4 h-4 transition-transform duration-200 shrink-0",
                      "group-hover:scale-105"
                    )} />
                    <span className="text-[11px] font-bold uppercase tracking-wider font-mono">{item.name}</span>
                  </div>
                  {isItemLocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </NavLink>
                
                {hasSubmenus && location.pathname === item.path && (
                  <div className="pl-9 pr-2 py-1 space-y-1 border-l border-[#E7E4DD] ml-6 mt-1 text-left">
                    {item.subMenus.map((sub) => (
                      <NavLink
                        key={sub.name}
                        to={sub.path}
                        onClick={() => { if (window.innerWidth < 1024 && isSidebarOpen) toggleSidebar(); }}
                        className={({ isActive }) => cn(
                          "block py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider font-mono transition-all",
                          isActive || window.location.search.includes(sub.path.split('?')[1] || '---')
                            ? "text-[#6D4AFF] bg-purple-50/30 font-extrabold"
                            : "text-slate-400 hover:text-[#111827] hover:bg-slate-50 font-bold"
                        )}
                      >
                        {sub.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User profile action with modern look */}
        <div className="p-4 border-t border-[#E7E4DD] bg-[#FAF9F6]">
        {activeWorkspace ? (
          <button
            onClick={() => exitWorkspace()}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-[10px] text-[#6D4AFF] hover:bg-purple-50 rounded-xl transition-all font-bold uppercase tracking-wider border border-[#E7E4DD]"
          >
            <LogOut size={13} />
            <span>Exit Workspace</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-[10px] text-rose-600 hover:bg-rose-50/50 rounded-xl transition-all font-bold uppercase tracking-wider border border-[#E7E4DD]"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        )}
        </div>
      </div>
    </>
  );
};
