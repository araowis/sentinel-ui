import React, { useState } from 'react';
import {
  BarChart3,
  Database,
  Zap,
  HeartPulse,
  Settings,
  FileText,
} from 'lucide-react';

import { cn } from '../../lib/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem = ({
  icon,
  label,
  active,
  onClick,
}: NavItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 ease-in-out group',
      active
        ? 'bg-cyan-500/20 text-cyan-400 border-r-4 border-cyan-400'
        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200',
    )}
  >
    {icon}

    <span className="font-mono text-[11px] font-bold uppercase tracking-widest">
      {label}
    </span>
  </button>
);

export const Sidebar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
}) => {
  const [backendUrl, setBackendUrl] = useState(
    'http://localhost:5000',
  );

  const [repoUrl, setRepoUrl] = useState(
    'https://github.com/org/backend-service',
  );

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col pt-16 bg-[#0b1326]/95 backdrop-blur-2xl border-r border-white/5 w-72 transition-all duration-300">

      {/* Header
      <div className="px-6 py-8">
        <h2 className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-widest mb-1">
          Incident Intelligence
        </h2>

        <p className="text-sm text-slate-500">
          AI-Driven Root Cause Analysis
        </p>
      </div> */}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto min-h-0">
      <nav className="px-2 space-y-1">
        <NavItem
          icon={
            <div
              className={cn(
                'p-1 rounded',
                activeTab === 'telemetry'
                  ? 'text-cyan-400'
                  : 'text-slate-400 group-hover:text-cyan-400',
              )}
            >
              <BarChart3 size={20} />
            </div>
          }
          label="Live Telemetry"
          active={activeTab === 'telemetry'}
          onClick={() => onTabChange('telemetry')}
        />

        <NavItem
          icon={
            <div className="p-1 rounded text-slate-400 group-hover:text-cyan-400">
              <Database size={20} />
            </div>
          }
          label="Heuristic Logs"
          active={activeTab === 'logs'}
          onClick={() => onTabChange('logs')}
        />

        <NavItem
          icon={
            <div className="p-1 rounded text-slate-400 group-hover:text-cyan-400">
              <Zap size={20} />
            </div>
          }
          label="Automated Actions"
          active={activeTab === 'actions'}
          onClick={() => onTabChange('actions')}
        />

        <NavItem
          icon={
            <div className="p-1 rounded text-slate-400 group-hover:text-cyan-400">
              <HeartPulse size={20} />
            </div>
          }
          label="System Health"
          active={activeTab === 'health'}
          onClick={() => onTabChange('health')}
        />
      </nav>
      </div>

      {/* Manual Override
      <div className="p-4 border-t border-white/5">
        <button className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 py-3 font-mono text-[11px] font-bold uppercase tracking-widest transition-all">
          Trigger Manual Override
        </button>
      </div> */}

      {/* Infrastructure Targets Panel */}
      <div className="px-4 pb-4">
        <div className="rounded-xl border border-cyan-500/20 bg-[#0b1326]/60 p-4 backdrop-blur-xl">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-mono text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                Infrastructure Targets
              </p>

              <p className="text-[10px] text-slate-600 font-mono mt-1">
                Active runtime integrations
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>

          {/* Runtime Backend */}
          <div className="mb-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Runtime Endpoint
            </p>

            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:5000"
              className="w-full bg-[#060e20] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* GitHub Repo */}
          <div className="mb-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              Remediation Repository
            </p>

            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/org/backend-service"
              className="w-full bg-[#060e20] border border-white/10 rounded-lg px-3 py-2 text-[11px] font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
          </div>

          {/* Connect Button */}
          <button
            className="w-full mt-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-400 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Synchronize Targets
          </button>

          {/* Status */}
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-mono text-slate-500 break-all">
              Runtime:
              <span className="text-cyan-400 ml-1">
                {backendUrl || 'Not configured'}
              </span>
            </p>

            <p className="text-[10px] font-mono text-slate-500 break-all">
              Repository:
              <span className="text-emerald-400 ml-1">
                {repoUrl || 'Not configured'}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 space-y-1 border-t border-white/5">
        <button className="w-full text-slate-400 px-4 py-2 flex items-center gap-3 hover:text-slate-200 transition-colors text-sm">
          <Settings size={18} />

          <span className="font-mono text-[11px] font-bold uppercase">
            Settings
          </span>
        </button>

        <button className="w-full text-slate-400 px-4 py-2 flex items-center gap-3 hover:text-slate-200 transition-colors text-sm">
          <FileText size={18} />

          <span className="font-mono text-[11px] font-bold uppercase">
            Documentation
          </span>
        </button>
      </div>
    </aside>
  );
};