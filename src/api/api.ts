  /**
   * Sentinel API — all backend calls in one place.
   *
   * Every function is async/await and throws on failure (the axios client
   * interceptor converts HTTP errors to plain Error objects with readable
   * messages, so callers just need try/catch or the useApiCall hook).
   *
   * Endpoint → backend route mapping
   * ─────────────────────────────────
   * getStats()              GET  /api/stats/enhanced
   * getIncidents()          GET  /api/incidents
   * getIncidentDetail()     GET  /api/incidents/{id}
   * triggerRca()            POST /api/incidents/{id}/rca
   * getRca()                GET  /api/incidents/{id}/rca
   * getRcaHistory()         GET  /api/incidents/{id}/rca/history
   * getFix()                GET  /api/incidents/{id}/fix
   * triggerFix()            POST /api/incidents/{id}/fix
   * resolveIncident()       PATCH /api/incidents/{id}/resolve
   * getLogs()               GET  /api/logs
   * getLogsByTrace()        GET  /api/logs/trace/{trace_id}
   * getServicesHealth()     GET  /api/services/health
   * getServiceDeepDive()    GET  /api/services/{service_name}/deep-dive
   * getHealingEvents()      GET  /api/healing/events
   * triggerAction()         POST /api/actions/trigger
   * getEngineActions()      GET  /api/engine/actions
   * getEngineAudit()        GET  /api/engine/audit
   * getEngineMode()         GET  /api/engine/mode
   * setEngineMode()         PATCH /api/engine/mode
   * getInfraTopology()      GET  /api/infra/topology
   * getInfraMetrics()       GET  /api/infra/metrics
   * getInfraUptime()        GET  /api/infra/uptime
   * getHealth()             GET  /api/health
   */

  import { apiClient } from './client';
  import type {
    StatsResponse,
    Incident,
    IncidentDetail,
    RcaResult,
    IncidentFix,
    BackendLog,
    ServiceHealth,
    ServiceDeepDiveResponse,
    HealingEvent,
    EngineAction,
    AuditEntry,
    EngineMode,
    InfraTopology,
    InfraMetrics,
    InfraUptime,
    TriggerActionRequest,
  } from '../models';

  // ── Dashboard stats ──────────────────────────────────────────────────────────

  export async function getStats(): Promise<StatsResponse> {
    const { data } = await apiClient.get<StatsResponse>('/api/stats/enhanced');
    return data;
  }

  // ── Incidents ────────────────────────────────────────────────────────────────

  export async function getIncidents(params?: {
    status?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ incidents: Incident[]; count: number }> {
    const { data } = await apiClient.get('/api/incidents', { params });
    return data;
  }

  export async function getIncidentDetail(id: string): Promise<IncidentDetail> {
    const { data } = await apiClient.get<IncidentDetail>(`/api/incidents/${id}`);
    return data;
  }

  export async function resolveIncident(id: string): Promise<void> {
    await apiClient.patch(`/api/incidents/${id}/resolve`);
  }

  // ── RCA ──────────────────────────────────────────────────────────────────────

  export async function getRca(id: string): Promise<{ incident_id: string; rca: RcaResult }> {
    const { data } = await apiClient.get(`/api/incidents/${id}/rca`);
    return data;
  }

  export async function triggerRca(id: string): Promise<{ incident_id: string; rca: RcaResult }> {
    const { data } = await apiClient.post(`/api/incidents/${id}/rca`);
    return data;
  }

  export async function getRcaHistory(id: string): Promise<{
    incident_id: string;
    total_runs: number;
    rca_history: RcaResult[];
  }> {
    const { data } = await apiClient.get(`/api/incidents/${id}/rca/history`);
    return data;
  }

  // ── Fix / remediation ────────────────────────────────────────────────────────

  export async function getFix(id: string): Promise<{ incident_id: string; fix: IncidentFix }> {
    const { data } = await apiClient.get(`/api/incidents/${id}/fix`);
    return data;
  }

  export async function triggerFix(id: string): Promise<{ incident_id: string; fix: IncidentFix }> {
    const { data } = await apiClient.post(`/api/incidents/${id}/fix`);
    return data;
  }

  // ── Logs ─────────────────────────────────────────────────────────────────────

  export async function getLogs(params?: {
    service?: string;
    level?: string;
    limit?: number;
  }): Promise<BackendLog[]> {
    const { data } = await apiClient.get<BackendLog[]>('/api/logs', { params });
    return data;
  }

  export async function getLogsByTrace(
    traceId: string,
  ): Promise<{ trace_id: string; logs: BackendLog[]; count: number }> {
    const { data } = await apiClient.get(`/api/logs/trace/${traceId}`);
    return data;
  }

  // ── Services health ──────────────────────────────────────────────────────────

  export async function getServicesHealth(windowMinutes = 30): Promise<{
    services: ServiceHealth[];
    window_minutes: number;
  }> {
    const { data } = await apiClient.get('/api/services/health', {
      params: { window_minutes: windowMinutes },
    });
    return data;
  }

  export async function getServiceDeepDive(
    serviceName: string,
    windowMinutes = 30,
  ): Promise<ServiceDeepDiveResponse> {
    const { data } = await apiClient.get<ServiceDeepDiveResponse>(
      `/api/services/${serviceName}/deep-dive`,
      { params: { window_minutes: windowMinutes } },
    );
    return data;
  }

  // ── Healing events ───────────────────────────────────────────────────────────

  export async function getHealingEvents(params?: {
    incident_id?: string;
    limit?: number;
  }): Promise<{ events: HealingEvent[]; count: number }> {
    const { data } = await apiClient.get('/api/healing/events', { params });
    return data;
  }

  // ── Manual action trigger ────────────────────────────────────────────────────

  export async function triggerAction(body: TriggerActionRequest): Promise<{
    created: boolean;
    id: string;
    incident_id: string;
    action_type: string;
    status: string;
    target_service: string;
    cluster_id?: string;
    notes?: string;
    triggered_at: string;
  }> {
    const { data } = await apiClient.post('/api/actions/trigger', body);
    return data;
  }

  // ── Engine (actions + audit + mode) ─────────────────────────────────────────

  export async function getEngineActions(): Promise<{ actions: EngineAction[] }> {
    const { data } = await apiClient.get('/api/engine/actions');
    return data;
  }

  export async function getEngineAudit(params?: {
    action_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ audit: AuditEntry[]; count: number; total: number }> {
    const { data } = await apiClient.get('/api/engine/audit', { params });
    return data;
  }

  export async function getEngineMode(): Promise<EngineMode> {
    const { data } = await apiClient.get<EngineMode>('/api/engine/mode');
    return data;
  }

  export async function setEngineMode(mode: 'autonomous' | 'human_in_the_loop'): Promise<EngineMode> {
    const { data } = await apiClient.patch<EngineMode>('/api/engine/mode', { mode });
    return data;
  }

  // ── Infrastructure ───────────────────────────────────────────────────────────

  export async function getInfraTopology(): Promise<InfraTopology> {
    const { data } = await apiClient.get<InfraTopology>('/api/infra/topology');
    return data;
  }

  export async function getInfraMetrics(): Promise<InfraMetrics> {
    const { data } = await apiClient.get<InfraMetrics>('/api/infra/metrics');
    return data;
  }

  export async function getInfraUptime(days = 30): Promise<InfraUptime> {
    const { data } = await apiClient.get<InfraUptime>('/api/infra/uptime', { params: { days } });
    return data;
  }

  // ── Health check ─────────────────────────────────────────────────────────────

  export async function getHealth(): Promise<{ status: string; service: string }> {
    const { data } = await apiClient.get('/api/health');
    return data;
  }

  export async function createManualIncident(body: {
  service: string;
  severity: string;
  title: string;
  error_type?: string;
}) {
  const { data } = await apiClient.post(
    '/api/incidents/manual',
    body
  );

  return data;
}