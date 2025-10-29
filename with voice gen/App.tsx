import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import PathTimeline from './components/PathTimeline';
import SequentialImageTransition from './components/SequentialImageTransition';
import VoiceSelector, { voices } from './components/VoiceSelector';
import { SparklesIcon } from './components/icons';
import { findWikipediaPath, generateRapSong } from './services/geminiService';
import { fetchImageForTitle } from './services/wikipediaService';
import { decode, decodeAudioData } from './utils/audioUtils';
import type { WikiPathResponse } from './types';

type AppState = 'idle' | 'loading' | 'transitioning' | 'results' | 'error';

const App: React.FC = () => {
  const [imageA, setImageA] = useState<File | null>(null);
  const [imageB, setImageB] = useState<File | null>(null);
  const [previewA, setPreviewA] = useState<string | null>(null);
  const [previewB, setPreviewB] = useState<string | null>(null);

  const [pathData, setPathData] = useState<WikiPathResponse | null>(null);
  const [imageUrls, setImageUrls] = useState<(string | null)[] | null>(null);
  const [rapSongData, setRapSongData] = useState<{ lyrics: string; audio: string } | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].id);
  
  const [appState, setAppState] = useState<AppState>('idle');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Audio state management
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlayingRap, setIsPlayingRap] = useState(false);

  useEffect(() => {
    return () => {
      if (previewA) URL.revokeObjectURL(previewA);
      if (previewB) URL.revokeObjectURL(previewB);
      audioContextRef.current?.close();
    };
  }, [previewA, previewB]);

  const handleImageUpload = (setter: React.Dispatch<React.SetStateAction<File | null>>, previewSetter: React.Dispatch<React.SetStateAction<string | null>>) => (file: File) => {
    setter(file);
    previewSetter(URL.createObjectURL(file));
    handleReset(true);
  };

  const handleReset = (soft = false) => {
    if (!soft) {
      setImageA(null);
      setImageB(null);
      setPreviewA(null);
      setPreviewB(null);
    }
    setPathData(null);
    setImageUrls(null);
    setRapSongData(null);
    setErrorMessage('');
    setLoadingMessage('');
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
    }
    setIsPlayingRap(false);
    setAppState('idle');
  };

  const handleSubmit = useCallback(async () => {
    if (!imageA || !imageB) {
      setErrorMessage("Please upload both a starting and an ending image.");
      setAppState('error');
      return;
    }
    
    handleReset(true);
    setAppState('loading');

    try {
      setLoadingMessage("Identifying subjects and finding path...");
      const wikiPath = await findWikipediaPath(imageA, imageB);
      setPathData(wikiPath);

      // Don't wait for the song, generate it in the background with the selected voice
      generateRapSong(wikiPath, selectedVoice).then(setRapSongData);

      setLoadingMessage("Fetching images from Wikipedia...");
      const urls = await Promise.all(
        wikiPath.path.map(step => fetchImageForTitle(step.wikipediaTitle))
      );
      const validUrls = urls.filter(url => url !== null) as string[];
      setImageUrls(urls);
      
      if (validUrls.length >= 2) {
          setAppState('transitioning');
      } else {
          console.warn("Not enough valid images for transition. Skipping.");
          setAppState('results');
      }

    } catch (err) {
      console.error(err);
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
      setAppState('error');
    }
  }, [imageA, imageB, selectedVoice]);

  const handleTransitionComplete = useCallback(() => {
    setAppState('results');
  }, []);
  
  const handlePlayRap = useCallback(async () => {
    if (!rapSongData?.audio) return;

    if (isPlayingRap && audioSourceRef.current) {
        audioSourceRef.current.stop();
        setIsPlayingRap(false);
        return;
    }

    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioCtx = audioContextRef.current;
    
    try {
        const audioBuffer = await decodeAudioData(decode(rapSongData.audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
            setIsPlayingRap(false);
            audioSourceRef.current = null;
        };
        source.start();
        audioSourceRef.current = source;
        setIsPlayingRap(true);
    } catch (e) {
        console.error("Failed to play audio:", e);
    }
  }, [rapSongData, isPlayingRap]);

  const renderContent = () => {
    switch(appState) {
        case 'loading':
            return (
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="text-xl font-semibold text-gray-300">{loadingMessage}</p>
                </div>
            );
        case 'error':
            return (
                <div className="text-center bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-lg mx-auto">
                    <h3 className="text-xl font-bold text-red-300 mb-2">An Error Occurred</h3>
                    <p className="text-red-300/80 mb-4">{errorMessage}</p>
                    <button onClick={() => handleReset()} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg transition-colors">
                        Try Again
                    </button>
                </div>
            );
        case 'transitioning':
            const validImageUrls = imageUrls?.filter(url => url !== null) as string[] | undefined;
            return validImageUrls && pathData ? (
                <SequentialImageTransition
                    imageUrls={validImageUrls}
                    pathData={pathData}
                    onComplete={handleTransitionComplete}
                />
            ) : null;
        case 'results':
            return pathData && imageUrls ? (
                <PathTimeline 
                    pathData={pathData} 
                    imageUrls={imageUrls} 
                    onReset={() => handleReset()}
                    rapSongData={rapSongData}
                    onPlayRap={handlePlayRap}
                    isPlayingRap={isPlayingRap}
                />
            ) : null;
        case 'idle':
        default:
            return (
                <div className="w-full max-w-5xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <ImageUploader id="imageA" label="Start Subject" onImageUpload={handleImageUpload(setImageA, setPreviewA)} previewUrl={previewA}/>
                        <ImageUploader id="imageB" label="End Subject" onImageUpload={handleImageUpload(setImageB, setPreviewB)} previewUrl={previewB}/>
                    </div>
                    <div className="space-y-6">
                        <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
                        <div className="text-center">
                            <button onClick={handleSubmit} disabled={!imageA || !imageB} className="inline-flex items-center justify-center gap-3 px-8 py-4 font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 ease-in-out hover:from-purple-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none">
                                <SparklesIcon className="w-6 h-6" />
                                Find Connection
                            </button>
                        </div>
                    </div>
                </div>
            );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
       <style>{`
          @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; opacity: 0; }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; opacity: 0; }
          .backface-hidden { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
          @keyframes flip-tile { from { transform: rotateY(0deg); } to { transform: rotateY(180deg); } }
      `}</style>
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          WikiPath Finder
        </h1>
        <p className="mt-2 text-lg text-gray-400 max-w-2xl mx-auto">
          Upload two images and let AI discover the surprising path between them on Wikipedia.
        </p>
      </header>
      <main className="w-full flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;