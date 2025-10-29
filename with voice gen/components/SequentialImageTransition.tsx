import React, { useState, useEffect } from 'react';
import ImageTileTransition from './ImageTileTransition';
import type { WikiPathResponse } from '../types';
import { ArrowRightIcon } from './icons';

interface SequentialImageTransitionProps {
  imageUrls: string[];
  pathData: WikiPathResponse;
  onComplete: () => void;
}

const SequentialImageTransition: React.FC<SequentialImageTransitionProps> = ({ imageUrls, pathData, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNextTransition = () => {
    if (currentIndex < imageUrls.length - 2) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };
  
  // Failsafe in case a transition hangs
  useEffect(() => {
    const timeout = setTimeout(() => {
        console.warn("Transition timed out. Force completing.");
        onComplete();
    }, (imageUrls.length -1) * 4000); // 4s per transition max
    return () => clearTimeout(timeout);
  }, [onComplete, imageUrls.length]);


  if (currentIndex >= imageUrls.length - 1) {
    return null;
  }
  
  const startSubject = pathData.path[currentIndex]?.subjectName || 'Start';
  const endSubject = pathData.path[currentIndex + 1]?.subjectName || 'End';

  return (
      <div className="w-full flex flex-col items-center justify-center gap-4 animate-fade-in">
        <div className="flex items-center gap-3 text-lg md:text-xl font-semibold text-gray-300 mb-2">
            <span className="truncate max-w-[200px] md:max-w-xs">{startSubject}</span>
            <ArrowRightIcon className="w-6 h-6 text-indigo-400 flex-shrink-0" />
            <span className="truncate max-w-[200px] md:max-w-xs">{endSubject}</span>
        </div>
        <ImageTileTransition
            key={currentIndex}
            startImageUrl={imageUrls[currentIndex]}
            endImageUrl={imageUrls[currentIndex + 1]}
            onComplete={handleNextTransition}
            duration={2500} // A bit faster for sequential transitions
        />
    </div>
  );
};

export default SequentialImageTransition;
