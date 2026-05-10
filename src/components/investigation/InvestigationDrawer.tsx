import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RefreshCw, Check, Github, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useApiCall } from '../../hooks/useApiCall';
import { getIncidentDetail, triggerRca, resolveIncident } from '../../api/api';
import type { IncidentDetail, RcaResult } from '../../models';

// ── Log level styles ──────────────────────────────────────────────────────────

const levelClass: Record<string, string> = {
  ERROR: 'text-red-500',
  WARN:  'text-amber-400',
  INFO:  'text-emerald-400',
  DEBUG: 'text-slate-500',
};

// ── Fix action type → icon / label ────────────────────────────────────────────

function fixLabel(actionType: string): string {
  if (actionType === 'github.pull_request') return 'GitHub PR Created';
  if (actionType === 'github.issue') return 'GitHub Issue Created';
  if (actionType === 'slack.message') return 'Slack Alert Sent';
  return actionType;
}

function FixIcon({ actionType }: { actionType: string }) {
  if (actionType === 'github.pull_request' || actionType === 'github.issue') {
    return <Github size={24} className="text-emerald-400" />;
  }
  return <MessageSquare size={24} className="text-emerald-400" />;
}

// ── RCA section ───────────────────────────────────────────────────────────────

const RcaSection = ({ rca }: { rca: RcaResult }) => (
  <section className="relative">
    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-500/30 rounded-full" />
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
        <Sparkles size={16} />
        AI Root Cause Analysis
      </h3>
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Confidence
          </span>
          <span className="text-emerald-400 font-bold text-lg leading-none">
            {rca.confidence}%
          </span>
        </div>
        <div className="h-10 w-[1px] bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            Blast Radius
          </span>
          <span className="text-amber-400 font-bold text-sm leading-none">{rca.blast_radius}</span>
        </div>
      </div>
    </div>
    <div className="bg-cyan-500/5 p-6 rounded-xl border border-cyan-500/20 space-y-4">
      <p className="text-slate-200 leading-relaxed">
        {rca.root_cause}
      </p>
      {rca.recommended_fix && (
        <div className="border-t border-white/5 pt-4">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
            Recommended Fix
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">{rca.recommended_fix}</p>
        </div>
      )}
      {rca.impact && (
        <div className="border-t border-white/5 pt-4">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
            Impact
          </p>
          <p className="text-slate-300 text-sm">{rca.impact}</p>
        </div>
      )}
    </div>
    <p className="font-mono text-[10px] text-slate-600 mt-2">
      Generated {new Date(rca.generated_at).toLocaleString()} · {rca.model_used}
    </p>
  </section>
);

// ── Main drawer ───────────────────────────────────────────────────────────────

