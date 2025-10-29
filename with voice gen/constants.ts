
import { Type } from "@google/genai";

export const GEMINI_PROMPT = `Task: Given two images, (A) and (B), do three things:

1) Identify each image’s main subject (most specific common name).
2) Compute a short, logical click-path on English Wikipedia from A → B using only real article links.
3) Return a STRICT JSON object matching the provided schema. No prose, no markdown.

Rules:
- Use canonical English Wikipedia article titles and include \`pageid\` for every subject you name.
- Path array: first item is A’s article, last item is B’s article. For each step i, \`connectingLinkTitle\` is the exact title clicked on page i to reach page i+1. For the final step, set \`connectingLinkTitle\` = null.
- Do not invent pages. Prefer high-confidence links; keep path ≤ 6.
- Do NOT return image URLs. I will fetch images via the Wikipedia REST API using your \`title\`/\`pageid\`.

Output JSON only, following the schema fields exactly.`;

export const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    start: {
      type: Type.OBJECT,
      properties: {
        subjectName: { type: Type.STRING },
        wikipediaTitle: { type: Type.STRING },
        pageid: { type: Type.INTEGER },
      },
      required: ["subjectName", "wikipediaTitle", "pageid"],
    },
    end: {
      type: Type.OBJECT,
      properties: {
        subjectName: { type: Type.STRING },
        wikipediaTitle: { type: Type.STRING },
        pageid: { type: Type.INTEGER },
      },
      required: ["subjectName", "wikipediaTitle", "pageid"],
    },
    path: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subjectName: { type: Type.STRING },
          wikipediaTitle: { type: Type.STRING },
          pageid: { type: Type.INTEGER },
          connectingLinkTitle: { type: Type.STRING, nullable: true, description: "null for final step" },
        },
        required: ["subjectName", "wikipediaTitle", "pageid", "connectingLinkTitle"],
      },
    },
  },
  required: ["start", "end", "path"],
};
