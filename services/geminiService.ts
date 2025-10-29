import { GoogleGenAI, Type, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface WikiPathStep {
  topic: string;
  url: string;
  imageUrl?: string;
}

const base64ToPart = (base64: string) => {
  const mimeType = base64.match(/data:(.*);base64,/)?.[1] ?? 'image/jpeg';
  const cleanBase64 = base64.split(',')[1];
  return {
    inlineData: {
      data: cleanBase64,
      mimeType,
    },
  };
};

export async function findWikiPath(startImageBase64: string, finishImageBase64: string): Promise<Omit<WikiPathStep, 'imageUrl'>[]> {
  const model = 'gemini-2.5-flash';

  const prompt = `Analyze these two images. Identify the primary subject of the start image and the finish image. Then, generate a logical chain of 4 to 6 Wikipedia articles that creatively and plausibly connect the first subject to the second. For each article, provide its exact title and its full URL. The first item in the array must be the subject of the start image, and the last item must be the subject of the finish image.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: 'Start image:' },
          base64ToPart(startImageBase64),
          { text: 'Finish image:' },
          base64ToPart(finishImageBase64),
          { text: prompt },
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            path: {
              type: Type.ARRAY,
              description: 'The conceptual path of Wikipedia articles, including titles and URLs.',
              items: { 
                type: Type.OBJECT,
                properties: {
                  topic: { type: Type.STRING, description: "Wikipedia article title" },
                  url: { type: Type.STRING, description: "Full URL to the Wikipedia article" }
                },
                required: ['topic', 'url']
              }
            }
          },
          required: ['path']
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    if (!result.path || !Array.isArray(result.path) || result.path.length === 0) {
      throw new Error("Failed to find a valid WikiPath. The model returned an unexpected format.");
    }
    return result.path;
  } catch (error) {
    console.error("Error finding WikiPath:", error);
    throw new Error("Failed to find a connection. The model may be unavailable or the images could not be processed.");
  }
}

export async function generateImageForTopic(topic: string): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  const prompt = `A high-quality, artistic, and representative image of: ${topic}`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return `data:image/png;base64,${base64ImageBytes}`;
      }
    }
    throw new Error('No image data found in response.');
  } catch(error) {
    console.error(`Error generating image for topic "${topic}":`, error);
    throw new Error(`Failed to generate an image for "${topic}".`);
  }
}


export async function generateLyrics(path: WikiPathStep[], genre: string): Promise<string> {
  if (path.length === 0) {
    throw new Error("A path of subjects is required to generate lyrics.");
  }

  const model = 'gemini-2.5-flash';
  const topics = path.map(p => p.topic).join(' -> ');

  const prompt = `
    You are an expert songwriter specializing in ${genre} music.
    Your task is to write a song where each verse is inspired by a topic in a sequence. This sequence represents a conceptual journey.
    The song must follow these strict rules:
    1. Do not include a chorus, bridge, or any section labels (like [Verse 1]).
    2. For each topic in the list, create exactly one short verse.
    3. Each verse must be between 2 and 4 lines long.
    4. Each verse must be thematically centered around its corresponding topic.
    5. Each verse must subtly and naturally include the name of its topic within the lyrics.
    6. Do not use asterisks or any other special formatting. Return only the raw text of the lyrics.

    The topics are: ${topics}.

    Craft creative and emotive ${genre} lyrics that tell a story, flowing from one verse to the next, following the journey of the topics.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating lyrics:", error);
    throw new Error("Failed to generate lyrics. The model may be unavailable or the request could not be processed.");
  }
}