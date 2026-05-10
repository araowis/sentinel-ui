import React, { useState } from 'react';
import {
  Search, ExternalLink, Settings, RefreshCw, Code, GitBranch,
  AlertCircle, Slack, Mail, Zap, UserCheck, Bell, CheckCircle2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useApiCall } from '../../hooks/useApiCall';
import {
  getEngineActions,
  getEngineAudit,
  getEngineMode,
  setEngineMode,
  getIncidents,
  triggerAction,
  triggerRca,
} from '../../api/api';
import type { EngineAction, AuditEntry, Incident } from '../../models';

// ── Helpers ───────────────────────────────────────────────────────────────────

function ActionIcon({ name }: { name: string }) {
  if (name.includes('pull_request') || name === 'rollback') return <GitBranch size={20} />;
  if (name.includes('issue')) return <AlertCircle size={20} />;
  if (name.includes('slack')) return <Slack size={20} />;
  if (name.includes('email')) return <Mail size={20} />;
  // if (name === 'restart') return <RefreshCw size={20} />;
  // if (name === 'scale-out') return <Zap size={20} />;
  return <Code size={20} />;
}

function actionColorClass(name: string) {
  if (name.includes('slack')) return 'bg-amber-500/10 text-amber-500';
  if (name.includes('email')) return 'bg-red-500/10 text-red-400';
  // if (name === 'restart' || name === 'scale-out') return 'bg-cyan-500/10 text-cyan-400';
  return 'bg-slate-500/10 text-slate-300';
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
    HIGH:     'bg-orange-500/15 text-orange-400 border-orange-500/30',
    MEDIUM:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
    LOW:      'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };
  return (
    <span className={cn('px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-lg border', map[severity] ?? map.LOW)}>
      {severity}
    </span>
  );
}

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
  <div className={cn(
    'bg-[#171f33]/70 backdrop-blur-xl p-6 rounded-xl flex flex-col justify-between border group transition-all duration-300',
    action.enabled
      ? 'border-white/5 hover:border-cyan-500/30 hover:bg-[#1d2740]'
      : 'border-dashed border-white/10 opacity-60',
  )}>
    <div>
      <div className="flex justify-between items-start mb-5">
        <div className={cn('p-3 rounded-xl', actionColorClass(action.name))}>
          <ActionIcon name={action.name} />
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-[9px] font-mono font-bold uppercase tracking-wider', action.enabled ? 'text-emerald-400' : 'text-slate-500')}>
            {action.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div className={cn('w-1.5 h-1.5 rounded-full', action.enabled ? 'bg-emerald-400' : 'bg-slate-600')} />
        </div>
      </div>
      <h3 className="text-[17px] font-bold text-slate-100 mb-2 capitalize">
        {action.name.replace(/[._]/g, ' ')}
      </h3>
      <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{action.description}</p>
    </div>
    {/* <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-end"> */}
      {/* <div>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
          {action.success_rate != null ? 'Success Rate' : 'Last Run'}
        </p>
        <p className={cn('font-mono text-[14px] font-bold', action.success_rate != null ? 'text-emerald-400' : 'text-slate-200')}>
          {action.success_rate != null
            ? `${action.success_rate}%`
            : action.last_run
            ? new Date(action.last_run).toLocaleTimeString()
            : 'Never'}
        </p>
      </div>
      <button className="text-cyan-400 group-hover:translate-x-1 transition-transform">
        <ExternalLink size={18} />
      </button> */}
    {/* </div> */}
  </div>
);

// ── Suggested actions (action_type values must match backend enum) ─────────────

