import axios from 'axios';
import type {
  Incident,
  Microservice,
  HealingEvent,
  SystemLog,
  Action,
  AuditLogEntry,
  SystemHealthMetrics,
} from '../models';

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const sentinelApi = {
  // Telemetry & Stats
  getGlobalStats: async () => {
    const { data } = await apiClient.get('/stats/summary');
    return data;
  },

  getSystemHealth: async (): Promise<SystemHealthMetrics> => {
    const { data } = await apiClient.get('/health/metrics');
    return data;
  },

  // Incidents
  getIncidents: async (status?: string): Promise<Incident[]> => {
    const { data } = await apiClient.get('/incidents', {
      params: { status },
    });
    return data;
  },

  getIncidentDetails: async (id: string): Promise<Incident> => {
    const { data } = await apiClient.get(`/incidents/${id}`);
    return data;
  },

  resolveIncident: async (id: string) => {
    const { data } = await apiClient.post(`/incidents/${id}/resolve`);
    return data;
  },

  // Microservices
  getMicroservices: async (): Promise<Microservice[]> => {
    const { data } = await apiClient.get('/services');
    return data;
  },

  // Logs
  getLogs: async (
    params?: {
      service?: string;
      level?: string;
      limit?: number;
    }
  ): Promise<SystemLog[]> => {
    const { data } = await apiClient.get('/logs', { params });
    return data;
  },

  // Healing & Actions
  getHealingEvents: async (): Promise<HealingEvent[]> => {
    const { data } = await apiClient.get('/healing/history');
    return data;
  },

  getActions: async (): Promise<Action[]> => {
    const { data } = await apiClient.get('/actions');
    return data;
  },

  triggerAction: async (
    actionId: string,
    incidentId?: string
  ) => {
    const { data } = await apiClient.post(
      `/actions/${actionId}/execute`,
      { incidentId }
    );
    return data;
  },

  getAuditLogs: async (): Promise<AuditLogEntry[]> => {
    const { data } = await apiClient.get('/audit');
    return data;
  },
};