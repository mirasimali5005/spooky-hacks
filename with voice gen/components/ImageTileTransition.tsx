import React, { useEffect, useState, useRef } from 'react';

interface ImageTileTransitionProps {
  startImageUrl: string;
  endImageUrl: string;
  gridSize?: number;
  duration?: number; // in ms
  onComplete: () => void;
}

const ImageTileTransition: React.FC<ImageTileTransitionProps> = ({
  startImageUrl,
  endImageUrl,
  gridSize = 25,
  duration = 1500,
  onComplete,
}) => {
  const [brightnessMap, setBrightnessMap] = useState<number[][] | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = endImageUrl;

    const processImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      canvas.width = gridSize;
      canvas.height = gridSize;
      ctx.drawImage(image, 0, 0, gridSize, gridSize);

      const newBrightnessMap: number[][] = [];
      let maxBrightness = 0;
      let minBrightness = 255;

      for (let y = 0; y < gridSize; y++) {
        const row: number[] = [];
        for (let x = 0; x < gridSize; x++) {
          const pixel = ctx.getImageData(x, y, 1, 1).data;
          // Luma formula for perceptual brightness
          const brightness = 0.299 * pixel[0] + 0.587 * pixel[1] + 0.114 * pixel[2];
          row.push(brightness);
          if (brightness > maxBrightness) maxBrightness = brightness;
          if (brightness < minBrightness) minBrightness = brightness;
        }
        newBrightnessMap.push(row);
      }
      
      const range = maxBrightness - minBrightness;
      if (range > 0) {
          // Normalize brightness map from 0 to 1
          for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
              newBrightnessMap[y][x] = (newBrightnessMap[y][x] - minBrightness) / range;
            }
          }
      }

      setBrightnessMap(newBrightnessMap);
    };

    const handleError = () => {
        console.error("Could not load image for brightness calculation. Using random transition.");
        const randomMap: number[][] = Array.from({ length: gridSize }, () => 
            Array.from({ length: gridSize }, () => Math.random())
        );
        setBrightnessMap(randomMap);
    };

    image.onload = processImage;
    image.onerror = handleError;

    const timer = setTimeout(onComplete, duration + 1000); // Animation duration + buffer
    return () => clearTimeout(timer);

  }, [endImageUrl, gridSize, onComplete, duration]);

  const renderGrid = () => {
    if (!brightnessMap) {
      return (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400 mr-3"></div>
          Preparing transition...
        </div>
      );
    }
    
    const tiles = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const brightness = brightnessMap[row][col];
        // Darker areas (lower brightness) transition first
        const delay = brightness * (duration / 2);

        tiles.push(
          <div
            key={`${row}-${col}`}
            className="absolute"
            style={{
              width: `${100 / gridSize}%`,
              height: `${100 / gridSize}%`,
              top: `${(row / gridSize) * 100}%`,
              left: `${(col / gridSize) * 100}%`,
              perspective: '1000px',
            }}
          >
            <div
              className="relative w-full h-full"
              style={{
                animationName: 'flip-tile',
                animationDuration: `${duration}ms`,
                animationDelay: `${delay}ms`,
                animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                animationFillMode: 'forwards',
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="absolute w-full h-full backface-hidden"
                style={{
                  backgroundImage: `url(${startImageUrl})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: `${col / (gridSize - 1) * 100}% ${row / (gridSize - 1) * 100}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
              <div
                className="absolute w-full h-full backface-hidden"
                style={{
                  backgroundImage: `url(${endImageUrl})`,
                  backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                  backgroundPosition: `${col / (gridSize - 1) * 100}% ${row / (gridSize - 1) * 100}%`,
                  backgroundRepeat: 'no-repeat',
                  transform: 'rotateY(180deg)',
                }}
              />
            </div>
          </div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className="w-full max-w-3xl mx-auto aspect-video relative bg-gray-900 shadow-2xl shadow-indigo-500/20 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="hidden" />
      {renderGrid()}
    </div>
  );
};

export default ImageTileTransition;
