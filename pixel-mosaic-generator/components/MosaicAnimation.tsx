import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChainedTileTranslation } from '../types';
import { ReplayIcon } from './IconComponents';

interface MosaicAnimationProps {
  sourceImageUrl: string;
  translations: ChainedTileTranslation[];
  width: number;
  height: number;
  tileSize: number;
}

const ANIMATION_DURATION_PER_STAGE = 4000; // in milliseconds
const POST_STAGE_DELAY = 500; // delay between stages

// Easing function for smooth animation
const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

type AnimationStatus = 'loading' | 'playing' | 'finished';

export const MosaicAnimation: React.FC<MosaicAnimationProps> = ({
  sourceImageUrl,
  translations,
  width,
  height,
  tileSize,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number | null>(null);

  const [status, setStatus] = useState<AnimationStatus>('loading');
  const [stage, setStage] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  const animate = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    if (!canvas || !ctx || !translations[0]?.destinations) return;

    if (startTimeRef.current === null) {
      startTimeRef.current = timestamp;
    }

    const elapsedTime = timestamp - startTimeRef.current;
    const progress = Math.min(elapsedTime / ANIMATION_DURATION_PER_STAGE, 1);
    const easedProgress = easeInOutCubic(progress);

    ctx.clearRect(0, 0, width, height);

    translations.forEach(t => {
      const startX = stage === 0 ? t.sourceX : t.destinations[stage - 1].x;
      const startY = stage === 0 ? t.sourceY : t.destinations[stage - 1].y;
      const endX = t.destinations[stage].x;
      const endY = t.destinations[stage].y;

      const currentX = startX + (endX - startX) * easedProgress;
      const currentY = startY + (endY - startY) * easedProgress;

      // Draw a pixelated solid rectangle using the average color for the tile
      const c = t.avgColor;
      ctx.fillStyle = `rgb(${c.r}, ${c.g}, ${c.b})`;
      ctx.fillRect(Math.round(currentX), Math.round(currentY), tileSize, tileSize);
    });

    if (progress < 1) {
      animationFrameId.current = requestAnimationFrame(animate);
    } else {
      setTimeout(() => {
        const nextStage = stage + 1;
        if (nextStage < translations[0].destinations.length) {
          setStage(nextStage);
        } else {
          setStatus('finished');
        }
      }, POST_STAGE_DELAY);
    }
  }, [stage, translations, width, height, tileSize]);

  // Effect to initialize/reset state when translations change
  useEffect(() => {
    setStatus('playing');
    setStage(0);
    startTimeRef.current = null;

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [translations]);

  // Effect to run the animation for the current stage
  useEffect(() => {
    if (status === 'playing') {
      startTimeRef.current = null;
      animationFrameId.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [animate, status]);

  const handleReplay = () => {
      setStage(0);
      setStatus('playing');
  };

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden ring-2 ring-indigo-500">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-full object-contain"
      />
      {status === 'finished' && (
         <button
          onClick={handleReplay}
          className="absolute top-4 right-4 bg-gray-900/50 text-white p-2 rounded-full hover:bg-gray-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all"
          aria-label="Replay Animation"
         >
          <ReplayIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
