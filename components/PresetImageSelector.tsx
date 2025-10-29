import React from 'react';

export interface PresetImage {
  id: string;
  name: string;
  displayName: string;
  path: string;
  thumbnail?: string;
}

// Hardcoded preset images - add your images here!
export const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'beabadoobee',
    name: 'Beabadoobee',
    displayName: 'Beabadoobee',
    path: '/preset-images/Beabadoobee.png',
  },
  {
    id: 'clairo',
    name: 'Clairo',
    displayName: 'Clairo',
    path: '/preset-images/Clairo.png',
  },
  {
    id: 'labubu',
    name: 'Labubu',
    displayName: 'Labubu',
    path: '/preset-images/Labubu.png',
  },
  {
    id: 'matcha',
    name: 'Matcha',
    displayName: 'Matcha',
    path: '/preset-images/Matcha.png',
  },
  {
    id: 'jorts',
    name: 'Jorts',
    displayName: 'Jorts',
    path: '/preset-images/Jorts.png',
  },
  {
    id: 'keychains',
    name: 'Keychains',
    displayName: 'Keychains',
    path: '/preset-images/Keychains,ong.jpg',
  },
  {
    id: 'tote-bags',
    name: 'Tote bag',
    displayName: 'Tote Bags',
    path: '/preset-images/Tote bags.png',
  },
  {
    id: 'wired-headphones',
    name: 'Wired headphones',
    displayName: 'Wired Headphones',
    path: '/preset-images/Wired Headphones.png',
  },
];

interface PresetImageSelectorProps {
  title: string;
  selectedPreset: PresetImage | null;
  onSelect: (preset: PresetImage) => void;
  className?: string;
}

export const PresetImageSelector: React.FC<PresetImageSelectorProps> = ({
  title,
  selectedPreset,
  onSelect,
  className = '',
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-200 mb-3">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {PRESET_IMAGES.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            className={`
              relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200
              ${
                selectedPreset?.id === preset.id
                  ? 'border-indigo-500 ring-2 ring-indigo-400 scale-105 shadow-lg shadow-indigo-500/50'
                  : 'border-gray-600 hover:border-gray-400 hover:scale-105'
              }
            `}
            title={preset.displayName}
          >
            <img
              src={preset.path}
              alt={preset.displayName}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML = `
                  <div class="w-full h-full bg-gray-700 flex items-center justify-center text-xs text-gray-400 p-1 text-center">
                    ${preset.displayName}
                  </div>
                `;
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
              <p className="text-xs text-white font-medium truncate text-center">
                {preset.displayName}
              </p>
            </div>
          </button>
        ))}
      </div>
      {selectedPreset && (
        <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/50">
          <p className="text-sm text-indigo-300">
            Selected: <span className="font-semibold">{selectedPreset.displayName}</span>
          </p>
        </div>
      )}
    </div>
  );
};
