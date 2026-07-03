export type DeckType = 'fibonacci' | 'modifiedFib' | 'tshirt' | 'powersOfTwo' | 'linear';

export interface Participant {
  id: string;        // stable clientId from localStorage
  name: string;
  avatar: string;    // e.g. "cat", "dog", "bird"
  isHost: boolean;
  connected: boolean;
}

// Server-internal (never serialised pre-reveal)
export interface Room {
  id: string;
  name: string;
  deckType: DeckType;
  revealed: boolean;
  autoReveal: boolean;
  participants: Participant[];
  votes: Record<string, string>;
}

// Sanitised projection sent to clients
export interface ParticipantDTO extends Participant {
  hasVoted: boolean;
  vote: string | null; // non-null only when revealed
}

export interface RoomStateDTO {
  id: string;
  name: string;
  deckType: DeckType;
  revealed: boolean;
  autoReveal: boolean;
  participants: ParticipantDTO[];
}

// Brief summary for the lobby room list
export interface RoomSummary {
  id: string;
  name: string;
  deckType: DeckType;
  participantCount: number;
  revealed: boolean;
}

// ---- Socket event payloads ----

export interface RoomCreatePayload {
  deckType: DeckType;
  roomName: string;    // room display name (may be empty — falls back to ID)
  hostName: string;    // host participant's display name
  avatar: string;
  clientId: string;
  autoReveal: boolean;
}

export interface RoomJoinPayload {
  roomId: string;
  name: string;
  avatar: string;
  clientId: string;
}

export interface VoteCastPayload {
  value: string;
}

export interface AutoRevealPayload {
  enabled: boolean;
}

export interface ErrorPayload {
  message: string;
}

// Discriminated map for socket typing
export interface ServerToClientEvents {
  'room:state': (state: RoomStateDTO) => void;
  'error': (err: ErrorPayload) => void;
}

export interface ClientToServerEvents {
  'room:create': (payload: RoomCreatePayload, ack: (roomId: string) => void) => void;
  'room:join': (payload: RoomJoinPayload, ack: (ok: boolean) => void) => void;
  'vote:cast': (payload: VoteCastPayload) => void;
  'reveal': () => void;
  'reset': () => void;
  'settings:autoReveal': (payload: AutoRevealPayload) => void;
}
