import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Bot,
  Smartphone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Database,
  RefreshCw,
  Loader2,
  ServerCrash,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config';

const FILTERS = ['All Logs', 'Resolved', 'Escalated'];
const POLL_INTERVAL_MS = 30000; // refresh every 30 seconds
const PAGE_SIZE = 10;

const ActivityLogs = () => {
  const [logs, setLogs]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [error, setError]             = useState(null);
  const [searchTerm, setSearchTerm]   = useState('');
  const [activeFilter, setActiveFilter] = useState('All Logs');
  const [expandedId, setExpandedId]   = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ─── Fetch from real backend ───────────────────────────────────────────────
  const fetchLogs = useCallback(async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/activity-logs`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
        setLastUpdated(new Date());
      } else {
        throw new Error(json.message || 'Unexpected response shape');
      }
    } catch (err) {
      console.error('[ActivityLogs] fetch error:', err);
      setError(err.message || 'Failed to load activity logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchLogs(false);
  }, [fetchLogs]);

  // Background polling — refresh every 30 s without showing full loader
  useEffect(() => {
    const timer = setInterval(() => fetchLogs(true), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchLogs]);

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  // ─── Client-side filter + search ──────────────────────────────────────────
  const filteredLogs = logs.filter((log) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      log.guest.toLowerCase().includes(q) ||
      (log.requestType || '').toLowerCase().includes(q) ||
      log.room.toLowerCase().includes(q);

    const matchesFilter =
      activeFilter === 'All Logs' ||
      log.finalStatus === activeFilter;

    return matchesSearch && matchesFilter;
  });

  // ─── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpandedId(null);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safeCurrentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  // ─── Counts for badge labels ───────────────────────────────────────────────
  const resolvedCount  = logs.filter((l) => l.finalStatus === 'Resolved').length;
  const escalatedCount = logs.filter((l) => l.finalStatus === 'Escalated').length;

  const filterLabel = (f) => {
    if (f === 'Resolved')  return `Resolved (${resolvedCount})`;
    if (f === 'Escalated') return `Escalated (${escalatedCount})`;
    return `All Logs (${logs.length})`;
  };

  // ─── Pagination Controls Component ─────────────────────────────────────────
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/30">
        <span className="text-[10px] text-slate-400 font-medium">
          Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => goToPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronLeft size={13} />
          </button>
          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => goToPage(page)}
              className={`min-w-[28px] h-7 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                page === safeCurrentPage
                  ? 'bg-[#6D28D9] text-white border border-[#6D28D9]'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => goToPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    );
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-in fade-in duration-500 pb-16 text-left max-w-[1400px] mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-slate-950 tracking-tight">Activity &amp; Audit Logs</h1>
          <p className="text-xs text-slate-500 font-medium">Review AI actions and operational history.</p>
        </div>

        {/* Manual refresh + last-updated hint */}
        <div className="flex items-center gap-3 shrink-0">
          {lastUpdated && (
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* AI OPERATIONS FLOW STRIP */}
      <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-semibold">
        {[
          { label: 'Guest Request',      color: 'bg-slate-400',   textClass: '' },
          { label: 'AI Response Decision', color: 'bg-purple-500', textClass: 'text-[#6D28D9] font-bold' },
          { label: 'PMS Update',         color: 'bg-slate-400',   textClass: '' },
          { label: 'Audit Logged',       color: 'bg-emerald-500', textClass: 'text-emerald-700 font-bold' },
        ].map((step, i, arr) => (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${step.color}`} />
              <span className={step.textClass || 'text-slate-650'}>{step.label}</span>
            </div>
            {i < arr.length - 1 && <span className="text-slate-300 hidden md:block">➜</span>}
          </React.Fragment>
        ))}
      </div>

      {/* FILTER + SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200/80 p-2 rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === f
                  ? 'bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filterLabel(f)}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guest or room..."
            className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:border-purple-500/30 outline-none transition-all"
          />
        </div>
      </div>

      {/* ── STATES ── */}

      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin text-[#6D28D9]" />
          <p className="text-xs font-semibold">Loading audit logs from database…</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-white rounded-xl border border-rose-200 shadow-sm p-10 flex flex-col items-center justify-center gap-3 text-rose-500">
          <ServerCrash size={28} />
          <p className="text-xs font-bold">Failed to load logs</p>
          <p className="text-[10px] text-slate-400 font-medium">{error}</p>
          <button
            onClick={() => fetchLogs(false)}
            className="mt-2 px-4 py-1.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}

      {/* Data table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden text-left">

          {/* DESKTOP TABLE */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Time</th>
                  <th className="px-5 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Guest &amp; Room</th>
                  <th className="px-5 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Channel</th>
                  <th className="px-5 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">AI Decision</th>
                  <th className="px-5 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">PMS Status</th>
                  <th className="px-5 py-2.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">Outcome</th>
                  <th className="px-5 py-2.5 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-650">
                {paginatedLogs.map((log) => {
                  const isExpanded     = expandedId === log.id;
                  const confidenceNum  = parseFloat(log.confidence);
                  const isLowConf     = confidenceNum < 85;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => toggleExpand(log.id)}
                        className={`hover:bg-slate-50/20 transition-all cursor-pointer ${isExpanded ? 'bg-slate-50/15' : ''}`}
                      >
                        {/* Time */}
                        <td className="px-5 py-3 text-slate-400 font-mono text-[10px]">{log.timestamp}</td>

                        {/* Guest & Room */}
                        <td className="px-5 py-3 text-slate-900 font-bold">
                          <div className="flex flex-col">
                            <span>{log.guest}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{log.room}</span>
                          </div>
                        </td>

                        {/* Channel */}
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                            {log.channel === 'WhatsApp'
                              ? <Smartphone size={12} className="text-emerald-500 shrink-0" />
                              : <Mail size={12} className="text-blue-500 shrink-0" />}
                            <span>{log.channel}</span>
                          </div>
                        </td>

                        {/* AI Decision */}
                        <td className="px-5 py-3 text-slate-900 font-bold max-w-xs truncate">
                          <div className="flex items-center gap-1.5">
                            <Bot size={13} className="text-[#6D28D9] shrink-0" />
                            <span>{log.aiAction}</span>
                          </div>
                        </td>

                        {/* PMS Status */}
                        <td className="px-5 py-3 text-slate-600 font-medium truncate max-w-[180px]">
                          <div className="flex items-center gap-1">
                            <Database size={11} className="text-slate-400 shrink-0" />
                            <span>{log.pmsStatus}</span>
                          </div>
                        </td>

                        {/* Outcome */}
                        <td className="px-5 py-3">
                          <div className="flex flex-col space-y-0.5">
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider w-fit ${
                              log.finalStatus === 'Resolved'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : 'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {log.finalStatus}
                            </span>
                            {isLowConf && (
                              <span className="text-[8.5px] font-bold text-rose-500 flex items-center gap-0.5">
                                <AlertCircle size={9} />
                                Low confidence ({log.confidence})
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Expand toggle */}
                        <td className="px-5 py-3 text-right">
                          <button className="text-[11px] font-bold text-[#6D28D9] hover:underline cursor-pointer">
                            {isExpanded ? 'Hide Details' : 'View Details'}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan="7" className="p-0 bg-slate-50/30">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-t border-slate-100"
                              >
                                <div className="py-4 px-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                                  {/* Left: Request + AI reply */}
                                  <div className="space-y-3">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-slate-400 font-bold block">Guest request</span>
                                      {log.details.guestRequest ? (
                                        <p className="text-slate-700 italic font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                                          "{log.details.guestRequest}"
                                        </p>
                                      ) : (
                                        <p className="text-slate-300 italic text-[10px]">No request text recorded.</p>
                                      )}
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-slate-400 font-bold block">AI response</span>
                                      {log.details.aiReply ? (
                                        <p className="text-slate-900 font-bold leading-relaxed bg-purple-50/30 p-2.5 rounded-lg border border-purple-100/30">
                                          "{log.details.aiReply}"
                                        </p>
                                      ) : (
                                        <p className="text-slate-300 italic text-[10px]">No AI reply recorded.</p>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: PMS update + escalation */}
                                  <div className="space-y-3">
                                    <div className="space-y-0.5">
                                      <span className="text-[10px] text-slate-400 font-bold block">PMS update</span>
                                      <div className="flex items-center gap-1.5 text-slate-800 font-bold bg-white p-2.5 rounded-lg border border-slate-100">
                                        <Database size={11} className="text-[#6D28D9] shrink-0" />
                                        <span>{log.details.pmsUpdate || 'No PMS update recorded.'}</span>
                                      </div>
                                    </div>
                                    {log.details.escalationReason && (
                                      <div className="space-y-0.5">
                                        <span className="text-[10px] text-rose-500 font-bold block">Escalation reason</span>
                                        <p className="text-rose-600 font-bold bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/30">
                                          {log.details.escalationReason}
                                        </p>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium pt-1">
                                      <CheckCircle2 size={11} className="text-emerald-500" />
                                      Confidence: <span className="font-black text-slate-700">{log.confidence}</span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARD LIST */}
          <div className="block md:hidden divide-y divide-slate-100">
            {paginatedLogs.map((log) => {
              const isExpanded    = expandedId === log.id;
              const confidenceNum = parseFloat(log.confidence);
              const isLowConf    = confidenceNum < 85;

              return (
                <div key={log.id} className="p-4 space-y-2.5 cursor-pointer">
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Bot size={13} className="text-[#6D28D9] shrink-0" />
                        <h4 className="font-bold text-slate-950 leading-tight">{log.aiAction}</h4>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {log.guest} · {log.room} · {log.timestamp}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                        log.finalStatus === 'Resolved'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {log.finalStatus}
                      </span>
                      {isLowConf && (
                        <span className="text-[8.5px] font-bold text-rose-500 flex items-center gap-0.5">
                          <AlertCircle size={9} /> Low conf.
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleExpand(log.id)}
                    className="w-full py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-[#6D28D9] text-center"
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pt-2 border-t border-slate-100 space-y-2.5 text-xs"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">Guest request</span>
                          <p className="text-slate-700 italic bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                            "{log.details.guestRequest || 'N/A'}"
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">AI response</span>
                          <p className="text-slate-900 font-bold bg-purple-50/25 p-2 rounded border border-purple-100/30 leading-relaxed">
                            "{log.details.aiReply || 'N/A'}"
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block uppercase">PMS update</span>
                          <p className="text-slate-800 font-bold bg-slate-50 p-2 rounded border border-slate-100 leading-relaxed">
                            {log.details.pmsUpdate || 'N/A'}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <PaginationControls />

          {/* Empty state */}
          {filteredLogs.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center text-slate-400 gap-3">
              <Database size={28} className="text-slate-300" />
              <p className="text-xs font-semibold">No audit logs found.</p>
              <p className="text-[10px] font-medium">
                {searchTerm || activeFilter !== 'All Logs'
                  ? 'Try adjusting your search or filter.'
                  : 'Activity logs will appear here as guests interact with the AI.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;