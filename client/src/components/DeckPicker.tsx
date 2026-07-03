import type { DeckType } from '@poker/shared';
import { DECK_LABELS } from '../deckLabels';

interface Props {
  selected: DeckType;
  onChange: (d: DeckType) => void;
  disabled?: boolean;
}

const DECK_TYPES: DeckType[] = ['fibonacci', 'modifiedFib', 'tshirt', 'powersOfTwo', 'linear'];

export default function DeckPicker({ selected, onChange, disabled }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {DECK_TYPES.map(d => (
        <button
          key={d}
          type="button"
          disabled={disabled}
          onClick={() => onChange(d)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
            ${selected === d
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {DECK_LABELS[d]}
        </button>
      ))}
    </div>
  );
}
