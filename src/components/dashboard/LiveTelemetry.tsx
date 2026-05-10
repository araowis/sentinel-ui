import React, { useEffect, useState } from 'react';
import { ShoppingCart, CreditCard, Box, Bolt, Server, Activity, Cpu } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useApiCall } from '../../hooks/useApiCall';
import { getStats, getIncidents, getServicesHealth, getHealingEvents } from '../../api/api';
import { sentinelWs } from '../../api/websocket';
import type { Incident, ServiceHealth, Severity } from '../../models';
import { ServiceDeepDiveModal } from '../health/ServiceDeepDiveModal';

// ── Severity badge colours (maps backend CRITICAL/HIGH/MEDIUM/LOW) ────────────
const severityClasses: Record<Severity, string> = {
  CRITICAL: 'bg-red-500/10 text-red-500 border-red-500/20',
  HIGH:     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  MEDIUM:   'bg-amber-500/10 text-amber-500 border-amber-500/20',
  LOW:      'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const SERVICE_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  default: Server,
};

// Map service name keywords to icons
function serviceIcon(name: string): React.ComponentType<{ size?: number }> {
  const lower = name.toLowerCase();
  if (lower.includes('order') || lower.includes('cart')) return ShoppingCart;
  if (lower.includes('payment') || lower.includes('pay')) return CreditCard;
  if (lower.includes('inventory') || lower.includes('stock')) return Box;
  return SERVICE_ICONS.default;
}

// ── Sub-components ────────────────────────────────────────────────────────────

const StatCard = ({
  label,
  value,
  subvalue,
  colorClass,
}: {
  label: string;
  value: React.ReactNode;
  subvalue?: string;
  colorClass: string;
}) => (
  <div className="bg-[#171f33]/70 backdrop-blur-xl border border-white/5 p-6 rounded-xl shadow-inner shadow-white/5">
    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <div className="mt-2 flex items-baseline gap-2">
      <span className={cn('text-5xl font-bold tracking-tight', colorClass)}>{value}</span>
      {subvalue && <span className="font-mono text-[13px] text-emerald-400">{subvalue}</span>}
    </div>
  </div>
);

const MicroserviceCard = ({
  service,
  onClick,
}: {
  service: ServiceHealth;
  onClick: (serviceName: string) => void;
}) => {
  const Icon = serviceIcon(service.service);
  const stable = service.status === 'STABLE';
  return (
    <div
      onClick={() => onClick(service.service)}
      className={cn(
        'bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center justify-between border-l-4 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/10',
        stable ? 'border-emerald-500' : service.status === 'CRITICAL' ? 'border-red-500' : 'border-amber-500',
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'p-3 rounded-lg',
            stable
              ? 'bg-emerald-500/10 text-emerald-400'
              : service.status === 'CRITICAL'
              ? 'bg-red-500/10 text-red-500'
              : 'bg-amber-500/10 text-amber-400',
          )}
        >
          <Icon size={20} />
        </div>
        <div>
          <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">
            {service.service}
          </div>
          <div
            className={cn(
              'text-xl font-bold',
              stable ? 'text-slate-200' : service.status === 'CRITICAL' ? 'text-red-500' : 'text-amber-400',
            )}
          >
            {service.status}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            'w-2 h-2 rounded-full animate-pulse mr-2',
            stable ? 'bg-emerald-500' : service.status === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500',
          )}
        />
        <span className="font-mono text-[10px] text-slate-500 mr-2">{service.error_rate_pct}% err</span>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

