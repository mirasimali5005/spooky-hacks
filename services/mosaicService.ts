import { RGBColor, ChainedTileTranslation } from '../types';

// Helper to load an image from a URL
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${url}. Error: ${err}`));
    img.src = url;
  });
};

// Helper to calculate the average color of an ImageData region
const getAverageColor = (imageData: ImageData): RGBColor => {
  const data = imageData.data;
  let r = 0, g = 0, b = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    // a = data[i+3]
    // Only count pixels that are not fully transparent
    if (data[i + 3] > 0) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  if (count === 0) return { r: 0, g: 0, b: 0 };
  return {
    r: Math.floor(r / count),
    g: Math.floor(g / count),
    b: Math.floor(b / count),
  };
};

// Helper to calculate luminance of a color
const getLuminance = (c: RGBColor): number => {
  return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
};

interface TileInfo {
  x: number;
  y: number;
  luminance: number;
  avgColor: RGBColor;
}

interface MosaicAnalysisResult {
  translations: ChainedTileTranslation[];
  width: number;
  height: number;
}

const analyzeImage = (img: HTMLImageElement | HTMLCanvasElement, tileSize: number): TileInfo[] => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get canvas context');

    // If an HTMLImageElement was provided, set canvas size to image size and draw it
    if (img instanceof HTMLImageElement) {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    } else {
      // If a canvas was provided (resized target), use its dimensions and copy
      canvas.width = (img as HTMLCanvasElement).width;
      canvas.height = (img as HTMLCanvasElement).height;
      ctx.drawImage(img as HTMLCanvasElement, 0, 0);
    }

    const tiles: TileInfo[] = [];
    for (let y = 0; y < canvas.height; y += tileSize) {
        for (let x = 0; x < canvas.width; x += tileSize) {
            if (x + tileSize > canvas.width || y + tileSize > canvas.height) continue;
            const tileImageData = ctx.getImageData(x, y, tileSize, tileSize);
            const avgColor = getAverageColor(tileImageData);
            tiles.push({
                x,
                y,
                luminance: getLuminance(avgColor),
                avgColor,
            });
        }
    }
    return tiles;
};

export const analyzeImageSequenceForMosaic = async (
  imageUrlSequence: string[],
  tileSize: number,
  setProgress: (progress: number) => void
): Promise<MosaicAnalysisResult> => {
  setProgress(0);
  const loadedImages = await Promise.all(imageUrlSequence.map(loadImage));
  const progressPerImage = 100 / (loadedImages.length + 1); // +1 for mapping phase

  // Use dimensions of the first image as the canonical size
  const sourceImg = loadedImages[0];
  const { width, height } = sourceImg;

  // 1. Analyze Source Image
  const sourceTiles = analyzeImage(sourceImg, tileSize);
  if (sourceTiles.length === 0) {
    throw new Error("Source image is too small for the selected tile size.");
  }
  setProgress(progressPerImage);

  // 2. Analyze all target images
  const targetCellSets: TileInfo[][] = [];
  for (let i = 1; i < loadedImages.length; i++) {
    const targetImg = loadedImages[i];

    // Draw target image resized to source dimensions to ensure tile counts match
    const resizedTargetCanvas = document.createElement('canvas');
    const resizedCtx = resizedTargetCanvas.getContext('2d');
    if (!resizedCtx) throw new Error('Could not create resizing context');
    resizedTargetCanvas.width = width;
    resizedTargetCanvas.height = height;
    resizedCtx.drawImage(targetImg, 0, 0, width, height);
    const targetImageForAnalysis = resizedTargetCanvas;

    const targetCells = analyzeImage(targetImageForAnalysis as any, tileSize);
    targetCellSets.push(targetCells);
    setProgress(progressPerImage * (i + 1));
  }

  // 3. Sort all lists by luminance to prepare for mapping
  sourceTiles.sort((a, b) => a.luminance - b.luminance);
  targetCellSets.forEach(cellSet => cellSet.sort((a, b) => a.luminance - b.luminance));

  // 4. Build the chained translation map
  const translations: ChainedTileTranslation[] = [];
  const numTiles = sourceTiles.length;

  for (let i = 0; i < numTiles; i++) {
    const sourceTile = sourceTiles[i];
    const destinations: { x: number; y: number }[] = [];

    for (const targetCellSet of targetCellSets) {
        // Ensure we don't go out of bounds if tile counts mismatch
        if (i < targetCellSet.length) {
            const targetCell = targetCellSet[i];
            destinations.push({
                x: targetCell.x,
                y: targetCell.y,
            });
        }
    }

    // Only add a translation if it has destinations
    if (destinations.length > 0) {
        translations.push({
            sourceX: sourceTile.x,
            sourceY: sourceTile.y,
            destinations: destinations,
            avgColor: sourceTile.avgColor,
        });
    }
  }

  setProgress(100);
  return {
    translations,
    width,
    height,
  };
};