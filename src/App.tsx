/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';
import { LiveTelemetry } from './components/dashboard/LiveTelemetry';
import { HeuristicLogs } from './components/logs/HeuristicLogs';
import { AutomatedActions } from './components/actions/AutomatedActions';
import { SystemHealth } from './components/health/SystemHealth';
import { InvestigationDrawer } from './components/investigation/InvestigationDrawer';

export default function App() {
  const [activeTab, setActiveTab] = useState('telemetry');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isInvestigationOpen, setIsInvestigationOpen] = useState(false);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    setIsInvestigationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#061026] text-slate-200 selection:bg-cyan-500/30 overflow-x-hidden">
      <Topbar />
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="pl-72 pt-16 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">
          {activeTab === 'telemetry' && <LiveTelemetry onSelectIncident={handleSelectIncident} />}
          {activeTab === 'logs' && <HeuristicLogs />}
          {activeTab === 'actions' && <AutomatedActions />}
          {activeTab === 'health' && <SystemHealth />}
        </div>
      </main>

      <InvestigationDrawer 
        incidentId={selectedIncidentId} 
        isOpen={isInvestigationOpen} 
        onClose={() => setIsInvestigationOpen(false)} 
      />
    </div>
  );
}
