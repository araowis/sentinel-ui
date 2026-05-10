/**
 * TypeScript types that mirror the Sentinel FastAPI backend responses.
 * All field names are snake_case to match JSON returned by the API.
 */

// ── Incidents ────────────────────────────────────────────────────────────────

export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface Incident {
  id: string;                 // UUID — used for all API calls
  incident_code: string;      // e.g. INC-2025-001 — displayed in UI
  trace_id: string;
  primary_service: string;
  severity: Severity;
  status: IncidentStatus;
  detected_at: string;        // ISO timestamp
  resolved_at: string | null;
  raw_log_count: number;
  affected_source: string | null;
  error_types: string[];      // e.g. ["GATEWAY_TIMEOUT", "NEGATIVE_STOCK"]
  latest_rca?: RcaResult | null;
}

export interface IncidentDetail extends Incident {
  logs: IncidentLog[];
}

// ── RCA ──────────────────────────────────────────────────────────────────────

export interface RcaResult {
  id: string;
  incident_id: string;
  root_cause: string;
  impact: string;
  confidence: number;          // 0–100
  recommended_fix: string;
  severity: string;
  blast_radius: string;
  affected_service: string;
  github_pr_description: string | null;
  health_snapshot: unknown;
  generated_at: string;
  model_used: string;
}

// ── Fix / remediation ────────────────────────────────────────────────────────

export interface IncidentFix {
  id: string;
  incident_id: string;
  action_type: string;         // "github.pull_request" | "github.issue" | "slack.message"
  status: string;
  detail: unknown;
  triggered_at: string;
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export interface IncidentLog {
  trace_id: string;
  service: string;
  error_type: string;
  message: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  class_name: string | null;
  timestamp: string;
}

export interface BackendLog {
  id: string;
  trace_id: string;
  service: string;
  error_type: string | null;
  message: string;
  level: string;
  thread: string | null;
  class_name: string | null;
  timestamp: string;
  processed: boolean;
  dedup_key: string;
}

// ── Dashboard stats ──────────────────────────────────────────────────────────

export interface StatsResponse {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  critical: number;
  high: number;
  resolution_rate: number;     // 0–100 %
  avg_confidence: number | null;
  mttr_minutes: number | null;
}

// ── Services health ──────────────────────────────────────────────────────────

export type ServiceStatus = 'STABLE' | 'DEGRADED' | 'CRITICAL';

export interface ServiceHealth {
  service: string;
  status: ServiceStatus;
  error_rate_pct: number;
  open_incidents: number;
  total_logs: number;
  last_seen: string | null;
  active_severities: string[];
}

// ── Service Deep-Dive ────────────────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type: 'source' | 'default';
  data?: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
}

export interface RootCauseAnalysis {
  primary_issue: string;
  confidence: number;
  temporal_analysis: string;
  cascade_analysis: string;
  affected_dependencies: string[];
}

export interface DependencyGraph {
  upstream: string[];
  downstream: string[];
  cascade_chain: string[];
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TemporalCorrelations {
  retry_storm_detected: boolean;
  burst_patterns: unknown[];
  correlated_services: string[];
  anomaly_score: number;
  service_spread: number;
  incident_frequency: number;
}

export interface ServiceDeepDiveResponse {
  service: string;
  status: ServiceStatus;
  health_score: number;
  root_cause: RootCauseAnalysis;
  recent_incidents: Incident[];
  dependency_graph: DependencyGraph;
  temporal_correlations: TemporalCorrelations;
  ai_narrative: string;
  recommended_actions: string[];
}

// ── Healing events ───────────────────────────────────────────────────────────

export interface HealingEvent {
  id: string;
  incident_id: string;
  incident_code: string | null;
  action_type: string;
  status: string;
  triggered_at: string;
  detail: unknown;
}

// ── Engine ───────────────────────────────────────────────────────────────────

export interface EngineAction {
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  total_runs: number;
  success_rate: number | null;
  last_run: string | null;
}

export interface AuditEntry {
  id: string;
  incident_id: string;
  incident_code: string | null;
  primary_service: string | null;
  action_type: string;
  status: string;
  triggered_at: string;
  detail: unknown;
}

export interface EngineMode {
  engine_mode: 'autonomous' | 'human_in_the_loop';
  updated_at: string | null;
}

// ── Infrastructure ───────────────────────────────────────────────────────────

export interface RegionNode {
  region: string;
  label: string;
  lat: number;
  lng: number;
  status: string;
}

export interface InfraTopology {
  regions: RegionNode[];
  open_incidents: Record<string, number>;
  inter_region_latency_ms: Record<string, number>;
}

export interface MetricPoint {
  timestamp: number;
  value: number;
}

export interface InfraMetrics {
  cpu: { unit: string; series: MetricPoint[] };
  memory: { unit: string; used: number; total: number; series: MetricPoint[] };
  disk_io: { unit: string; read: MetricPoint[]; write: MetricPoint[] };
  generated_at: string;
}

export interface UptimeDay {
  date: string;
  uptime_pct: number;
  incident_count: number;
  has_critical: boolean;
  last_remediation: string | null;
}

export interface InfraUptime {
  days: number;
  avg_uptime: number;
  matrix: UptimeDay[];
}

// ── Trigger action request ───────────────────────────────────────────────────

export interface TriggerActionRequest {
  incident_id: string;
  action_type: string;
  target_service: string;
  cluster_id?: string;
  notes?: string;
}

// ── Microservice (legacy — kept for mock-data backward compat) ───────────────

export interface Microservice {
  name: string;
  status: 'STABLE' | 'DEGRADED' | 'OUTAGE';
  type: string;
  latency?: string;
  errorRate?: string;
}
