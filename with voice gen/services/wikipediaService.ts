
const WIKIPEDIA_API_BASE = "https://en.wikipedia.org/api/rest_v1";

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    url.startsWith("https://upload.wikimedia.org/") &&
    (lowerUrl.endsWith(".jpg") || lowerUrl.endsWith(".jpeg") || lowerUrl.endsWith(".png"))
  );
};

export const fetchImageForTitle = async (title: string): Promise<string | null> => {
  const encodedTitle = encodeURIComponent(title);

  // 1. Try fetching from page summary first
  try {
    const summaryResponse = await fetch(`${WIKIPEDIA_API_BASE}/page/summary/${encodedTitle}`);
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      const imageUrl = summaryData.originalimage?.source || summaryData.thumbnail?.source;
      if (isValidImageUrl(imageUrl)) {
        return imageUrl;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch summary for "${title}":`, error);
  }

  // 2. Fallback to media-list if summary fails or has no valid image
  try {
    const mediaListResponse = await fetch(`${WIKIPEDIA_API_BASE}/page/media-list/${encodedTitle}`);
    if (mediaListResponse.ok) {
      const mediaListData = await mediaListResponse.json();
      const firstImage = mediaListData.items?.find((item: any) => item.type === "image");
      if (firstImage && firstImage.srcset) {
         // Find the highest resolution source from srcset
        const bestSrc = firstImage.srcset[firstImage.srcset.length - 1]?.src;
        if (bestSrc && isValidImageUrl(`https:${bestSrc}`)) {
          return `https:${bestSrc}`;
        }
      }
      // Fallback for older format
       if (firstImage && firstImage.src && isValidImageUrl(`https:${firstImage.src}`)) {
          return `https:${firstImage.src}`;
      }
    }
  } catch (error) {
    console.warn(`Failed to fetch media-list for "${title}":`, error);
  }

  console.warn(`Could not find a valid image for title: "${title}"`);
  return null;
};
