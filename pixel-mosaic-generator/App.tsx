import React, { useState, useCallback, useEffect } from 'react';
import { MosaicAnimation } from './components/MosaicAnimation';
import { analyzeImageSequenceForMosaic } from './services/mosaicService';
import { GithubIcon } from './components/IconComponents';
import { ChainedTileTranslation } from './types';
// Imports from the WikiPath Finder feature
import { ImageUploader as WikiImageUploader } from './Wikipath Finder/components/ImageUploader';
import { ResultsDisplay } from './Wikipath Finder/components/ResultsDisplay';
import { identifySubject, findWikipediaPath, getWikipediaImage } from './Wikipath Finder/services/geminiService';
import type { PathStep } from './Wikipath Finder/types';

interface MosaicData {
  translations: ChainedTileTranslation[];
  width: number;
  height: number;
}

const App: React.FC = () => {
  const [mosaicData, setMosaicData] = useState<MosaicData | null>(null);
  const [isWikiLoading, setIsWikiLoading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // WikiPath Mosaic specific state
  const [startImage, setStartImage] = useState<File | null>(null);
  const [endImage, setEndImage] = useState<File | null>(null);
  const [wikiPath, setWikiPath] = useState<PathStep[]>([]);
  const [wikiLoadingMessage, setWikiLoadingMessage] = useState('');
  const [wikiImageUrls, setWikiImageUrls] = useState<string[]>([]);

  // Clean up object URLs created for wiki images
  useEffect(() => {
    return () => {
      wikiImageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [wikiImageUrls]);

  // Handler: use the WikiPath Finder to build an image sequence (start -> intermediates -> end)
  const handleFindConnectionAndAnimate = useCallback(async () => {
    if (!startImage || !endImage) {
      setError('Please upload both a start and an end image for WikiPath Mosaic.');
      return;
    }

    setIsWikiLoading(true);
    setWikiLoadingMessage('Analyzing images...');
    setError(null);
    setWikiPath([]);
    setWikiImageUrls([]);
    setMosaicData(null);

    try {
      // 1) Identify subjects from the provided files
      const [startSubject, endSubject] = await Promise.all([
        identifySubject(startImage),
        identifySubject(endImage),
      ]);

      setWikiLoadingMessage(`Finding path from "${startSubject}" to "${endSubject}"...`);
      const pathSteps = await findWikipediaPath(startSubject, endSubject);
      if (!pathSteps || pathSteps.length === 0) throw new Error('Could not find a path between the subjects.');

      setWikiLoadingMessage('Fetching images for the connection path...');
      const fetchWithRetry = async (name: string, tries = 3): Promise<string | null> => {
        for (let i = 0; i < tries; i++) {
          const u = await getWikipediaImage(name);
          if (u) return u;
          await new Promise(r => setTimeout(r, 250 * (i + 1)));
        }
        return null;
      };

      // Build path with images (use uploaded start/end images for first/last)
      const pathWithImages: PathStep[] = await Promise.all(
        pathSteps.map(async (step, index) => {
          if (index === 0) return { ...step, imageUrl: URL.createObjectURL(startImage) };
          if (index === pathSteps.length - 1) return { ...step, imageUrl: URL.createObjectURL(endImage) };
          await new Promise(r => setTimeout(r, 120 * index));
          const imageUrl = await fetchWithRetry(step.subjectName);
          return { ...step, imageUrl: imageUrl || undefined };
        })
      );

      setWikiPath(pathWithImages);

      // Build a sequence of image URLs for the mosaic analysis. Keep only steps that have usable image URLs.
      const seqUrls: string[] = [];
      // start
      const startObjUrl = URL.createObjectURL(startImage);
      seqUrls.push(startObjUrl);
      // intermediates (only those with valid imageUrl)
      for (let i = 1; i < pathWithImages.length - 1; i++) {
        const u = pathWithImages[i].imageUrl;
        if (u) seqUrls.push(u);
      }
      // end
      const endObjUrl = URL.createObjectURL(endImage);
      seqUrls.push(endObjUrl);

      setWikiImageUrls(seqUrls);

      // Run the existing mosaic analysis on this sequence
      setProgress(0);
      const TILE_SIZE = 10;
      const data = await analyzeImageSequenceForMosaic(seqUrls, TILE_SIZE, setProgress);
      setMosaicData(data);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred while building WikiPath Mosaic.');
    } finally {
      setIsWikiLoading(false);
      setWikiLoadingMessage('');
    }
  }, [startImage, endImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-7xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Pixel Mosaic Generator
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Generate a pixelated mosaic that morphs along a Wikipedia path between two uploaded images.
          </p>
        </header>

        <main>
          {/* WikiPath Mosaic Section */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mt-8">
            <h2 className="text-2xl font-bold text-gray-200">WikiPath Mosaic (Start → End)</h2>
            <p className="text-sm text-gray-400 mb-4">Upload a start and an end image. The app will find a Wikipedia path between the identified subjects and fetch images for intermediate steps, then animate the mosaic transforming from start → intermediates → end.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <WikiImageUploader title="Start Subject" onImageUpload={setStartImage} />
              <WikiImageUploader title="End Subject" onImageUpload={setEndImage} />
            </div>
            <div className="text-center">
              <button
                onClick={handleFindConnectionAndAnimate}
                disabled={!startImage || !endImage || isWikiLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg"
              >
                {isWikiLoading ? 'Finding Path & Images...' : 'Find Path & Animate'}
              </button>
              {wikiLoadingMessage && <p className="text-gray-400 mt-2">{wikiLoadingMessage}</p>}
            </div>
            {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
          </div>

          {/* Show wiki path results (images + links) when available */}
          {wikiPath.length > 0 && (
            <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-lg">
              <ResultsDisplay path={wikiPath} />
            </div>
          )}

          {(isWikiLoading || mosaicData) && (
            <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-200 mb-4 text-center">
                {isWikiLoading ? 'Analyzing Images...' : 'Mosaic Transformation'}
              </h2>
              {isWikiLoading && (
                <div className="relative w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                  <span className="absolute w-full text-center text-xs font-medium text-white top-0.5 left-0">{Math.round(progress)}%</span>
                </div>
              )}
              {mosaicData && !isWikiLoading && (
                <MosaicAnimation
                   sourceImageUrl={wikiImageUrls[0]}
                   translations={mosaicData.translations}
                   width={mosaicData.width}
                   height={mosaicData.height}
                   tileSize={10}
                />
              )}
            </div>
          )}
        </main>

        <footer className="text-center mt-12 text-gray-500">
            <p>Built with React, TypeScript, and Tailwind CSS.</p>
            <a href="https://github.com/google-gemini-v2/pixel-mosaic-generator" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <GithubIcon className="w-5 h-5" />
                View on GitHub
            </a>
        </footer>
      </div>
    </div>
  );
};

export default App;