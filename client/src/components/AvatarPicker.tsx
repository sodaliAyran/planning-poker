import { AVATARS } from '../avatarList';

interface Props {
  selected: string;
  onChange: (key: string) => void;
}

export default function AvatarPicker({ selected, onChange }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {AVATARS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          title={label}
          onClick={() => onChange(key)}
          className={`
            flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all
            ${selected === key
              ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105'
              : 'border-transparent bg-white hover:border-indigo-200 hover:bg-indigo-50'}
          `}
        >
          <img src={`/avatars/${key}.svg`} alt={label} className="w-12 h-12" />
          <span className="text-[10px] text-gray-500 font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
