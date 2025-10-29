import React from 'react';

export const voices = [
  { id: 'Puck', name: 'Hype Man' },
  { id: 'Fenrir', name: 'Deep Voice' },
  { id: 'Zephyr', name: 'Chill Lo-fi' },
  { id: 'Kore', name: 'Pop Star' },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      <h3 className="text-lg font-semibold text-gray-300 mb-3">Choose the Rapper's Voice:</h3>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {voices.map((voice) => (
          <button
            key={voice.id}
            onClick={() => onVoiceChange(voice.id)}
            className={`
              px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
              ${selectedVoice === voice.id
                ? 'bg-indigo-600 text-white shadow-md scale-105'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            {voice.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoiceSelector;