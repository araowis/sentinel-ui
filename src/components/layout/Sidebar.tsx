import React from 'react';
import { LucideIcon, BarChart3, Database, Zap, HeartPulse, Settings, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, active, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 ease-in-out group",
      active 
        ? "bg-cyan-500/20 text-cyan-400 border-r-4 border-cyan-400" 
        : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
    )}
  >
    {icon}
    <span className="font-mono text-[11px] font-bold uppercase tracking-widest">{label}</span>
  </button>
);

export const Sidebar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col pt-16 bg-[#0b1326]/95 backdrop-blur-2xl border-r border-white/5 w-72 transition-all duration-300">
      <div className="px-6 py-8">
        <h2 className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-1">Incident Intelligence</h2>
        <p className="text-sm text-slate-500">AI-Driven Root Cause Analysis</p>
      </div>
      
      <nav className="flex-1 px-2 space-y-1">
        <NavItem 
          icon={<div className={cn("p-1 rounded", activeTab === 'telemetry' ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-400")}><BarChart3 size={20} /></div>}
          label="Live Telemetry"
          active={activeTab === 'telemetry'}
          onClick={() => onTabChange('telemetry')}
        />
        <NavItem 
          icon={<div className="p-1 rounded text-slate-400 group-hover:text-cyan-400"><Database size={20} /></div>}
          label="Heuristic Logs"
          active={activeTab === 'logs'}
          onClick={() => onTabChange('logs')}
        />
        <NavItem 
          icon={<div className="p-1 rounded text-slate-400 group-hover:text-cyan-400"><Zap size={20} /></div>}
          label="Automated Actions"
          active={activeTab === 'actions'}
          onClick={() => onTabChange('actions')}
        />
        <NavItem 
          icon={<div className="p-1 rounded text-slate-400 group-hover:text-cyan-400"><HeartPulse size={20} /></div>}
          label="System Health"
          active={activeTab === 'health'}
          onClick={() => onTabChange('health')}
        />
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all">
          Trigger Manual Override
        </button>
      </div>

      <div className="p-4 space-y-1">
        <button className="w-full text-slate-400 px-4 py-2 flex items-center gap-3 hover:text-slate-200 transition-colors text-sm">
          <Settings size={18} />
          <span className="font-mono text-[11px] font-bold uppercase">Settings</span>
        </button>
        <button className="w-full text-slate-400 px-4 py-2 flex items-center gap-3 hover:text-slate-200 transition-colors text-sm">
          <FileText size={18} />
          <span className="font-mono text-[11px] font-bold uppercase">Documentation</span>
        </button>
      </div>
    </aside>
  );
};
