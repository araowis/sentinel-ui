export enum Severity {
  CRITICAL = 'CRITICAL',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
}

export interface Incident {
  id: string;
  timestamp: string;
  service: string;
  errorType: string;
  severity: Severity;
  status: string;
  description?: string;
}

export interface Microservice {
  name: string;
  status: 'STABLE' | 'DEGRADED' | 'OUTAGE';
  type: string;
}

export interface HealingEvent {
  id: string;
  action: string;
  timestamp: string;
  status: 'SUCCESSFUL' | 'IN_PROGRESS' | 'FAILED' | 'PENDING';
  type: 'AUTOMATED ACTION' | 'AI RECOMMENDATION';
}

export interface SystemLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'CRIT' | 'AI';
  service: string;
  message: string;
  isAnomaly?: boolean;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  successRate: number;
  lastRun: string;
  icon: string;
}

export interface AuditLogEntry {
  timestamp: string;
  incidentId: string;
  action: string;
  outcome: 'Success' | 'Failed' | 'Pending';
  validation: string;
}
