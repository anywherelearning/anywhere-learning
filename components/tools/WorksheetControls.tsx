'use client';

import type { LetterSize, LetterStyle } from '@/lib/tools/worksheet-engine';

/** Shared option controls used by every worksheet tool. */

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-semibold text-forest-dark">{label}</legend>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(opt.value)}
              className={`rounded-full border px-4 py-1.5 text-sm transition focus:outline-2 focus:outline-offset-2 focus:outline-forest ${
                selected
                  ? 'border-forest bg-forest font-semibold text-white'
                  : 'border-gray-300 bg-white text-gray-600 hover:border-forest/50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export interface WorksheetOptions {
  letterStyle: LetterStyle;
  letterSize: LetterSize;
  rowsPerLine: number;
  showMidline: boolean;
  modelFirst: boolean;
}

export default function WorksheetControls({
  options,
  onChange,
  maxRows = 8,
}: {
  options: WorksheetOptions;
  onChange: (options: WorksheetOptions) => void;
  maxRows?: number;
}) {
  return (
    <div className="space-y-5">
      <OptionGroup<LetterStyle>
        label="Letter style"
        value={options.letterStyle}
        options={[
          { value: 'pre-cursive', label: 'Beginner (pre-cursive)' },
          { value: 'print', label: 'Print' },
        ]}
        onChange={(letterStyle) => onChange({ ...options, letterStyle })}
      />

      <OptionGroup<LetterSize>
        label="Letter size"
        value={options.letterSize}
        options={[
          { value: 'large', label: 'Large' },
          { value: 'medium', label: 'Medium' },
          { value: 'small', label: 'Small' },
        ]}
        onChange={(letterSize) => onChange({ ...options, letterSize })}
      />

      <div>
        <label htmlFor="rows-per-line" className="mb-1.5 block text-sm font-semibold text-forest-dark">
          Practice rows: {options.rowsPerLine}
        </label>
        <input
          id="rows-per-line"
          type="range"
          min={1}
          max={maxRows}
          value={options.rowsPerLine}
          onChange={(e) => onChange({ ...options, rowsPerLine: Number(e.target.value) })}
          className="w-full accent-forest"
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.showMidline}
            onChange={(e) => onChange({ ...options, showMidline: e.target.checked })}
            className="size-4 accent-forest"
          />
          Dashed midline
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={options.modelFirst}
            onChange={(e) => onChange({ ...options, modelFirst: e.target.checked })}
            className="size-4 accent-forest"
          />
          Solid example first
        </label>
      </div>
    </div>
  );
}
