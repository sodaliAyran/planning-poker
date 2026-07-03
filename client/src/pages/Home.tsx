import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DeckType, RoomSummary } from '@poker/shared';
import socket from '../socket';
import { getClientId, getSavedName, getSavedAvatar, saveIdentity } from '../identity';
import AvatarPicker from '../components/AvatarPicker';
import DeckPicker from '../components/DeckPicker';
import { AVATARS } from '../avatarList';
import { DECK_LABELS } from '../deckLabels';

export default function Home() {
  const navigate = useNavigate();

  // Identity
  const [name, setName]     = useState(getSavedName());
  const [avatar, setAvatar] = useState(getSavedAvatar() || AVATARS[0].key);
  const [editingId, setEditingId] = useState(!getSavedName());

  // Room list
  const [rooms, setRooms]           = useState<RoomSummary[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [roomName, setRoomName]     = useState('');
  const [deck, setDeck]             = useState<DeckType>('fibonacci');
  const [autoReveal, setAutoReveal] = useState(false);
  const [creating, setCreating]     = useState(false);

  // Join by code
  const [joinCode, setJoinCode] = useState('');

  const identityReady = !!name.trim();

  const fetchRooms = useCallback(async () => {
    setLoadingRooms(true);
    try {
      const res  = await fetch('/api/rooms');
      const data = await res.json() as RoomSummary[];
      setRooms(data);
    } catch {
      // silently ignore network errors
    } finally {
      setLoadingRooms(false);
    }
  }, []);

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  function saveId() {
    if (!name.trim()) return;
    saveIdentity(name.trim(), avatar);
    setEditingId(false);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!identityReady) return;
    setCreating(true);
    saveIdentity(name.trim(), avatar);
    if (!socket.connected) socket.connect();
    socket.emit('room:create', {
      deckType: deck,
      roomName: roomName.trim(),
      hostName: name.trim(),
      avatar,
      clientId: getClientId(),
      autoReveal,
    }, (roomId) => {
      setCreating(false);
      navigate(`/room/${roomId}`);
    });
  }

  function handleJoinByCode(e: React.FormEvent) {
    e.preventDefault();
    if (!joinCode.trim()) return;
    // Accept full URLs or bare codes
    const match = joinCode.trim().match(/([A-Za-z0-9_-]{6,12})\s*$/);
    const code  = match ? match[1] : joinCode.trim();
    navigate(`/room/${code}`);
  }

  function handleJoinRoom(roomId: string) {
    navigate(`/room/${roomId}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Title */}
        <div className="text-center">
          <div className="text-5xl mb-2">🃏</div>
          <h1 className="text-3xl font-bold text-gray-900">Refinement Poker</h1>
          <p className="text-gray-500 text-sm mt-1">Internal planning tool — no account needed</p>
        </div>

        {/* ── Identity bar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700">Your identity</h2>
            {!editingId && (
              <button onClick={() => setEditingId(true)} className="text-xs text-indigo-500 hover:text-indigo-700">
                Edit
              </button>
            )}
          </div>

          {editingId ? (
            <div className="space-y-3">
              <input
                autoFocus
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                maxLength={30}
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <AvatarPicker selected={avatar} onChange={a => { setAvatar(a); }} />
              <button
                onClick={saveId}
                disabled={!name.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 font-semibold text-sm transition disabled:opacity-40"
              >
                Save identity
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <img src={`/avatars/${avatar}.svg`} alt={avatar} className="w-10 h-10 rounded-full border-2 border-indigo-200" />
              <span className="font-medium text-gray-800">{name}</span>
              <span className="text-xs text-gray-400 ml-auto">Used when you join or create rooms</span>
            </div>
          )}
        </div>

        {/* ── Actions row: Create + Join by code ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Create room */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-gray-700">Create a room</h2>

            {showCreate ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  type="text"
                  value={roomName}
                  onChange={e => setRoomName(e.target.value)}
                  placeholder="Room name (optional)"
                  maxLength={50}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Estimation scale</p>
                  <DeckPicker selected={deck} onChange={setDeck} />
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoReveal}
                    onChange={e => setAutoReveal(e.target.checked)}
                    className="w-4 h-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm text-gray-600">Auto-reveal when all voted</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 border border-gray-200 text-gray-500 rounded-xl py-2 text-sm hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating || !identityReady}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2 font-semibold text-sm transition disabled:opacity-40"
                  >
                    {creating ? 'Creating…' : 'Create →'}
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => { if (identityReady) setShowCreate(true); }}
                disabled={!identityReady}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + New Room
              </button>
            )}
            {!identityReady && (
              <p className="text-xs text-amber-500">Set your name above first</p>
            )}
          </div>

          {/* Join by code */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h2 className="font-semibold text-gray-700">Join by code</h2>
            <form onSubmit={handleJoinByCode} className="space-y-2">
              <input
                type="text"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value)}
                placeholder="Room code or URL"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                disabled={!joinCode.trim() || !identityReady}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Join →
              </button>
            </form>
            {!identityReady && (
              <p className="text-xs text-amber-500">Set your name above first</p>
            )}
          </div>
        </div>

        {/* ── Active rooms ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Active rooms</h2>
            <button
              onClick={fetchRooms}
              disabled={loadingRooms}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition disabled:opacity-40"
            >
              {loadingRooms ? 'Refreshing…' : '↻ Refresh'}
            </button>
          </div>

          {rooms.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              {loadingRooms ? 'Loading…' : 'No active rooms. Create one above!'}
            </p>
          ) : (
            <ul className="space-y-2">
              {rooms.map(r => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 transition"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 truncate">{r.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {DECK_LABELS[r.deckType]}
                      {' · '}
                      {r.participantCount} player{r.participantCount !== 1 ? 's' : ''}
                      {r.revealed && <span className="ml-1 text-amber-500">• revealed</span>}
                    </p>
                  </div>
                  <button
                    onClick={() => handleJoinRoom(r.id)}
                    disabled={!identityReady}
                    className="ml-4 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Join →
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
