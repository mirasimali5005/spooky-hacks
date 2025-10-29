import React, { useEffect, useRef, useState } from 'react';

interface AudioPlayerDebugProps {
  audioBase64: string;
  mimeType?: string;
  lyrics: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export const AudioPlayerDebug: React.FC<AudioPlayerDebugProps> = ({ audioBase64, mimeType, lyrics, audioRef: externalAudioRef }) => {
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;
  const [audioInfo, setAudioInfo] = useState({
    canPlay: false,
    duration: 0,
    error: null as string | null,
    loadedData: false,
  });

  const detectedMimeType = mimeType || 'audio/wav';
  const audioSrc = `data:${detectedMimeType};base64,${audioBase64}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      console.log('✅ Audio can play!');
      setAudioInfo(prev => ({ ...prev, canPlay: true }));
    };

    const handleLoadedMetadata = () => {
      console.log('✅ Audio metadata loaded. Duration:', audio.duration);
      setAudioInfo(prev => ({ ...prev, duration: audio.duration, loadedData: true }));
    };

    const handleError = (e: Event) => {
      const target = e.target as HTMLAudioElement;
      const error = target.error;
      console.error('❌ Audio error:', error);
      setAudioInfo(prev => ({
        ...prev,
        error: error ? `Error ${error.code}: ${error.message}` : 'Unknown error'
      }));
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);

    // Try to load
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
    };
  }, [audioBase64, detectedMimeType]);

  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-5 rounded-lg border border-purple-500/50">
      <h3 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
        <span>🎤</span> AI Voice Performance
      </h3>

      <audio
        ref={audioRef}
        controls
        src={audioSrc}
        className="w-full rounded-lg mb-3"
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>

      {/* Debug Info */}
      <div className="bg-gray-900/50 p-3 rounded-md text-xs space-y-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={audioInfo.canPlay ? 'text-green-400' : 'text-yellow-400'}>
            {audioInfo.canPlay ? '✅' : '⏳'}
          </span>
          <span className="text-gray-400">Can Play: {audioInfo.canPlay ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={audioInfo.loadedData ? 'text-green-400' : 'text-yellow-400'}>
            {audioInfo.loadedData ? '✅' : '⏳'}
          </span>
          <span className="text-gray-400">
            Duration: {audioInfo.duration > 0 ? `${audioInfo.duration.toFixed(2)}s` : 'Unknown'}
          </span>
        </div>
        <div className="text-gray-400">Format: {detectedMimeType}</div>
        <div className="text-gray-400">Base64 Length: {audioBase64.length.toLocaleString()} chars</div>
        {audioInfo.error && (
          <div className="text-red-400 mt-2">
            ⚠️ Error: {audioInfo.error}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <p className="text-gray-400 text-xs">
          Generated with Gemini TTS
        </p>
        <a
          href={audioSrc}
          download="ai-rap-song.wav"
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md transition-colors"
        >
          ⬇️ Download Audio
        </a>
      </div>
    </div>
  );
};
