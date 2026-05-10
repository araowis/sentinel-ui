import React, { useState } from 'react';
import { Globe, Activity } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';
import { useApiCall } from '../../hooks/useApiCall';
import { getServicesHealth, getInfraMetrics, getInfraUptime } from '../../api/api';
import type { ServiceHealth, MetricPoint } from '../../models';
import { ServiceDeepDiveModal } from './ServiceDeepDiveModal';

// ── Metric card ───────────────────────────────────────────────────────────────

const MetricCard = ({
  label,
  value,
  subvalue,
  children,
  colorClass,
}: {
  label: string;
  value: string;
  subvalue?: string;
  children?: React.ReactNode;
  colorClass: string;
}) => (
  <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 flex flex-col justify-between border border-white/5 relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none">
        {label}
      </h4>
      <span className={cn('font-mono text-[13px] font-bold', colorClass)}>{value}</span>
    </div>
    {children}
    {subvalue && (
      <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-slate-500">
        <Activity size={12} className="text-cyan-400/60" />
        {subvalue}
      </div>
    )}
  </div>
);

// ── Service status colour ─────────────────────────────────────────────────────

function serviceStatusClass(status: string): string {
  if (status === 'STABLE') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  if (status === 'CRITICAL') return 'bg-red-500/10 text-red-400 border-red-500/30';
  return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
}

// ── CPU mini-bar chart ────────────────────────────────────────────────────────

const CpuChart = ({ series }: { series: MetricPoint[] }) => {
  const last10 = series.slice(-10);
  const max = Math.max(...last10.map((p) => p.value), 1);
  return (
    <div className="h-24 flex items-end gap-1.5 mt-2">
      {last10.map((p, i) => (
        <div
          key={i}
          className="flex-1 bg-cyan-400/20 rounded-t-sm group-hover:bg-cyan-400/30 transition-colors relative"
          style={{ height: `${(p.value / max) * 100}%` }}
        >
          {p.value / max > 0.85 && (
            <div className="w-full h-1 bg-cyan-400 shadow-[0_0_8px_cyan]" />
          )}
        </div>
      ))}
    </div>
  );
};

// ── Uptime matrix (30-day grid) ───────────────────────────────────────────────

