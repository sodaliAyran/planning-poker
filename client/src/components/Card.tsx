interface Props {
  value: string | null; // null = face-down
  revealed: boolean;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const SIZE = {
  sm:  'w-10 h-14 text-xs',
  md:  'w-14 h-20 text-sm',
  lg:  'w-16 h-24 text-base',
};

export default function Card({ value, revealed, size = 'md', selected, onClick, disabled }: Props) {
  const showFront = revealed && value !== null;

  return (
    <div
      className={`perspective cursor-pointer select-none ${disabled ? 'pointer-events-none' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={`card-inner relative ${SIZE[size]} ${showFront ? 'flipped' : ''}`}>

        {/* Back face — shown while unrevealed */}
        <div
          className={`
            card-face absolute inset-0 rounded-xl border-2 flex items-center justify-center
            bg-gradient-to-br from-indigo-500 to-violet-600
            ${selected
              ? 'border-yellow-400 shadow-lg shadow-yellow-300/50 ring-2 ring-yellow-400'
              : 'border-indigo-400'}
          `}
        >
          <span className="text-white font-bold text-lg">🃏</span>
        </div>

        {/* Front face — revealed value */}
        <div
          className={`
            card-back card-face absolute inset-0 rounded-xl border-2 flex flex-col items-center justify-center
            bg-white border-indigo-300 shadow-md
          `}
        >
          <span className="font-bold text-indigo-700 leading-none" style={{ fontSize: size === 'sm' ? '0.7rem' : '1.1rem' }}>
            {value}
          </span>
        </div>

      </div>
    </div>
  );
}