const SUGGESTED_ACTIONS = [
  { key: 'trigger_rca',                 label: 'Trigger RCA',        description: 'Run AI root-cause analysis',           icon: <Zap size={16} />,        color: 'border-cyan-500/40 hover:bg-cyan-500/10 text-cyan-400' },
  { key: 'send_slack_message',          label: 'Send Slack Alert',   description: 'Post to #incidents channel',           icon: <Slack size={16} />,       color: 'border-amber-500/40 hover:bg-amber-500/10 text-amber-400' },
  { key: 'create_github_issue',         label: 'Create GitHub Issue',description: 'Open a tracked issue in the repo',     icon: <AlertCircle size={16} />, color: 'border-purple-500/40 hover:bg-purple-500/10 text-purple-400' },
  { key: 'create_github_pull_request',  label: 'Open Pull Request',  description: 'Propose an automated fix via PR',      icon: <GitBranch size={16} />,   color: 'border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400' },
  { key: 'send_email',                  label: 'Send Email',         description: 'Notify on-call engineer via email',    icon: <Mail size={16} />,        color: 'border-red-500/40 hover:bg-red-500/10 text-red-400' },
  // { key: 'restart',                     label: 'Restart Service',    description: 'Rolling restart of affected service',  icon: <RefreshCw size={16} />,   color: 'border-slate-500/40 hover:bg-slate-500/10 text-slate-300' },
];

// ── Approval modal ────────────────────────────────────────────────────────────

interface ApprovalModalProps {
  incident: Incident;
  onApprove: (incident: Incident, selected: string[]) => Promise<void>;
  onDismiss: () => void;
}

