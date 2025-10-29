import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Play, RotateCcw, Music, Palette } from "lucide-react";
import { analyzeImageSequenceForMosaic } from '../services/mosaicService';
import { identifySubject, findWikipediaPath, getWikipediaImage } from '../services/geminiService';
import { generateLyricsAndVoice } from '../services/voiceService';
import type { PathStep } from '../wikipathTypes';
import type { ChainedTileTranslation } from '../types';
import { MosaicAnimation } from './MosaicAnimation';
import { PresetImageSelector } from './PresetImageSelector';
import { ImageUploader } from './ImageUploader';
import { VoiceSelector } from './VoiceSelector';
import { AudioPlayerDebug } from './AudioPlayerDebug';
import { ResultsDisplay } from './ResultsDisplay';
import { PerformativeChatbox } from './PerformativeChatbox';

interface MosaicData {
  translations: ChainedTileTranslation[];
  width: number;
  height: number;
}

const MatchaMosaicGenerator = () => {
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
  const [selectedPresetEnd, setSelectedPresetEnd] = useState<any>(null);
  const [presetEndSubjectName, setPresetEndSubjectName] = useState<string | null>(null);
  const [selectedPresetEndImageUrl, setSelectedPresetEndImageUrl] = useState<string | null>(null);

  // Chatbox visibility
  const [showChatbox, setShowChatbox] = useState(false);

  // Audio ref for syncing
  const audioRef = useRef<HTMLAudioElement>(null);

  // Convert preset image to File object when selected
  const handlePresetEndSelect = useCallback(async (preset: any) => {
    setSelectedPresetEnd(preset);
    setPresetEndSubjectName(preset.name);
    setSelectedPresetEndImageUrl(preset.path);

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

  // Clean up object URLs created for wiki images
  useEffect(() => {
    return () => {
      wikiImageUrls.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [wikiImageUrls]);

  // Handler: use the WikiPath Finder to build an image sequence (start -> intermediates -> end)
  const handleFindConnectionAndAnimate = useCallback(async () => {
    if (!startImage || !endImage) {
      setError('Please upload both a start and an end image for WikiPath Mosaic.');
      return;
    }

    // Show the chatbox when animation starts
    setShowChatbox(true);

    setIsWikiLoading(true);
    setWikiLoadingMessage('Analyzing images...');
    setError(null);
    setWikiPath([]);
    setWikiImageUrls([]);
    setMosaicData(null);
    setRapSongData(null);

    try {
      // 1) Identify subjects from the provided files
      // Add delay to avoid rate limiting
      setWikiLoadingMessage('Identifying start subject...');
      const startSubject = await identifySubject(startImage);

      // Add 2 second delay before next API call
      await new Promise(r => setTimeout(r, 2000));

      // Only identify end subject if not using a preset
      let endSubject: string;
      if (presetEndSubjectName) {
        endSubject = presetEndSubjectName;
        setWikiLoadingMessage(`Using preset end subject: "${endSubject}"...`);
      } else {
        setWikiLoadingMessage('Identifying end subject...');
        endSubject = await identifySubject(endImage);
        // Add another delay after identifying
        await new Promise(r => setTimeout(r, 2000));
      }

      setWikiLoadingMessage(`Finding path from "${startSubject}" to "${endSubject}"...`);
      const pathSteps = await findWikipediaPath(startSubject, endSubject);
      if (!pathSteps || pathSteps.length === 0) throw new Error('Could not find a path between the subjects.');

      setWikiLoadingMessage('Fetching images for the connection path...');
      const fetchWithRetry = async (name: string, tries = 3): Promise<string | null> => {
        for (let i = 0; i < tries; i++) {
          const u = await getWikipediaImage(name);
          if (u) return u;
          // Increase delay between retries to avoid rate limiting
          await new Promise(r => setTimeout(r, 500 * (i + 1)));
        }
        return null;
      };

      // Build path with images (use uploaded start/end images for first/last)
      const pathWithImages: PathStep[] = await Promise.all(
        pathSteps.map(async (step, index) => {
          if (index === 0) return { ...step, imageUrl: URL.createObjectURL(startImage) };
          if (index === pathSteps.length - 1) {
            const imageUrl = selectedPresetEndImageUrl || URL.createObjectURL(endImage);
            return { ...step, imageUrl };
          }
          // Add staggered delay to avoid rate limiting (500ms between each request)
          await new Promise(r => setTimeout(r, 500 * index));
          const imageUrl = await fetchWithRetry(step.subjectName);
          return { ...step, imageUrl: imageUrl || undefined };
        })
      );

      setWikiPath(pathWithImages);

      // Build a sequence of image URLs for the mosaic analysis
      const seqUrls: string[] = [];
      const startObjUrl = URL.createObjectURL(startImage);
      seqUrls.push(startObjUrl);

      for (let i = 1; i < pathWithImages.length - 1; i++) {
        const u = pathWithImages[i].imageUrl;
        if (u) seqUrls.push(u);
      }

      const endObjUrl = selectedPresetEndImageUrl || URL.createObjectURL(endImage);
      seqUrls.push(endObjUrl);

      setWikiImageUrls(seqUrls);

      // Start lyrics & voice generation in parallel
      setIsGeneratingLyrics(true);
      setWikiLoadingMessage('Generating lyrics and voice...');
      generateLyricsAndVoice(pathWithImages, selectedVoice)
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

      // Run the mosaic analysis
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
  }, [startImage, endImage, selectedVoice, presetEndSubjectName, selectedPresetEndImageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <div className="container mx-auto max-w-7xl space-y-8">
        {/* Header Section with Matcha Theme */}
        <div className="text-center space-y-4 animate-in fade-in duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Palette className="w-10 h-10 text-primary animate-float" />
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-foreground">
              Performify Your Situation
            </h1>
            <Sparkles className="w-10 h-10 text-primary animate-float-delayed" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning pixel mosaics that morph along Wikipedia paths, complete with AI-generated brainrot rap songs
          </p>
        </div>

        {/* Main Generator Card */}
        <div className="bg-card rounded-3xl shadow-2xl border-2 border-primary/20 p-8 backdrop-blur-sm">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6 flex items-center gap-3">
            <Upload className="w-7 h-7 text-primary" />
            WikiPath Mosaic Generator
          </h2>
          <p className="text-muted-foreground mb-6">
            Upload a start image and choose an end subject. We'll find a Wikipedia path and create a mesmerizing mosaic animation!
          </p>

          {/* Voice Selector */}
          <div className="mb-6">
            <VoiceSelector selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} />
          </div>

          {/* Image Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Start Image */}
            <div className="space-y-4">
              <ImageUploader title="Start Subject" onImageUpload={setStartImage} />
            </div>

            {/* End Image with Presets */}
            <div className="space-y-4">
              <ImageUploader
                title="End Subject (Upload Custom)"
                externalPreview={selectedPresetEndImageUrl}
                onImageUpload={(file) => {
                  setEndImage(file);
                  setSelectedPresetEnd(null);
                  setPresetEndSubjectName(null);
                  setSelectedPresetEndImageUrl(null);
                }}
              />
              <div className="mt-4">
                <PresetImageSelector
                  title="Or Choose Preset End Subject"
                  selectedPreset={selectedPresetEnd}
                  onSelect={handlePresetEndSelect}
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center">
            <Button
              onClick={handleFindConnectionAndAnimate}
              disabled={!startImage || !endImage || isWikiLoading}
              variant="hero"
              size="lg"
              className="text-lg px-12 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all"
            >
              {isWikiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                  {wikiLoadingMessage || 'Processing...'}
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Find Path & Animate
                </>
              )}
            </Button>
            {error && (
              <p className="text-destructive mt-4 text-sm bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isWikiLoading && (
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-primary/20">
            <div className="relative w-full bg-muted rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary via-primary-glow to-primary h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
              <span className="absolute w-full text-center text-xs font-medium text-foreground top-0.5">
                {Math.round(progress)}%
              </span>
            </div>
            <p className="text-muted-foreground text-sm text-center mt-2">{wikiLoadingMessage}</p>
          </div>
        )}

        {/* Wiki Path Results */}
        {wikiPath.length > 0 && (
          <div className="bg-card rounded-2xl shadow-lg border border-primary/20 p-6">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-4">Wikipedia Path</h3>
            <ResultsDisplay path={wikiPath} />
          </div>
        )}

        {/* Lyrics & Voice Section */}
        {wikiPath.length > 0 && (
          <div className="bg-card rounded-2xl shadow-lg border border-primary/20 p-6">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
              <Music className="w-6 h-6 text-primary" />
              AI-Generated Brainrot Rap
            </h3>

            {isGeneratingLyrics && (
              <div className="p-6 bg-muted/50 rounded-xl text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-3" />
                <p className="text-foreground font-semibold">Generating AI rap song...</p>
                <p className="text-muted-foreground text-sm mt-1">Writing lyrics about your Wikipedia journey...</p>
              </div>
            )}

            {rapSongData && !isGeneratingLyrics && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-6 rounded-xl border border-primary/30">
                  <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                    <span>📝</span> Lyrics <span className="text-xs text-muted-foreground ml-2">(synced with animation)</span>
                  </h4>
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-mono leading-relaxed bg-background/50 p-4 rounded-lg overflow-x-auto max-h-96">
                    {rapSongData.lyrics.split('\n').map((line, i) => {
                      const currentSubject = wikiPath[currentAnimationStage]?.subjectName.toLowerCase();
                      const isCurrentLine = currentSubject && line.toLowerCase().includes(currentSubject);
                      return (
                        <div
                          key={i}
                          className={`transition-all duration-300 ${isCurrentLine ? 'text-primary font-bold scale-105 transform' : ''}`}
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
          </div>
        )}

        {/* Mosaic Animation */}
        {mosaicData && !isWikiLoading && (
          <div className="bg-card rounded-2xl shadow-lg border border-primary/20 p-6">
            <h3 className="text-2xl font-serif font-bold text-foreground mb-4 flex items-center gap-3">
              <RotateCcw className="w-6 h-6 text-primary" />
              Mosaic Transformation
            </h3>
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
          </div>
        )}
      </div>

      {/* Performative Chatbox */}
      <PerformativeChatbox
        isVisible={showChatbox}
        wikiPath={wikiPath.map(step => step.subjectName)}
      />
    </div>
  );
};

export default MatchaMosaicGenerator;
