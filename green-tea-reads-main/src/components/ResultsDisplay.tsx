import React from 'react';
import type { PathStep } from '../wikipathTypes';
import { ArrowDown } from 'lucide-react';
import { ImageWithLoader } from './ImageWithLoader';

interface ResultsDisplayProps {
  path: PathStep[];
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ path }) => {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-glow">The Connection Path</h2>
      <div className="relative flex flex-col items-center">
        {/* Decorative line */}
        <div className="absolute top-0 bottom-0 w-1 bg-border" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 0 }} />

        {path.map((step, index) => (
          <React.Fragment key={index}>
            <div className="w-full max-w-3xl bg-card rounded-xl shadow-lg my-4 z-10 border border-border flex flex-col sm:flex-row items-stretch overflow-hidden">
              <div className="w-full sm:w-1/3 h-48 sm:h-auto flex-shrink-0">
                <ImageWithLoader src={step.imageUrl} alt={step.subjectName} />
              </div>
              <div className="p-4 sm:p-6 flex-grow flex flex-col justify-center">
                <h3 className="text-2xl font-semibold text-foreground">{step.subjectName}</h3>
                {step.connectingLinkTitle && (
                  <div className="mt-2 text-md text-muted-foreground">
                    <span className="font-medium text-foreground">Link Clicked:</span>
                    <a
                      href={`https://en.wikipedia.org/wiki/${step.connectingLinkTitle.replace(/\s/g, '_')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      {step.connectingLinkTitle}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {index < path.length - 1 && (
              <div className="text-primary my-2 z-10">
                <ArrowDown className="w-8 h-8" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
