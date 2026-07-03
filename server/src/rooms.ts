import { nanoid } from 'nanoid';
import type { Room, Participant, RoomStateDTO, RoomSummary, DeckType } from '@poker/shared';

const rooms = new Map<string, Room>();

const GC_DELAY = 30 * 60 * 1000;
const gcTimers = new Map<string, ReturnType<typeof setTimeout>>();

function scheduleGC(roomId: string) {
  if (gcTimers.has(roomId)) clearTimeout(gcTimers.get(roomId)!);
  gcTimers.set(roomId, setTimeout(() => {
    const room = rooms.get(roomId);
    if (room && room.participants.filter(p => p.connected).length === 0) {
      rooms.delete(roomId);
    }
    gcTimers.delete(roomId);
  }, GC_DELAY));
}

export function createRoom(deckType: DeckType, name: string, autoReveal: boolean): Room {
  const id = nanoid(8);
  const room: Room = {
    id,
    name: name.trim() || id,
    deckType,
    revealed: false,
    autoReveal,
    participants: [],
    votes: {},
  };
  rooms.set(id, room);
  return room;
}

export function getRoom(id: string): Room | undefined {
  return rooms.get(id);
}

export function listRooms(): RoomSummary[] {
  return Array.from(rooms.values())
    .filter(r => r.participants.some(p => p.connected))
    .map(r => ({
      id: r.id,
      name: r.name,
      deckType: r.deckType,
      participantCount: r.participants.filter(p => p.connected).length,
      revealed: r.revealed,
    }));
}

export function addParticipant(room: Room, p: Participant): void {
  const existing = room.participants.find(x => x.id === p.id);
  if (existing) {
    existing.name = p.name;
    existing.avatar = p.avatar;
    existing.connected = true;
  } else {
    room.participants.push(p);
  }
}

export function removeParticipant(room: Room, clientId: string): void {
  const p = room.participants.find(x => x.id === clientId);
  if (!p) return;
  p.connected = false;

  if (p.isHost) {
    const next = room.participants.find(x => x.connected && x.id !== clientId);
    if (next) {
      p.isHost = false;
      next.isHost = true;
    }
  }

  const anyConnected = room.participants.some(x => x.connected);
  if (!anyConnected) scheduleGC(room.id);
}

export function castVote(room: Room, clientId: string, value: string): void {
  room.votes[clientId] = value;
}

export function reveal(room: Room): void {
  room.revealed = true;
}

export function reset(room: Room): void {
  room.revealed = false;
  room.votes = {};
}

export function setAutoReveal(room: Room, enabled: boolean): void {
  room.autoReveal = enabled;
}

export function allConnectedVoted(room: Room): boolean {
  const connected = room.participants.filter(p => p.connected);
  return connected.length > 0 && connected.every(p => room.votes[p.id] !== undefined);
}

export function toDTO(room: Room): RoomStateDTO {
  return {
    id: room.id,
    name: room.name,
    deckType: room.deckType,
    revealed: room.revealed,
    autoReveal: room.autoReveal,
    participants: room.participants.map(p => ({
      ...p,
      hasVoted: room.votes[p.id] !== undefined,
      vote: room.revealed ? (room.votes[p.id] ?? null) : null,
    })),
  };
}
