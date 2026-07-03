import type { ParticipantDTO } from '@poker/shared';
import ParticipantSeat from './ParticipantSeat';

interface Props {
  participants: ParticipantDTO[];
  revealed: boolean;
}

export default function Table({ participants, revealed }: Props) {
  // Split participants around an oval: top half and bottom half
  const mid = Math.ceil(participants.length / 2);
  const top    = participants.slice(0, mid);
  const bottom = participants.slice(mid);

  return (
    <div className="relative flex flex-col items-center gap-6 py-4">
      {/* Top row */}
      <div className="flex gap-6 justify-center flex-wrap">
        {top.map(p => (
          <ParticipantSeat key={p.id} participant={p} revealed={revealed} />
        ))}
      </div>

      {/* Oval table */}
      <div className="relative flex items-center justify-center
                      w-64 h-28 bg-emerald-700 rounded-[50%] shadow-xl
                      border-4 border-emerald-600">
        <span className="text-emerald-300 font-semibold text-sm tracking-wide select-none">
          🃏 Refinement Poker
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex gap-6 justify-center flex-wrap">
        {bottom.map(p => (
          <ParticipantSeat key={p.id} participant={p} revealed={revealed} />
        ))}
      </div>
    </div>
  );
}
