import { GoogleGenAI, Type, Modality } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";
import { GEMINI_PROMPT, RESPONSE_SCHEMA } from "../constants";
import { WikiPathResponse } from "../types";

// Assume process.env.API_KEY is available in the environment
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we'll proceed assuming it's set.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const findWikipediaPath = async (imageA: File, imageB: File): Promise<WikiPathResponse> => {
  try {
    const [base64ImageA, base64ImageB] = await Promise.all([
      fileToBase64(imageA),
      fileToBase64(imageB),
    ]);

    const imagePartA = {
      inlineData: {
        mimeType: imageA.type,
        data: base64ImageA,
      },
    };

    const imagePartB = {
      inlineData: {
        mimeType: imageB.type,
        data: base64ImageB,
      },
    };

    const textPart = {
      text: GEMINI_PROMPT,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePartA, imagePartB, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    const jsonString = response.text.trim();
    return JSON.parse(jsonString) as WikiPathResponse;

  } catch (error) {
    console.error("Error calling Gemini API for pathfinding:", error);
    if (error instanceof Error) {
       throw new Error(`Failed to find Wikipedia path: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};


export const generateRapSong = async (pathData: WikiPathResponse, voiceName: string): Promise<{ lyrics: string; audio: string } | null> => {
    try {
        const pathSummary = pathData.path.map(p => p.subjectName).join(' to ');
        const lyricsPrompt = `
        You are a cringey, chronically online Gen Z meme lord who makes rap songs.
        Create a short, funny, and extremely corny rap song about the journey from ${pathData.start.subjectName} to ${pathData.end.subjectName}.
        The path is: ${pathSummary}.

        RULES:
        1.  **Inject Beatboxing**: Weave beatboxing sounds DIRECTLY into the lyrics. Use sounds like "(boom badoom bap)", "(boots 'n' cats)", "(skrrt skrrt)", and "(unh)".
        2.  **Max "Brain Rot"**: Use absurd, modern slang and meme references. Think "rizz", "no cap", "gyatt", "skibidi", "it's giving...", "the opps". Make it so corny it's funny.
        3.  **Short & Sweet**: Keep it under 8 lines.
        4.  **Lyrics Only**: Just return the lyrics, nothing else.

        EXAMPLE:
        Yo, started with a Penguin, no cap (unh)
        (boots 'n' cats 'n' boots 'n' cats)
        Ended up at Nuclear Fission, where's the map?
        It's giving... scientific rizz, on the app (boom bap)
        Skibidi-dop-dop-yes-yes.
        `;

        // 1. Generate Lyrics
        const lyricsResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: lyricsPrompt,
        });
        const lyrics = lyricsResponse.text;

        if (!lyrics) {
            throw new Error("Lyric generation failed.");
        }
        
        // 2. Generate Speech from Lyrics
        const ttsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `(sings with a beatbox rhythm) ${lyrics}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: voiceName },
                    },
                },
            },
        });
        
        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("TTS generation failed to return audio data.");
        }

        return { lyrics, audio: base64Audio };
    } catch (error) {
        console.error("Error generating rap song:", error);
        return null; // Return null on failure so the app can continue without the song
    }
};