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
import PathTimeline from './components/PathTimeline';
import { generateLyricsAndVoice } from './services/voiceService';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayerDebug } from './components/AudioPlayerDebug';
import { PresetImageSelector, PRESET_IMAGES, type PresetImage } from './components/PresetImageSelector';

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
  const [rapSongData, setRapSongData] = useState<{ lyrics: string; audioBase64: string; mimeType?: string } | null>(null);
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('kore');
  const [currentAnimationStage, setCurrentAnimationStage] = useState(0);

  // Preset image selection
  const [selectedPresetEnd, setSelectedPresetEnd] = useState<PresetImage | null>(null);
  const [presetEndSubjectName, setPresetEndSubjectName] = useState<string | null>(null);
  const [presetEndImageUrl, setPresetEndImageUrl] = useState<string | null>(null);

  // Audio ref for syncing
  const audioRef = React.useRef<HTMLAudioElement>(null);

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
    setRapSongData(null);

    try {
      // 1) Identify subjects from the provided files
      // Use preset name if end image is from preset, otherwise identify from image
      const startSubject = await identifySubject(startImage);
      const endSubject = presetEndSubjectName || await identifySubject(endImage);

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
          if (index === pathSteps.length - 1) {
            // Use preset image URL if available, otherwise create blob URL
            const endImageUrl = presetEndImageUrl || URL.createObjectURL(endImage);
            return { ...step, imageUrl: endImageUrl };
          }
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
      // end - use preset URL if available, otherwise create blob URL
      const endObjUrl = presetEndImageUrl || URL.createObjectURL(endImage);
      seqUrls.push(endObjUrl);

      setWikiImageUrls(seqUrls);

      // Start lyrics & voice generation in parallel — ensure lyrics reference every subject
      setIsGeneratingLyrics(true);
      setWikiLoadingMessage('Generating lyrics and voice...');
      generateLyricsAndVoice(pathWithImages, selectedVoice) // Use the selected voice
        .then(result => {
          if (result) {
            console.log('Lyrics generated:', result.lyrics);
            setRapSongData(result);
          } else {
            console.warn('Lyrics generation returned null');
          }
        })
        .catch(err => {
          console.error('Lyrics generation failed', err);
        })
        .finally(() => {
          setIsGeneratingLyrics(false);
        });

      // Run the existing mosaic analysis on this sequence
      setWikiLoadingMessage('Analyzing mosaic tiles...');
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
  }, [startImage, endImage, selectedVoice, presetEndImageUrl]);

  // Convert preset image to File object when selected
  const handlePresetEndSelect = useCallback(async (preset: PresetImage) => {
    setSelectedPresetEnd(preset);
    setPresetEndSubjectName(preset.name); // Store the subject name for Gemini
    setPresetEndImageUrl(preset.path); // Store the preset URL directly

    try {
      const response = await fetch(preset.path);
      const blob = await response.blob();
      const file = new File([blob], `${preset.id}.jpg`, { type: 'image/jpeg' });
      setEndImage(file);
    } catch (err) {
      console.error('Failed to load preset image:', err);
      setError('Failed to load preset image. Please try again.');
    }
  }, []);

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

            {/* Voice Selector */}
            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <WikiImageUploader title="Start Subject" onImageUpload={setStartImage} />
              <div>
                <WikiImageUploader title="End Subject (Upload Custom)" onImageUpload={(file) => {
                  setEndImage(file);
                  setSelectedPresetEnd(null); // Clear preset if custom upload
                  setPresetEndSubjectName(null);
                  setPresetEndImageUrl(null);
                }} />
                <div className="mt-4">
                  <PresetImageSelector
                    title="Or Choose Preset End Subject"
                    selectedPreset={selectedPresetEnd}
                    onSelect={handlePresetEndSelect}
                  />
                </div>
              </div>
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

          {/* Lyrics & Voice Section - Always show when path exists */}
          {wikiPath.length > 0 && (
            <div className="mt-8 bg-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-200 mb-4">🎵 AI-Generated Rap Song</h2>

              {/* Show loading state for lyrics generation */}
              {isGeneratingLyrics && (
                <div className="p-4 bg-gray-900/50 rounded-lg border border-indigo-500/30 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-3"></div>
                  <p className="text-gray-300 font-semibold">Generating AI rap song...</p>
                  <p className="text-gray-500 text-sm mt-1">Writing lyrics about your Wikipedia journey...</p>
                </div>
              )}

              {/* Show generated lyrics & audio when available */}
              {rapSongData && !isGeneratingLyrics && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-5 rounded-lg border border-indigo-500/50">
                    <h3 className="text-lg font-semibold text-indigo-300 mb-3 flex items-center gap-2">
                      <span>📝</span> Lyrics
                      <span className="text-xs text-gray-400 ml-2">(synced with animation)</span>
                    </h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-200 font-mono leading-relaxed bg-gray-900/50 p-4 rounded-md overflow-x-auto">
                      {rapSongData.lyrics.split('\n').map((line, i) => {
                        const currentSubject = wikiPath[currentAnimationStage]?.subjectName.toLowerCase();
                        const isCurrentLine = currentSubject && line.toLowerCase().includes(currentSubject);
                        return (
                          <div
                            key={i}
                            className={`transition-all duration-300 ${isCurrentLine ? 'text-yellow-300 font-bold scale-105 transform' : ''}`}
                          >
                            {line}
                          </div>
                        );
                      })}
                    </pre>
                  </div>

                  <AudioPlayerDebug
                    audioBase64={rapSongData.audioBase64}
                    mimeType={rapSongData.mimeType}
                    lyrics={rapSongData.lyrics}
                    audioRef={audioRef}
                  />
                </div>
              )}

              {/* Show if generation failed */}
              {!isGeneratingLyrics && !rapSongData && (
                <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30 text-center">
                  <p className="text-yellow-300">Rap song generation is processing or failed. Check console for details.</p>
                </div>
              )}
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
                   audioRef={audioRef}
                   pathStepCount={wikiPath.length}
                   onStageChange={setCurrentAnimationStage}
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