export const LiveTelemetry = ({
  onSelectIncident,
}: {
  onSelectIncident: (id: string) => void;
}) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterSeverity, setFilterSeverity] = useState<string>('');

  const stats     = useApiCall(() => getStats());
  const incidents = useApiCall(() => getIncidents({
    status: filterStatus || undefined,
    severity: filterSeverity || undefined,
    limit: 50,
  }));
  const services  = useApiCall(() => getServicesHealth());
  const healing   = useApiCall(() => getHealingEvents({ limit: 6 }));

  // Refresh incident list when the WebSocket notifies us of new incidents
  useEffect(() => {
    const handler = () => incidents.refetch();
    sentinelWs.on('incident_update', handler);
    return () => sentinelWs.off('incident_update', handler);
  }, [incidents.refetch]);

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setShowDeepDive(true);
  };

  const handleCloseDeepDive = () => {
    setShowDeepDive(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  const s = stats.data;
  const incidentList: Incident[] = incidents.data?.incidents ?? [];
  const serviceList: ServiceHealth[] = services.data?.services ?? [];

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Open Incidents"
          value={stats.loading ? '—' : (s?.open ?? 0)}
          subvalue={s ? `${s.in_progress} in progress` : undefined}
          colorClass="text-cyan-400"
        />
        <StatCard
          label="Critical Alerts"
          value={stats.loading ? '—' : (s?.critical ?? 0)}
          subvalue={s ? `${s.high} high` : undefined}
          colorClass="text-red-500"
        />
        <StatCard
          label="Resolved Today"
          value={stats.loading ? '—' : (s?.resolved ?? 0)}
          subvalue={s?.mttr_minutes != null ? `MTTR: ${s.mttr_minutes.toFixed(0)}m` : undefined}
          colorClass="text-emerald-400"
        />
        <StatCard
          label="AI Confidence"
          value={
            stats.loading
              ? '—'
              : s?.avg_confidence != null
              ? `${s.avg_confidence.toFixed(0)}%`
              : 'N/A'
          }
          subvalue="RCA average"
          colorClass="text-amber-400"
        />
      </div>

      {/* Microservices Health */}
      <div>
        <h3 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Microservices Health Status
        </h3>
        {services.error && (
          <p className="text-red-400 font-mono text-xs mb-2">{services.error}</p>
        )}
        {serviceList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {serviceList.slice(0, 6).map((svc) => (
              <MicroserviceCard
                key={svc.service}
                service={svc}
                onClick={handleServiceClick}
              />
            ))}
          </div>
        ) : !services.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Placeholder cards while no live data */}
            {['Order Service', 'Payment Service', 'Inventory Service'].map((name) => (
              <div
                key={name}
                className="bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center justify-between border-l-4 border-slate-700 opacity-40"
              >
                <div className="font-mono text-[12px] text-slate-500">{name} — no data</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Incident Stream + Healing Engine */}
      <div className="grid grid-cols-12 gap-6">
        {/* Active Incident Stream */}
        <div className="col-span-12 lg:col-span-8 bg-[#171f33]/70 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-800/30">
            <h3 className="text-xl font-bold text-slate-200">Active Incident Stream</h3>
            <div className="flex gap-2">
              <button className="bg-slate-700/50 px-3 py-1.5 rounded border border-white/5 text-[11px] font-mono font-bold text-slate-400 hover:text-cyan-400 transition-colors">
                EXPORT
              </button>
              <button
                onClick={incidents.refetch}
                className="bg-cyan-500 px-3 py-1.5 rounded text-[#0b1326] text-[11px] font-mono font-bold hover:brightness-110 transition-all"
              >
                REFRESH
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-white/5 bg-slate-800/20 flex gap-4 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700/50 border border-white/10 rounded px-3 py-1.5 text-[11px] text-slate-200 font-mono hover:border-cyan-500/50 transition-colors"
              >
                <option value="">All</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Severity:</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-slate-700/50 border border-white/10 rounded px-3 py-1.5 text-[11px] text-slate-200 font-mono hover:border-cyan-500/50 transition-colors"
              >
                <option value="">All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            {(filterStatus || filterSeverity) && (
              <button
                onClick={() => {
                  setFilterStatus('');
                  setFilterSeverity('');
                }}
                className="ml-auto text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {incidents.error && (
            <div className="px-6 py-3 bg-red-500/10 text-red-400 font-mono text-xs border-b border-red-500/20">
              {incidents.error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/20 border-b border-white/5">
                  {['Incident ID', 'Timestamp', 'Service', 'Severity', 'Status'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'px-6 py-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest',
                        h === 'Status' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incidents.loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-3 bg-slate-700/50 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : incidentList.map((incident) => (
                      <tr
                        key={incident.id}
                        className="hover:bg-cyan-500/5 transition-colors group cursor-pointer"
                        onClick={() => onSelectIncident(incident.id)}
                      >
                        <td className="px-6 py-4 font-mono text-[13px] text-cyan-400">
                          {incident.incident_code}
                        </td>
                        <td className="px-6 py-4 font-mono text-[13px] text-slate-400">
                          {new Date(incident.detected_at).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 font-mono text-[13px] text-slate-200 bg-slate-800/10">
                          {incident.primary_service}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                              severityClasses[incident.severity] ?? severityClasses.LOW,
                            )}
                          >
                            {incident.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-emerald-400 font-mono text-[11px] font-bold">
                            {incident.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                {!incidents.loading && incidentList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-mono text-sm">
                      No incidents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* AI Healing Engine */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/20 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                AI Healing Engine
              </h3>
              <Bolt size={18} className="text-cyan-400" />
            </div>
            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/10" />
              {healing.loading ? (
                <div className="space-y-4 pl-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-700/40 rounded animate-pulse" />
                  ))}
                </div>
              ) : healing.data?.events.length ? (
                healing.data.events.map((event, idx) => (
                  <div key={event.id} className="relative pl-8">
                    <div
                      className={cn(
                        'absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-[#171f33]',
                        idx === 0
                          ? 'bg-cyan-500 shadow-[0_0_8px_rgba(76,215,246,0.5)]'
                          : 'bg-emerald-500',
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-mono text-[13px] text-slate-200">
                        {event.action_type.replace('.', ' → ')} for {event.incident_code ?? event.incident_id.slice(0, 8)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                        {new Date(event.triggered_at).toLocaleTimeString()} · {event.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="pl-8 font-mono text-[12px] text-slate-500">No healing events yet</p>
              )}
            </div>
          </div>

          {/* Infrastructure Preview */}
          <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5 h-48 overflow-hidden relative group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000')] bg-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171f33] to-transparent" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                Global Cluster Status
              </span>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-200">
                    {services.data?.services.length ?? '—'}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                    Active Services
                  </span>
                </div>
                <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    className="h-full bg-cyan-400 shadow-[0_0_8px_rgba(76,215,246,0.5)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="p-3 bg-emerald-500/10 rounded text-emerald-400">
            <Server size={24} />
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Resolution Rate
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {stats.data?.resolution_rate != null
                ? `${stats.data.resolution_rate.toFixed(1)}%`
                : '—'}
            </div>
          </div>
        </div>
        <div className="bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center gap-4 border-l-4 border-cyan-400">
          <div className="p-3 bg-cyan-400/10 rounded text-cyan-400">
            <Activity size={24} />
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Total Incidents
            </div>
            <div className="text-2xl font-bold text-slate-200">{stats.data?.total ?? '—'}</div>
          </div>
        </div>
        <div className="bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center gap-4 border-l-4 border-amber-400">
          <div className="p-3 bg-amber-400/10 rounded text-amber-400">
            <Cpu size={24} />
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
              Avg MTTR
            </div>
            <div className="text-2xl font-bold text-slate-200">
              {stats.data?.mttr_minutes != null
                ? `${stats.data.mttr_minutes.toFixed(0)}m`
                : '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Service Deep-Dive Modal */}
      <ServiceDeepDiveModal
        serviceName={selectedService}
        isOpen={showDeepDive}
        onClose={handleCloseDeepDive}
      />
    </div>
  );
};
