import React, { useState } from 'react';
import { Search, ExternalLink, CheckCircle2, Clock, Github, Slack, Mail, Zap, Settings, RefreshCw, Code, GitBranch, Terminal, Filter, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApiCall } from '../../hooks/useApiCall';
import { getEngineActions, getEngineAudit, getEngineMode, setEngineMode } from '../../api/api';
import type { EngineAction, AuditEntry } from '../../models';

// ── Action card icon map ──────────────────────────────────────────────────────

function ActionIcon({ name }: { name: string }) {
  if (name.includes('pull_request') || name === 'rollback') return <GitBranch size={20} />;
  if (name.includes('issue')) return <AlertCircle size={20} />;
  if (name.includes('slack')) return <Slack size={20} />;
  if (name.includes('email')) return <Mail size={20} />;
  if (name === 'restart') return <RefreshCw size={20} />;
  if (name === 'scale-out') return <Zap size={20} />;
  return <Code size={20} />;
}

function actionColorClass(name: string): string {
  if (name.includes('slack')) return 'bg-amber-500/10 text-amber-500';
  if (name.includes('email')) return 'bg-red-500/10 text-red-400';
  if (name === 'restart' || name === 'scale-out') return 'bg-cyan-500/10 text-cyan-400';
  return 'bg-slate-500/10 text-slate-300';
}

// ── Outcome badge ─────────────────────────────────────────────────────────────

function OutcomeBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  const cls =
    upper === 'SUCCESS' || upper === 'TRIGGERED'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : upper === 'FAILED'
      ? 'bg-red-500/10 text-red-500 border-red-500/20'
      : 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  return (
    <span className={cn('px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border', cls)}>
      {status}
    </span>
  );
}

// ── Action card ───────────────────────────────────────────────────────────────

