'use client';

import type { MapColorMode } from '@/lib/colors';

interface ModeOption {
  id: MapColorMode;
  label: string;
  description: string;
}

const modeOptions: ModeOption[] = [
  { id: 'production', label: 'Production', description: 'Total electricity generation' },
  { id: 'independence', label: 'Independence', description: 'Energy independence score' },
  { id: 'clean', label: 'Clean Energy', description: 'Clean energy percentage' },
];

interface MapModeSelectorProps {
  selected: MapColorMode;
  onChange: (mode: MapColorMode) => void;
}

export default function MapModeSelector({ selected, onChange }: MapModeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted mr-1">Color by:</span>
      <div className="flex gap-1">
        {modeOptions.map(mode => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            title={mode.description}
            className={`
              px-2.5 py-1 rounded-full text-xs transition-all
              ${
                selected === mode.id
                  ? 'bg-primary text-canvas'
                  : 'bg-inset text-muted hover:text-secondary hover:bg-inset'
              }
            `}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}
