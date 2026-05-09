<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sentinel AI — Frontend

React + TypeScript dashboard for the Sentinel AI self-healing incident platform.

---

## Run Locally

**Prerequisites:** Node.js 18+, Sentinel backend running on port 8000

```bash
npm install
npm run dev        # starts on http://localhost:3000
```

Set environment variables in `.env.local`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws/incidents
```

---

## Integration — What Was Connected

### Backend (FastAPI — `sentinel/`)

| What | Detail |
|---|---|
| **CORS middleware** | Added to `main.py`; allows `localhost:3000` and `localhost:5173` by default. Override with `CORS_ORIGINS` env var (comma-separated list). |
| **WebSocket endpoint** | `GET /ws/incidents` — browser clients connect here and receive live push when new incidents are created by the ingestion pipeline. |
| **Broadcast on ingest** | `post_ingest_hook` now calls `broadcast_from_thread()` after grouping new incidents, sending `{"type": "incident_update", "incident_ids": [...]}` to all connected clients. |

---

### Frontend (React — `sentinel-ui/`)

#### API Layer

| File | What it does |
|---|---|
| `src/api/client.ts` | Shared Axios instance — base URL from `VITE_API_BASE_URL`, 30 s timeout, error-normalising response interceptor (network errors and FastAPI `detail` strings surfaced as plain `Error.message`). |
| `src/api/api.ts` | All 20 API functions mapped to correct backend paths. Every function is `async/await` and throws on failure. |
| `src/api/websocket.ts` | Auto-reconnecting WebSocket client with 25 s keepalive pings. Exported as singleton `sentinelWs`. |
| `src/main.tsx` | Calls `sentinelWs.connect()` once at app startup. |

#### API Functions (`src/api/api.ts`)

| Function | Method | Endpoint |
|---|---|---|
| `getStats()` | GET | `/api/stats/enhanced` |
| `getIncidents(params?)` | GET | `/api/incidents` |
| `getIncidentDetail(id)` | GET | `/api/incidents/{id}` |
| `resolveIncident(id)` | PATCH | `/api/incidents/{id}/resolve` |
| `getRca(id)` | GET | `/api/incidents/{id}/rca` |
| `triggerRca(id)` | POST | `/api/incidents/{id}/rca` |
| `getRcaHistory(id)` | GET | `/api/incidents/{id}/rca/history` |
| `getFix(id)` | GET | `/api/incidents/{id}/fix` |
| `triggerFix(id)` | POST | `/api/incidents/{id}/fix` |
| `getLogs(params?)` | GET | `/api/logs` |
| `getLogsByTrace(traceId)` | GET | `/api/logs/trace/{traceId}` |
| `getServicesHealth()` | GET | `/api/services/health` |
| `getHealingEvents()` | GET | `/api/healing/events` |
| `triggerAction(body)` | POST | `/api/actions/trigger` |
| `getEngineActions()` | GET | `/api/engine/actions` |
| `getEngineAudit()` | GET | `/api/engine/audit` |
| `getEngineMode()` | GET | `/api/engine/mode` |
| `setEngineMode(mode)` | PATCH | `/api/engine/mode` |
| `getInfraMetrics()` | GET | `/api/infra/metrics` |
| `getInfraUptime()` | GET | `/api/infra/uptime` |

#### Hooks & Types

| File | What it does |
|---|---|
| `src/hooks/useApiCall.ts` | Generic data-fetching hook — returns `{ data, loading, error, refetch }`. Re-fetches when deps change. |
| `src/models/index.ts` | TypeScript types rewritten to match backend snake_case schema (`Incident`, `RcaResult`, `ServiceHealth`, `AuditEntry`, `InfraMetrics`, `HealingEvent`, etc.). |

#### Components — Live Data Wired

| Component | Data source | Features |
|---|---|---|
| **LiveTelemetry** | `/api/stats/enhanced`, `/api/incidents`, `/api/services/health`, `/api/healing/events` | Stat cards (open, critical, resolved, AI confidence, MTTR), incident table with severity badges, per-service health cards, healing timeline. Refreshes on WebSocket push. |
| **InvestigationDrawer** | `/api/incidents/{id}` (detail + logs + latest RCA) | Shows real incident metadata, error types, RCA root cause / confidence / recommended fix, attached logs. **Re-run Analysis** button calls `POST .../rca`. **Mark as Resolved** button calls `PATCH .../resolve`. |
| **HeuristicLogs** | `/api/logs`, `/api/logs/trace/{id}` | Live log stream with service and level filters. Trace pivot — enter a trace ID to isolate all logs for that trace. Error/warn rows highlighted. |
| **AutomatedActions** | `/api/engine/actions`, `/api/engine/audit`, `/api/engine/mode` | Action library cards with live success rates. Execution audit log with search. Autonomous / Human-in-the-loop mode toggle (persisted to DB). |
| **SystemHealth** | `/api/services/health`, `/api/infra/metrics`, `/api/infra/uptime` | Per-service deep-dive table (error rate, open incidents, status). CPU mini-chart, memory bar, disk I/O from metrics stub. 30-day uptime matrix colour-coded by outage severity. |

---

## Debugging

| Problem | Fix |
|---|---|
| **CORS error in browser** | Confirm the backend `CORS_ORIGINS` env var includes your frontend origin, or that the backend is running. |
| **422 Validation error** | FastAPI `detail` string is shown directly in the UI error banner — it tells you exactly which field failed. |
| **Network error / cannot reach backend** | The Axios interceptor shows "Cannot reach the Sentinel backend. Is it running on port 8000?" — start the backend with `uv run fastapi dev main.py` from `sentinel/`. |
| **WebSocket not connecting** | Open DevTools → Network → WS tab and check if the upgrade to `/ws/incidents` succeeds. Verify `VITE_WS_URL` in `.env.local`. |
| **Dashboard shows "—" everywhere** | The backend needs a PostgreSQL connection. Check `DB_HOST/NAME/USER/PASSWORD/PORT` env vars in `sentinel/.env` and run `migrations/schema.sql` before first start. |
| **No incidents / logs** | The ingestion pipeline polls `HACKATHON_BACKEND_URL` (default `localhost:5000`) for logs. Either start that service or POST manually to `POST /api/ingest/log`. |
