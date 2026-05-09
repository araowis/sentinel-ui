# Backend Integration Guide

To connect your backend to the **Sentinel AI Dashboard** with minimal friction, follow these steps.

## 1. Environment Configuration
Create a `.env` file in the root of the project (if it doesn't exist) and point `VITE_API_BASE_URL` to your backend:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api/v1
```

## 2. CORS Setup (Critical)
Since the dashboard runs on a different port (typically 3000), your backend **must** allow Cross-Origin Resource Sharing from the dashboard's URL.

**Fast fix for Express/Node.js:**
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-preview-url.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

## 3. Data Schema Alignment
The dashboard expects specific JSON structures defined in `src/models/index.ts`. 

**Minimal Friction Tip:** 
If you can't change your backend schema easily, wrap the `sentinelApi` methods in `src/api.ts` with a simple mapping function:

```typescript
// Example in src/api.ts
getIncidents: async (): Promise<Incident[]> => {
  const { data } = await apiClient.get('/your-legacy-endpoint');
  return data.map((item: any) => ({
    id: item.uuid,           // Map your backend keys to Sentinel keys
    timestamp: item.created,
    service: item.origin,
    severity: item.level,
    status: item.state
  }));
}
```

## 4. Real-time Log Streaming (Optional)
Currently, the `HeuristicLogs` component polls via API. To upgrade to real-time:
1. Implement a **WebSocket** or **Server-Sent Events (SSE)** endpoint in your backend.
2. Update `HeuristicLogs.tsx` to use a `useEffect` hook that listens to your stream instead of calling `getLogs`.

## 5. Deployment
When you deploy the dashboard:
1. Ensure `VITE_API_BASE_URL` is set in your CI/CD environment variables.
2. The `npm run build` command will bake this URL into the static assets.