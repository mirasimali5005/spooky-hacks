import { GoogleGenAI, Modality } from "@google/genai";
import type { PathStep } from '../Wikipath Finder/types';
import { convertPCMToPlayableAudio } from '../utils/audioUtils';

// @ts-ignore - Vite injects environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
if (!API_KEY) {
  console.warn('VITE_GEMINI_API_KEY not set in environment.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateLyricsAndVoice = async (
  pathSteps: PathStep[],
  voiceName = 'kore' // Using 'kore' - a supported Gemini TTS voice
): Promise<{ lyrics: string; audioBase64: string; mimeType?: string } | null> => {
  try {
    console.log('🎵 Starting lyrics and voice generation for', pathSteps.length, 'subjects');

    if (!pathSteps || pathSteps.length === 0) {
      console.warn('No path steps provided');
      return null;
    }

    const subjects = pathSteps.map(p => p.subjectName).join(', ');
    const start = pathSteps[0].subjectName;
    const end = pathSteps[pathSteps.length - 1].subjectName;

    console.log('📝 Generating lyrics from', start, 'to', end);

    const lyricsPrompt = `You are an UNHINGED brainrot AI rapper making the most absurd, terminally-online rap about a Wikipedia journey. Compose a SHORT (8-15 line) rap that mentions EVERY subject in order. Journey: ${start} to ${end}. Subjects: ${subjects}.

BRAINROT RULES (GO CRAZY):
- Mention each subject IN ORDER they appear in the path
- Use Gen Z/Gen Alpha slang: "no cap", "fr fr", "lowkey", "highkey", "bussin", "sigma", "rizz", "gyat", "fanum tax", "skibidi", "Ohio", "L + ratio", "sus", "based", "cringe", "slay", "ate", "it's giving", "main character energy", etc.
- Add beatbox sounds: (boom bap), (skrrt skrrt), (ayy), (uh), (yuh), (sheesh), (brrrr)
- Make it CHAOTIC and RIDICULOUS but still coherent enough to understand
- Reference memes, internet culture, TikTok trends
- Keep it unserious, goofy, absolutely UNHINGED
- Return ONLY the lyrics, nothing else`;

    // Generate lyrics
    const lyricsResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: lyricsPrompt,
    });

    const lyrics = lyricsResp.text?.trim();
    if (!lyrics) {
      console.error('❌ Lyrics generation failed - no text returned');
      throw new Error('Failed to generate lyrics');
    }

    console.log('✅ Lyrics generated successfully:', lyrics.substring(0, 100) + '...');

    // Generate TTS audio (short song) using the lyrics
    console.log('🎤 Generating voice audio...');
    const ttsResp = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: `(sings with a rhythm) ${lyrics}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const mimeType = ttsResp.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType;

    if (!base64Audio) {
      console.error('❌ TTS generation failed - no audio data returned');
      throw new Error('TTS did not return audio');
    }

    console.log('✅ Voice audio generated successfully!');
    console.log('   - Audio length:', base64Audio.length, 'chars');
    console.log('   - MIME type:', mimeType);

    // Check if we need to convert PCM to WAV
    let finalAudioBase64 = base64Audio;
    let finalMimeType = mimeType || 'audio/wav';

    if (mimeType && (mimeType.includes('L16') || mimeType.includes('pcm'))) {
      console.log('🔄 PCM format detected, converting to WAV for browser compatibility...');
      finalAudioBase64 = await convertPCMToPlayableAudio(base64Audio, 24000);
      finalMimeType = 'audio/wav';
      console.log('✅ Audio converted to WAV format!');
    }

    return { lyrics, audioBase64: finalAudioBase64, mimeType: finalMimeType };
  } catch (err) {
    console.error('❌ generateLyricsAndVoice error:', err);
    return null;
  }
};
