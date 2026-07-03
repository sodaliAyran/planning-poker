import type { Server, Socket } from 'socket.io';
import type {
  ServerToClientEvents, ClientToServerEvents,
  RoomCreatePayload, RoomJoinPayload, VoteCastPayload,
  AutoRevealPayload,
} from '@poker/shared';
import {
  createRoom, getRoom, addParticipant, removeParticipant,
  castVote, reveal, reset, setAutoReveal,
  allConnectedVoted, toDTO,
} from './rooms.js';

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type AppServer = Server<ClientToServerEvents, ServerToClientEvents>;

const socketToClient = new Map<string, { clientId: string; roomId: string }>();

function broadcast(io: AppServer, roomId: string) {
  const room = getRoom(roomId);
  if (!room) return;
  io.to(roomId).emit('room:state', toDTO(room));
}

export function registerHandlers(io: AppServer, socket: AppSocket) {

  socket.on('room:create', (payload: RoomCreatePayload, ack) => {
    const room = createRoom(payload.deckType, payload.roomName, payload.autoReveal);
    addParticipant(room, {
      id: payload.clientId,
      name: payload.hostName,
      avatar: payload.avatar,
      isHost: true,
      connected: true,
    });
    socket.join(room.id);
    socketToClient.set(socket.id, { clientId: payload.clientId, roomId: room.id });
    ack(room.id);
    broadcast(io, room.id);
  });

  socket.on('room:join', (payload: RoomJoinPayload, ack) => {
    const room = getRoom(payload.roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found.' });
      ack(false);
      return;
    }
    const isFirst = room.participants.length === 0;
    addParticipant(room, {
      id: payload.clientId,
      name: payload.name,
      avatar: payload.avatar,
      isHost: isFirst,
      connected: true,
    });
    socket.join(payload.roomId);
    socketToClient.set(socket.id, { clientId: payload.clientId, roomId: payload.roomId });
    ack(true);
    broadcast(io, payload.roomId);
  });

  socket.on('vote:cast', (payload: VoteCastPayload) => {
    const meta = socketToClient.get(socket.id);
    if (!meta) return;
    const room = getRoom(meta.roomId);
    if (!room || room.revealed) return;
    castVote(room, meta.clientId, payload.value);
    if (room.autoReveal && allConnectedVoted(room)) {
      reveal(room);
    }
    broadcast(io, meta.roomId);
  });

  socket.on('reveal', () => {
    const meta = socketToClient.get(socket.id);
    if (!meta) return;
    const room = getRoom(meta.roomId);
    if (!room) return;
    const participant = room.participants.find(p => p.id === meta.clientId);
    if (!participant?.isHost) return;
    reveal(room);
    broadcast(io, meta.roomId);
  });

  socket.on('reset', () => {
    const meta = socketToClient.get(socket.id);
    if (!meta) return;
    const room = getRoom(meta.roomId);
    if (!room) return;
    const participant = room.participants.find(p => p.id === meta.clientId);
    if (!participant?.isHost) return;
    reset(room);
    broadcast(io, meta.roomId);
  });

  socket.on('settings:autoReveal', (payload: AutoRevealPayload) => {
    const meta = socketToClient.get(socket.id);
    if (!meta) return;
    const room = getRoom(meta.roomId);
    if (!room) return;
    const participant = room.participants.find(p => p.id === meta.clientId);
    if (!participant?.isHost) return;
    setAutoReveal(room, payload.enabled);
    broadcast(io, meta.roomId);
  });

  socket.on('disconnect', () => {
    const meta = socketToClient.get(socket.id);
    if (!meta) return;
    socketToClient.delete(socket.id);
    const room = getRoom(meta.roomId);
    if (!room) return;
    removeParticipant(room, meta.clientId);
    broadcast(io, meta.roomId);
  });
}
