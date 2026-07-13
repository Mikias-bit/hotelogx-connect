import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Conversations from './pages/Conversations';
import AutomationEngine from './pages/AutomationEngine';
import KnowledgeBase from './pages/KnowledgeBase';
import TakeoverQueue from './pages/TakeoverQueue';
import GuestProfile from './pages/GuestProfile';
import Integrations from './pages/Integrations';
import Transactions from './pages/Transactions';
import Settings from './pages/Settings';
import ActivityLogs from './pages/ActivityLogs';
import Unauthorized from './pages/Unauthorized';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { SuperAdminControlCenter } from './pages/super-admin/SuperAdminControlCenter';
import Subscriptions from './pages/super-admin/Subscriptions';
import SuperAdminSettings from './pages/super-admin/SuperAdminSettings';
import { CredentialSubmission } from './pages/onboarding/CredentialSubmission';
import SubscriptionBilling from './pages/SubscriptionBilling';
import BillingManagement from './pages/super-admin/BillingManagement';
import { ROLES } from './context/AppContext';

const PLATFORM_ROLES = [ROLES.PLATFORM_OPERATOR, ROLES.MANAGER, ROLES.GUEST_ASSISTANT];
const ADMIN_ONLY = [ROLES.SUPER_ADMIN];

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding/:token" element={<CredentialSubmission />} />

          {/* Protected Enterprise Platform Dashboard */}
          <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="conversations" element={<Conversations />} />
            <Route path="automation-engine" element={<AutomationEngine />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="takeover-queue" element={<TakeoverQueue />} />

            <Route path="guest-profile" element={<GuestProfile />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Client billing & SaaS subscription routes */}
            <Route path="subscription-billing" element={<SubscriptionBilling />} />
            <Route path="subscription_billing" element={<SubscriptionBilling />} />
            <Route path="billing-management" element={<BillingManagement />} />
            
            {/* Super Admin Routes */}
            <Route path="onboarding" element={<SuperAdminControlCenter defaultTab="onboarding" />} />
            <Route path="workspaces" element={<SuperAdminControlCenter defaultTab="workspaces" />} />
            <Route path="integrations-infra" element={<SuperAdminControlCenter defaultTab="integrations-infra" />} />
            <Route path="billing" element={<Subscriptions />} />
            <Route path="platform-settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Fallbacks */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
