import React from 'react';
import { Search, Filter, ExternalLink, CheckCircle2, AlertCircle, Clock, Github, Slack, Mail, Zap, Settings, Shield, RefreshCw, Code, GitBranch, Terminal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { actions, auditLogs } from '../../mockData';

const ActionCard = ({ action }: any) => (
  <div className={cn(
    "bg-[#171f33]/70 backdrop-blur-xl p-6 rounded-xl flex flex-col justify-between border group transition-all duration-300",
    action.enabled ? "border-white/5 hover:border-cyan-500/30 hover:bg-[#1d2740]" : "border-dashed border-white/10 opacity-60"
  )}>
    <div>
      <div className="flex justify-between items-start mb-5">
        <div className={cn(
          "p-3 rounded-xl",
          action.id === '1' ? "bg-cyan-500/10 text-cyan-400" : 
          action.id === '4' ? "bg-amber-500/10 text-amber-500" :
          action.id === '5' ? "bg-red-500/10 text-red-400" : "bg-slate-500/10 text-slate-300"
        )}>
          {action.id === '1' ? <Zap size={20} /> : 
           action.id === '2' ? <GitBranch size={20} /> :
           action.id === '3' ? <AlertCircle size={20} /> :
           action.id === '4' ? <Slack size={20} /> : <Mail size={20} />}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[9px] font-mono font-bold uppercase tracking-wider",
            action.enabled ? "text-emerald-400" : "text-slate-500"
          )}>{action.enabled ? "Enabled" : "Disabled"}</span>
          <div className={cn("w-1.5 h-1.5 rounded-full", action.enabled ? "bg-emerald-400" : "bg-slate-600")} />
        </div>
      </div>
      <h3 className="text-[17px] font-bold text-slate-100 mb-2">{action.name}</h3>
      <p className="text-[13px] text-slate-400 font-medium leading-relaxed">{action.description}</p>
    </div>
    <div className="mt-8 pt-5 border-t border-white/5 flex justify-between items-end">
      <div>
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">
          {action.id === '1' || action.id === '3' ? "Success Rate" : "Last Run"}
        </p>
        <p className={cn("font-mono text-[14px] font-bold", (action.id === '1' || action.id === '3') ? "text-emerald-400" : "text-slate-200")}>
          {action.id === '1' || action.id === '3' ? `${action.successRate}%` : action.lastRun}
        </p>
      </div>
      <button className="text-cyan-400 group-hover:translate-x-1 transition-transform">
        <ExternalLink size={18} />
      </button>
    </div>
  </div>
);

