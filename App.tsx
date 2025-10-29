import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { LyricsDisplay } from './components/LyricsDisplay';
import { Spinner } from './components/Spinner';
import { findWikiPath, generateLyrics, generateImageForTopic, WikiPathStep } from './services/geminiService';
import { MusicNoteIcon } from './components/icons/MusicNoteIcon';
import { WikiPathDisplay } from './components/WikiPathDisplay';

const App: React.FC = () => {
  const [startImage, setStartImage] = useState<string | null>(null);
  const [finishImage, setFinishImage] = useState<string | null>(null);
  const [wikiPath, setWikiPath] = useState<WikiPathStep[]>([]);
  const [genre, setGenre] = useState<string>('Pop');
  const [lyrics, setLyrics] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<'idle' | 'findingPath' | 'generatingImages' | 'generatingLyrics'>('idle');
  const [error, setError] = useState<string | null>(null);

  const genres = ['Pop', 'Rock', 'Hip-Hop', 'Country', 'Jazz', 'Electronic', 'Folk'];

  const handleReset = () => {
    setStartImage(null);
    setFinishImage(null);
    setWikiPath([]);
    setLyrics('');
    setError(null);
    setLoadingStep('idle');
  };
  
  const handlePrimaryAction = useCallback(async () => {
    setError(null);

    if (!startImage || !finishImage) {
      setError('Please provide both a start and finish image.');
      return;
    }
    
    setLoadingStep('findingPath');
    setWikiPath([]);
    setLyrics('');

    try {
      // Step 1: Find the path of topics and URLs
      const pathWithoutImages = await findWikiPath(startImage, finishImage);
      const initialPathState = pathWithoutImages.map(p => ({ ...p, imageUrl: undefined }));
      setWikiPath(initialPathState);
      
      // Step 2: Generate images for each topic
      setLoadingStep('generatingImages');
      const pathWithImages = await Promise.all(
        pathWithoutImages.map(async (step) => {
          const imageUrl = await generateImageForTopic(step.topic);
          // Update state incrementally to show images as they load
          setWikiPath(prevPath => prevPath.map(p => p.topic === step.topic ? { ...p, imageUrl } : p));
          return { ...step, imageUrl };
        })
      );

      // Step 3: Generate lyrics automatically
      setLoadingStep('generatingLyrics');
      const generatedLyrics = await generateLyrics(pathWithImages, genre);
      setLyrics(generatedLyrics);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during the generation process.');
    } finally {
      setLoadingStep('idle');
    }
  }, [startImage, finishImage, genre]);

  const isLoading = loadingStep !== 'idle';
  const primaryButtonDisabled = isLoading || (!startImage || !finishImage);
  
  const primaryButtonText = () => {
    if (loadingStep === 'findingPath') return 'Finding Connection...';
    if (loadingStep === 'generatingImages') return 'Visualizing Path...';
    if (loadingStep === 'generatingLyrics') return 'Writing Your Song...';
    return 'Create Lyrical Journey';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-slate-800 text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        
        <header className="flex items-center space-x-4 mb-8">
          <div className="bg-indigo-500 p-3 rounded-full shadow-lg">
            <MusicNoteIcon className="w-8 h-8 text-white"/>
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">WikiPath Lyricist</h1>
            <p className="text-indigo-300 text-sm sm:text-base">Create a song from the journey between two images.</p>
          </div>
        </header>

        <main className="space-y-8">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                 <h2 className="text-xl font-semibold mb-4 text-indigo-300">1. Choose a Start and Finish</h2>
              </div>
              <ImageUploader title="Start Image" onImageUpload={setStartImage} disabled={isLoading} />
              <ImageUploader title="Finish Image" onImageUpload={setFinishImage} disabled={isLoading} />
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4 text-indigo-300">2. Select a Genre</h2>
                <div className="relative">
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none disabled:opacity-50 cursor-pointer"
                    aria-label="Select music genre"
                  >
                    {genres.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
             <button 
              onClick={handlePrimaryAction}
              disabled={primaryButtonDisabled}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {isLoading && <Spinner />}
              {primaryButtonText()}
            </button>
            {(wikiPath.length > 0 || startImage || finishImage) && !isLoading && (
               <button onClick={handleReset} className="text-slate-400 hover:text-white transition text-sm py-2 px-4">Reset</button>
            )}
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center">
              <strong>Error:</strong> {error}
            </div>
          )}

          {wikiPath.length > 0 && (
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-indigo-300">Your Conceptual Path</h2>
              <WikiPathDisplay path={wikiPath} />
            </div>
          )}

          {lyrics && !isLoading && (
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-indigo-300">Your Generated Song</h2>
              <LyricsDisplay lyrics={lyrics} />
            </div>
          )}

        </main>
        <footer className="text-center text-slate-500 mt-12 text-sm">
          <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;