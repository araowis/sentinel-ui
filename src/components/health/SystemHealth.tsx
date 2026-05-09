import React from 'react';
import { Globe, Cpu, Database, Activity, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const MetricCard = ({ label, value, subvalue, children, colorClass }: any) => (
  <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 flex flex-col justify-between border border-white/5 relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="flex justify-between items-center mb-4">
      <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none">{label}</h4>
      <span className={cn("font-mono text-[13px] font-bold", colorClass)}>{value}</span>
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

export const SystemHealth = () => {
  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <span className="font-mono text-[11px] font-bold text-cyan-400 tracking-[0.2em] uppercase">Infrastructure Overview</span>
          <h1 className="text-5xl font-bold mt-2 text-slate-200 tracking-tight">System Health</h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-[#171f33]/70 backdrop-blur-xl px-4 py-3 rounded-xl flex items-center gap-3 border border-white/5">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <div>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Global Status</p>
              <p className="font-mono text-[12px] font-bold text-emerald-400">STABLE</p>
            </div>
          </div>
          <div className="bg-[#171f33]/70 backdrop-blur-xl px-4 py-3 rounded-xl flex items-center gap-3 border border-white/5">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_12px_rgba(255,185,95,0.4)]" />
            <div>
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Active Alerts</p>
              <p className="font-mono text-[12px] font-bold text-amber-500">01 DEGRADED</p>
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
            <span className="font-mono text-[12px] text-slate-500">14 Active Regions</span>
          </div>
          
          <div className="relative w-full aspect-[21/9] bg-[#060e20]/50 rounded-lg border border-white/5 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=1200" 
              alt="World Map" 
              className="w-full h-full object-cover opacity-20 contrast-[1.2] invert brightness-50"
            />
            {/* Map Hotspots */}
            <div className="absolute top-[25%] left-[15%] group">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse ring-4 ring-cyan-400/20" />
            </div>
            <div className="absolute top-[35%] left-[45%] group">
              <div className="w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(255,185,95,0.8)]" />
            </div>
            <div className="absolute top-[45%] left-[75%]"><div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" /></div>
            <div className="absolute top-[60%] left-[20%]"><div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" /></div>
            <div className="absolute top-[25%] left-[85%]"><div className="w-2 h-2 bg-cyan-400 rounded-full opacity-60" /></div>
          </div>
        </div>

        {/* Resource Telemetry */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <MetricCard label="Cluster CPU Load" value="34.2%" colorClass="text-cyan-400">
            <div className="h-24 flex items-end gap-1.5 mt-2">
              {[0.4, 0.55, 0.3, 0.65, 0.85, 0.45, 0.35, 0.5, 0.7, 0.4].map((h, i) => (
                <div key={i} className="flex-1 bg-cyan-400/20 rounded-t-sm group-hover:bg-cyan-400/30 transition-colors" style={{ height: `${h * 100}%` }}>
                  {h > 0.8 && <div className="w-full h-1 bg-cyan-400 shadow-[0_0_8px_cyan]" />}
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard label="Memory Usage" value="12.8 GB / 32 GB" colorClass="text-emerald-400">
            <div className="w-full bg-[#060e20] h-2 rounded-full mt-2 overflow-hidden border border-white/5 shadow-inner">
              <div className="bg-emerald-400 h-full shadow-[0_0_12px_rgba(78,222,163,0.5)]" style={{ width: "40%" }} />
            </div>
          </MetricCard>

          <MetricCard label="Disk I/O Throughput" value="840 MB/s" subvalue="IOPS: 12,402 | Latency: 0.2ms" colorClass="text-cyan-400">
            <div className="w-full h-8 bg-[#060e20] rounded border border-white/5 mt-2 flex items-center justify-around">
               <div className="h-[2px] w-1/3 bg-cyan-400/40 rounded-full" />
               <div className="h-[2px] w-1/4 bg-cyan-400 shadow-[0_0_8px_cyan] rounded-full" />
               <div className="h-[2px] w-1/5 bg-cyan-400/40 rounded-full" />
            </div>
          </MetricCard>
        </div>
      </div>

      {/* Service Grid and Topology */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-7 bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-200">Service Deep-Dive</h3>
            <button className="text-cyan-400 font-mono text-[11px] font-bold uppercase tracking-widest hover:underline">View All Microservices</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest">Service Name</th>
                  <th className="py-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest">Latency</th>
                  <th className="py-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest">Err Rate</th>
                  <th className="py-3 font-mono text-[10px] text-slate-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[13px]">
                {[
                  { name: 'Order-Service', lat: '24ms', err: '0.02%', status: 'HEALTHY', color: 'text-emerald-400' },
                  { name: 'Payment-Gateway', lat: '1,402ms', err: '12.4%', status: 'DEGRADED', color: 'text-amber-500' },
                  { name: 'Inventory-Core', lat: '12ms', err: '0.00%', status: 'HEALTHY', color: 'text-emerald-400' },
                  { name: 'CDN-Edge-Cache', lat: '4ms', err: '0.01%', status: 'HEALTHY', color: 'text-emerald-400' },
                  { name: 'Auth-Identity-V2', lat: '42ms', err: '0.05%', status: 'HEALTHY', color: 'text-emerald-400' },
                ].map((s, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-slate-800/20 transition-colors">
                    <td className={cn("py-4 text-slate-200", s.status === 'DEGRADED' && "text-amber-400 font-bold")}>{s.name}</td>
                    <td className="py-4 text-slate-400">{s.lat}</td>
                    <td className={cn("py-4", s.status === 'DEGRADED' ? "text-red-500" : "text-emerald-400")}>{s.err}</td>
                    <td className="py-4 text-right">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-bold border",
                        s.status === 'HEALTHY' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-500 border-amber-500/30"
                      )}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5 flex flex-col">
          <h3 className="text-2xl font-bold text-slate-200 mb-6">Network Topology</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#060e20]/40 p-5 rounded-xl border border-white/5">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Gateway Load</p>
              <p className="text-4xl font-bold text-cyan-400">42.1%</p>
            </div>
            <div className="bg-[#060e20]/40 p-5 rounded-xl border border-white/5">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Inter-Service Latency</p>
              <p className="text-4xl font-bold text-emerald-400">14ms</p>
            </div>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-500 uppercase tracking-widest">Ingress Traffic</span>
                <span className="text-cyan-400">2.4 Gbps</span>
              </div>
              <div className="w-full bg-[#060e20] h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full shadow-[0_0_8px_cyan]" style={{ width: "65%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-500 uppercase tracking-widest">Egress Traffic</span>
                <span className="text-slate-200">1.1 Gbps</span>
              </div>
              <div className="w-full bg-[#060e20] h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: "30%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SLA Matrix */}
      <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-8 border border-white/5">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-2xl font-bold text-slate-200">Uptime & SLA Tracking</h3>
            <p className="text-sm text-slate-400 mt-1">Real-time verification of 30-day reliability metrics</p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">30D Uptime</p>
              <p className="text-2xl font-bold text-emerald-400">99.98%</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Healing Events</p>
              <p className="text-2xl font-bold text-cyan-400">142</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 120 }).map((_, i) => {
            const isDown = i === 45 || i === 82;
            const isAmber = i === 19 || i === 104;
            return (
              <div 
                key={i} 
                className={cn(
                  "w-[12px] h-8 rounded-sm transition-all duration-300",
                  isDown ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : 
                  isAmber ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : 
                  "bg-emerald-500/60 hover:bg-emerald-400"
                )}
              />
            );
          })}
        </div>

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
          <p className="font-mono text-[11px] text-cyan-400/80 italic">Last automated remediation: 4 hours ago (CDN Route Optimization)</p>
        </div>
      </div>
    </div>
  );
};