export const AutomatedActions = () => {
  return (
    <div className="space-y-12">
      {/* Engine State Section */}
      <section className="bg-[#171f33]/70 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-[0_4px_40px_rgba(76,215,246,0.1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-8 group">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-cyan-400 tracking-tight">Autonomous Engine State</h1>
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500" />
            </div>
          </div>
          <p className="text-lg text-slate-400 font-medium max-w-2xl">Sentinel AI is currently monitoring <span className="text-slate-200">14 active microservices</span> across production clusters with neural inference patterns active.</p>
        </div>
        <div className="flex bg-[#060e20] p-1.5 rounded-full border border-white/5 shadow-inner">
          <button className="px-8 py-3 rounded-full font-mono text-[12px] font-bold uppercase tracking-widest bg-cyan-500 text-[#0b1326] shadow-[0_0_15px_rgba(76,215,246,0.4)] transition-all">Autonomous Mode</button>
          <button className="px-8 py-3 rounded-full font-mono text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-200 transition-colors">Human-in-the-loop</button>
        </div>
      </section>

      {/* Action Library Grid */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-mono text-[12px] font-bold text-slate-500 tracking-[0.2em] uppercase">Action Library</h2>
          <div className="flex items-center gap-3">
             <span className="text-cyan-400 font-mono text-[13px] font-bold">5 Total Actions Configured</span>
             <div className="h-4 w-[1px] bg-white/10" />
             <button className="text-slate-500 hover:text-cyan-400"><Settings size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {actions.map(action => <ActionCard key={action.id} action={action} />)}
        </div>
      </section>

      {/* Healing Performance and Extensions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Healing Performance (Timeline) */}
        <div className="lg:col-span-2 bg-[#171f33]/70 backdrop-blur-xl rounded-2xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-800/10">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">AI Healing Performance</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-1">Recent automated patches and validation cycles</p>
            </div>
            <button className="font-mono text-[11px] font-bold uppercase tracking-widest text-cyan-400 border border-cyan-400/20 px-6 py-3 rounded-xl hover:bg-cyan-500/10 transition-all active:scale-95 shadow-[0_0_10px_rgba(76,215,246,0.1)]">Configure Neural Model</button>
          </div>
          <div className="p-8 space-y-10">
             {/* Timeline Item 1 */}
             <div className="flex gap-8 relative group">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 ring-4 ring-[#171f33] z-10">
                    <CheckCircle2 size={20} />
                  </div>
                  <div className="w-[2px] h-full bg-white/5 my-2 absolute top-10" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-[14px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">FIX-8842</span>
                    <span className="font-mono text-[12px] text-slate-500 uppercase tracking-widest">14:22:10 UTC</span>
                  </div>
                  <div className="bg-[#0b1326]/60 p-5 rounded-2xl border border-white/5 group-hover:border-cyan-400/20 transition-colors">
                    <p className="text-[15px] text-slate-200 mb-3 font-medium">Memory Leak Suppression in <span className="text-emerald-400 font-bold">payment-gateway:v2.1</span></p>
                    <div className="flex gap-8">
                      <div className="flex items-center gap-2.5 text-[12px] font-mono text-slate-500">
                        <Code size={14} className="text-slate-600" />
                        main_loop.go:142
                      </div>
                      <div className="flex items-center gap-2.5 text-[12px] font-mono text-emerald-400">
                        <Shield size={14} />
                        Tests Passed (12/12)
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             {/* Timeline Item 2 */}
             <div className="flex gap-8 relative group">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 ring-4 ring-[#171f33] z-10 animate-pulse">
                    <Clock size={20} />
                  </div>
                  <div className="w-[2px] h-full bg-white/5 my-2 absolute top-10" />
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-4 mb-3">
                    <span className="font-mono text-[14px] font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded">FIX-8851</span>
                    <span className="font-mono text-[12px] text-slate-500 uppercase tracking-widest">14:58:33 UTC</span>
                  </div>
                  <div className="bg-[#0b1326]/60 p-5 rounded-2xl border border-white/5 group-hover:border-cyan-400/20 transition-colors">
                    <p className="text-[15px] text-slate-200 mb-3 font-medium">Refactoring redundant API calls in <span className="text-amber-500 font-bold">auth-server:latest</span></p>
                    <div className="flex gap-8">
                      <div className="flex items-center gap-2.5 text-[12px] font-mono text-slate-500">
                        <Terminal size={14} className="text-slate-600" />
                        token_util.ts:88
                      </div>
                      <div className="flex items-center gap-2.5 text-[12px] font-mono text-amber-500">
                        <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '3s'}} />
                        Validation in progress (Canary 5%)
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Extensions Corner */}
        <div className="space-y-8">
          {/* Git Integration */}
          <div className="bg-[#171f33]/70 backdrop-blur-xl p-8 rounded-2xl border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-8">
              <Github className="text-slate-300" size={24} />
              <h3 className="text-lg font-bold text-slate-100">Git Integration</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#060e20] rounded-xl border border-white/10 group hover:border-cyan-400/20 transition-colors">
                <div className="flex items-center gap-3">
                  <GitBranch size={16} className="text-slate-500 group-hover:text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Sentinel-core-repo</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Connected</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-[#060e20] rounded-xl border border-white/10 group hover:border-cyan-400/20 transition-colors">
                <div className="flex items-center gap-3">
                  <GitBranch size={16} className="text-slate-500 group-hover:text-cyan-400" />
                  <span className="text-sm font-medium text-slate-300">Sentinel-infra-v3</span>
                </div>
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Connected</span>
              </div>
              <button className="w-full mt-2 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500 border border-white/5 rounded-xl hover:bg-slate-800/50 hover:text-slate-200 transition-all">Manage Repositories</button>
            </div>
          </div>

          {/* Alerting Corner */}
          <div className="bg-[#171f33]/70 backdrop-blur-xl p-8 rounded-2xl border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-8">
              <Slack className="text-slate-300" size={24} />
              <h3 className="text-lg font-bold text-slate-100">Alerting & Rotation</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 block">Slack Channel</label>
                <div className="flex items-center justify-between gap-3 bg-[#060e20] p-4 rounded-xl border border-white/10 group cursor-pointer hover:border-amber-500/20 transition-colors">
                  <span className="font-mono text-[13px] text-amber-500">#ops-healing</span>
                  <Settings size={14} className="text-slate-600 group-hover:text-slate-400" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 block">Current On-Call</label>
                <div className="flex items-center gap-4 bg-[#0b1326]/40 p-4 rounded-xl border border-white/5">
                   <div className="relative">
                      <img 
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100&h=100" 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full border-2 border-cyan-400/30" 
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#171f33]" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-100">Jordan D. (SRE Team 1)</p>
                      <p className="text-[10px] font-mono text-slate-500 leading-none mt-1">Shift ends in 4h 12m</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Audit Log Section */}
      <section className="bg-[#171f33]/70 backdrop-blur-xl rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-800/10">
          <h2 className="text-2xl font-bold text-slate-100 italic">Execution Audit Log</h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:flex-initial">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                className="bg-[#0b1326] border-white/10 rounded-full pl-10 pr-6 py-2.5 text-sm focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 transition-all w-full md:w-72 placeholder:text-slate-700 text-slate-200"
                placeholder="Search Incident ID..."
                type="text"
              />
            </div>
            <button className="p-3 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-white/5 transition-colors">
              <Filter className="text-slate-400" size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0b1326]/50 sticky top-0 z-10">
              <tr>
                <th className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Timestamp</th>
                <th className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Incident ID</th>
                <th className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Action Taken</th>
                <th className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Outcome</th>
                <th className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">Validation</th>
                <th className="p-6 font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {auditLogs.map((entry, idx) => (
                <tr key={idx} className="hover:bg-cyan-500/5 transition-colors group">
                  <td className="p-6 font-mono text-[13px] text-slate-400">{entry.timestamp}</td>
                  <td className="p-6 text-cyan-400 font-mono font-bold">{entry.incidentId}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className={cn(entry.outcome === 'Success' ? "text-cyan-400" : "text-red-500")} />
                      <span className="text-[14px] text-slate-200 font-medium">{entry.action}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-mono font-bold uppercase rounded-lg border",
                      entry.outcome === 'Success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {entry.outcome}
                    </span>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                      "text-[10px] font-mono font-bold uppercase tracking-wider",
                      entry.outcome === 'Success' ? "text-slate-400" : "text-red-400/80"
                    )}>{entry.validation}</span>
                  </td>
                  <td className="p-6 text-center">
                    <button className="text-slate-500 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-slate-800">
                      <ExternalLink size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-900/50 border-t border-white/5 flex justify-center">
           <button className="font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-all hover:scale-110">Load Extended History</button>
        </div>
      </section>
    </div>
  );
};
