# 🍵 Matcha Mosaic Magic - Green Tea Reads Edition

A beautiful matcha-themed web app that creates stunning pixel mosaics that morph along Wikipedia paths, complete with AI-generated brainrot rap songs!

## ✨ Features

### 🎨 **Pixel Mosaic Generator**
- Upload a start image and choose an end subject
- AI finds a Wikipedia path between the two subjects
- Creates a mesmerizing mosaic animation that morphs through each step
- Beautiful matcha green UI with smooth animations

### 🎵 **AI Brainrot Rap Generator**
- Generates unhinged, terminally-online rap lyrics
- Mentions every subject in the Wikipedia path IN ORDER
- Includes Gen Z/Alpha slang: "no cap", "fr fr", "bussin", "sigma", "rizz", "gyat", etc.
- Features beatbox sounds: (boom bap), (skrrt), (yuh), (sheesh)
- Uses Google Gemini TTS for natural voice
- Automatic PCM-to-WAV conversion for browser playback

### 🎬 **Audio-Video Synchronization**
- Mosaic animation syncs perfectly with the audio
- Lyrics highlight the current subject being displayed
- Real-time timing based on audio playback
- When lyrics mention "Mao Zedong", the mosaic shows Mao Zedong!

### 🖼️ **Preset Image Selection**
- Hardcoded preset images for quick selection:
  - Beabadoobee
  - Clairo
  - Labubu (trendy character)
  - Matcha (the drink!)
  - Jorts (aesthetic fashion)
  - Keychains
  - Tote Bags
  - Wired Headphones
- Beautiful grid layout with matcha theme
- No AI confusion - preset names are used directly

### 🎤 **Voice Selection**
- Choose from multiple Gemini TTS voices:
  - Kore (default)
  - Puck
  - Charon
  - Keres
  - Fenrir
  - Aoede

### 🎨 **Matcha Theme Design**
- Soft matcha green and cream color palette
- 3D parallax effects on hero section
- Floating animations
- Beautiful gradients and shadows
- Responsive design for all devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- A Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mirasimali5005/spooky-hacks.git
cd spooky-hacks
```

2. Navigate to the green-tea-reads directory:
```bash
cd green-tea-reads-main
```

3. Install dependencies:
```bash
npm install
# or
bun install
```

4. Create a `.env` file in the `green-tea-reads-main` directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

5. Start the development server:
```bash
npm run dev
# or
bun dev
```

6. Open your browser to `http://localhost:5173`

## 📖 Usage

1. **Upload Start Image**: Click the "Start Subject" upload area and select an image
2. **Choose End Subject**: Either:
   - Upload a custom image, OR
   - Click one of the preset image buttons (Beabadoobee, Clairo, Matcha, etc.)
3. **Select Voice**: Choose your preferred TTS voice from the dropdown
4. **Click "Find Path & Animate"**: Sit back and watch the magic happen!
5. **Enjoy**: 
   - Watch the Wikipedia path results appear
   - Read the generated brainrot lyrics
   - Play the AI-generated rap song
   - Watch the mosaic animation sync with the music
   - See lyrics highlight as each subject is mentioned

## 🎯 Technical Details

### Architecture
- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **AI**: Google Gemini API (Vision, Text Generation, TTS)
- **State Management**: React hooks
- **Audio Processing**: Custom PCM-to-WAV converter

### Key Components
- `MatchaMosaicGenerator.tsx` - Main app logic and UI
- `MosaicAnimation.tsx` - Canvas-based mosaic animation with audio sync
- `PresetImageSelector.tsx` - Preset image grid selector
- `VoiceSelector.tsx` - TTS voice dropdown
- `AudioPlayerDebug.tsx` - Audio player with debug info
- `ResultsDisplay.tsx` - Wikipedia path results

### Services
- `mosaicService.ts` - Mosaic tile analysis and transformation logic
- `voiceService.ts` - Lyrics generation and TTS with PCM-to-WAV conversion
- `geminiService.ts` - Wikipedia path finding and image identification
- `audioUtils.ts` - PCM-to-WAV audio conversion utilities

## 🎨 Customization

### Adding More Preset Images

1. Add your image to `public/performative selection images/`
2. Update `PresetImageSelector.tsx`:
```typescript
{
  id: 'your-image-id',
  name: 'Subject Name', // What Gemini will search for
  displayName: 'Display Name',
  path: '/performative selection images/YourImage.png',
}
```

### Changing Colors

Edit `src/index.css` to customize the matcha theme:
```css
--primary: 120 35% 65%; /* Matcha green */
--secondary: 340 60% 92%; /* Blush accent */
```

## 🐛 Troubleshooting

### Audio Not Playing
- Check that PCM-to-WAV conversion is working (see console logs)
- Try a different browser (Chrome/Edge work best)
- Check that MIME type shows `audio/wav`

### Images Not Loading
- Verify preset image paths are correct
- Check that images exist in `public/performative selection images/`
- Open browser console for error messages

### API Errors
- Verify your VITE_GEMINI_API_KEY is set correctly
- Check API quota limits
- Ensure you have the latest @google/genai package

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Google Gemini AI for amazing multimodal capabilities
- shadcn/ui for beautiful React components
- The matcha aesthetic community for inspiration
- All the brainrot slang contributors (fr fr no cap)

## 🔗 Links

- **GitHub**: https://github.com/mirasimali5005/spooky-hacks
- **Branch**: `performative`

---

Built with 🍵 matcha and ✨ AI magic
