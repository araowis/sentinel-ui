import React from 'react';
import { X, Sparkles, CheckCircle2, RotateCcw, Play, RefreshCw, Check, Filter, Download, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { systemLogs } from '../../mockData';
import { motion, AnimatePresence } from 'motion/react';

export const InvestigationDrawer = ({ incidentId, isOpen, onClose }: { incidentId: string | null, isOpen: boolean, onClose: () => void }) => {
  if (!incidentId) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" 
          />
          
          {/* Drawer */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full md:w-[600px] lg:w-[800px] bg-[#0b1326] z-[70] shadow-[-20px_0px_50px_rgba(0,0,0,0.5)] flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <header className="p-8 border-b border-white/5 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1 uppercase">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    Critical
                  </span>
                  <span className="font-mono text-[13px] text-slate-500">{incidentId}</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-100">Critical Failure in Payment Gateway</h1>
                <p className="text-sm text-slate-400 mt-1">Detected 4 minutes ago • Impacting 12.4k users</p>
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
              {/* AI Analysis */}
              <section className="relative">
                <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-500/30 rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-mono text-[11px] font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-widest">
                    <Sparkles size={16} />
                    AI Root Cause Analysis
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Confidence</span>
                      <span className="text-emerald-400 font-bold text-lg leading-none">96%</span>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Impact Score</span>
                      <span className="text-red-500 font-bold text-lg leading-none">8.9/10</span>
                    </div>
                  </div>
                </div>
                <div className="bg-cyan-500/5 p-6 rounded-xl border border-cyan-500/20">
                  <p className="text-slate-200 leading-relaxed text-lg">
                    Database connection pool <span className="text-cyan-400 font-bold">exhausted</span> due to unoptimized query in the reporting service. The surge in high-latency reads caused a deadlock in the transaction manager at <code className="bg-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono text-sm">04:12:08 UTC</code>.
                  </p>
                </div>
              </section>

              {/* Remediation */}
              <section>
                <h3 className="font-mono text-[11px] font-bold text-slate-500 mb-4 tracking-widest uppercase">Remediation Status</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <div>
                        <p className="font-bold text-slate-100">Slack Alert Sent</p>
                        <p className="text-[11px] font-mono text-slate-500">Channel: #ops-incidents • 04:13:21</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">Success</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <div>
                        <p className="font-bold text-slate-100">GitHub Issue Created</p>
                        <p className="text-[11px] font-mono text-slate-500">Issue #4492 • Assigned to @infra-team</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">Success</span>
                  </div>

                  <div className="p-4 bg-slate-800/60 rounded-xl border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <RefreshCw size={24} className="text-cyan-400 animate-spin" style={{ animationDuration: '3s'}} />
                      <div>
                        <p className="font-bold text-slate-100">Service Restart Recommended</p>
                        <p className="text-[11px] font-mono text-slate-500">Cluster: payment-gw-v3 • Pending Authorization</p>
                      </div>
                    </div>
                    <button className="bg-cyan-500 text-[#0b1326] px-4 py-2 rounded-lg font-mono text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 shadow-[0_0_15px_rgba(76,215,246,0.3)]">
                      Trigger Service Restart
                    </button>
                  </div>
                </div>
              </section>

              {/* Logs */}
              <section className="flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">System Logs</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono text-slate-500 hover:border-white/30 cursor-pointer">FILTER: PAYMENT-SERVICE</span>
                    <span className="px-2 py-0.5 rounded border border-white/10 text-[10px] font-mono text-slate-500 hover:border-white/30 cursor-pointer">ERRORS ONLY</span>
                  </div>
                </div>
                <div className="bg-[#050505] rounded-xl border border-white/10 p-6 font-mono text-[13px] overflow-hidden max-h-[400px] overflow-y-auto custom-scrollbar">
                  <div className="space-y-2">
                    {systemLogs.map((log, i) => (
                      <div 
                        key={i} 
                        className={cn(
                          "group flex gap-4 transition-colors",
                          log.isAnomaly ? "bg-red-500/10 border-l-2 border-red-500 -mx-6 px-6 py-1" : "hover:bg-cyan-500/5 py-1 px-2 rounded"
                        )}
                      >
                        <span className="text-slate-600 shrink-0 select-none">{log.timestamp}</span>
                        <span className={cn(
                          "uppercase font-bold shrink-0",
                          log.level === 'INFO' ? "text-emerald-400" :
                          log.level === 'WARN' ? "text-amber-400" :
                          log.level === 'CRIT' ? "text-red-500" : "text-cyan-400"
                        )}>
                          [{log.level}]
                        </span>
                        <span className="text-slate-300">{log.message}</span>
                      </div>
                    ))}
                    <div className="flex gap-4 group italic text-cyan-400/60 transition-colors py-1 px-2 rounded">
                      <span className="text-slate-600 shrink-0 select-none">04:12:09.412</span>
                      <span className="uppercase font-bold shrink-0">[AI]</span>
                      <span className="italic">Analyzing stack trace... correlating with recent deployment #D-221</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer className="p-8 border-t border-white/5 bg-slate-800/10 flex justify-between gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 border border-cyan-500/40 text-cyan-400 py-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-cyan-500/10 transition-all active:scale-[0.98]">
                <RefreshCw size={18} />
                Re-run Analysis
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-[#0b1326] py-4 rounded-xl font-mono text-[11px] font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10">
                <Check size={18} />
                Mark as Resolved
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
