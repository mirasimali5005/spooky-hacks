# Preset Images Directory

This directory contains hardcoded/preset images that users can select as the **end subject** for the WikiPath Mosaic.

## How to Add Preset Images

1. **Add your image file** to this directory (`public/preset-images/`)
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Recommended size: 200x200px to 500x500px (square images work best)
   - File naming: Use lowercase with hyphens (e.g., `beabadoobee.jpg`, `taylor-swift.jpg`)

2. **Update the preset list** in `/components/PresetImageSelector.tsx`
   - Add a new entry to the `PRESET_IMAGES` array
   - Example:
   ```typescript
   {
     id: 'beabadoobee',           // Unique ID (match filename without extension)
     name: 'Beabadoobee',         // Subject name for Wikipedia path
     displayName: 'Beabadoobee',  // Name shown in UI
     path: '/preset-images/beabadoobee.jpg',  // Path to image file
   }
   ```

3. **The `name` field is important!**
   - This is the subject name that will be sent to Gemini
   - It should match exactly what you want the AI to search for in Wikipedia
   - This prevents the AI from getting confused about the end subject

## Example Preset Images

```typescript
export const PRESET_IMAGES: PresetImage[] = [
  {
    id: 'beabadoobee',
    name: 'Beabadoobee',      // ← This is what Gemini will use
    displayName: 'Beabadoobee',
    path: '/preset-images/beabadoobee.jpg',
  },
  {
    id: 'mao-zedong',
    name: 'Mao Zedong',        // ← Exact Wikipedia subject name
    displayName: 'Mao Zedong',
    path: '/preset-images/mao-zedong.jpg',
  },
];
```

## Current Preset Images

Place your images here:
- `beabadoobee.jpg` - Singer/songwriter
- `taylor-swift.jpg` - Pop artist
- `barack-obama.jpg` - Former US President
- `eiffel-tower.jpg` - French landmark
- `mona-lisa.jpg` - Famous painting
- `einstein.jpg` - Physicist
- (Add more as needed)

## Tips

- Use high-quality, recognizable images
- Square aspect ratio works best for the grid layout
- The subject should be clearly visible
- File size should be reasonable (< 1MB recommended)
- Test that the Wikipedia subject name works by searching it manually first

## How It Works

1. User clicks a preset image button
2. The image is loaded and converted to a File object
3. The `name` field is saved as `presetEndSubjectName`
4. When finding the path, the app uses `presetEndSubjectName` directly instead of asking Gemini to identify the subject
5. This ensures Gemini knows exactly what subject to find a path to!
