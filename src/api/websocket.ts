/**
 * WebSocket client for live incident updates.
 *
 * Usage
 * ─────
 *   sentinelWs.connect();
 *
 *   sentinelWs.on('incident_update', (data) => {
 *     console.log('New incidents:', data.incident_ids);
 *   });
 *
 * The backend broadcasts:
 *   { "type": "incident_update", "incident_ids": ["<uuid>", ...] }
 *
 * Debugging WebSocket issues
 * ─────────────────────────
 * 1. Ensure the backend is running and /ws/incidents is reachable.
 * 2. Check browser DevTools → Network → WS tab to inspect frames.
 * 3. If you see a CORS error on the WS upgrade, verify CORS_ORIGINS env var
 *    on the backend includes your frontend origin.
 * 4. The client auto-reconnects every 3 s after a disconnect.
 */

type MessageHandler = (data: unknown) => void;

const WS_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws/incidents';

class SentinelWebSocketClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, Set<MessageHandler>>();
  private shouldReconnect = true;
  private pingInterval: ReturnType<typeof setInterval> | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(WS_URL);
    } catch (e) {
      console.warn('[WS] Failed to create WebSocket:', e);
      this._scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      console.info('[WS] Connected to Sentinel backend');
      // Send periodic pings to keep the connection alive through proxies
      this.pingInterval = setInterval(() => {
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25_000);
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data as string) as { type: string; [key: string]: unknown };
        if (msg.type === 'ping') return; // server-side keepalive, ignore
        const handlers = this.handlers.get(msg.type);
        handlers?.forEach((h) => h(msg));
      } catch {
        // Non-JSON frames (e.g. raw pings) — ignore silently
      }
    };

    this.ws.onerror = () => {
      console.warn('[WS] Connection error — will retry');
    };

    this.ws.onclose = () => {
      if (this.pingInterval) clearInterval(this.pingInterval);
      if (this.shouldReconnect) this._scheduleReconnect();
    };
  }

  private _scheduleReconnect(): void {
    setTimeout(() => {
      if (this.shouldReconnect) this.connect();
    }, 3_000);
  }

  on(type: string, handler: MessageHandler): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.pingInterval) clearInterval(this.pingInterval);
    this.ws?.close();
  }
}

export const sentinelWs = new SentinelWebSocketClient();