const UptimeMatrix = ({ matrix }: { matrix: { uptime_pct: number; has_critical: boolean; incident_count: number; date: string }[] }) => (
  <div className="flex flex-wrap gap-1">
    {matrix.map((day, i) => {
      const isDown = day.uptime_pct < 95;
      const isDegraded = day.uptime_pct < 99.9 && !isDown;
      return (
        <div
          key={i}
          title={`${day.date}: ${day.uptime_pct}% uptime, ${day.incident_count} incidents`}
          className={cn(
            'w-[12px] h-8 rounded-sm transition-all duration-300 cursor-default',
            isDown
              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
              : isDegraded
              ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'
              : 'bg-emerald-500/60 hover:bg-emerald-400',
          )}
        />
      );
    })}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const SystemHealth = () => {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showDeepDive, setShowDeepDive] = useState(false);

  const servicesState = useApiCall(() => getServicesHealth(60));
  const metricsState  = useApiCall(() => getInfraMetrics());
  const uptimeState   = useApiCall(() => getInfraUptime(30));

  const services = servicesState.data?.services ?? [];
  const metrics  = metricsState.data;
  const uptime   = uptimeState.data;

  const stableCount   = services.filter((s) => s.status === 'STABLE').length;
  const degradedCount = services.filter((s) => s.status !== 'STABLE').length;

  const handleServiceClick = (serviceName: string) => {
    setSelectedService(serviceName);
    setShowDeepDive(true);
  };

  const handleCloseDeepDive = () => {
    setShowDeepDive(false);
    setTimeout(() => setSelectedService(null), 300);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-[0.2em] uppercase">
            Infrastructure Overview
          </span>
          <h1 className="text-5xl font-bold mt-2 text-slate-200 tracking-tight">System Health</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#171f33]/70 backdrop-blur-xl px-4 py-3 rounded-xl flex items-center gap-3 border border-white/5">
            <div className={cn('w-3 h-3 rounded-full animate-pulse', degradedCount === 0 ? 'bg-emerald-500' : 'bg-amber-500')} />
            <div>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">
                Global Status
              </p>
              <p className={cn('font-mono text-[12px] font-bold', degradedCount === 0 ? 'text-emerald-400' : 'text-amber-400')}>
                {degradedCount === 0 ? 'STABLE' : `${degradedCount} DEGRADED`}
              </p>
            </div>
          </div>
          <div className="bg-[#171f33]/70 backdrop-blur-xl px-4 py-3 rounded-xl flex items-center gap-3 border border-white/5">
            <div className="w-3 h-3 bg-cyan-400 rounded-full" />
            <div>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">
                Services
              </p>
              <p className="font-mono text-[12px] font-bold text-cyan-400">
                {stableCount}/{services.length} STABLE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Map and Resource Gauges */}
      <div className="grid grid-cols-12 gap-6">
        {/* Global Map */}
        <div className="col-span-12 lg:col-span-8 bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <Globe className="text-cyan-400" size={24} />
              <h3 className="text-2xl font-bold text-slate-200">Global Infrastructure</h3>
            </div>
            <span className="font-mono text-[12px] text-slate-500">
              {services.length} Active Services
            </span>
          </div>

          <div className="relative w-full aspect-[21/9] bg-[#060e20]/50 rounded-lg border border-white/5 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200"
              alt="World Map"
              className="w-full h-full object-cover opacity-20 contrast-[1.2] invert brightness-50"
            />
            {/* Static region dots */}
            <div className="absolute top-[25%] left-[15%]">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse ring-4 ring-cyan-400/20" />
            </div>
            <div className="absolute top-[35%] left-[45%]">
              <div className={cn('w-3 h-3 rounded-full', degradedCount > 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(255,185,95,0.8)]' : 'bg-cyan-400')} />
            </div>
            <div className="absolute top-[45%] left-[75%]">
              <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" />
            </div>
            <div className="absolute top-[60%] left-[20%]">
              <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" />
            </div>
            <div className="absolute top-[25%] left-[85%]">
              <div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" />
            </div>
          </div>
        </div>

        {/* Resource Telemetry */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <MetricCard
            label="Cluster CPU Load"
            value={
              metrics
                ? `${metrics.cpu.series[metrics.cpu.series.length - 1]?.value.toFixed(1) ?? '—'}%`
                : '—'
            }
            colorClass="text-cyan-400"
          >
            {metrics && <CpuChart series={metrics.cpu.series} />}
            {metricsState.loading && (
              <div className="h-24 bg-slate-700/30 rounded animate-pulse mt-2" />
            )}
          </MetricCard>

          <MetricCard
            label="Memory Usage"
            value={metrics ? `${metrics.memory.used.toFixed(1)} GB / ${metrics.memory.total} GB` : '—'}
            colorClass="text-emerald-400"
          >
            <div className="w-full bg-[#060e20] h-2 rounded-full mt-2 overflow-hidden border border-white/5 shadow-inner">
              {metrics && (
                <div
                  className="bg-emerald-400 h-full shadow-[0_0_12px_rgba(78,222,163,0.5)]"
                  style={{ width: `${(metrics.memory.used / metrics.memory.total) * 100}%` }}
                />
              )}
            </div>
          </MetricCard>

          <MetricCard
            label="Disk I/O Throughput"
            value={
              metrics
                ? `${(
                    (metrics.disk_io.read[metrics.disk_io.read.length - 1]?.value ?? 0) +
                    (metrics.disk_io.write[metrics.disk_io.write.length - 1]?.value ?? 0)
                  ).toFixed(0)} MB/s`
                : '—'
            }
            subvalue={metrics ? `Note: ${metricsState.data?.generated_at ? 'stub data' : ''}` : undefined}
            colorClass="text-cyan-400"
          >
            <div className="w-full h-8 bg-[#060e20] rounded border border-white/5 mt-2 flex items-center justify-around">
              <div className="h-[2px] w-1/3 bg-cyan-400/40 rounded-full" />
              <div className="h-[2px] w-1/4 bg-cyan-400 shadow-[0_0_8px_cyan] rounded-full" />
              <div className="h-[2px] w-1/5 bg-cyan-400/40 rounded-full" />
            </div>
          </MetricCard>
        </div>
      </div>

      {/* Service Deep-Dive */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-200">Service Deep-Dive</h3>
            <button
              onClick={servicesState.refetch}
              className="text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-widest hover:underline"
            >
              Refresh
            </button>
          </div>

          {servicesState.error && (
            <p className="text-red-400 font-mono text-xs mb-4">{servicesState.error}</p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  {['Service Name', 'Err Rate', 'Open Incidents', 'Status'].map((h) => (
                    <th
                      key={h}
                      className={cn(
                        'py-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest',
                        h === 'Status' && 'text-right',
                      )}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {servicesState.loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/5 animate-pulse">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="py-4">
                            <div className="h-3 bg-slate-700/50 rounded w-3/4" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : services.map((svc) => (
                      <tr
                        key={svc.service}
                        className="border-b border-white/5 hover:bg-slate-800/20 transition-colors cursor-pointer"
                        onClick={() => handleServiceClick(svc.service)}
                      >
                        <td
                          className={cn(
                            'py-4',
                            svc.status === 'STABLE' ? 'text-slate-200' : 'text-amber-400 font-bold',
                          )}
                        >
                          {svc.service}
                        </td>
                        <td
                          className={cn(
                            'py-4',
                            svc.error_rate_pct > 10 ? 'text-red-500' : 'text-emerald-400',
                          )}
                        >
                          {svc.error_rate_pct}%
                        </td>
                        <td className="py-4 text-slate-400">{svc.open_incidents}</td>
                        <td className="py-4 text-right">
                          <span
                            className={cn(
                              'px-2 py-1 rounded text-[9px] font-bold border',
                              serviceStatusClass(svc.status),
                            )}
                          >
                            {svc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                {!servicesState.loading && services.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500 text-sm">
                      No service data in the last 60 minutes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Network Topology */}
        <div className="col-span-12 lg:col-span-5 bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5 flex flex-col">
          <h3 className="text-2xl font-bold text-slate-200 mb-6">Network Topology</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#060e20]/40 p-5 rounded-xl border border-white/5">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                Services Monitored
              </p>
              <p className="text-4xl font-bold text-cyan-400">{services.length}</p>
            </div>
            <div className="bg-[#060e20]/40 p-5 rounded-xl border border-white/5">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                30-Day Uptime
              </p>
              <p className="text-4xl font-bold text-emerald-400">
                {uptime ? `${uptime.avg_uptime.toFixed(2)}%` : '—'}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-500 uppercase tracking-widest">Stable Services</span>
                <span className="text-cyan-400">{stableCount}</span>
              </div>
              <div className="w-full bg-[#060e20] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full shadow-[0_0_8px_cyan]"
                  style={{ width: services.length > 0 ? `${(stableCount / services.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-500 uppercase tracking-widest">Degraded / Critical</span>
                <span className="text-amber-400">{degradedCount}</span>
              </div>
              <div className="w-full bg-[#060e20] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: services.length > 0 ? `${(degradedCount / services.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA / Uptime Matrix */}
      <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-200">Uptime & SLA Tracking</h3>
            <p className="text-sm text-slate-400 mt-1">
              30-day reliability matrix (computed from incidents table)
            </p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">
                30D Uptime
              </p>
              <p className="text-2xl font-bold text-emerald-400">
                {uptime ? `${uptime.avg_uptime.toFixed(2)}%` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">
                Incident Days
              </p>
              <p className="text-2xl font-bold text-cyan-400">
                {uptime
                  ? uptime.matrix.filter((d) => d.incident_count > 0).length
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {uptimeState.loading ? (
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-[12px] h-8 rounded-sm bg-slate-700/40 animate-pulse" />
            ))}
          </div>
        ) : uptime ? (
          <UptimeMatrix matrix={uptime.matrix} />
        ) : null}

        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t border-white/5 pt-6">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500/60 rounded-sm" />
              <span className="font-mono text-[10px] text-slate-500">Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-amber-500 rounded-sm" />
              <span className="font-mono text-[10px] text-slate-500">Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-sm" />
              <span className="font-mono text-[10px] text-slate-500">Outage</span>
            </div>
          </div>
          <p className="font-mono text-[11px] text-cyan-400/80 italic">
            {uptimeState.loading ? 'Loading…' : `Data computed from ${uptime?.days ?? 30} days of incident history`}
          </p>
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
