import React from 'react';

export interface Voice {
  id: string;
  name: string;
  description: string;
}

export const GEMINI_VOICES: Voice[] = [
  { id: 'kore', name: 'Kore', description: 'Warm and friendly' },
  { id: 'puck', name: 'Puck', description: 'Playful and energetic' },
  { id: 'charon', name: 'Charon', description: 'Deep and resonant' },
  { id: 'fenrir', name: 'Fenrir', description: 'Bold and powerful' },
  { id: 'aoede', name: 'Aoede', description: 'Melodic and smooth' },
  { id: 'leda', name: 'Leda', description: 'Clear and articulate' },
  { id: 'orus', name: 'Orus', description: 'Rich and expressive' },
  { id: 'zephyr', name: 'Zephyr', description: 'Light and airy' },
];

interface VoiceSelectorProps {
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange }) => {
  return (
    <div className="mb-4">
      <label htmlFor="voice-select" className="block text-sm font-semibold text-gray-300 mb-2">
        🎤 Select AI Voice
      </label>
      <select
        id="voice-select"
        value={selectedVoice}
        onChange={(e) => onVoiceChange(e.target.value)}
        className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {GEMINI_VOICES.map((voice) => (
          <option key={voice.id} value={voice.id}>
            {voice.name} - {voice.description}
          </option>
        ))}
      </select>
    </div>
  );
};
