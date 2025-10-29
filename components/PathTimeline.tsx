import React from 'react';

interface PathTimelineProps {
  rapSongData: { lyrics: string; audioBase64: string } | null;
}

const PathTimeline: React.FC<PathTimelineProps> = ({ rapSongData }) => {
  console.log('PathTimeline rendered with rapSongData:', rapSongData);

  if (!rapSongData) {
    console.log('PathTimeline: No rapSongData, not rendering');
    return null;
  }

  const audioSrc = `data:audio/mpeg;base64,${rapSongData.audioBase64}`;
  console.log('PathTimeline: Rendering with lyrics and audio');

  return (
    <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-indigo-500/30">
      <h3 className="text-xl font-semibold text-indigo-400 mb-3">🎤 AI-Generated Rap Song</h3>
      <div className="bg-gray-800 p-4 rounded-md mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Lyrics:</h4>
        <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">{rapSongData.lyrics}</pre>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Audio:</h4>
        <audio controls src={audioSrc} className="w-full" />
      </div>
    </div>
  );
};

export default PathTimeline;
