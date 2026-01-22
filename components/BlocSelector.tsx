'use client';

interface BlocOption {
  id: string;
  label: string;
}

const blocOptions: BlocOption[] = [
  { id: 'ALL', label: 'All' },
  { id: 'EU', label: 'EU' },
  { id: 'NATO', label: 'NATO' },
  { id: 'BRICS', label: 'BRICS+' },
  { id: 'G7', label: 'G7' },
  { id: 'G20', label: 'G20' },
  { id: 'OECD', label: 'OECD' },
  { id: 'ASEAN', label: 'ASEAN' },
  { id: 'THE_WEST', label: 'The West' },
  { id: 'GLOBAL_SOUTH', label: 'Global South' },
];

interface BlocSelectorProps {
  selected: string;
  onChange: (bloc: string) => void;
}

export default function BlocSelector({ selected, onChange }: BlocSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {blocOptions.map(bloc => (
        <button
          key={bloc.id}
          onClick={() => onChange(bloc.id)}
          className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-all
            ${
              selected === bloc.id
                ? 'bg-primary text-white shadow-sm'
                : 'bg-inset text-secondary hover:bg-gray-200'
            }
          `}
        >
          {bloc.label}
        </button>
      ))}
    </div>
  );
}
