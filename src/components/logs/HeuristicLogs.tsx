import React from 'react';
import { Search, Download, Trash2, Cpu, Brain, Zap, History, GitBranch, Settings, Info, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { systemLogs } from '../../mockData';

export const HeuristicLogs = () => {
  return (
    <div className="flex flex-grow flex-col h-[calc(100vh-64px-16px)] overflow-hidden">
      {/* Filters Header */}
      <div className="p-gutter border-b border-white/10 bg-[#0b1326]/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Heuristic Logs</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Real-time Stream Active</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-[#171f33] p-1 rounded-lg border border-white/10">
              <Search className="text-slate-500 px-2" size={32} />
              <input 
                className="bg-transparent border-none focus:ring-0 font-mono text-sm text-slate-200 placeholder:text-slate-600 w-48"
                placeholder="Trace ID (e.g. tr-992...)"
                type="text"
              />
            </div>
            <select className="bg-[#171f33] border border-white/10 rounded-lg font-mono text-[11px] font-bold text-slate-300 px-3 py-2 focus:ring-1 focus:ring-cyan-400 appearance-none min-w-[140px] text-center">
              <option>All Services</option>
              <option>Order-Service</option>
              <option>Payment-Gateway</option>
            </select>
            <select className="bg-[#171f33] border border-white/10 rounded-lg font-mono text-[11px] font-bold text-slate-300 px-3 py-2 focus:ring-1 focus:ring-cyan-400 appearance-none min-w-[140px] text-center">
              <option>All Severities</option>
              <option className="text-emerald-400">Info</option>
              <option className="text-amber-400">Warn</option>
              <option className="text-red-500 font-bold">Critical</option>
            </select>
            <button className="bg-cyan-500 text-[#0b1326] font-mono text-[11px] font-bold uppercase tracking-widest px-6 py-2 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-12 gap-0 overflow-hidden">
        {/* Main Terminal */}
        <div className="col-span-12 lg:col-span-9 flex flex-col border-r border-white/10 bg-[#060e20]">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-white/10">
            <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stream Console</span>
            <div className="flex items-center gap-6">
              <span className="font-mono text-[11px] text-slate-600">Lines: 124,801</span>
              <div className="flex gap-4">
                <button className="text-slate-600 hover:text-cyan-400 transition-colors"><Download size={16} /></button>
                <button className="text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
          
          <div className="flex-grow p-6 font-mono text-[13px] overflow-y-auto custom-scrollbar-minimal space-y-1">
             {/* Log Entries */}
             <div className="group flex gap-4 hover:bg-cyan-500/5 transition-colors py-1 px-2 rounded">
              <span className="text-slate-700 shrink-0 select-none">14:02:01.442</span>
              <span className="text-emerald-400 shrink-0 font-bold">INFO</span>
              <span className="text-slate-500 shrink-0">[Order-Service]</span>
              <code className="text-slate-300">{"{\"event\": \"order_received\", \"trace_id\": \"tr-441-a1\", \"status\": \"pending\"}"}</code>
            </div>

            {/* Anomaly Highlight */}
            <div className="group flex flex-col bg-red-500/5 border-l-2 border-red-500 my-4 py-3 px-4 rounded-r shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
              <div className="flex gap-4">
                <span className="text-slate-700 shrink-0 select-none">14:02:03.119</span>
                <span className="text-red-500 shrink-0 font-bold uppercase">Crit</span>
                <span className="text-slate-500 shrink-0">[Payment-Gateway]</span>
                <code className="text-slate-100">{"{\"error\": \"connection_timeout\", \"trace_id\": \"tr-441-a1\", \"target\": \"upstream-bank-api\"}"}</code>
              </div>
              <div className="mt-3 ml-20 flex items-center gap-3">
                <span className="bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[9px] font-bold border border-cyan-400/30 uppercase tracking-[0.2em] flex items-center gap-1">
                  <Brain size={12} />
                  Heuristic Match
                </span>
                <span className="text-cyan-400/80 italic text-[12px]">Probable Root Cause: DNS Resolution Failure in US-EAST-1 cluster.</span>
              </div>
            </div>

            <div className="group flex gap-4 hover:bg-cyan-500/5 transition-colors py-1 px-2 rounded">
              <span className="text-slate-700 shrink-0 select-none">14:02:04.001</span>
              <span className="text-emerald-400 shrink-0 font-bold uppercase">Info</span>
              <span className="text-slate-500 shrink-0">[Inventory-Manager]</span>
              <code className="text-slate-300">{"{\"event\": \"stock_reservation_held\", \"trace_id\": \"tr-441-a1\", \"sku\": \"AE-992\"}"}</code>
            </div>

            <div className="group flex flex-col bg-amber-500/5 border-l-2 border-amber-500 my-4 py-3 px-4 rounded-r shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]">
              <div className="flex gap-4">
                <span className="text-slate-700 shrink-0 select-none">14:02:05.882</span>
                <span className="text-amber-500 shrink-0 font-bold uppercase">Warn</span>
                <span className="text-slate-500 shrink-0">[Inventory-Manager]</span>
                <code className="text-slate-100">{"{\"warning\": \"deadlock_retry_limit\", \"trace_id\": \"tr-918-x2\", \"duration_ms\": 1400}"}</code>
              </div>
              <div className="mt-3 ml-20 flex items-center gap-3">
                <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold border border-amber-500/20 uppercase tracking-[0.2em] flex items-center gap-1">
                  <Cpu size={12} />
                  Pattern Match
                </span>
                <span className="text-amber-400/80 italic text-[12px]">Pattern Detected: Inventory Lock Contention (High Frequency).</span>
              </div>
            </div>

            {systemLogs.map((log, i) => (
              <div key={i} className="group flex gap-4 hover:bg-cyan-500/5 transition-colors py-1 px-2 rounded opacity-80">
                <span className="text-slate-700 shrink-0 select-none">{log.timestamp}</span>
                <span className={cn(
                  "shrink-0 font-bold uppercase",
                  log.level === 'INFO' ? "text-emerald-400" :
                  log.level === 'WARN' ? "text-amber-400" : "text-red-500"
                )}>{log.level}</span>
                <span className="text-slate-500 shrink-0">[{log.service}]</span>
                <code className="text-slate-300">{log.message}</code>
              </div>
            ))}
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
                />
              </div>
              <button className="bg-slate-800 border border-white/10 text-slate-200 font-mono text-[11px] font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-slate-700 transition-colors">
                Launch Explorer
              </button>
            </div>
          </div>
        </div>

        {/* Heuristic Analysis Panel */}
        <div className="hidden lg:flex lg:col-span-3 flex-col bg-[#171f33]/30 border-l border-white/5">
          <div className="p-6">
            <h3 className="font-mono text-[11px] font-bold text-cyan-400 border-b border-cyan-400/20 pb-2 mb-6 uppercase tracking-widest">Heuristic Analysis</h3>
            <div className="space-y-6">
              <div className="bg-[#171f33]/70 backdrop-blur-xl p-5 rounded-xl border border-white/5 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle size={14} className="text-red-500" />
                  <span className="font-mono text-[9px] text-red-500 font-bold uppercase tracking-wider">High Confidence</span>
                </div>
                <p className="text-[13px] text-slate-200 mb-4 leading-relaxed">Frequent 504 Timeouts in Payment-Gateway</p>
                <div className="h-1.5 w-full bg-[#060e20] rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[85%] shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                </div>
                <div className="flex justify-between mt-3">
                  <span className="font-mono text-[10px] text-slate-500">85% correlation</span>
                  <span className="font-mono text-[10px] text-slate-500">12 events</span>
                </div>
              </div>

              <div className="bg-[#171f33]/70 backdrop-blur-xl p-5 rounded-xl border border-amber-500/20 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="font-mono text-[9px] text-amber-500 font-bold uppercase tracking-wider">Pattern Match</span>
                </div>
                <p className="text-[13px] text-slate-200 mb-4 leading-relaxed">Inventory Lock Contention detected</p>
                <div className="h-1.5 w-full bg-[#060e20] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[62%] shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                </div>
                <div className="flex justify-between mt-3">
                  <span className="font-mono text-[10px] text-slate-500">62% correlation</span>
                  <span className="font-mono text-[10px] text-slate-500">42 ms delay</span>
                </div>
              </div>

              {/* Healing Timeline */}
              <div className="mt-10">
                <h4 className="font-mono text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-6">Autonomous Healing</h4>
                <div className="relative pl-6 border-l border-white/10 space-y-8">
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-[#0b1326] shadow-[0_0_8px_#4edea3]" />
                    <p className="font-mono text-[12px] text-slate-200 leading-snug">Auto-scaling group expanded in us-east-1a</p>
                    <p className="font-mono text-[10px] text-slate-500 mt-1">02:14:11</p>
                  </div>
                  <div className="relative">
                    <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-cyan-400 ring-4 ring-[#0b1326]" />
                    <p className="font-mono text-[12px] text-slate-200 leading-snug">Purging stale redis locks for SKU:AE-992</p>
                    <p className="font-mono text-[10px] text-slate-500 mt-1">02:14:08</p>
                  </div>
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
                  <p className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">System AI Model</p>
                  <p className="font-mono text-[12px] font-bold text-slate-200">Sentinel-CORE v4.2</p>
               </div>
            </div>
            <button className="w-full bg-[#171f33] border border-cyan-400/20 text-cyan-400 font-mono text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl hover:bg-cyan-400/5 transition-colors">
              View Training Set
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