const ActionCard = ({ action }: { action: EngineAction }) => (
  <div
    className={cn(
      'bg-[#171f33]/70 backdrop-blur-xl p-6 rounded-xl flex flex-col justify-between border group transition-all duration-300',
      action.enabled
        ? 'border-white/5 hover:border-cyan-500/30 hover:bg-[#1d2740]'
        : 'border-dashed border-white/10 opacity-60',
    )}
  >
    <div>
      <div className="flex justify-between items-start mb-5">
        <div className={cn('p-3 rounded-xl', actionColorClass(action.name))}>
          <ActionIcon name={action.name} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-[9px] font-mono font-bold uppercase tracking-wider',
              action.enabled ? 'text-emerald-400' : 'text-slate-500',
            )}
          >
            {action.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              action.enabled ? 'bg-emerald-400' : 'bg-slate-600',
            )}
          />
        </div>
      </div>
      <h3 className="text-[17px] font-bold text-slate-100 mb-2 capitalize">
        {action.name.replace(/[._]/g, ' ')}
      </h3>
      <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{action.description}</p>
    </div>
    <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-end">
      <div>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
          {action.success_rate != null ? 'Success Rate' : 'Last Run'}
        </p>
        <p
          className={cn(
            'font-mono text-[14px] font-bold',
            action.success_rate != null ? 'text-emerald-400' : 'text-slate-200',
          )}
        >
          {action.success_rate != null
            ? `${action.success_rate}%`
            : action.last_run
            ? new Date(action.last_run).toLocaleTimeString()
            : 'Never'}
        </p>
      </div>
      <button className="text-cyan-400 group-hover:translate-x-1 transition-transform">
        <ExternalLink size={18} />
      </button>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const AutomatedActions = () => {
  const [auditSearch, setAuditSearch] = useState('');
  const [modeUpdating, setModeUpdating] = useState(false);

  const actionsState = useApiCall(() => getEngineActions());
  const auditState   = useApiCall(() => getEngineAudit({ limit: 50 }));
  const modeState    = useApiCall(() => getEngineMode());

  const actions = actionsState.data?.actions ?? [];
  const audit   = auditState.data?.audit ?? [];

  const filteredAudit = auditSearch
    ? audit.filter(
        (e) =>
          e.incident_code?.toLowerCase().includes(auditSearch.toLowerCase()) ||
          e.action_type.toLowerCase().includes(auditSearch.toLowerCase()),
      )
    : audit;

  const currentMode = modeState.data?.engine_mode ?? 'human_in_the_loop';
  const isAutonomous = currentMode === 'autonomous';

  const handleToggleMode = async () => {
    setModeUpdating(true);
    try {
      await setEngineMode(isAutonomous ? 'human_in_the_loop' : 'autonomous');
      modeState.refetch();
    } catch {
      // ignore — UI stays in current state
    } finally {
      setModeUpdating(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Engine State */}
      <section className="bg-[#171f33]/70 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-[0_4px_40px_rgba(76,215,246,0.1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-cyan-400 tracking-tight">
              Autonomous Engine State
            </h1>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
            </div>
          </div>
          <p className="text-lg text-slate-400 font-medium max-w-2xl">
            Sentinel AI is monitoring{' '}
            <span className="text-slate-200">{actions.length} configured action types</span>{' '}
            across production clusters.
          </p>
        </div>
        <div className="flex bg-[#060e20] p-1.5 rounded-full border border-white/5 shadow-inner">
          <button
            onClick={handleToggleMode}
            disabled={modeUpdating}
            className={cn(
              'px-8 py-3 rounded-full font-mono text-[12px] font-bold uppercase tracking-widest transition-all disabled:opacity-60',
              isAutonomous
                ? 'bg-cyan-500 text-[#0b1326] shadow-[0_0_15px_rgba(76,215,246,0.4)]'
                : 'text-slate-500 hover:text-slate-200',
            )}
          >
            Autonomous Mode
          </button>
          <button
            onClick={handleToggleMode}
            disabled={modeUpdating}
            className={cn(
              'px-8 py-3 rounded-full font-mono text-[12px] font-bold uppercase tracking-widest transition-all disabled:opacity-60',
              !isAutonomous
                ? 'bg-cyan-500 text-[#0b1326] shadow-[0_0_15px_rgba(76,215,246,0.4)]'
                : 'text-slate-500 hover:text-slate-200',
            )}
          >
            Human-in-the-loop
          </button>
        </div>
      </section>

      {/* Action Library Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-mono text-[12px] font-bold text-slate-500 tracking-[0.2em] uppercase">
            Action Library
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-mono text-[13px] font-bold">
              {actions.length} Actions Configured
            </span>
            <div className="h-4 w-[1px] bg-white/10" />
            <button className="text-slate-500 hover:text-cyan-400">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {actionsState.error && (
          <p className="text-red-400 font-mono text-xs mb-4">{actionsState.error}</p>
        )}

        {actionsState.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-[#171f33]/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {actions.map((action) => (
              <ActionCard key={action.name} action={action} />
            ))}
          </div>
        )}
      </section>

      {/* Execution Audit Log */}
      <section className="bg-[#171f33]/70 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800/10">
          <h2 className="text-2xl font-bold text-slate-100 italic">Execution Audit Log</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                className="bg-[#0b1326] border border-white/10 rounded-full pl-10 pr-6 py-2.5 text-sm focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all w-full md:w-72 placeholder:text-slate-700 text-slate-200"
                placeholder="Search Incident ID or action..."
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </div>
            <button
              onClick={auditState.refetch}
              className="p-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-white/5 transition-colors"
            >
              <RefreshCw className="text-slate-400" size={18} />
            </button>
          </div>
        </div>

        {auditState.error && (
          <div className="px-8 py-3 bg-red-500/10 text-red-400 font-mono text-xs">
            {auditState.error}
          </div>
        )}

        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b1326]/50 sticky top-0 z-10">
              <tr>
                {['Timestamp', 'Incident ID', 'Action Taken', 'Outcome', 'Service', 'Details'].map(
                  (h) => (
                    <th
                      key={h}
                      className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditState.loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="p-6">
                          <div className="h-3 bg-slate-700/50 rounded w-3/4" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filteredAudit.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-cyan-500/5 transition-colors group"
                    >
                      <td className="p-6 font-mono text-[13px] text-slate-400">
                        {new Date(entry.triggered_at).toLocaleString()}
                      </td>
                      <td className="p-6 text-cyan-400 font-mono font-bold">
                        {entry.incident_code ?? entry.incident_id?.slice(0, 8)}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Zap
                            size={16}
                            className={
                              entry.status === 'SUCCESS' ? 'text-cyan-400' : 'text-slate-500'
                            }
                          />
                          <span className="text-[14px] text-slate-200 font-medium">
                            {entry.action_type.replace(/[._]/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <OutcomeBadge status={entry.status} />
                      </td>
                      <td className="p-6 font-mono text-[12px] text-slate-400">
                        {entry.primary_service ?? '—'}
                      </td>
                      <td className="p-6 text-center">
                        <button className="text-slate-500 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-slate-800">
                          <ExternalLink size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
              {!auditState.loading && filteredAudit.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-mono text-sm">
                    No audit entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-900/50 border-t border-white/5 flex justify-center">
          <button
            onClick={() => auditState.refetch()}
            className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-all hover:scale-110"
          >
            Load Extended History
          </button>
        </div>
      </section>
    </div>
  );
};
