
import React, { useState } from 'react';

interface LyricsDisplayProps {
  lyrics: string;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lyrics }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const handleCopy = () => {
    navigator.clipboard.writeText(lyrics).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  return (
    <div className="relative group">
      <pre className="whitespace-pre-wrap bg-gray-900/70 p-6 rounded-lg font-mono text-slate-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto border border-slate-700">
        {lyrics}
      </pre>
      <button 
        onClick={handleCopy}
        className="absolute top-3 right-3 bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white px-3 py-1 text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};
