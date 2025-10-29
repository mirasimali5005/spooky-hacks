import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { identifySubject, findWikipediaPath, getWikipediaImage } from './services/geminiService';
import type { PathStep } from './types';
import { GithubIcon } from './components/icons';

const App: React.FC = () => {
  const [startImage, setStartImage] = useState<File | null>(null);
  const [endImage, setEndImage] = useState<File | null>(null);
  const [path, setPath] = useState<PathStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFindConnection = useCallback(async () => {
    if (!startImage || !endImage) {
      setError('Please upload both a start and an end image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPath([]);

    try {
      setLoadingMessage('Analyzing start and end images...');
      const [startSubject, endSubject] = await Promise.all([
        identifySubject(startImage),
        identifySubject(endImage),
      ]);
      
      setLoadingMessage(`Finding connection path from "${startSubject}" to "${endSubject}"...`);
      const pathSteps = await findWikipediaPath(startSubject, endSubject);

      if (!pathSteps || pathSteps.length === 0) {
        throw new Error('Could not find a path between the subjects.');
      }

      setLoadingMessage('Fetching images for the connection path...');

      const fetchWithRetry = async (name: string, tries = 3): Promise<string | null> => {
        for (let i = 0; i < tries; i++) {
          const u = await getWikipediaImage(name);
          if (u) return u;
          await new Promise(r => setTimeout(r, 250 * (i + 1)));
        }
        return null;
      };

      const pathWithImages = await Promise.all(
        pathSteps.map(async (step, index) => {
          // Use the user-uploaded image for the first step
          if (index === 0 && startImage) {
            return { ...step, imageUrl: URL.createObjectURL(startImage) };
          }
          // Use the user-uploaded image for the last step
          if (index === pathSteps.length - 1 && endImage) {
            return { ...step, imageUrl: URL.createObjectURL(endImage) };
          }
          
          // gentle stagger to avoid burst
          await new Promise(r => setTimeout(r, 120 * index));
          const imageUrl = await fetchWithRetry(step.subjectName);
          return { ...step, imageUrl: imageUrl || undefined };
        })
      );

      setPath(pathWithImages);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [startImage, endImage]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            WikiPath Finder
          </h1>
          <p className="mt-2 text-lg text-gray-400">Find the "six degrees of separation" between any two subjects.</p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl p-6 md:p-8 border border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <ImageUploader title="Start Subject" onImageUpload={setStartImage} />
              <ImageUploader title="End Subject" onImageUpload={setEndImage} />
            </div>

            <div className="text-center">
              <button
                onClick={handleFindConnection}
                disabled={!startImage || !endImage || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 disabled:scale-100"
              >
                {isLoading ? 'Finding Connection...' : 'Find Connection'}
              </button>
            </div>
            
            {error && <p className="text-center text-red-400 mt-4 animate-pulse">{error}</p>}
          </div>

          {isLoading && <Loader message={loadingMessage} />}
          {!isLoading && path.length > 0 && <ResultsDisplay path={path} />}
        </main>
        
        <footer className="text-center mt-12 text-gray-500">
          <p>Powered by Gemini API</p>
          <a href="https://github.com/google/genaui" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <GithubIcon />
            View on GitHub
          </a>
        </footer>
      </div>
    </div>
  );
};

export default App;