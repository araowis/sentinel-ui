/**
 * Axios client shared across all API modules.
 *
 * Configuration is driven by VITE_API_BASE_URL (set in .env.local).
 * The response interceptor normalises error messages so callers only
 * have to catch a plain Error with a readable .message.
 *
 * Auth tokens: if you add JWT auth later, add the request interceptor below
 * and store the token in localStorage / a React context.
 */

import axios, { AxiosError } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  // Timeout after 30 s so the UI doesn't hang on slow Claude RCA calls
  timeout: 30_000,
});

// ── Request interceptor (auth token placeholder) ─────────────────────────────
// Uncomment and adapt when JWT auth is added:
//
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('sentinel_token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// ── Response interceptor — normalise error messages ──────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(
        new Error('Cannot reach the Sentinel backend. Is it running on port 8000?'),
      );
    }

    const detail =
      (error.response?.data as { detail?: string })?.detail ??
      error.message ??
      'Unknown error';

    return Promise.reject(new Error(`[${error.response?.status ?? 0}] ${detail}`));
  },
);
