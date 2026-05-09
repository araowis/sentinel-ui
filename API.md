# Sentinel AI - API Requirements Specification

Based on the implemented frontend components and the **Sentinel AI Backend** schema, the following APIs are required to power the full functionality of the dashboard.

## 1. Core Ingestion (Existing in OpenAPI)
These APIs handle the data flow into the Sentinel AI Backend from external sources (GitHub, Slack).

| Endpoint | Method | Component | Purpose |
| :--- | :--- | :--- | :--- |
| `/api/event` | POST | Incident Stream | Receives raw events from integrations to generate incidents. |
| `/api/ingest/log` | POST | Heuristic Logs | Ingests atomic system logs for analysis. |
| `/api/ingest/logs` | POST | Heuristic Logs | Batch ingestion for high-throughput log streams. |
| `/api/ingest/health` | GET | System Health | Basic connectivity check for the ingestion layer. |

## 2. Dashboard & Telemetry APIs (Required for UI)
These APIs are needed to populate the main dashboard views.

| Feature Component | Endpoint Requirement | Required Data Fields |
| :--- | :--- | :--- |
| **Stats Overview** | `GET /api/stats/summary` | Open incident count, resolution rates, AI confidence %, MTTR metrics. |
| **Microservice Health** | `GET /api/services/health` | Service name, status (Stable/Degraded), icon type, latency (ms). |
| **Active Incident Stream** | `GET /api/incidents/active` | Incident ID, timestamp, service name, error type, severity, status. |
| **Healing Timeline** | `GET /api/healing/events` | Action description, timestamp, status (Success/Pending), type. |

## 3. Incident Investigation & AI RCA
Required for the detail drawer and deep-dive analysis.

| Feature Component | Endpoint Requirement | Required Data Fields |
| :--- | :--- | :--- |
| **AI Root Cause (RCA)** | `GET /api/incidents/{id}/rca` | Analysis text, confidence score, impact score, timestamp. |
| **Remediation Tracking** | `GET /api/incidents/{id}/remedy` | List of actions taken (Slack, GitHub), status, timestamps. |
| **Log Correlation** | `GET /api/logs/query` | Filtered logs (by Trace ID or Service), level, anomaly flag. |
| **Manual Override** | `POST /api/actions/trigger` | Target service, action type (Restart, Rollback), cluster ID. |

## 4. System Health & Infrastructure
Powering the global map and resource gauges.

| Feature Component | Endpoint Requirement | Required Data Fields |
| :--- | :--- | :--- |
| **Global Topology** | `GET /api/infra/topology` | Active region coordinates, status, inter-region latency. |
| **Resource Telemetry** | `GET /api/infra/metrics` | CPU load (time-series), Memory usage (GB), Disk I/O (MB/s). |
| **SLA Tracking** | `GET /api/infra/uptime` | 30-day uptime matrix, incident markers, last remediation time. |

## 5. Automated Engine Control
Management of the AI remediation rules.

| Feature Component | Endpoint Requirement | Required Data Fields |
| :--- | :--- | :--- |
| **Action Library** | `GET /api/engine/actions` | Action name, description, success rate, last run time, toggle status. |
| **Audit Log** | `GET /api/engine/audit` | Execution history, outcome (Success/Fail), validation type (Canary/Auto). |
| **Engine State** | `PATCH /api/engine/mode` | Current mode (Autonomous vs Human-in-the-loop). |

---

## Integration Mappings (Sentinel AI Backend)

* The `EventEnvelope` from the OpenAPI spec maps directly to the **Active Incident Stream**:
    * `github.issue` -> **Severity:** Warning
    * `github.pull_request` -> **Action:** Git Integration
    * `slack.message` -> **Action:** Slack Alert
* The **System Health** markers on the global map should be driven by the `GithubRepository` status if tied to deployment regions.

---

## Project Status Summary

I've completed the application build. Highlights include:

* **Polished UI:** Implemented the Sentinel AI dashboard with a high-end "Cyber-Ops" aesthetic, including glassmorphism, neon accents, and dark-mode styling.
* **Navigation System:** Fully functional Sidebar and Topbar for switching between Live Telemetry, Heuristic Logs, Automated Actions, and System Health.
* **Incident Investigation:** Smooth, slide-in Investigation Drawer (using `motion/react`) featuring AI Root Cause Analysis and Monospace System Logs.
* **Live Telemetry:** Real-time incident table, microservice health cards, and AI Healing Engine timeline.
* **Heuristic Logs:** Terminal-style viewer with AI "Heuristic Match" highlights and trace ID filtering.
* **Automated Actions:** Action library with success rate tracking and an Execution Audit Log.
* **System Health:** Global infrastructure map with resource telemetry gauges and an SLA uptime matrix.v