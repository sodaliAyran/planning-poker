import type { ParticipantDTO } from '@poker/shared';
import Card from './Card';

interface Props {
  participant: ParticipantDTO;
  revealed: boolean;
}

export default function ParticipantSeat({ participant, revealed }: Props) {
  const { name, avatar, hasVoted, vote, isHost, connected } = participant;

  return (
    <div className="flex flex-col items-center gap-1.5 w-20">
      {/* Crown for host */}
      {isHost && <span className="text-yellow-400 text-xs">👑</span>}

      {/* Avatar + connection indicator */}
      <div className="relative">
        <img
          src={`/avatars/${avatar}.svg`}
          alt={name}
          className={`w-12 h-12 rounded-full border-2 ${
            connected ? 'border-indigo-300' : 'border-gray-200 opacity-40'
          }`}
        />
        {/* voted glow ring */}
        {hasVoted && !revealed && (
          <span className="absolute inset-0 rounded-full ring-2 ring-green-400 animate-pulse" />
        )}
        {!connected && (
          <span className="absolute -bottom-1 -right-1 text-[10px] bg-gray-100 rounded-full px-1">💤</span>
        )}
      </div>

      {/* Card above avatar — compact size */}
      <div className="mt-1">
        {connected || hasVoted ? (
          <Card
            value={vote}
            revealed={revealed}
            size="sm"
          />
        ) : (
          <div className="w-10 h-14 rounded-xl border-2 border-dashed border-gray-200 opacity-40" />
        )}
      </div>

      {/* Name */}
      <span className="text-xs text-gray-600 font-medium text-center truncate w-full text-center leading-tight">
        {name}
      </span>
    </div>
  );
}
