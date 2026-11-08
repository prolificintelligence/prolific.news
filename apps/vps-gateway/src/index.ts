import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';

const PORT = process.env.PORT || 8080;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Track client subscriptions by topic/room
const channelSubscriptions = new Map<string, Set<WebSocket>>();

// Redis pub/sub client
let redisSub: Redis | null = null;
let redisPub: Redis | null = null;

try {
  redisSub = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  redisPub = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });

  redisSub.on('message', (channel, message) => {
    broadcastToChannel(channel, message);
  });

  redisSub.connect().catch(() => {
    console.warn('[Redis] Operating in standalone in-memory mode without external Redis server');
  });
  redisPub.connect().catch(() => {});
} catch {
  console.warn('[Redis] Operating in standalone in-memory mode');
}

function broadcastToChannel(channel: string, message: string) {
  const clients = channelSubscriptions.get(channel);
  if (!clients) return;

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ channel, data: JSON.parse(message) }));
    }
  }
}

// WebSocket connection lifecycle
wss.on('connection', (ws: WebSocket) => {
  let subscribedChannels = new Set<string>();

  ws.on('message', (rawData) => {
    try {
      const msg = JSON.parse(rawData.toString());
      if (msg.action === 'subscribe' && msg.channel) {
        if (!channelSubscriptions.has(msg.channel)) {
          channelSubscriptions.set(msg.channel, new Set());
          if (redisSub && redisSub.status === 'ready') {
            redisSub.subscribe(msg.channel);
          }
        }
        channelSubscriptions.get(msg.channel)?.add(ws);
        subscribedChannels.add(msg.channel);
        ws.send(JSON.stringify({ status: 'subscribed', channel: msg.channel }));
      } else if (msg.action === 'unsubscribe' && msg.channel) {
        channelSubscriptions.get(msg.channel)?.delete(ws);
        subscribedChannels.delete(msg.channel);
      }
    } catch (err) {
      console.error('[WebSocket] Invalid message payload', err);
    }
  });

  ws.on('close', () => {
    for (const channel of subscribedChannels) {
      channelSubscriptions.get(channel)?.delete(ws);
    }
    subscribedChannels.clear();
  });
});

// HTTP Webhook for Inngest or Next.js to trigger a broadcast
app.post('/api/publish', async (req, res) => {
  const { channel, data } = req.body;
  if (!channel || !data) {
    return res.status(400).json({ error: 'channel and data required' });
  }

  const payloadStr = JSON.stringify(data);

  if (redisPub && redisPub.status === 'ready') {
    await redisPub.publish(channel, payloadStr);
  } else {
    // In-memory fallback
    broadcastToChannel(channel, payloadStr);
  }

  res.json({ success: true, channel, recipients: channelSubscriptions.get(channel)?.size || 0 });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    activeConnections: wss.clients.size,
    topicsTracked: channelSubscriptions.size,
  });
});

server.listen(PORT, () => {
  console.log(`[Prolific News VPS Gateway] Listening on port ${PORT}`);
});
