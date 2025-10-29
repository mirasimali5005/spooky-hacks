import { GoogleGenAI, Type } from "@google/genai";
import type { PathStep } from '../types';

// @ts-ignore - Vite injects environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
if (!API_KEY) {
    console.warn("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Helper function to convert a File object to a Gemini Part object
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const identifySubject = async (imageFile: File): Promise<string> => {
  const imagePart = await fileToGenerativePart(imageFile);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
        parts: [
            imagePart,
            { text: "Analyze this image and identify the main subject. Provide only the most specific and common name for the subject (e.g., a person's full name, a landmark's official name, a specific event's name). Do not add any extra text or explanation. Just the name." }
        ]
    }
  });

  const subject = response.text.trim();
  if (!subject) {
    throw new Error('Could not identify a subject in the image.');
  }
  return subject;
};

export const findWikipediaPath = async (startSubject: string, endSubject: string): Promise<PathStep[]> => {
  const prompt = `You are an expert at the Wikipedia Game. Find a short, logical path of clicked links from the Wikipedia article for "${startSubject}" to the article for "${endSubject}". Provide the path as a JSON array. Each object in the array should represent a step and have two keys: "subjectName" (the name of the current article) and "connectingLinkTitle" (the title of the link on that page to get to the next subject). The first object's subjectName should be "${startSubject}". The last object's subjectName should be "${endSubject}" and its "connectingLinkTitle" should be null.`;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    subjectName: {
                        type: Type.STRING,
                        description: 'The name of the Wikipedia article for this step.'
                    },
                    connectingLinkTitle: {
                        type: Type.STRING,
                        description: 'The title of the link to click to get to the next step. Should be null for the final step.'
                    }
                },
                propertyOrdering: ["subjectName", "connectingLinkTitle"],
                nullable: true,
            }
        }
      }
  });

  try {
    const jsonText = response.text.trim();
    // A simple regex to handle potential null values which might not be quoted correctly by all models
    const cleanedJson = jsonText.replace(/: null/g, ': "null"');
    const parsed = JSON.parse(cleanedJson);

    // Convert back the string "null" to actual null
    return parsed.map((item: any) => ({
      ...item,
      connectingLinkTitle: item.connectingLinkTitle === "null" ? null : item.connectingLinkTitle,
    }));

  } catch (e) {
    console.error("Failed to parse JSON response:", response.text);
    throw new Error("The model returned an invalid path format. Please try again.");
  }
};

export const getWikipediaImage = async (subjectName: string): Promise<string | null> => {
  const title = encodeURIComponent(subjectName.replace(/\s+/g, '_'));

  // 1) Try REST Summary thumbnail/original
  const s = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
    headers: { accept: 'application/json' },
    referrerPolicy: 'no-referrer'
  }).then(r => r.ok ? r.json() : null).catch(() => null);

  let url: string | undefined = s?.originalimage?.source || s?.thumbnail?.source;

  // 2) Fallback: first image from media-list
  if (!url) {
    const m = await fetch(`https://en.wikipedia.org/api/rest_v1/page/media-list/${title}`, {
      headers: { accept: 'application/json' },
      referrerPolicy: 'no-referrer'
    }).then(r => r.ok ? r.json() : null).catch(() => null);

    const firstImg = m?.items?.find((it: any) => it?.type === 'image' && (it?.src || it?.srcset?.length));
    url = firstImg?.src || firstImg?.srcset?.[firstImg.srcset.length - 1]?.src;
  }

  // 3) Validate: direct, renderable image
  if (typeof url !== 'string') return null;
  if (!url.startsWith('https://upload.wikimedia.org/')) return null;
  if (!/\.(png|jpe?g)(\?|$)/i.test(url)) return null;

  try {
    const h = await fetch(url, { method: 'HEAD', referrerPolicy: 'no-referrer' });
    const ct = h.headers.get('content-type') || '';
    if (!h.ok || !ct.startsWith('image/')) return null;
  } catch { return null; }

  return url;
};