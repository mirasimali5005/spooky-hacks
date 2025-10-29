import React from 'react';
import { WikiPathStep } from '../services/geminiService';
import { Spinner } from './Spinner';

interface WikiPathDisplayProps {
  path: WikiPathStep[];
}

export const WikiPathDisplay: React.FC<WikiPathDisplayProps> = ({ path }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-6 gap-y-4 items-start justify-center bg-gray-900/70 p-4 rounded-lg border border-slate-700">
      {path.map((item, index) => (
        <React.Fragment key={item.topic}>
          <div className="flex flex-col items-center gap-2 text-center animate-fade-in w-full">
            <div className="w-full aspect-square bg-slate-800 rounded-lg flex items-center justify-center overflow-hidden border border-slate-700 shadow-md">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.topic} 
                  className="w-full h-full object-cover animate-fade-in" 
                />
              ) : (
                <Spinner />
              )}
            </div>
            <a 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-indigo-300 hover:text-indigo-100 font-semibold text-sm break-words"
            >
              {item.topic}
            </a>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};