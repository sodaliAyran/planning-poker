import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import type { ServerToClientEvents, ClientToServerEvents } from '@poker/shared';
import { registerHandlers } from './socket.js';
import { listRooms } from './rooms.js';

const PORT = parseInt(process.env.PORT ?? '3001', 10);
const isProd = process.env.NODE_ENV === 'production';

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  ...(isProd ? {} : { cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] } }),
});

// Room list API
app.get('/api/rooms', (_req, res) => {
  res.json(listRooms());
});

// Serve built client in production
if (isProd) {
  // process.cwd() is the workspace root; works regardless of compiled file depth
  const clientDist = path.resolve(process.cwd(), 'client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

io.on('connection', socket => registerHandlers(io, socket));

httpServer.listen(PORT, () => {
  console.log(`🃏  Refinement Poker server running on http://localhost:${PORT}`);
});