function ApprovalModal({ incident, onApprove, onDismiss }: ApprovalModalProps) {
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleApprove = async () => {
    setSubmitting(true);
    try { await onApprove(incident, [...selected]); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060e20]/80 backdrop-blur-md">
      <div className="bg-[#111827] border border-cyan-500/20 rounded-2xl w-full max-w-2xl shadow-[0_0_80px_rgba(76,215,246,0.15)] overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <UserCheck size={20} className="text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-100">Human Approval Required</h3>
            </div>
            <p className="text-sm text-slate-400">
              Sentinel AI is waiting for your approval before taking any action.
            </p>
          </div>
          <SeverityBadge severity={incident.severity} />
        </div>

        {/* Incident context */}
        <div className="p-6 border-b border-white/5 bg-[#0b1326]/60">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-mono text-cyan-400 font-bold text-sm">{incident.incident_code}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 text-sm font-mono">{incident.primary_service}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500 text-xs font-mono">
              {new Date(incident.detected_at).toLocaleString()}
            </span>
          </div>
          {incident.affected_source && (
            <p className="text-slate-300 text-sm">
              Affected source:{' '}
              <span className="font-mono text-amber-400">{incident.affected_source}</span>
            </p>
          )}
          <p className="text-slate-500 text-xs font-mono mt-1">
            Trace: {incident.trace_id} · {incident.raw_log_count} raw log entries
          </p>
        </div>

        {/* Action checkboxes */}
        <div className="p-6">
          <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-4">
            Select Actions to Approve
          </p>
          <div className="grid grid-cols-2 gap-3">
            {SUGGESTED_ACTIONS.map((action) => {
              const isSelected = selected.has(action.key);
              return (
                <button
                  key={action.key}
                  onClick={() => toggle(action.key)}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200',
                    isSelected ? action.color : 'border-white/5 hover:border-white/10 text-slate-400',
                  )}
                >
                  <div className={cn('mt-0.5 shrink-0', isSelected ? '' : 'opacity-40')}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-semibold', isSelected ? '' : 'text-slate-300')}>
                      {action.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={14} className="ml-auto shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center gap-3 justify-end">
          <button
            onClick={onDismiss}
            disabled={submitting}
            className="px-5 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10 transition-all disabled:opacity-50"
          >
            Dismiss
          </button>
          <button
            disabled={selected.size === 0 || submitting}
            onClick={handleApprove}
            className={cn(
              'px-6 py-2.5 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2',
              selected.size > 0 && !submitting
                ? 'bg-cyan-500 text-[#0b1326] shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-cyan-400'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed',
            )}
          >
            {submitting && <RefreshCw size={12} className="animate-spin" />}
            Approve {selected.size > 0 ? `(${selected.size})` : ''} Actions
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pending incidents panel ───────────────────────────────────────────────────

interface PendingPanelProps {
  incidents: Incident[];
  loading: boolean;
  dismissedIds: Set<string>;
  approvedIds: Set<string>;
  onReview: (incident: Incident) => void;
  onRefresh: () => void;
}

function PendingIncidentsPanel({
  incidents, loading, dismissedIds, approvedIds, onReview, onRefresh,
}: PendingPanelProps) {
  const visible = incidents.filter(
    (i) => !dismissedIds.has(i.id) && !approvedIds.has(i.id),
  );

  return (
    <section className="bg-[#171f33]/70 backdrop-blur-xl rounded-2xl border border-amber-500/20 overflow-hidden shadow-[0_4px_40px_rgba(251,191,36,0.08)]">
      <div className="p-6 border-b border-white/5 bg-amber-500/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-amber-400" />
            {visible.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-[#0b1326] text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {visible.length}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-100">
            Pending Incidents — Awaiting Human Approval
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest">
            Human-in-the-Loop Active
          </span>
          <button onClick={onRefresh} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCw size={14} className="text-slate-500 hover:text-amber-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-white/5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-5 flex items-center gap-5 animate-pulse">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-700/50 rounded w-1/3" />
                <div className="h-3 bg-slate-700/30 rounded w-2/3" />
              </div>
              <div className="h-8 w-20 bg-slate-700/30 rounded-xl" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="p-12 text-center">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-3 opacity-60" />
          <p className="text-slate-500 font-mono text-sm">No open incidents. All clear.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {visible.map((incident) => (
            <div
              key={incident.id}
              className="p-5 flex items-start gap-5 hover:bg-white/[0.02] transition-colors group"
            >
              <div className="mt-1.5 shrink-0">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  incident.severity === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                  incident.severity === 'HIGH'     ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]' :
                  incident.severity === 'MEDIUM'   ? 'bg-amber-400' : 'bg-slate-500',
                )} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {incident.incident_code}
                  </span>
                  <SeverityBadge severity={incident.severity} />
                  <span className="text-slate-500 font-mono text-xs">{incident.primary_service}</span>
                  <span className="text-slate-600 font-mono text-xs ml-auto">
                    {Math.round((Date.now() - new Date(incident.detected_at).getTime()) / 60000)}m ago
                  </span>
                </div>
                <p className="text-sm text-slate-400 font-mono">
                  Trace: {incident.trace_id}
                  {incident.affected_source && (
                    <span className="text-amber-400/70"> · {incident.affected_source}</span>
                  )}
                  <span className="text-slate-600"> · {incident.raw_log_count} logs</span>
                </p>
              </div>

              <button
                onClick={() => onReview(incident)}
                className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-amber-400 font-mono text-[11px] font-bold uppercase tracking-wider transition-all"
              >
                <UserCheck size={14} />
                Review
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export const AutomatedActions = () => {
  const [auditSearch,      setAuditSearch]      = useState('');
  const [modeUpdating,     setModeUpdating]     = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [dismissedIds,     setDismissedIds]     = useState<Set<string>>(new Set());
  const [approvedIds,      setApprovedIds]      = useState<Set<string>>(new Set());
  const [toast,            setToast]            = useState<{ msg: string; ok: boolean } | null>(null);

  const actionsState   = useApiCall(() => getEngineActions());
  const auditState     = useApiCall(() => getEngineAudit({ limit: 50 }));
  const modeState      = useApiCall(() => getEngineMode());
  // Real backend: all OPEN incidents for the pending panel
  const incidentsState = useApiCall(() => getIncidents({ status: 'OPEN', limit: 50 }));

  const actions   = actionsState.data?.actions ?? [];
  const audit     = auditState.data?.audit ?? [];
  const incidents = incidentsState.data?.incidents ?? [];

  const filteredAudit = auditSearch
    ? audit.filter(
        (e) =>
          e.incident_code?.toLowerCase().includes(auditSearch.toLowerCase()) ||
          e.action_type.toLowerCase().includes(auditSearch.toLowerCase()),
      )
    : audit;

  const currentMode  = modeState.data?.engine_mode ?? 'human_in_the_loop';
  const isAutonomous = currentMode === 'autonomous';

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleMode = async () => {
    setModeUpdating(true);
    try {
      await setEngineMode(isAutonomous ? 'human_in_the_loop' : 'autonomous');
      modeState.refetch();
    } catch { /* ignore */ }
    finally { setModeUpdating(false); }
  };

  const handleApprove = async (incident: Incident, selectedActions: string[]) => {
  const results = await Promise.allSettled(
    selectedActions.map((actionType) => {
      if (actionType === 'trigger_rca') {
        // RCA has its own dedicated endpoint — no target_service needed
        return triggerRca(incident.id);
      }
 
      return triggerAction({
        incident_id:    incident.id,
        action_type:    actionType,
        target_service: incident.primary_service,  // ← the fix
      });
    }),
  );
 
  const failed = results.filter((r) => r.status === 'rejected').length;
  const ok     = results.length - failed;
 
  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`Action "${selectedActions[i]}" failed:`, (r as PromiseRejectedResult).reason);
    }
  });
 
  setApprovedIds((prev) => new Set([...prev, incident.id]));
  setSelectedIncident(null);
 
  showToast(
    failed === 0
      ? `✓ ${ok} action(s) triggered for ${incident.incident_code}`
      : `${ok} triggered, ${failed} failed — check console`,
    failed === 0,
  );
 
  auditState.refetch();
};

  const handleDismiss = () => {
    if (selectedIncident) {
      setDismissedIds((prev) => new Set([...prev, selectedIncident.id]));
      setSelectedIncident(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Toast */}
      {toast && (
        <div className={cn(
          'fixed top-6 right-6 z-50 font-mono text-sm px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border',
          toast.ok
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        )}>
          <CheckCircle2 size={16} />
          {toast.msg}
        </div>
      )}

      {/* Approval modal */}
      {selectedIncident && (
        <ApprovalModal
          incident={selectedIncident}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
        />
      )}

      {/* Engine State toggle */}
      <section className="bg-[#171f33]/70 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-[0_4px_40px_rgba(76,215,246,0.1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-cyan-400 tracking-tight">Autonomous Engine State</h1>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
            </div>
          </div>
          <p className="text-lg text-slate-400 font-medium max-w-2xl">
            Sentinel AI is monitoring{' '}
            <span className="text-slate-200">{actions.length} configured action types</span>{' '}
            across production clusters.{' '}
           {isAutonomous && (
  <span className="text-amber-400 font-semibold">
    AI is acting autonomously. Review triggered actions below.
  </span>
)}
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

      {/* Pending incidents — only shown in human-in-the-loop mode */}
      {!isAutonomous && (
        <PendingIncidentsPanel
          incidents={incidents}
          loading={incidentsState.loading}
          dismissedIds={dismissedIds}
          approvedIds={approvedIds}
          onReview={setSelectedIncident}
          onRefresh={incidentsState.refetch}
        />
      )}

      {/* Action Library */}
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
                {['Timestamp', 'Incident ID', 'Action Taken', 'Outcome', 'Service', 'Details'].map((h) => (
                  <th key={h} className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">
                    {h}
                  </th>
                ))}
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
                    <tr key={entry.id} className="hover:bg-cyan-500/5 transition-colors group">
                      <td className="p-6 font-mono text-[13px] text-slate-400">
                        {new Date(entry.triggered_at).toLocaleString()}
                      </td>
                      <td className="p-6 text-cyan-400 font-mono font-bold">
                        {entry.incident_code ?? entry.incident_id?.slice(0, 8)}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Zap size={16} className={entry.status === 'SUCCESS' ? 'text-cyan-400' : 'text-slate-500'} />
                          <span className="text-[14px] text-slate-200 font-medium">
                            {entry.action_type.replace(/[._]/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-6"><OutcomeBadge status={entry.status} /></td>
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