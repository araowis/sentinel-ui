import React, { useMemo } from 'react';
import { X, AlertCircle, ArrowRight, TrendingDown, Zap, Network } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useApiCall } from '../../hooks/useApiCall';
import { getServiceDeepDive } from '../../api/api';
import type { ServiceDeepDiveResponse } from '../../models';
import { createManualIncident } from '../../api/api';

import { Github } from 'lucide-react';
import { triggerAction } from '../../api/api';
interface ServiceDeepDiveModalProps {
  serviceName: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConfidenceIndicator = ({ confidence }: { confidence: number }) => {
  const color =
    confidence >= 75
      ? 'text-emerald-400'
      : confidence >= 50
      ? 'text-amber-400'
      : 'text-red-400';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[#060e20] rounded-full overflow-hidden border border-white/5">
        <div
          className={cn(
            'h-full transition-all',
            confidence >= 75
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(78,222,163,0.5)]'
              : confidence >= 50
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
              : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
          )}
          style={{ width: `${confidence}%` }}
        />
      </div>
      <span className={cn('font-mono text-[11px] font-bold', color)}>
        {confidence}%
      </span>
    </div>
  );
};

const DependencyChain = ({ deps }: { deps: { upstream: string[]; downstream: string[] } }) => {
  if (deps.upstream.length === 0 && deps.downstream.length === 0) {
    return <p className="text-slate-500 text-sm">No dependencies</p>;
  }

  return (
    <div className="space-y-4">
      {deps.upstream.length > 0 && (
        <div>
          <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-2">
            Upstream (depends on)
          </h4>
          <div className="flex flex-wrap gap-2">
            {deps.upstream.map((svc) => (
              <span
                key={svc}
                className="px-2.5 py-1.5 bg-blue-500/10 text-blue-400 rounded text-[11px] font-mono border border-blue-500/30"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}

      {deps.downstream.length > 0 && (
        <div>
          <h4 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest mb-2">
            Downstream (depends on this)
          </h4>
          <div className="flex flex-wrap gap-2">
            {deps.downstream.map((svc) => (
              <span
                key={svc}
                className="px-2.5 py-1.5 bg-purple-500/10 text-purple-400 rounded text-[11px] font-mono border border-purple-500/30"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ErrorLogsList = ({
  logs,
}: {
  logs: { error_type: string; count: number; last_seen: string | null }[];
}) => {
  if (logs.length === 0) {
    return <p className="text-slate-500 text-sm">No errors detected</p>;
  }

  return (
    <div className="space-y-3">
      {logs.map((log) => (
        <div key={`${log.error_type}-${log.last_seen}-${log.count}`} className="flex justify-between items-center p-3 bg-[#060e20]/40 rounded border border-white/5">
          <div>
            <p className="font-mono text-[11px] font-bold text-slate-200">{log.error_type}</p>
            {log.last_seen && (
              <p className="text-[10px] text-slate-500 mt-1">
                Last seen: {new Date(log.last_seen).toLocaleString()}
              </p>
            )}
          </div>
          <span className="font-mono text-[12px] font-bold text-red-400">{log.count}</span>
        </div>
      ))}
    </div>
  );
};

export const ServiceDeepDiveModal: React.FC<ServiceDeepDiveModalProps> = ({
  serviceName,
  isOpen,
  onClose,
}) => {
  const deepDiveState = useApiCall(
    () => (serviceName ? getServiceDeepDive(serviceName, 30) : Promise.reject('No service')),
    [serviceName, isOpen]
  );

  const data: ServiceDeepDiveResponse | null = deepDiveState.data || null;

  const statusColor =
    data?.status === 'STABLE'
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : data?.status === 'CRITICAL'
      ? 'bg-red-500/10 text-red-400 border-red-500/30'
      : 'bg-amber-500/10 text-amber-500 border-amber-500/30';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-10 overflow-y-auto"
      >
        <div className="w-full max-w-4xl mx-4 mb-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            {deepDiveState.loading ? (
              <div className="h-8 bg-slate-700/40 rounded w-48 animate-pulse" />
            ) : (
              <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-200">{serviceName}</h2>
                {data && (
                  <span
                    className={cn(
                      'px-3 py-1.5 rounded text-[11px] font-bold border',
                      statusColor
                    )}
                  >
                    {data.status}
                  </span>
                )}
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded transition-colors"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          {/* Error state */}
          {deepDiveState.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              <p className="font-mono text-sm">{deepDiveState.error}</p>
            </div>
          )}

          {/* Content Grid */}
          <div className="space-y-6">
            {/* Health Score Card */}
            {data && (
              <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Health Score
                    </p>
                    <p className={cn(
                      'text-4xl font-bold',
                      data.health_score >= 75
                        ? 'text-emerald-400'
                        : data.health_score >= 50
                        ? 'text-amber-400'
                        : 'text-red-400'
                    )}>
                      {data.health_score}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Recent Incidents
                    </p>
                    <p className="text-4xl font-bold text-cyan-400">
                      {data.recent_incidents.length}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Anomaly Score
                    </p>
                    <p className="text-4xl font-bold text-purple-400">
                      {(data.temporal_correlations.anomaly_score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Root Cause Analysis */}
            {data?.root_cause && (
              <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className="text-amber-400 mt-1" size={20} />
                  <h3 className="text-xl font-bold text-slate-200">Root Cause Analysis</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Primary Issue
                    </p>
                    <p className="text-slate-300">{data.root_cause.primary_issue}</p>
                  </div>

                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Confidence Level
                    </p>
                    <ConfidenceIndicator confidence={data.root_cause.confidence} />
                  </div>

                  {data.root_cause.temporal_analysis && (
                    <div>
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                        Temporal Analysis
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {data.root_cause.temporal_analysis}
                      </p>
                    </div>
                  )}

                  {data.root_cause.cascade_analysis && (
                    <div>
                      <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                        Cascade Analysis
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {data.root_cause.cascade_analysis}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI Narrative */}
            {data?.ai_narrative && (
              <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
                <div className="flex items-start gap-3 mb-4">
                  <Zap className="text-cyan-400 mt-1" size={20} />
                  <h3 className="text-xl font-bold text-slate-200">AI Narrative</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{data.ai_narrative}</p>
              </div>
            )}

            {/* Dependencies */}
            {data && (
              <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
                <div className="flex items-start gap-3 mb-4">
                  <Network className="text-blue-400 mt-1" size={20} />
                  <h3 className="text-xl font-bold text-slate-200">Service Dependencies</h3>
                </div>
                <DependencyChain
                  deps={{
                    upstream: data.dependency_graph.upstream,
                    downstream: data.dependency_graph.downstream,
                  }}
                />
              </div>
            )}

            {/* Temporal Anomalies */}
            {data?.temporal_correlations && (
              <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
                <div className="flex items-start gap-3 mb-4">
                  <TrendingDown className="text-red-400 mt-1" size={20} />
                  <h3 className="text-xl font-bold text-slate-200">Temporal Anomalies</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-[#060e20]/40 p-4 rounded border border-white/5">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                      Retry Storm
                    </p>
                    <p className={cn(
                      'text-lg font-bold',
                      data.temporal_correlations.retry_storm_detected
                        ? 'text-red-400'
                        : 'text-emerald-400'
                    )}>
                      {data.temporal_correlations.retry_storm_detected ? 'DETECTED' : 'None'}
                    </p>
                  </div>
                  <div className="bg-[#060e20]/40 p-4 rounded border border-white/5">
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                      Service Spread
                    </p>
                    <p className="text-lg font-bold text-cyan-400">
                      {data.temporal_correlations.service_spread}
                    </p>
                  </div>
                </div>

                {data.temporal_correlations.correlated_services.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-2">
                      Correlated Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {data.temporal_correlations.correlated_services.map((svc) => (
                        <span
                          key={svc}
                          className="px-2.5 py-1.5 bg-orange-500/10 text-orange-400 rounded text-[11px] font-mono border border-orange-500/30"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Logs */}
            {data && (
              <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
                <h3 className="text-xl font-bold text-slate-200 mb-4">Recent Error Types</h3>
                <ErrorLogsList logs={data.recent_incidents.map(i => ({
                  error_type: i.error_types?.[0] || 'UNKNOWN',
                  count: i.raw_log_count,
                  last_seen: i.detected_at
                }))} />
              </div>
            )}

            {/* Recommended Actions */}
            {data?.recommended_actions && data.recommended_actions.length > 0 && (
              <div className="bg-emerald-500/5 backdrop-blur-xl rounded-xl p-6 border border-emerald-500/20">
                <h3 className="text-xl font-bold text-emerald-400 mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  {data.recommended_actions.map((action, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <ArrowRight size={16} className="text-emerald-400 mt-1 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading skeleton */}
            {deepDiveState.loading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-[#171f33]/70 rounded-xl p-6 border border-white/5"
                  >
                    <div className="h-6 bg-slate-700/40 rounded w-1/3 mb-4 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-700/40 rounded animate-pulse" />
                      <div className="h-4 bg-slate-700/40 rounded w-5/6 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Incident Actions */}
{data && (
  <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5">
    <h3 className="text-xl font-bold text-slate-200 mb-4">
      Incident Actions
    </h3>

    <div className="flex flex-wrap gap-4">

      {/* Save Incident */}
      <button
        onClick={async () => {
          try {

            const response = await createManualIncident({
              service: serviceName || 'unknown',
              severity:
                data.status === 'CRITICAL'
                  ? 'CRITICAL'
                  : data.status === 'DEGRADED'
                  ? 'HIGH'
                  : 'MEDIUM',

              title:
                data.root_cause?.primary_issue ||
                'Manual Incident',

              error_type:
                data.recent_incidents?.[0]?.error_types?.[0] ||
                'UNKNOWN'
            });

            alert(
              `Incident created: ${response.incident_code}`
            );

          } catch (err) {
            console.error(err);
            alert('Failed to save incident');
          }
        }}
        className="flex items-center gap-2 px-4 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all"
      >
        <AlertCircle size={18} />
        Save Incident
      </button>
      {/* Create PR */}
<button
  onClick={async () => {
    try {

      await triggerAction({
        incident_id: data.recent_incidents?.[0]?.id,
        action_type: 'github.pull_request',
        target_service: serviceName || '',
        notes: 'AI-generated PR request',
      });

      alert('PR triggered');

    } catch (err) {
      console.error(err);
      alert('Failed to create PR');
    }
  }}
  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
>
  <Github size={18} />
  Create PR
</button>

{/* Raise Issue */}
<button
  onClick={async () => {
    try {

      await triggerAction({
        incident_id: data.recent_incidents?.[0]?.id,
        action_type: 'github.issue',
        target_service: serviceName || '',
        notes: 'AI-generated GitHub issue',
      });

      alert('Issue created');

    } catch (err) {
      console.error(err);
      alert('Failed to create issue');
    }
  }}
  className="flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all"
>
  <Github size={18} />
  Raise Issue
</button>

    </div>
  </div>
)}
            
          </div>
        </div>
      </motion.div>
    </>
  );
};
