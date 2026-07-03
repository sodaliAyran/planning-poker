import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socket from '../socket';
import { getClientId, getSavedName, getSavedAvatar, saveIdentity } from '../identity';
import { useRoom } from '../hooks/useRoom';
import { DECKS } from '../deckData';
import Table from '../components/Table';
import CardHand from '../components/CardHand';
import HostControls from '../components/HostControls';
import JoinModal from '../components/JoinModal';

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate   = useNavigate();
  const { room, error, castVote, revealVotes, resetRound, setAutoReveal } = useRoom(roomId);

  const [joined, setJoined]             = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;
    const name   = getSavedName();
    const avatar = getSavedAvatar();
    if (name && avatar) doJoin(name, avatar);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  // Reset selected card when a new round starts
  useEffect(() => {
    if (room && !room.revealed) setSelectedCard(null);
  }, [room?.revealed]);

  function doJoin(name: string, avatar: string) {
    if (joinedRef.current) return;
    joinedRef.current = true;
    saveIdentity(name, avatar);
    if (!socket.connected) socket.connect();
    socket.emit('room:join', {
      roomId: roomId!,
      name,
      avatar,
      clientId: getClientId(),
    }, (ok) => {
      if (ok) setJoined(true);
      else navigate('/');
    });
  }

  function handleVote(value: string) {
    setSelectedCard(value);
    castVote(value);
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-3">{error}</p>
          <button onClick={() => navigate('/')} className="text-indigo-600 hover:underline text-sm">
            ← Back to lobby
          </button>
        </div>
      </div>
    );
  }

  const me = room?.participants.find(p => p.id === getClientId());
  const isHost  = me?.isHost ?? false;
  const deckCards = room ? DECKS[room.deckType] : [];
  const roomUrl   = window.location.href;
  const roomTitle = room?.name && room.name !== roomId ? room.name : `Room ${roomId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      {!joined && !getSavedName() && (
        <JoinModal onJoin={doJoin} />
      )}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-sm text-gray-400 hover:text-gray-600">
            ← Lobby
          </button>
          <h1 className="text-lg font-bold text-gray-700">🃏 {roomTitle}</h1>
          <div className="w-16" />
        </div>

        {room ? (
          <>
            <Table participants={room.participants} revealed={room.revealed} />

            {isHost && (
              <HostControls
                room={room}
                onReveal={revealVotes}
                onReset={resetRound}
                onToggleAutoReveal={setAutoReveal}
                roomUrl={roomUrl}
              />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <p className="text-xs text-gray-500 mb-2 text-center">
                {room.revealed
                  ? 'Cards revealed — wait for the host to start a new round'
                  : selectedCard
                    ? `You voted: ${selectedCard} — tap another to change`
                    : 'Pick your card'}
              </p>
              <CardHand
                cards={deckCards}
                selected={selectedCard}
                onSelect={handleVote}
                disabled={room.revealed}
              />
            </div>

            {!isHost && (
              <div className="text-center">
                <button
                  onClick={() => navigator.clipboard.writeText(roomUrl)}
                  className="text-xs text-indigo-500 hover:text-indigo-700 transition"
                >
                  🔗 Copy invite link
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 animate-pulse text-sm">Connecting…</div>
          </div>
        )}
      </div>
    </div>
  );
}
