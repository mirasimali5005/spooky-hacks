# Voice & Lyrics Generation - Implementation Guide

## What's Been Implemented

### 1. **Lyrics Generation**

- AI-powered rap song creation using Gemini 2.5 Flash
- Mentions **every subject** from the Wikipedia path
- Includes beatbox sounds like "(boom bap)", "(boots 'n' cats)", "(skrrt)"
- Funny and corny style

### 2. **Voice Synthesis (TTS)**

- Uses Gemini TTS Preview model
- Converts lyrics to audio
- Voice: "alloy" (can be changed)
- Output format: Base64 encoded audio

### 3. **UI Components**

#### Dedicated Section for Lyrics & Voice

Located below the Wikipedia path results:

```
AI-Generated Rap Song
├── Loading State (spinning animation)
├── Lyrics Display
│   └── Formatted in a gradient box with monospace font
└── Audio Player
    └── HTML5 audio controls with custom styling
```

## Files Modified

### Core Files:

1. **`services/voiceService.ts`** - Voice & lyrics generation logic
2. **`components/PathTimeline.tsx`** - UI component (legacy, now inline)
3. **`App.tsx`** - Main integration
4. **`.env.local`** - Environment variables (VITE_GEMINI_API_KEY)

## How It Works

### Flow:

```
1. User uploads Start & End images
   ↓
2. App finds Wikipedia path
   ↓
3. Parallel processes start:
   ├── Fetch Wikipedia images
   ├── Generate mosaic tiles
   └── Generate lyrics & voice
   ↓
4. Display results:
   ├── Wikipedia path with images/links
   ├── Lyrics & Audio Player
   └── Mosaic animation
```

## Testing Steps

1. **Open browser**: http://localhost:3000/
2. **Upload two images** (e.g., a celebrity and a concept)
3. **Click "Find Path & Animate"**
4. **Watch for**:

   - "Generating lyrics and voice..." message
   - Spinning loader animation
   - Lyrics appearing in a purple/pink gradient box
   - Audio player below the lyrics

5. **Check Console** (F12 → Console):
   ```
   Starting lyrics and voice generation for X subjects
   Generating lyrics from [Start] to [End]
   Lyrics generated successfully: ...
   Generating voice audio...
   Voice audio generated successfully!
   ```

## UI Features

### Lyrics Section:

- **Gradient background**: Indigo to purple
- **Border**: Indigo with 50% opacity
- **Font**: Monospace for that "rap sheet" look
- **Icon**: text emoji

### Audio Section:

- **Gradient background**: Purple to pink
- **Custom audio player**: Styled with hue rotation
- **Metadata**: Shows number of subjects mentioned
- **Icon**: text emoji

## Troubleshooting

### If lyrics don't appear:

1. **Check Console** for errors
2. **Verify API key** in `.env.local`:
   ```bash
   VITE_GEMINI_API_KEY=your_key_here
   ```
3. **Restart dev server**:
   ```bash
   npm run dev
   ```
4. **Check network tab** for API calls to Gemini

### If audio doesn't play:

1. **Check browser console** for audio format errors
2. **Verify base64 audio** is being received (check logs)
3. **Try different browser** (Chrome/Firefox recommended)
4. **Check audio permissions** in browser settings

## Sample Output

### Example Lyrics:

```
Yo, started with Einstein, no cap (unh)
(boots 'n' cats 'n' boots 'n' cats)
Through Quantum Mechanics, that's where it's at
Then hit up Schrödinger, the cat man (skrrt)
Wave functions got me feeling like I can
Ended at Philosophy of Mind, the plan
It's giving... big brain energy, fam! (boom bap)
```

## Configuration

### Supported Gemini TTS Voices:

The following voices are supported by Gemini TTS:

- **kore** - Warm and friendly (default)
- **puck** - Playful and energetic
- **charon** - Deep and resonant
- **fenrir** - Bold and powerful
- **aoede** - Melodic and smooth
- **leda** - Clear and articulate
- **orus** - Rich and expressive
- **zephyr** - Light and airy

And more: achernar, achird, algenib, algieba, alnilam, autonoe, callirrhoe, despina, enceladus, erinome, gacrux, iapetus, laomedeia, pulcherrima, rasalgethi, sadachbia, sadaltager, schedar, sulafat, umbriel, vindemiatrix, zubenelgenubi

### Change Voice:

Users can now select their preferred voice from the dropdown in the UI!

### Adjust Lyrics Style:

In `services/voiceService.ts`, modify the prompt:

- Line 22-30: Change tone, length, style requirements

## Performance

- **Lyrics generation**: ~2-5 seconds
- **Voice synthesis**: ~3-7 seconds
- **Total**: ~5-12 seconds (parallel with mosaic generation)

## Next Steps

Potential enhancements:

- [ ] Voice selector dropdown (let user pick voice)
- [ ] Download audio button
- [ ] Share lyrics feature
- [ ] Multiple voice modes (rap, sing, narrate)
- [ ] Lyrics highlighting while playing
- [ ] Waveform visualization

---

**Built with using Gemini 2.5 Flash & TTS**
