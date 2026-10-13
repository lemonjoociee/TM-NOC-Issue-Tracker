import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { parseSharePointWorkbook, SHAREPOINT_DOWNLOAD_URL, SHAREPOINT_DIRECT_LINK } from './src/utils/sharepointLiveParser';
import { Issue, MonthlySummary } from './src/types/issue';
import { INITIAL_ISSUES } from './src/data/initialIssues';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

interface LiveCache {
  issues: Issue[];
  summaries: MonthlySummary[];
  lastSyncTime: string;
  lastSyncIso: string;
  totalIssues: number;
  status: 'synced' | 'syncing' | 'error';
  error: string | null;
}

// Initial cache with fallback data
let liveCache: LiveCache = {
  issues: INITIAL_ISSUES,
  summaries: [],
  lastSyncTime: 'Initial Baseline',
  lastSyncIso: new Date().toISOString(),
  totalIssues: INITIAL_ISSUES.length,
  status: 'synced',
  error: null,
};

let currentSharePointUrl = SHAREPOINT_DIRECT_LINK;

function getDownloadUrl(webUrl: string): string {
  try {
    const u = new URL(webUrl);
    u.searchParams.set('download', '1');
    return u.toString();
  } catch {
    return SHAREPOINT_DOWNLOAD_URL;
  }
}

// Connected SSE clients for instant live push
const sseClients = new Set<express.Response>();

function broadcastSseUpdate() {
  const payload = JSON.stringify({
    type: 'sharepoint_update',
    issues: liveCache.issues,
    summaries: liveCache.summaries,
    lastSyncTime: liveCache.lastSyncTime,
    lastSyncIso: liveCache.lastSyncIso,
    totalIssues: liveCache.totalIssues,
    targetUrl: currentSharePointUrl,
  });

  for (const client of sseClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  }
}

/**
 * Downloads and parses the live SharePoint spreadsheet directly using cookie redirection
 */
async function fetchAndSyncSharePoint(): Promise<boolean> {
  try {
    liveCache.status = 'syncing';
    const downloadUrl = getDownloadUrl(currentSharePointUrl);

    // Step 1: Follow manual redirect to extract FedAuth authentication cookie
    const res1 = await fetch(downloadUrl, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
      },
    });

    const location = res1.headers.get('location');
    const setCookies = (res1.headers as any).getSetCookie
      ? (res1.headers as any).getSetCookie()
      : [res1.headers.get('set-cookie')].filter(Boolean);

    let fileBuffer: Buffer | null = null;

    if (location) {
      const nextUrl = location.startsWith('http') ? location : `https://scicommsc-my.sharepoint.com${location}`;
      const cookieHeader = setCookies.map((c: string) => c.split(';')[0]).join('; ');

      const res2 = await fetch(nextUrl, {
        headers: {
          Cookie: cookieHeader,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        },
      });

      if (!res2.ok) {
        throw new Error(`SharePoint download responded with status ${res2.status}: ${res2.statusText}`);
      }

      const arrayBuf = await res2.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else if (res1.ok) {
      const arrayBuf = await res1.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      throw new Error(`Failed initial redirect from SharePoint: status ${res1.status}`);
    }

    if (!fileBuffer || fileBuffer.length < 1000) {
      throw new Error('Downloaded file too small to be a valid Excel workbook.');
    }

    // Parse the live multi-sheet workbook
    const parsed = parseSharePointWorkbook(fileBuffer);

    if (parsed.issues.length > 0) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      liveCache = {
        issues: parsed.issues,
        summaries: parsed.summaries,
        lastSyncTime: `Live Sync ${timeStr}`,
        lastSyncIso: now.toISOString(),
        totalIssues: parsed.issues.length,
        status: 'synced',
        error: null,
      };
      console.log(`[SharePoint Sync] Synced ${parsed.issues.length} live issues at ${timeStr}`);
      broadcastSseUpdate();
      return true;
    }
  } catch (err: any) {
    console.error('[SharePoint Sync Error]', err?.message || err);
    liveCache.status = 'error';
    liveCache.error = err?.message || 'Sync failed';
  }
  return false;
}

// Initial sync on startup
fetchAndSyncSharePoint();

// Fast background real-time polling every 10 seconds
setInterval(() => {
  fetchAndSyncSharePoint();
}, 10000);

// API Routes
app.get('/api/sharepoint/live', (req, res) => {
  res.json({
    success: true,
    ...liveCache,
    targetUrl: currentSharePointUrl,
  });
});

// Server-Sent Events (SSE) for instantaneous push updates when SharePoint changes
app.get('/api/sharepoint/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current state immediately
  res.write(
    `data: ${JSON.stringify({
      type: 'initial_state',
      issues: liveCache.issues,
      summaries: liveCache.summaries,
      lastSyncTime: liveCache.lastSyncTime,
      lastSyncIso: liveCache.lastSyncIso,
      totalIssues: liveCache.totalIssues,
      targetUrl: currentSharePointUrl,
    })}\n\n`
  );

  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

app.post('/api/sharepoint/refresh', async (req, res) => {
  const ok = await fetchAndSyncSharePoint();
  res.json({
    success: ok,
    ...liveCache,
    targetUrl: currentSharePointUrl,
  });
});

app.post('/api/sharepoint/config', async (req, res) => {
  const { url } = req.body;
  if (url && typeof url === 'string') {
    currentSharePointUrl = url.trim();
    console.log(`[SharePoint Config] Updated target link to: ${currentSharePointUrl}`);
    const ok = await fetchAndSyncSharePoint();
    return res.json({
      success: ok,
      targetUrl: currentSharePointUrl,
      ...liveCache,
    });
  }
  res.status(400).json({ error: 'Invalid URL provided' });
});

app.get('/api/sharepoint/status', (req, res) => {
  res.json({
    connected: true,
    targetUrl: currentSharePointUrl,
    status: liveCache.status,
    lastSyncTime: liveCache.lastSyncTime,
    lastSyncIso: liveCache.lastSyncIso,
    totalIssues: liveCache.totalIssues,
    error: liveCache.error,
  });
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TM NOC Issue Tracker server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
