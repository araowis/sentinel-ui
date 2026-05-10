import React, { useState, useEffect, useRef} from 'react';
import { Search, Download, Brain, GitBranch, AlertCircle, AlertTriangle, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApiCall } from '../../hooks/useApiCall';
import { getLogs, getLogsByTrace } from '../../api/api';
import type { BackendLog } from '../../models';

const levelClass: Record<string, string> = {
  ERROR: 'text-red-500',
  WARN:  'text-amber-400',
  INFO:  'text-emerald-400',
  DEBUG: 'text-slate-500',
};

export const HeuristicLogs = () => {
  const [serviceFilter, setServiceFilter] = useState('');
  const [levelFilter, setLevelFilter]     = useState('');
  const [traceInput, setTraceInput]       = useState('');
  const [traceSearch, setTraceSearch]     = useState('');

  const hasLoadedOnce = useRef(false);

  // Main log stream
  const { data: logs, loading, error, refetch } = useApiCall<BackendLog[]>(
    () => getLogs({
      service: serviceFilter || undefined,
      level:   levelFilter   || undefined,
      limit:   200,
    }),
    [serviceFilter, levelFilter],
  );

  // Trace pivot
  const traceResult = useApiCall(
    () => traceSearch ? getLogsByTrace(traceSearch) : Promise.resolve(null),
    [traceSearch],
  );

  const displayLogs: BackendLog[] = traceSearch
    ? (traceResult.data?.logs ?? [])
    : (logs ?? []);

  // Collect unique services for the filter dropdown
  const knownServices = Array.from(new Set((logs ?? []).map((l) => l.service))).sort();

  useEffect(() => {
    if (logs && logs.length > 0) {
      hasLoadedOnce.current = true;
    }
  }, [logs]);

  const handleApplyFilters = () => refetch();

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleLaunchExplorer = () => setTraceSearch(traceInput.trim());

  return (
    <div className="flex flex-grow flex-col h-[calc(100vh-64px-16px)] overflow-hidden">
      {/* Filters Header */}
      <div className="p-6 border-b border-white/10 bg-[#0b1326]/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Heuristic Logs</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                Real-time Stream Active
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="bg-[#171f33] border border-white/10 rounded-lg font-mono text-[11px] font-bold text-slate-300 px-3 py-2 focus:ring-1 focus:ring-cyan-400 appearance-none min-w-[140px] text-center"
            >
              <option value="">All Services</option>
              {knownServices.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-[#171f33] border border-white/10 rounded-lg font-mono text-[11px] font-bold text-slate-300 px-3 py-2 focus:ring-1 focus:ring-cyan-400 appearance-none min-w-[140px] text-center"
            >
              <option value="">All Levels</option>
              <option value="INFO">Info</option>
              <option value="WARN">Warn</option>
              <option value="ERROR">Error / Critical</option>
            </select>
            <button
              onClick={handleApplyFilters}
              className="bg-cyan-500 text-[#0b1326] font-mono text-[11px] font-bold uppercase tracking-widest px-6 py-2 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-12 gap-0 overflow-hidden">
        {/* Main Terminal */}
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-0 border-r border-white/10 bg-[#060e20]">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-white/10">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Stream Console
            </span>
            <div className="flex items-center gap-6">
              <span className="font-mono text-[11px] text-slate-600">
                Lines: {displayLogs.length}
              </span>
              <div className="flex gap-4">
                <button className="text-slate-600 hover:text-cyan-400 transition-colors">
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-grow p-6 font-mono text-[13px] overflow-y-auto space-y-1">
            {loading && !hasLoadedOnce.current && (
              <div className="space-y-2">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-5 bg-slate-800/40 rounded animate-pulse" />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {!loading && displayLogs.map((log, i) => {
              const isError = log.level === 'ERROR';
              return (
                <div
                  key={`${log.id}-${i}`}
                  className={cn(
                    'group flex gap-4 transition-colors py-1 px-2 rounded',
                    isError
                      ? 'bg-red-500/5 border-l-2 border-red-500 -mx-2 px-4 my-1'
                      : log.level === 'WARN'
                      ? 'bg-amber-500/5 border-l border-amber-500/30 -mx-2 px-4'
                      : 'hover:bg-cyan-500/5',
                  )}
                >
                  <span className="text-slate-700 shrink-0 select-none">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      fractionalSecondDigits: 3,
                    })}
                  </span>
                  <span className={cn('font-bold shrink-0 uppercase', levelClass[log.level] ?? 'text-slate-400')}>
                    {log.level === 'ERROR' ? 'CRIT' : log.level}
                  </span>
                  <span className="text-slate-500 shrink-0">[{log.service}]</span>
                  <code className={cn('break-all', isError ? 'text-slate-100' : 'text-slate-300')}>
                    {log.error_type ? `[${log.error_type}] ` : ''}
                    {log.message}
                  </code>
                </div>
              );
            })}

            {!loading && displayLogs.length === 0 && !error && (
              <p className="text-slate-600 italic text-sm">No logs to display.</p>
            )}
          </div>

          {/* Trace Input */}
          <div className="p-6 border-t border-white/10 bg-[#0b1326]/50">
            <div className="flex items-center gap-6">
              <div className="flex-grow flex items-center bg-[#060e20] p-4 rounded-xl border border-cyan-500/30 shadow-[0_4px_20px_rgba(76,215,246,0.1)]">
                <GitBranch size={20} className="text-cyan-400 mr-4" />
                <input
                  className="bg-transparent border-none focus:ring-0 font-mono text-[13px] text-slate-200 w-full placeholder:text-slate-700"
                  placeholder="Isolated Trace View: Enter Trace ID to pivot..."
                  type="text"
                  value={traceInput}
                  onChange={(e) => setTraceInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLaunchExplorer()}
                />
              </div>
              <button
                onClick={handleLaunchExplorer}
                className="bg-slate-800 border border-white/10 text-slate-200 font-mono text-[11px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-slate-700 transition-colors"
              >
                {traceSearch ? 'Clear' : 'Launch Explorer'}
              </button>
            </div>
            {traceSearch && (
              <div className="mt-2 flex items-center gap-2">
                <span className="font-mono text-[11px] text-cyan-400">
                  Showing trace: {traceSearch}
                </span>
                <button
                  onClick={() => { setTraceSearch(''); setTraceInput(''); }}
                  className="text-slate-500 hover:text-slate-300 text-[11px] font-mono underline"
                >
                  reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Heuristic Analysis Panel */}
        <div className="hidden lg:flex lg:col-span-3 flex-col bg-[#171f33]/30 border-l border-white/5">
          <div className="p-6">
            <h3 className="font-mono text-[11px] font-bold text-cyan-400 border-b border-cyan-400/20 pb-2 mb-6 uppercase tracking-widest">
              Heuristic Analysis
            </h3>
            <div className="space-y-6">
              {/* Error rate card */}
              <div className="bg-[#171f33]/70 backdrop-blur-xl p-5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-wider">
                    Log Summary
                  </span>
                </div>
                <p className="text-[13px] text-slate-200 mb-4 leading-relaxed">
                  {(logs ?? []).filter((l) => l.level === 'ERROR').length} errors /{' '}
                  {(logs ?? []).filter((l) => l.level === 'WARN').length} warnings in stream
                </p>
                <div className="h-1.5 w-full bg-[#060e20] rounded-full overflow-hidden">
                  {(logs?.length ?? 0) > 0 && (
                    <div
                      className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                      style={{
                        width: `${Math.min(
                          100,
                          ((logs ?? []).filter((l) => l.level === 'ERROR').length /
                            Math.max(logs?.length ?? 1, 1)) *
                            100,
                        )}%`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Warn card */}
              {(logs ?? []).filter((l) => l.level === 'WARN').length > 0 && (
                <div className="bg-[#171f33]/70 backdrop-blur-xl p-5 rounded-xl border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-amber-500" />
                    <span className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-wider">
                      Pattern Match
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-200 mb-4 leading-relaxed">
                    {(logs ?? []).filter((l) => l.level === 'WARN').length} warnings detected
                  </p>
                </div>
              )}

              {/* AI info */}
              <div className="mt-10">
                <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-6">
                  Stream Info
                </h4>
                <div className="font-mono text-[11px] text-slate-500 space-y-2">
                  <p>Services: {knownServices.length}</p>
                  <p>Total lines: {displayLogs.length}</p>
                  {traceSearch && <p className="text-cyan-400">Trace filter active</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto p-6 bg-[#171f33]/30 border-t border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-cyan-400/20 bg-[#060e20] p-1 flex items-center justify-center">
                <Brain size={24} className="text-cyan-400" />
              </div>
              <div>
                <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">
                  System AI Model
                </p>
                <p className="font-mono text-[12px] font-bold text-slate-200">Sentinel-CORE v4.2</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
