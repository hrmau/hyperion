'use client';

interface YearSliderProps {
  years: number[];
  selected: number;
  onChange: (year: number) => void;
}

export default function YearSlider({ years, selected, onChange }: YearSliderProps) {
  const min = years[0];
  const max = years[years.length - 1];

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-secondary w-12">{min}</span>
      <div className="flex-1 relative">
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={selected}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-inset rounded-lg appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-0
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
      <span className="text-sm text-secondary w-12 text-right">{max}</span>
      <div className="ml-2 px-3 py-1 bg-inset rounded-lg">
        <span className="text-lg font-semibold text-primary">{selected}</span>
      </div>
    </div>
  );
}
