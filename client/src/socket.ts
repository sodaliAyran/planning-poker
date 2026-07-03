import { io, Socket } from 'socket.io-client';
import type { ServerToClientEvents, ClientToServerEvents } from '@poker/shared';

// Single socket instance for the entire app lifetime
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  autoConnect: false,
  // In dev Vite proxies /socket.io → localhost:3001
  // In prod the server serves the client on the same origin
});

export default socket;
