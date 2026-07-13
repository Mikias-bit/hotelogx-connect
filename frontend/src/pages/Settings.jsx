import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Bell,
  Save,
  ShieldAlert,
  RefreshCw,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  Database,
  Sliders,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../config";

// --- SUB-PANEL: AI TONE & STYLE ---
const AIToneStylePanel = ({ settings, onChange }) => {
  const tone = settings.communicationVoice;
  const language = settings.defaultLanguage;
  const signature = settings.messageSignature;

  // Preview messages mapped to selected tone
  const getPreviewText = () => {
    switch (tone) {
      case "Formal & Traditional":
        return "Dear Ms. Jenkins, we are pleased to inform you that your request for a checkout extension until 2:00 PM has been formally approved. Enjoy your stay.";
      case "Friendly, Casual & Quick":
        return "Hey Sarah! Sure thing, I've extended your checkout to 2 PM. Sleep in and relax, no rush!";
      case "Ultra-Luxury Concierge Style":
        return "Good morning Sarah. It is our utmost pleasure to accommodate your request. Your checkout has been graciously extended to 2:00 PM today.";
      default: // Warm & Professional
        return "Absolutely Sarah, I’ve extended your checkout until 2:00 PM today based on availability. Your room key has been updated automatically.";
    }
  };

  return (
    <div className="space-y-5 text-left">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="text-left">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            AI Persona & Tone
          </h3>
          <p className="text-slate-500 text-xs font-medium">
            Configure the automated communication voice signature for your
            property.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Communication Voice
            </label>
            <select
              value={tone}
              onChange={(e) => onChange("communicationVoice", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-purple-500/20"
            >
              <option>Warm & Professional</option>
              <option>Formal & Traditional</option>
              <option>Friendly, Casual & Quick</option>
              <option>Ultra-Luxury Concierge Style</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Default Language
            </label>
            <select
              value={language}
              onChange={(e) => onChange("defaultLanguage", e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-purple-500/20"
            >
              <option>Auto-Detect Multilingual</option>
              <option>Strict English Only</option>
              <option>Bilingual (English / Spanish)</option>
              <option>Bilingual (English / French)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            Automated Message Signature
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => onChange("messageSignature", e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-purple-500/20 placeholder-slate-400"
          />
        </div>
      </div>

      {/* INTERACTIVE CHAT PREVIEW */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-3.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Live Voice Preview Simulation
        </span>

        <div className="space-y-3 max-w-md">
          {/* Guest side bubble */}
          <div className="flex justify-end">
            <div className="bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl rounded-tr-none text-xs font-medium max-w-xs">
              "Can I checkout at 2 PM?"
            </div>
          </div>

          {/* AI side bubble */}
          <div className="flex justify-start items-start gap-2">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0">
              <Bot size={13} />
            </div>
            <div className="bg-white border border-slate-150 text-slate-900 px-3.5 py-2 rounded-xl rounded-tl-none text-xs font-semibold max-w-xs space-y-1 shadow-sm">
              <p className="leading-relaxed">{getPreviewText()}</p>
              <span className="text-[9.5px] text-slate-400 font-medium block border-t border-slate-100 pt-1 mt-1 text-right">
                {signature}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-PANEL: AI PERMISSIONS ---
const AIPermissionsPanel = ({ settings, onChange }) => {
  const lateCheckOutLimit = settings.lateCheckoutLimit;
  const refundLimit = `$${settings.billingWaiverLimit}`;
  const upgradePermission = settings.roomUpgradeLimit;

  const handleRefundChange = (val) => {
    const numeric = parseInt(val.replace("$", ""), 10) || 0;
    onChange("billingWaiverLimit", numeric);
  };

  return (
    <div className="space-y-5 text-left">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="text-left">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            AI Decision Permissions
          </h3>
          <p className="text-slate-500 text-xs font-medium">
            Set precise operational authorization levels for independent AI
            decisions.
          </p>
        </div>

        {/* Compact permissions card deck */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Late Checkout */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-2.5 hover:border-purple-200/60 transition-all bg-slate-50/20">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Late Checkout limits
            </span>
            <p className="text-xs text-slate-500 font-medium leading-normal">
              AI can independently extend guest room keys complimentary up to:
            </p>
            <select
              value={lateCheckOutLimit}
              onChange={(e) => onChange("lateCheckoutLimit", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
            >
              <option>12:00 PM</option>
              <option>1:00 PM</option>
              <option>2:00 PM</option>
              <option>3:00 PM (Supervisor alert)</option>
            </select>
          </div>

          {/* Card 2: Refund Approvals */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-2.5 hover:border-purple-200/60 transition-all bg-slate-50/20">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Refund Approvals
            </span>
            <p className="text-xs text-slate-500 font-medium leading-normal">
              AI can auto-issue billing credits / folio waivers up to:
            </p>
            <select
              value={refundLimit}
              onChange={(e) => handleRefundChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
            >
              <option>$0 (Requires manual desk review)</option>
              <option>$25</option>
              <option>$50</option>
              <option>$100</option>
            </select>
          </div>

          {/* Card 3: Room Upgrades */}
          <div className="border border-slate-200/80 rounded-xl p-4 space-y-2.5 hover:border-purple-200/60 transition-all bg-slate-50/20">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
              Room Upgrades
            </span>
            <p className="text-xs text-slate-500 font-medium leading-normal">
              AI can grant complimentary upgrades during check-in for:
            </p>
            <select
              value={upgradePermission}
              onChange={(e) => onChange("roomUpgradeLimit", e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none"
            >
              <option>No Autonomous Upgrades</option>
              <option>Standard Rooms Only</option>
              <option>Standard & Junior Suites</option>
            </select>
          </div>
        </div>
      </div>

      {/* Safety Guard Notice */}
      <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-xl flex items-start gap-3">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
          Any guest inquiry exceeding these limits (e.g. asking for $75 discount
          or checkout at 3 PM) is automatically forwarded to human staff
          takeover queue.
        </p>
      </div>
    </div>
  );
};

// --- SUB-PANEL: ESCALATION RULES ---
const EscalationRulesPanel = ({ settings, onChange }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
      <div className="text-left">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Escalation Routing
        </h3>
        <p className="text-slate-500 text-xs font-medium">
          Define target human teams when guest situations bypass automated
          control limits.
        </p>
      </div>

      <div className="space-y-3.5">
        {[
          {
            label: "VIP Guests Escalations",
            desc: "Loyalty status triggers priority desk routing",
            state: settings.vipEscalationRoute,
            key: "vipEscalationRoute",
            options: ["Supervisor", "Front Desk Manager", "Duty Manager"],
          },
          {
            label: "Refund & Disputes",
            desc: "Surcharges or incidental fee disputes",
            state: settings.refundEscalationRoute,
            key: "refundEscalationRoute",
            options: ["Supervisor", "Front Desk Manager", "Accounting Desk"],
          },
          {
            label: "Complaint Sentiment Trigger",
            desc: "High negativity / anger detected by AI NLP",
            state: settings.sentimentEscalationRoute,
            key: "sentimentEscalationRoute",
            options: [
              "Human Takeover",
              "Front Desk Supervisor",
              "Escalation Channel",
            ],
          },
          {
            label: "Low AI Confidence Trigger",
            desc: "Fails to map matching hotel SOP rules",
            state: settings.confidenceEscalationRoute,
            key: "confidenceEscalationRoute",
            options: [
              "Takeover Queue",
              "Front Desk Assistant",
              "Supervisor Queue",
            ],
          },
        ].map((rule, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl"
          >
            <div className="space-y-0.5 text-left">
              <p className="text-xs font-bold text-slate-900">{rule.label}</p>
              <p className="text-[10px] text-slate-400 font-semibold">
                {rule.desc}
              </p>
            </div>
            <select
              value={rule.state}
              onChange={(e) => onChange(rule.key, e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none w-full sm:w-48 cursor-pointer"
            >
              {rule.options.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-PANEL: STAFF ALERTS ---
const StaffAlertsPanel = ({ settings, onChange }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
      <div className="text-left">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Staff Routing & Alerts
        </h3>
        <p className="text-slate-500 text-xs font-medium">
          Configure alert triggers and messaging routes when humans are paged.
        </p>
      </div>

      <div className="space-y-3">
        {/* WhatsApp Alert */}
        <div className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
          <div className="text-left space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              WhatsApp Shift Paging
            </p>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Send high-priority escalation notifications directly to staff
              WhatsApp devices.
            </p>
          </div>
          <button
            onClick={() => onChange("pushAlertsEnabled", !settings.pushAlertsEnabled)}
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 cursor-pointer ${settings.pushAlertsEnabled ? "bg-[#6D28D9]" : "bg-slate-300"}`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${settings.pushAlertsEnabled ? "translate-x-4" : ""}`}
            />
          </button>
        </div>

        {/* Email Alert */}
        <div className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
          <div className="text-left space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              Email Takeover Summary
            </p>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Generate instant email alerts with full conversational transcripts
              for manual takeover cases.
            </p>
          </div>
          <button
            onClick={() => onChange("systemAlertsEnabled", !settings.systemAlertsEnabled)}
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 cursor-pointer ${settings.systemAlertsEnabled ? "bg-[#6D28D9]" : "bg-slate-300"}`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${settings.systemAlertsEnabled ? "translate-x-4" : ""}`}
            />
          </button>
        </div>

        {/* Shift Routing */}
        <div className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
          <div className="text-left space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              Active Shift-Based Paging
            </p>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Route alerts dynamically depending on currently logged shift
              rosters in PMS.
            </p>
          </div>
          <button
            onClick={() => onChange("shiftPagingEnabled", !settings.shiftPagingEnabled)}
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 cursor-pointer ${settings.shiftPagingEnabled ? "bg-[#6D28D9]" : "bg-slate-300"}`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${settings.shiftPagingEnabled ? "translate-x-4" : ""}`}
            />
          </button>
        </div>

        {/* Night Mode */}
        <div className="flex justify-between items-center p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
          <div className="text-left space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              Auto Night-Duty Mode
            </p>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Forward escalated calls directly to the night manager mobile
              between 11 PM and 6 AM.
            </p>
          </div>
          <button
            onClick={() => onChange("nightDutyEnabled", !settings.nightDutyEnabled)}
            className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all shrink-0 cursor-pointer ${settings.nightDutyEnabled ? "bg-[#6D28D9]" : "bg-slate-300"}`}
          >
            <div
              className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${settings.nightDutyEnabled ? "translate-x-4" : ""}`}
            />
          </button>
        </div>

        {/* Emergency Escalation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50/50 border border-slate-200 rounded-xl">
          <div className="text-left space-y-0.5">
            <p className="text-xs font-bold text-slate-900">
              Emergency Priority Channel
            </p>
            <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
              Assign dispatch level to high safety risk complaints (e.g. room
              damage, incident alerts).
            </p>
          </div>
          <select
            value={settings.emergencyChannel}
            onChange={(e) => onChange("emergencyChannel", e.target.value)}
            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none w-full sm:w-48 cursor-pointer"
          >
            <option>Standard Takeover Queue</option>
            <option>High Priority Page</option>
            <option>Immediate Manager SMS Page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// --- SUB-PANEL: CONNECTED SYSTEMS ---
const ConnectedSystemsPanel = () => {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5 text-left animate-in fade-in duration-300">
      <div className="text-left">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Connected Systems
        </h3>
        <p className="text-slate-500 text-xs font-medium">
          Verify sync statuses with critical operational PMS and dispatch
          platforms.
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            system: "Opera PMS Integration",
            type: "Core PMS Link",
            status: "Sync Healthy",
            detail: "Dynamic folio fee posts active",
          },
          {
            system: "WhatsApp Enterprise API",
            type: "Guest Channel Link",
            status: "Active",
            detail: "Primary messaging webhook live",
          },
          {
            system: "SMTP Email Dispatch",
            type: "Staff Paging Channel",
            status: "Operational",
            detail: "Digest reports dispatch active",
          },
        ].map((sys, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
          >
            <div className="space-y-0.5 text-left">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">
                {sys.type}
              </span>
              <p className="text-xs font-bold text-slate-950">{sys.system}</p>
              <p className="text-[10px] text-slate-500 font-semibold">
                {sys.detail}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                {sys.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-PANEL: ACCOUNT SECURITY ---
const AccountSecurityPanel = ({ settings, onChange }) => {
  const { addToast } = useApp();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [logoutAll, setLogoutAll] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast("All password fields are required.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast("Confirm password does not match new password.", "error");
      return;
    }

    setUpdatingPass(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}` // Fallback if using local storage
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        addToast("Password updated successfully.", "success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        addToast(data.message || "Failed to update password.", "error");
      }
    } catch (err) {
      addToast("Connection error updating password.", "error");
    } finally {
      setUpdatingPass(false);
    }
  };

  // Simple password strength calculator
  const getPasswordStrength = () => {
    if (!newPassword)
      return { percent: 0, text: "Empty", color: "bg-slate-200" };
    if (newPassword.length < 5)
      return { percent: 25, text: "Weak", color: "bg-rose-500" };
    if (newPassword.length < 8)
      return { percent: 50, text: "Moderate", color: "bg-amber-500" };

    const hasNumbers = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    if (hasNumbers && hasSpecial)
      return { percent: 100, text: "Very Secure", color: "bg-emerald-500" };
    return { percent: 75, text: "Secure", color: "bg-purple-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 text-left animate-in fade-in duration-300">
      {/* Left side credentials edit form */}
      <form onSubmit={handleUpdatePassword} className="md:col-span-8 bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="text-left">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Account Credentials
          </h3>
          <p className="text-slate-500 text-xs font-medium">
            Update password credentials to access hotel operational dashboards
            securely.
          </p>
        </div>

        <div className="space-y-3 text-xs font-semibold">
          {/* Current Pass */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-3 pr-9 py-1.75 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-purple-500/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
              >
                {showCurrent ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          {/* New Pass */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full pl-3 pr-9 py-1.75 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-purple-500/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
              >
                {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
            {/* Strength Meter */}
            {newPassword && (
              <div className="space-y-1 pt-1 text-left">
                <div className="flex justify-between text-[9px] font-bold">
                  <span className="text-slate-400">Password Strength:</span>
                  <span className="text-slate-700">{strength.text}</span>
                </div>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all`}
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Pass */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-3 pr-9 py-1.75 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-purple-500/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-650"
              >
                {showConfirm ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={updatingPass}
            className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-[10px] uppercase tracking-wider cursor-pointer"
          >
            {updatingPass ? "Updating Password..." : "Update Password"}
          </button>
        </div>

        {/* Secure Access Controls */}
        <div className="pt-3.5 border-t border-slate-100 space-y-3.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Access Controls
          </span>

          {/* Enforce Complex rules */}
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="text-left space-y-0.5">
              <p className="text-slate-900 font-bold">Enforce Complex Rules</p>
              <p className="text-[9.5px] text-slate-400 leading-none">
                Require special characters and numeric sequences.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange("enforceComplexRules", !settings.enforceComplexRules)}
              className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all cursor-pointer ${settings.enforceComplexRules ? "bg-[#6D28D9]" : "bg-slate-300"}`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${settings.enforceComplexRules ? "translate-x-4" : ""}`}
              />
            </button>
          </div>

          {/* MFA */}
          <div className="flex justify-between items-center text-xs font-semibold">
            <div className="text-left space-y-0.5">
              <p className="text-slate-900 font-bold">
                Two-Factor Authentication (MFA)
              </p>
              <p className="text-[9.5px] text-slate-400 leading-none">
                Require OTP codes on staff login requests (future-ready).
              </p>
            </div>
            <button
              type="button"
              onClick={() => onChange("mfaEnabled", !settings.mfaEnabled)}
              className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-all cursor-pointer ${settings.mfaEnabled ? "bg-[#6D28D9]" : "bg-slate-300"}`}
            >
              <div
                className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${settings.mfaEnabled ? "translate-x-4" : ""}`}
              />
            </button>
          </div>

          {/* Session Timeout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
            <div className="text-left space-y-0.5">
              <p className="text-slate-900 font-bold">Session Idle Timeout</p>
              <p className="text-[9.5px] text-slate-400 leading-none">
                Automatically lock session after duration of idle status.
              </p>
            </div>
            <select
              value={settings.sessionTimeout}
              onChange={(e) => onChange("sessionTimeout", e.target.value)}
              className="px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none w-full sm:w-28 cursor-pointer"
            >
              <option>4 Hours</option>
              <option>8 Hours</option>
              <option>24 Hours</option>
            </select>
          </div>

          {/* Logout all */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setLogoutAll(true);
                setTimeout(() => setLogoutAll(false), 2000);
              }}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10.5px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              {logoutAll
                ? "All other sessions closed"
                : "Force logout from all other devices"}
            </button>
          </div>
        </div>
      </form>

      {/* Right side security status card */}
      <div className="md:col-span-4 bg-slate-50 border border-slate-150 p-4.5 rounded-xl text-left space-y-4 h-fit">
        <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-[10.5px] font-bold text-slate-900 uppercase tracking-wider">
            Access Status
          </span>
        </div>

        <div className="space-y-3.5 font-semibold text-xs text-slate-600">
          <div className="space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold block uppercase leading-none">
              Last password update
            </span>
            <p className="text-slate-900 font-bold">Just now</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold block uppercase leading-none">
              Active Sessions
            </span>
            <p className="text-slate-900 font-bold">1 device active</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold block uppercase leading-none">
              MFA Status
            </span>
            <p
              className={
                settings.mfaEnabled
                  ? "text-emerald-600 font-bold"
                  : "text-slate-500 font-bold"
              }
            >
              {settings.mfaEnabled ? "Active (Email-linked)" : "Inactive"}
            </p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9.5px] text-slate-400 font-bold block uppercase leading-none">
              Protection status
            </span>
            <p className="text-slate-900 font-bold">
              Brute-force protection active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB-PANEL: USAGE & BILLING ---
const BillingPlanPanel = () => {
  const { hotels } = useApp();
  const myHotel = hotels[0] || { plan: "Enterprise", rooms: 150 };

  return (
    <div className="space-y-5 text-left animate-in fade-in duration-300">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5">
        <div className="text-left">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Usage & Billing Metrics
          </h3>
          <p className="text-slate-500 text-xs font-medium">
            Review current operational workspace limits and direct integration
            statuses.
          </p>
        </div>

        {/* Shrunken billing indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Rooms Sync
            </span>
            <p className="text-sm font-black text-slate-950 font-mono">
              {myHotel.rooms || 150} Rooms
            </p>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none">
              PMS Active Sync
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Conversations
            </span>
            <p className="text-sm font-black text-slate-950 font-mono">
              1,240 / 5,000
            </p>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none">
              24.8% Monthly limit
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Integration Status
            </span>
            <p className="text-sm font-black text-emerald-600 font-mono">
              Connected
            </p>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none">
              PMS bridge normal
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Automation success
            </span>
            <p className="text-sm font-black text-[#6D28D9] font-mono">
              99.2% OK
            </p>
            <span className="text-[9px] text-slate-400 block font-semibold leading-none">
              0 unresolved locks
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN SETTINGS EXPORT COMPONENT ---
const Settings = () => {
  const { addToast } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("tone");
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Settings State matching database columns
  const [settings, setSettings] = useState({
    communicationVoice: "Warm & Professional",
    defaultLanguage: "Auto-Detect Multilingual",
    messageSignature: "Sincerely, the Guest Relations Team",
    lateCheckoutLimit: "2:00 PM",
    billingWaiverLimit: 30,
    roomUpgradeLimit: "Standard Rooms Only",
    vipEscalationRoute: "Front Desk Manager",
    refundEscalationRoute: "Supervisor",
    sentimentEscalationRoute: "Human Takeover",
    confidenceEscalationRoute: "Takeover Queue",
    shiftPagingEnabled: false,
    nightDutyEnabled: true,
    emergencyChannel: "High Priority Page",
    enforceComplexRules: true,
    mfaEnabled: false,
    sessionTimeout: "8 Hours",
    systemAlertsEnabled: true,
    pushAlertsEnabled: true,
    globalAutomation: true,
    confidenceThreshold: 85,
    humanTakeoverEnabled: true,
    escalationThreshold: 65,
    occupancyTrigger: 90
  });

  const [mobileExpanded, setMobileExpanded] = useState("tone");

  // Fetch settings from live database
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings((prev) => ({
            ...prev,
            ...data.data
          }));
        }
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast("Operational behavior controls successfully updated.", "success");
      } else {
        addToast(data.message || "Failed to save settings.", "error");
      }
    } catch (err) {
      addToast("Connection error saving settings.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    {
      id: "tone",
      label: "AI Tone & Style",
      icon: Bot,
      desc: "VOICE PERSONA & SIGNATURE",
    },
    {
      id: "permissions",
      label: "AI Permissions",
      icon: Sliders,
      desc: "MAX ALLOWED DECISION BOUNDS",
    },
    {
      id: "escalation",
      label: "Escalation Rules",
      icon: ShieldAlert,
      desc: "TEAM ROUTING CONFIGURATION",
    },
    {
      id: "alerts",
      label: "Staff Alerts",
      icon: Bell,
      desc: "SHIFTS & NOTIFICATIONS",
    },
    {
      id: "systems",
      label: "Connected Systems",
      icon: Database,
      desc: "PMS & WEBHOOK BRIDGES",
      route: "/app/integrations",
    },
    {
      id: "account",
      label: "My Account",
      icon: Lock,
      desc: "EMAIL & PASSWORD",
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCard,
      desc: "USAGE & BILLING",
    },
  ];

  const renderContent = (tabId) => {
    switch (tabId) {
      case "tone":
        return <AIToneStylePanel settings={settings} onChange={handleChange} />;
      case "permissions":
        return <AIPermissionsPanel settings={settings} onChange={handleChange} />;
      case "escalation":
        return <EscalationRulesPanel settings={settings} onChange={handleChange} />;
      case "alerts":
        return <StaffAlertsPanel settings={settings} onChange={handleChange} />;
      case "systems":
        return <ConnectedSystemsPanel />;
      case "account":
        return <AccountSecurityPanel settings={settings} onChange={handleChange} />;
      case "billing":
        return <BillingPlanPanel />;
      default:
        return <AIToneStylePanel settings={settings} onChange={handleChange} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-3 text-slate-400">
        <RefreshCw size={28} className="animate-spin text-[#6D28D9]" />
        <p className="text-xs font-semibold">Loading hotel configurations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-5 animate-in fade-in duration-500 pb-20 relative text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div className="text-left space-y-0.5">
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">
            Hotel Settings
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Configure hotel preferences and AI behavior.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={handleApply}
            disabled={isSaving}
            className="w-full lg:w-auto flex items-center justify-center gap-1.5 px-4.5 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer border border-slate-800"
          >
            {isSaving ? (
              <RefreshCw
                size={11}
                className="animate-spin text-purple-300 shrink-0"
              />
            ) : (
              <Save size={11} className="shrink-0" />
            )}
            <span>
              {isSaving ? "Applying Changes..." : "Save Behavior Settings"}
            </span>
          </button>
        </div>
      </div>

      {/* BEHAVIOR SUMMARY STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold py-2 px-1 border-b border-slate-100/80 bg-white/10 rounded-lg text-slate-500 leading-normal">
        <div className="flex items-start gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
          <p>
            <strong className="text-slate-900 font-bold block uppercase text-[9px] tracking-wider mb-0.5">
              AI Autopilot Approvals
            </strong>
            Late checkout extensions • Spa massage bookings • Room view upgrades
            • Guest WiFi/amenity inquiries
          </p>
        </div>
        <div className="flex items-start gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
          <p>
            <strong className="text-slate-900 font-bold block uppercase text-[9px] tracking-wider mb-0.5">
              Staff Takeover Triggered
            </strong>
            High negativity sentiment • Surcharge refund disputes • Guest
            service waivers above limit • Low model confidence
          </p>
        </div>
      </div>

      {/* GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <div className="hidden md:block md:col-span-3 space-y-1">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.route) {
                    navigate(tab.route);
                    return;
                  }
                  setActiveTab(tab.id);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer text-left ${
                  activeTab === tab.id
                    ? "bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20"
                    : "text-slate-500 hover:bg-white border border-transparent hover:border-slate-100 hover:text-slate-900"
                }`}
              >
                <tab.icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* AUTOMATION STATUS */}
          <div className="pt-3">
            <div className="p-4 bg-slate-900 rounded-xl text-white space-y-3 relative overflow-hidden group">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block border-b border-white/10 pb-1.5">
                Automation Status
              </span>

              <div className="space-y-2 text-[10.5px] font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>PMS Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>WhatsApp Webhook Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>AI Engine Automation Running</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Escalation Takeover Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP CONTENT PANEL */}
        <div className="hidden md:block md:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {renderContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* MOBILE ACCORDION STACKED VIEW */}
        <div className="block md:hidden md:col-span-12 space-y-2">
          {tabs.map((tab) => {
            const isOpen = mobileExpanded === tab.id;

            return (
              <div
                key={tab.id}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => {
                    if (tab.route) {
                      navigate(tab.route);
                      return;
                    }
                    setMobileExpanded(isOpen ? "" : tab.id);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-slate-50/50 text-xs font-bold text-slate-950 text-left border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <tab.icon size={14} className="text-[#6D28D9]" />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">
                    {isOpen ? "▼" : "▶"}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden p-4 bg-white"
                    >
                      {renderContent(tab.id)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Mobile Sticky Save Button */}
          <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/90 backdrop-blur-md border-t border-slate-150 block md:hidden">
            <button
              onClick={handleApply}
              disabled={isSaving}
              className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider shadow-md disabled:opacity-50"
            >
              {isSaving ? "Applying Changes..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
