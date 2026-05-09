import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { incidents, microservices, healingEvents } from '../../mockData';
import { Severity } from '../../models';
import { ShoppingCart, CreditCard, Box, Bolt, Server, Activity, Cpu } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

const StatCard = ({ label, value, subvalue, trend, colorClass }: any) => (
  <div className="bg-[#171f33]/70 backdrop-blur-xl border border-white/5 p-6 rounded-xl shadow-inner shadow-white/5">
    <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="mt-2 flex items-baseline gap-2">
      <span className={cn("text-5xl font-bold tracking-tight", colorClass)}>{value}</span>
      {subvalue && (
        <span className="font-mono text-[13px] text-emerald-400">{subvalue}</span>
      )}
    </div>
  </div>
);

const MicroserviceCard = ({ name, status, icon: Icon }: any) => (
  <div className={cn(
    "bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center justify-between border-l-4",
    status === 'STABLE' ? "border-emerald-500" : "border-red-500"
  )}>
    <div className="flex items-center gap-4">
      <div className={cn("p-3 rounded-lg", status === 'STABLE' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500")}>
        <Icon size={20} />
      </div>
      <div>
        <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">{name}</div>
        <div className={cn("text-xl font-bold", status === 'STABLE' ? "text-slate-200" : "text-red-500")}>{status}</div>
      </div>
    </div>
    <span className={cn("w-2 h-2 rounded-full animate-pulse mr-2", status === 'STABLE' ? "bg-emerald-500" : "bg-red-500")}></span>
  </div>
);

export const LiveTelemetry = ({ onSelectIncident }: { onSelectIncident: (id: string) => void }) => {
  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Open Incidents" value="12" subvalue="+2 vs avg" trend="up" colorClass="text-cyan-400" />
        <StatCard label="Critical Alerts" value="3" subvalue="P0 Priority" trend="down" colorClass="text-red-500" />
        <StatCard label="Resolved Today" value="45" subvalue="MTTR: 8M" trend="up" colorClass="text-emerald-400" />
        <StatCard label="AI Confidence" value="98%" subvalue="Autonomous" trend="up" colorClass="text-amber-400" />
      </div>

      {/* Health Summary */}
      <div>
        <h3 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Microservices Health Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MicroserviceCard name="Order Service" status="STABLE" icon={ShoppingCart} />
          <MicroserviceCard name="Payment Service" status="DEGRADED" icon={CreditCard} />
          <MicroserviceCard name="Inventory Service" status="STABLE" icon={Box} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Active Incident Stream */}
        <div className="col-span-12 lg:col-span-8 bg-[#171f33]/70 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-slate-800/30">
            <h3 className="text-xl font-bold text-slate-200">Active Incident Stream</h3>
            <div className="flex gap-2">
              <button className="bg-slate-700/50 px-3 py-1.5 rounded border border-white/5 text-[11px] font-mono font-bold text-slate-400 hover:text-cyan-400 transition-colors">EXPORT</button>
              <button className="bg-cyan-500 px-3 py-1.5 rounded text-[#0b1326] text-[11px] font-mono font-bold hover:brightness-110 transition-all">REFRESH</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/20 border-b border-white/5">
                  <th className="px-6 py-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">Incident ID</th>
                  <th className="px-6 py-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">Service</th>
                  <th className="px-6 py-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">Severity</th>
                  <th className="px-6 py-3 font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {incidents.map((incident) => (
                  <tr 
                    key={incident.id} 
                    className="hover:bg-cyan-500/5 transition-colors group cursor-pointer"
                    onClick={() => onSelectIncident(incident.id)}
                  >
                    <td className="px-6 py-4 font-mono text-[13px] text-cyan-400">{incident.id}</td>
                    <td className="px-6 py-4 font-mono text-[13px] text-slate-400">{incident.timestamp}</td>
                    <td className="px-6 py-4 font-mono text-[13px] text-slate-200 bg-slate-800/10">{incident.service}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        incident.severity === Severity.CRITICAL 
                          ? "bg-red-500/10 text-red-500 border-red-500/20" 
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-mono text-[11px] font-bold">{incident.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Healing Engine */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/20 flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest">AI Healing Engine</h3>
              <Bolt size={18} className="text-cyan-400" />
            </div>
            <div className="space-y-6 relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/10"></div>
              {healingEvents.map((event, idx) => (
                <div key={event.id} className="relative pl-8">
                  <div className={cn(
                    "absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-[#171f33]",
                    idx === 0 ? "bg-cyan-500 shadow-[0_0_8px_rgba(76,215,246,0.5)]" : "bg-emerald-500"
                  )}></div>
                  <div className="flex flex-col">
                    <span className="font-mono text-[13px] text-slate-200">{event.action}</span>
                    <span className="font-mono text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{event.timestamp} · {event.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Preview */}
          <div className="bg-[#171f33]/70 backdrop-blur-xl rounded-xl p-6 border border-white/5 h-48 overflow-hidden relative group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000')] bg-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#171f33] to-transparent"></div>
            <div className="relative z-10 flex flex-col h-full justify-between">
              <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Global Cluster Status</span>
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-bold text-slate-200">14</span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Active Regions</span>
                </div>
                <div className="flex-1 h-[2px] bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "easeOut" }}
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
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Database Health</div>
            <div className="text-2xl font-bold text-slate-200">99.98%</div>
          </div>
        </div>
        <div className="bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center gap-4 border-l-4 border-cyan-400">
          <div className="p-3 bg-cyan-400/10 rounded text-cyan-400">
            <Activity size={24} />
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Gateway Load</div>
            <div className="text-2xl font-bold text-slate-200">42.1%</div>
          </div>
        </div>
        <div className="bg-[#171f33]/70 backdrop-blur-xl p-4 rounded-xl flex items-center gap-4 border-l-4 border-amber-400">
          <div className="p-3 bg-amber-400/10 rounded text-amber-400">
            <Cpu size={24} />
          </div>
          <div>
            <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-1">Memory Usage</div>
            <div className="text-2xl font-bold text-slate-200">68.4%</div>
          </div>
        </div>
      </div>
    </div>
  );
};
