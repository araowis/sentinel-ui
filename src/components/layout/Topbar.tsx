import React from 'react';
import { Clock, CloudCheck, Settings } from 'lucide-react';

export const Topbar = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#0b1326]/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-cyan-500/5">
      <div className="flex items-center gap-6">
        <span className="text-2xl font-black text-cyan-400 tracking-tight">Sentinel AI</span>
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest">System Healthy</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="hidden lg:flex flex-col items-end">
          <span className="font-mono text-[13px] text-slate-200">2023-10-27 14:42:08 UTC</span>
          <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-widest">Latency: 14ms</span>
        </div>
        
        <div className="flex items-center gap-4 text-slate-400">
          <button className="p-2 hover:bg-slate-800/50 rounded-full cursor-pointer transition-colors">
            <Clock size={20} />
          </button>
          <button className="p-2 hover:bg-slate-800/50 rounded-full cursor-pointer transition-colors">
            <CloudCheck size={20} />
          </button>
          <button className="p-2 hover:bg-slate-800/50 rounded-full cursor-pointer transition-colors">
            <Settings size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100" 
              alt="Profile" 
              className="w-full h-full object-cover grayscale brightness-110"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
