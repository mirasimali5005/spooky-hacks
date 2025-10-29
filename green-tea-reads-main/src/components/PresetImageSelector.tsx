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
    path: '/performative selection images/Beabadoobee.png',
  },
  {
    id: 'clairo',
    name: 'Clairo',
    displayName: 'Clairo',
    path: '/performative selection images/Clairo.png',
  },
  {
    id: 'labubu',
    name: 'Labubu',
    displayName: 'Labubu',
    path: '/performative selection images/Labubu.png',
  },
  {
    id: 'matcha',
    name: 'Matcha',
    displayName: 'Matcha',
    path: '/performative selection images/Matcha.png',
  },
  {
    id: 'jorts',
    name: 'Jorts',
    displayName: 'Jorts',
    path: '/performative selection images/Jorts.png',
  },
  {
    id: 'keychains',
    name: 'Keychains',
    displayName: 'Keychains',
    path: '/performative selection images/Keychains,ong.jpg',
  },
  {
    id: 'tote-bags',
    name: 'Tote Bags',
    displayName: 'Tote Bags',
    path: '/performative selection images/Tote bags.png',
  },
  {
    id: 'wired-headphones',
    name: 'Wired Headphones',
    displayName: 'Wired Headphones',
    path: '/performative selection images/Wired Headphones.png',
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
                  ? 'border-primary ring-2 ring-primary/50 scale-105 shadow-lg shadow-primary/50'
                  : 'border-primary/30 hover:border-primary/60 hover:scale-105'
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
                  <div class="w-full h-full bg-primary/20 flex items-center justify-center text-xs text-primary p-1 text-center">
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
        <div className="mt-3 p-3 bg-primary/20 rounded-lg border border-primary/50">
          <p className="text-sm text-primary">
            Selected: <span className="font-semibold">{selectedPreset.displayName}</span>
          </p>
        </div>
      )}
    </div>
  );
};
