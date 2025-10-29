import React from 'react';
import { WikiPathResponse } from '../types';
import { ArrowRightIcon, ResetIcon, PlayIcon, PauseIcon } from './icons';

interface PathTimelineProps {
  pathData: WikiPathResponse;
  imageUrls: (string | null)[];
  onReset: () => void;
  rapSongData: { lyrics: string; audio: string } | null;
  onPlayRap: () => void;
  isPlayingRap: boolean;
}

const PathTimeline: React.FC<PathTimelineProps> = ({ pathData, imageUrls, onReset, rapSongData, onPlayRap, isPlayingRap }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">The Wikipedia Path</h1>
        <div className="flex items-center gap-4">
            {rapSongData?.audio && (
                 <button
                    onClick={onPlayRap}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors duration-300"
                >
                    {isPlayingRap ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                    {isPlayingRap ? 'Pause Rap' : 'Play Rap'}
                </button>
            )}
            <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-300"
            >
                <ResetIcon className="w-5 h-5"/>
                Start Over
            </button>
        </div>
      </div>

      {rapSongData?.lyrics && (
        <div className="mb-8 p-4 bg-gray-800 border-l-4 border-indigo-500 rounded-r-lg shadow-md animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">AI-Generated Rap Lyrics:</h3>
            <blockquote className="text-gray-300 italic whitespace-pre-wrap font-mono">
                {rapSongData.lyrics}
            </blockquote>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-4 lg:gap-0">
        {pathData.path.map((step, index) => (
          <React.Fragment key={step.pageid}>
            <div
              className="flex-shrink-0 group animate-fade-in-up"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="w-full lg:w-48 bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-indigo-500/30">
                <div className="h-48 bg-gray-700 flex items-center justify-center">
                    {imageUrls[index] ? (
                        <img src={imageUrls[index]!} alt={step.subjectName} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-gray-500">No Image</div>
                    )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-white truncate">{step.subjectName}</h3>
                  <a 
                    href={`https://en.wikipedia.org/wiki/${encodeURIComponent(step.wikipediaTitle)}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-indigo-400 hover:underline truncate"
                  >
                    {step.wikipediaTitle}
                  </a>
                </div>
              </div>
              {step.connectingLinkTitle && (
                 <div className="mt-2 text-center text-sm text-gray-400 hidden lg:block">
                    <p className="font-mono text-indigo-300">&darr;</p>
                    <p className="max-w-[12rem] mx-auto break-words">{step.connectingLinkTitle}</p>
                </div>
              )}
            </div>
            
            {index < pathData.path.length - 1 && (
              <div
                className="flex-grow flex items-center justify-center animate-fade-in"
                style={{ animationDelay: `${index * 200 + 100}ms` }}
              >
                 <div className="w-full h-px lg:h-auto lg:w-px bg-gray-700 my-4 lg:my-0"></div>
                 <ArrowRightIcon className="text-gray-600 w-8 h-8 mx-4 my-2 lg:my-0 transform lg:rotate-0 rotate-90" />
                 <div className="w-full h-px lg:h-auto lg:w-px bg-gray-700 my-4 lg:my-0"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default PathTimeline;