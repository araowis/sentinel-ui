# Sentinel AI - API Requirements Specification

Based on the implemented frontend components and the **Sentinel AI Backend** schema, the following APIs are required to power the full functionality of the dashboard.

---

## 1. Core Ingestion — ✅ Implemented

| Endpoint | Method | Component | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `/api/event` | POST | Incident Stream | ✅ Exists | Route: `event.py` → `POST /event` |
| `/api/ingest/log` | POST | Heuristic Logs | ✅ Exists | Route: `ingestion.py` → `POST /ingest/log` |
| `/api/ingest/logs` | POST | Heuristic Logs | ✅ Exists | Route: `ingestion.py` → `POST /ingest/logs` |
| `/api/ingest/health` | GET | System Health | ✅ Exists | Route: `ingestion.py` → `GET /ingest/health` |

---

## 2. Dashboard & Telemetry APIs

| Feature Component | Endpoint | Method | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Stats Overview** | ~~`/api/stats/summary`~~ → `/api/stats` | GET | ✅ Path corrected | Exists in `incident.py`. Returns total/open/in_progress/resolved/critical/high counts. Missing: AI confidence %, MTTR. |
| **Active Incident Stream** | ~~`/api/incidents/active`~~ → `/api/incidents?status=OPEN` | GET | ✅ Path corrected | `GET /api/incidents` with `?status=OPEN` filter covers this. |
| **Microservice Health** | `/api/services/health` | GET | ❌ Missing | Not implemented. Needs: service name, status, latency (ms). |
| **Healing Timeline** | `/api/healing/events` | GET | ❌ Missing | Not implemented. Needs: action description, timestamp, status, type. |
| **Log Query** | ~~`/api/logs/query`~~ → `/logs` | GET | ✅ Path corrected | Exists in `logs.py` as `GET /logs` with `?level=` and `?service=` filters. Add `trace_id` filter. |

---

## 3. Incident Investigation & AI RCA

| Feature Component | Endpoint | Method | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Incident Detail** | `/api/incidents/{id}` | GET | ✅ Exists | Returns metadata + logs + latest RCA. |
| **AI Root Cause (RCA)** | `/api/incidents/{id}/rca` | GET | ✅ Exists | Returns latest RCA: root_cause, confidence, impact, recommended_fix, generated_at. |
| **Trigger RCA** | `/api/incidents/{id}/rca` | POST | ✅ Exists | Re-runs Claude RCA. |
| **RCA History** | `/api/incidents/{id}/rca/history` | GET | ✅ Exists | All RCA runs for an incident. |
| **Remediation Tracking** | ~~`/api/incidents/{id}/remedy`~~ → `/api/incidents/{id}/fix` | GET | ✅ Path corrected | Exists. Returns latest EventEnvelope (Slack/GitHub action taken). |
| **Trigger Fix** | `/api/incidents/{id}/fix` | POST | ✅ Exists | Runs fix generation. Requires prior RCA. |
| **Resolve Incident** | `/api/incidents/{id}/resolve` | PATCH | ✅ Exists | Marks incident RESOLVED. |
| **Manual Override / Action Trigger** | `/api/actions/trigger` | POST | ❌ Missing | Not implemented. Needs: target service, action type (Restart/Rollback), cluster ID. |

---

## 4. System Health & Infrastructure

| Feature Component | Endpoint | Method | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Global Topology** | `/api/infra/topology` | GET | ❌ Missing | Needs: region coordinates, status, inter-region latency. |
| **Resource Telemetry** | `/api/infra/metrics` | GET | ❌ Missing | Needs: CPU (time-series), Memory (GB), Disk I/O (MB/s). |
| **SLA Tracking** | `/api/infra/uptime` | GET | ❌ Missing | Needs: 30-day uptime matrix, incident markers, last remediation time. |

---

## 5. Automated Engine Control

| Feature Component | Endpoint | Method | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Action Library** | `/api/engine/actions` | GET | ❌ Missing | Needs: action name, description, success rate, last run, toggle status. |
| **Audit Log** | `/api/engine/audit` | GET | ❌ Missing | Needs: execution history, outcome (Success/Fail), validation type. |
| **Engine State** | `/api/engine/mode` | PATCH | ❌ Missing | Needs: current mode (Autonomous vs Human-in-the-loop). |

---

## Summary of Gaps — APIs to Build

### 🔴 Missing — must implement

| Priority | Endpoint | Method | Suggested Implementation |
| :--- | :--- | :--- | :--- |
| High | `/api/services/health` | GET | Aggregate `incidents` + `log_entries` by service in last N minutes; derive status from error rate. |
| High | `/api/healing/events` | GET | Read `remediation_actions` table (already populated by `store_fix`). Return action_type, status, triggered_at. |
| Medium | `/api/actions/trigger` | POST | Accept `{ service, action_type, cluster_id }`. Persist to `remediation_actions` with status TRIGGERED. |
| Medium | `/api/engine/actions` | GET | Static or DB-backed list of known action templates with success rate computed from `remediation_actions`. |
| Medium | `/api/engine/audit` | GET | Read full `remediation_actions` table with pagination. Already has: incident_id, action_type, status, triggered_at. |
| Medium | `/api/engine/mode` | PATCH | Simple config store (env var or DB row). Toggle Autonomous / Human-in-the-loop mode. |
| Low | `/api/infra/topology` | GET | Static config or env-driven region map; no DB table needed. |
| Low | `/api/infra/metrics` | GET | Stub or integrate Prometheus/system metrics. |
| Low | `/api/infra/uptime` | GET | Compute from `incidents` table: count by day over 30 days. |

### 🟡 Path corrections applied (API.md had wrong paths)

| Old path in API.md | Correct backend path | Source |
| :--- | :--- | :--- |
| `/api/stats/summary` | `/api/stats` | `incident.py` |
| `/api/incidents/active` | `/api/incidents?status=OPEN` | `incident.py` |
| `/api/incidents/{id}/remedy` | `/api/incidents/{id}/fix` | `incident.py` |
| `/api/logs/query` | `/logs` | `logs.py` |

### 🟢 Existing (no change needed)

`GET /api/health`, `GET /api/incidents`, `GET /api/incidents/{id}`, `GET/POST /api/incidents/{id}/rca`, `GET /api/incidents/{id}/rca/history`, `GET/POST /api/incidents/{id}/fix`, `PATCH /api/incidents/{id}/resolve`, `GET /api/stats`, `POST /event`, `POST /ingest/log`, `POST /ingest/logs`, `GET /ingest/health`, `GET /logs`

---

## `/api/stats` — Enhancement Needed

Current response:
```json
{ "total": 10, "open": 3, "in_progress": 2, "resolved": 5, "critical": 1, "high": 2 }
```

Required additions for the Stats Overview UI component:
- `avg_confidence` — average `confidence` from `rca_results`
- `mttr_minutes` — average time from `detected_at` to `resolved_at` in `incidents`
- `resolution_rate` — `resolved / total * 100`

---

## Integration Mappings (unchanged)

* The `EventEnvelope` from the OpenAPI spec maps directly to the **Active Incident Stream**:
    * `github.issue` → **Severity:** Warning
    * `github.pull_request` → **Action:** Git Integration
    * `slack.message` → **Action:** Slack Alert
* The **Healing Timeline** (`/api/healing/events`) maps directly to the `remediation_actions` table, already populated by `FixGenerationService` via `IncidentService.store_fix()`.