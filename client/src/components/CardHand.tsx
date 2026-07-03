interface Props {
  cards: string[];
  selected: string | null;
  onSelect: (value: string) => void;
  disabled?: boolean;
}

export default function CardHand({ cards, selected, onSelect, disabled }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-2">
      {cards.map(value => (
        <button
          key={value}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(value)}
          className={`
            w-12 h-16 sm:w-14 sm:h-20 rounded-xl border-2 font-bold text-sm
            flex items-center justify-center transition-all duration-150
            focus:outline-none focus:ring-2 focus:ring-indigo-400
            ${selected === value
              ? 'bg-indigo-600 text-white border-indigo-600 scale-110 shadow-lg shadow-indigo-300/50 -translate-y-2'
              : 'bg-white text-indigo-700 border-indigo-200 hover:border-indigo-400 hover:scale-105 hover:-translate-y-1'}
            disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:translate-y-0
          `}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
