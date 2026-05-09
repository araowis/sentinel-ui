import { Severity, Incident, Microservice, HealingEvent, SystemLog, Action, AuditLogEntry } from './types';

export const incidents: Incident[] = [
  {
    id: '#INC-8842',
    timestamp: '14:41:02',
    service: 'auth-service',
    errorType: 'JWT_EXPIRED_EXCEPTION',
    severity: Severity.CRITICAL,
    status: 'RCA DONE',
    description: 'Database connection pool exhausted due to unoptimized query in the reporting service.'
  },
  {
    id: '#INC-8841',
    timestamp: '14:38:55',
    service: 'payment-gateway',
    errorType: 'STRIPE_TIMEOUT_504',
    severity: Severity.CRITICAL,
    status: 'HEALING...',
  },
  {
    id: '#INC-8839',
    timestamp: '14:35:12',
    service: 'inventory-db',
    errorType: 'READ_REPLICA_LAG_HIGH',
    severity: Severity.WARNING,
    status: 'IDENTIFIED',
  },
  {
    id: '#INC-8835',
    timestamp: '14:30:00',
    service: 'user-profile-api',
    errorType: 'REDIS_OOM_RESTART',
    severity: Severity.WARNING,
    status: 'RESOLVED',
  },
  {
    id: '#INC-8832',
    timestamp: '14:28:19',
    service: 'cdn-edge-04',
    errorType: 'SSL_HANDSHAKE_FAILURE',
    severity: Severity.CRITICAL,
    status: 'RCA DONE',
  }
];

export const microservices: Microservice[] = [
  { name: 'Order Service', status: 'STABLE', type: 'shopping_cart' },
  { name: 'Payment Service', status: 'DEGRADED', type: 'payments' },
  { name: 'Inventory Service', status: 'STABLE', type: 'inventory_2' }
];

export const healingEvents: HealingEvent[] = [
  {
    id: '1',
    action: "Scaling 'auth-service' replicas (2 -> 5)",
    timestamp: '14:42:05',
    status: 'IN_PROGRESS',
    type: 'AUTOMATED ACTION'
  },
  {
    id: '2',
    action: 'Traffic rerouted to West-2 Region',
    timestamp: '14:39:12',
    status: 'SUCCESSFUL',
    type: 'AI RECOMMENDATION'
  },
  {
    id: '3',
    action: "Rollback 'v2.4.1' on edge nodes",
    timestamp: '14:25:44',
    status: 'SUCCESSFUL',
    type: 'AI RECOMMENDATION'
  }
];

export const systemLogs: SystemLog[] = [
  { timestamp: '04:12:01.032', level: 'INFO', service: 'PAYMENT-SERVICE', message: 'Incoming request: POST /v1/authorize - cluster-004' },
  { timestamp: '04:12:04.110', level: 'WARN', service: 'PAYMENT-SERVICE', message: 'Slow query detected: SELECT * FROM ledger WHERE tx_id = ? ...' },
  { timestamp: '04:12:05.882', level: 'WARN', service: 'PAYMENT-SERVICE', message: 'Connection pool usage reached 94% (940/1000)' },
  { timestamp: '04:12:08.001', level: 'CRIT', service: 'PAYMENT-SERVICE', message: 'PoolExhaustedException: Timeout waiting for connection', isAnomaly: true },
  { timestamp: '04:12:08.102', level: 'CRIT', service: 'PAYMENT-SERVICE', message: 'HealthCheck Failed: Service Unavailable (503)', isAnomaly: true },
  { timestamp: '04:12:09.412', level: 'AI', service: 'AI-ENGINE', message: 'Analyzing stack trace... correlating with recent deployment #D-221' },
  { timestamp: '04:12:12.221', level: 'INFO', service: 'PAYMENT-SERVICE', message: 'Circuit breaker triggered: OPEN state' },
];

export const actions: Action[] = [
  { id: '1', name: 'AI Code Fix', description: 'Direct patching of logic errors using neural inference.', enabled: true, successRate: 94.2, lastRun: '1h ago', icon: 'auto_fix_high' },
  { id: '2', name: 'Raise GitHub PR', description: 'Opens PRs for non-critical infrastructure changes.', enabled: true, successRate: 100, lastRun: '2h ago', icon: 'merge_type' },
  { id: '3', name: 'Raise GitHub Issue', description: 'Tracks technical debt and persistent warnings.', enabled: true, successRate: 100, lastRun: 'Yesterday', icon: 'report_problem' },
  { id: '4', name: 'Slack Alert', description: 'Real-time event notification in #ops-fire-hose.', enabled: true, successRate: 100, lastRun: '14m ago', icon: 'chat' },
  { id: '5', name: 'Email On-Call', description: 'Legacy escalation for critical system failure.', enabled: false, successRate: 0, lastRun: 'N/A', icon: 'mail' }
];

export const auditLogs: AuditLogEntry[] = [
  { timestamp: '2023-10-24 14:58:33', incidentId: 'INC-9901-A', action: 'Raise GitHub PR', outcome: 'Success', validation: 'CANARY_PASSED' },
  { timestamp: '2023-10-24 14:42:10', incidentId: 'INC-8892-Z', action: 'AI Code Fix', outcome: 'Success', validation: 'AUTO_VALIDATED' },
  { timestamp: '2023-10-24 13:15:05', incidentId: 'INC-8884-F', action: 'Slack Alert', outcome: 'Success', validation: 'NOTIFIED' },
  { timestamp: '2023-10-24 12:44:12', incidentId: 'INC-8850-B', action: 'AI Code Fix', outcome: 'Failed', validation: 'ROLLBACK_EXECUTED' }
];
