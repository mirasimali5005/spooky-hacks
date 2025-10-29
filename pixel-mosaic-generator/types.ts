export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface ImageTile {
  imageData: ImageData;
  avgColor: RGBColor;
}

// New type for chained animations
export interface ChainedTileTranslation {
  sourceX: number;
  sourceY: number;
  destinations: { x: number; y: number }[];
  // Average color of the source tile — used for solid-color (pixelated) tiles
  avgColor: RGBColor;
}