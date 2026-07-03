import type { RoomStateDTO } from '@poker/shared';
import { DECK_LABELS } from '../deckLabels';

interface Props {
  room: RoomStateDTO;
  onReveal: () => void;
  onReset: () => void;
  onToggleAutoReveal: (enabled: boolean) => void;
  roomUrl: string;
}

export default function HostControls({ room, onReveal, onReset, onToggleAutoReveal, roomUrl }: Props) {
  const { revealed, autoReveal, deckType } = room;
  const connected = room.participants.filter(p => p.connected);
  const votedCount = connected.filter(p => p.hasVoted).length;
  const allVoted = votedCount === connected.length && connected.length > 0;

  function copyLink() {
    navigator.clipboard.writeText(roomUrl);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-700 text-sm">Host Controls</h3>
        <button
          onClick={copyLink}
          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-50 transition"
        >
          🔗 Copy invite link
        </button>
      </div>

      {/* Voting status */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span>{votedCount}/{connected.length} voted</span>
        {allVoted && !revealed && (
          <span className="text-green-600 font-semibold">✓ Everyone voted!</span>
        )}
        <span className="ml-auto text-gray-400">Deck: <span className="font-medium text-gray-600">{DECK_LABELS[deckType]}</span></span>
      </div>

      {/* Primary action */}
      <div>
        {!revealed ? (
          <button
            onClick={onReveal}
            disabled={votedCount === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl
                       font-semibold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reveal Cards 👁
          </button>
        ) : (
          <button
            onClick={onReset}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl
                       font-semibold text-sm transition"
          >
            New Round ↺
          </button>
        )}
      </div>

      {/* Auto-reveal toggle */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={autoReveal}
            onChange={e => onToggleAutoReveal(e.target.checked)}
          />
          <div className={`w-10 h-6 rounded-full transition ${autoReveal ? 'bg-indigo-500' : 'bg-gray-300'}`} />
          <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                          ${autoReveal ? 'translate-x-4' : ''}`} />
        </div>
        <span className="text-sm text-gray-600">Auto-reveal when all voted</span>
      </label>
    </div>
  );
}