export const InvestigationDrawer = ({
  incidentId,
  isOpen,
  onClose,
}: {
  incidentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [rcaRunning, setRcaRunning] = useState(false);
  const [resolving, setResolving]   = useState(false);
  const [actionMsg, setActionMsg]   = useState<string | null>(null);

const { data: incident, loading, error, refetch } = useApiCall<IncidentDetail>(
  () => {
    if (!incidentId) {
      return Promise.reject(new Error("No incident selected"));
    }

    return getIncidentDetail(incidentId);
  },
  [incidentId],
);

  if (!incidentId) return null;

  const severityColour =
    incident?.severity === 'CRITICAL' ? 'text-red-500 bg-red-500/20' :
    incident?.severity === 'HIGH'     ? 'text-orange-400 bg-orange-500/20' :
    incident?.severity === 'MEDIUM'   ? 'text-amber-400 bg-amber-500/20' :
                                        'text-slate-400 bg-slate-500/20';

  const handleReRunRca = async () => {
    if (!incident) return;
    setRcaRunning(true);
    setActionMsg(null);
    try {
      await triggerRca(incident.id);
      await refetch();
      setActionMsg('RCA re-run complete.');
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : 'RCA failed');
    } finally {
      setRcaRunning(false);
    }
  };

  const handleResolve = async () => {
    if (!incident) return;
    setResolving(true);
    setActionMsg(null);
    try {
      await resolveIncident(incident.id);
      await refetch();
      setActionMsg('Incident marked as resolved.');
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : 'Resolve failed');
    } finally {
      setResolving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[800px] bg-[#0b1326] z-[70] shadow-[-20px_0px_50px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <header className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {incident && (
                    <span
                      className={cn(
                        'px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 uppercase',
                        severityColour,
                      )}
                    >
                      <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                      {incident.severity}
                    </span>
                  )}
                  <span className="font-mono text-[13px] text-slate-500">
                    {incident?.incident_code ?? incidentId}
                  </span>
                </div>
                {loading ? (
                  <div className="h-7 w-64 bg-slate-700/50 rounded animate-pulse" />
                ) : error ? (
                  <p className="text-red-400 font-mono text-sm">{error}</p>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-slate-100">
                      {incident?.primary_service ?? 'Unknown Service'}
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                      Detected {incident ? new Date(incident.detected_at).toLocaleString() : '—'} ·{' '}
                      {incident?.raw_log_count ?? 0} log entries
                    </p>
                  </>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-100 p-2 rounded-full hover:bg-slate-800 transition-colors"
              >
                <X size={24} />
              </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              {loading && (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                  <p className="text-red-400 font-mono text-sm">{error}</p>
                  <button
                    onClick={refetch}
                    className="mt-3 text-cyan-400 font-mono text-xs underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && incident && (
                <>
                  {/* Error Types */}
                  {incident.error_types.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {incident.error_types.map((et) => (
                        <span
                          key={et}
                          className="bg-slate-800 border border-white/10 px-3 py-1 rounded font-mono text-[11px] text-slate-300"
                        >
                          {et}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* RCA */}
                  {incident.latest_rca ? (
                    <RcaSection rca={incident.latest_rca} />
                  ) : (
                    <section className="bg-slate-800/40 border border-white/5 rounded-xl p-6">
                      <p className="font-mono text-[12px] text-slate-400">
                        No RCA available yet. Click Re-run Analysis to generate one.
                      </p>
                    </section>
                  )}

                  {/* Remediation */}
                  {incident.latest_rca && (
                    <section>
                      <h3 className="font-mono text-[11px] font-bold text-slate-500 mb-4 tracking-widest uppercase">
                        Remediation Status
                      </h3>
                      <div className="grid gap-3">
                        <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <FixIcon actionType={incident.latest_rca.severity} />
                            <div>
                              <p className="font-bold text-slate-100">
                                {fixLabel(incident.latest_rca.severity)}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500">
                                Affected: {incident.latest_rca.affected_service}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
                            Processed
                          </span>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Logs */}
                  <section className="flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        System Logs ({incident.logs.length})
                      </h3>
                    </div>
                    <div className="bg-[#050505] rounded-xl border border-white/10 p-6 font-mono text-[13px] max-h-[400px] overflow-y-auto">
                      <div className="space-y-2">
                        {incident.logs.map((log, i) => (
                          <div
                            key={i}
                            className={cn(
                              'group flex gap-4 transition-colors py-1 px-2 rounded',
                              log.level === 'ERROR'
                                ? 'bg-red-500/10 border-l-2 border-red-500 -mx-2 px-4'
                                : 'hover:bg-cyan-500/5',
                            )}
                          >
                            <span className="text-slate-600 shrink-0 select-none text-[11px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span
                              className={cn(
                                'uppercase font-bold shrink-0',
                                levelClass[log.level] ?? 'text-slate-400',
                              )}
                            >
                              [{log.level}]
                            </span>
                            <span className="text-slate-400 shrink-0 text-[11px]">
                              {log.service}
                            </span>
                            <span className="text-slate-300 break-all">{log.message}</span>
                          </div>
                        ))}
                        {incident.logs.length === 0 && (
                          <p className="text-slate-600 italic">No logs attached to this incident.</p>
                        )}
                      </div>
                    </div>
                  </section>
                </>
              )}

              {/* Action feedback */}
              {actionMsg && (
                <div className="bg-slate-800/60 border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-slate-300">
                  {actionMsg}
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="p-8 border-t border-white/5 bg-slate-800/10 flex justify-between gap-4">
              <button
                onClick={handleReRunRca}
                disabled={rcaRunning || loading}
                className="flex-1 flex items-center justify-center gap-2 border border-cyan-500/40 text-cyan-400 py-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-cyan-500/10 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <RefreshCw size={18} className={rcaRunning ? 'animate-spin' : ''} />
                {rcaRunning ? 'Running…' : 'Re-run Analysis'}
              </button>
              <button
                onClick={handleResolve}
                disabled={resolving || loading || incident?.status === 'RESOLVED'}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-[#0b1326] py-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 disabled:opacity-50"
              >
                <Check size={18} />
                {incident?.status === 'RESOLVED' ? 'Resolved' : resolving ? 'Resolving…' : 'Mark as Resolved'}
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
