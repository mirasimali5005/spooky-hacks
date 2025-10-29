import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerDebugProps {
  audioBase64: string;
  mimeType?: string;
  lyrics: string;
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export const AudioPlayerDebug: React.FC<AudioPlayerDebugProps> = ({ audioBase64, mimeType, lyrics, audioRef: externalAudioRef }) => {
  const internalAudioRef = useRef<HTMLAudioElement>(null);
  const audioRef = externalAudioRef || internalAudioRef;
  const [isPlaying, setIsPlaying] = useState(false);
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

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    // Try to load
    audio.load();

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioBase64, detectedMimeType]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-5 rounded-lg border border-primary/50">
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
        <span></span> AI Voice Performance
      </h3>

      {/* Big Play/Pause Button */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={togglePlayPause}
          disabled={!audioInfo.canPlay}
          className="bg-primary hover:bg-primary/80 disabled:bg-muted disabled:cursor-not-allowed text-white p-4 rounded-full transition-all shadow-lg hover:scale-105"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
        </button>
        <div className="flex-1">
          <p className="text-foreground font-semibold">
            {isPlaying ? '🎵 Now Playing...' : audioInfo.canPlay ? 'Click to Play AI Rap' : '⏳ Loading audio...'}
          </p>
          <p className="text-muted-foreground text-sm">
            {audioInfo.duration > 0 ? `Duration: ${audioInfo.duration.toFixed(1)}s` : 'Preparing audio...'}
          </p>
        </div>
      </div>

      <audio
        ref={audioRef}
        controls
        src={audioSrc}
        className="w-full rounded-lg mb-3"
        preload="metadata"
      >
        Your browser does not support the audio element.
      </audio>

      {/* Show errors if any */}
      {audioInfo.error && (
        <div className="bg-destructive/10 p-3 rounded-md mb-3">
          <div className="text-destructive text-sm">
            ⚠️ Error: {audioInfo.error}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-xs">
          Generated with Gemini TTS
        </p>
        <a
          href={audioSrc}
          download="ai-rap-song.wav"
          className="text-xs bg-primary hover:bg-primary/80 text-white px-3 py-1 rounded-md transition-colors"
        >
          Download Audio
        </a>
      </div>
    </div>
  );
};
