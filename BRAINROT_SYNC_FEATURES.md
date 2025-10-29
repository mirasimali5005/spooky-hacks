# 🔥 Brainrot Lyrics & Audio-Video Sync Features

## What's New

### 1. 🧠 BRAINROT LYRICS MODE
The AI now generates **unhinged, terminally-online brainrot rap lyrics** with:

- **Gen Z/Alpha Slang**: "no cap", "fr fr", "bussin", "sigma", "rizz", "gyat", "fanum tax", "skibidi", "Ohio", "L + ratio", "sus", "based", "slay", etc.
- **Beatbox Sounds**: (boom bap), (skrrt skrrt), (ayy), (uh), (yuh), (sheesh), (brrrr)
- **Chaotic & Ridiculous**: Maximum internet culture and meme references
- **Subject Order**: Mentions each Wikipedia subject IN ORDER they appear in the path

### 2. 🎬 AUDIO-VIDEO SYNCHRONIZATION
The mosaic animation now **syncs perfectly with the audio**:

#### How It Works:
1. **Audio-Driven Timing**: The animation speed is automatically calculated based on the audio duration
   - Total audio duration ÷ number of path steps = duration per image transition
   - Minimum 2 seconds per transition for visibility

2. **Real-Time Sync**: As the audio plays, the animation matches the timing
   - When the lyrics mention "Mao Zedong", the mosaic shows the Mao Zedong image transition
   - Uses audio `timeupdate` events to sync stage changes

3. **Highlighted Lyrics**: The lyrics display highlights the current line being sung
   - Lines turn yellow and scale up when they mention the currently displayed subject
   - Visual feedback shows which subject is being sung about

#### Technical Implementation:
- `MosaicAnimation` accepts an `audioRef` prop
- Listens to audio playback events (`timeupdate`, `play`, `pause`)
- Calculates expected stage based on `audio.currentTime / audio.duration`
- Updates animation stage to match audio progress
- Parent `App.tsx` tracks current stage and highlights corresponding lyrics

### 3. 🎯 Features Summary

| Feature | Description |
|---------|-------------|
| **Brainrot Prompt** | Maximum chaos, Gen Z slang, memes, internet culture |
| **Audio Sync** | Mosaic transitions match audio timing perfectly |
| **Lyrics Highlight** | Current subject being sung is highlighted in yellow |
| **Voice Selection** | Choose from multiple Gemini TTS voices |
| **PCM-to-WAV Conversion** | Audio automatically converted for browser playback |
| **Debug Player** | Shows audio info, duration, format, and download option |

## Usage

1. **Upload Start & End Images**: Choose two images for your Wikipedia path
2. **Select Voice**: Pick your preferred TTS voice (Kore, Puck, Charon, etc.)
3. **Click "Find Path & Animate"**: AI finds the Wikipedia connection
4. **Watch & Listen**: 
   - Lyrics generate with maximum brainrot energy
   - Audio plays automatically
   - Mosaic animation syncs with the audio
   - Lyrics highlight which subject is currently shown
5. **Replay**: Click the replay button or restart the audio to watch again

## Example Flow

```
User uploads: "Cat" → "World War II"
AI finds path: Cat → Domestication → Agriculture → Civilization → War → World War II

Lyrics might be:
"Yo we start with a Cat, that's bussin fr fr (meow)
Then Domestication got that rizz, no cap (yuh)
Agriculture bringing crops, it's giving main character (skrrt)
Civilization built different, straight up sigma (boom bap)
War got me feeling Ohio, that's sus (brrrr)
World War II, we made it fam, L + ratio to the axis! (sheesh)"

As the audio plays:
- 0-3s: "Cat" mentioned → Cat image transition + line highlighted
- 3-6s: "Domestication" mentioned → Domestication transition + line highlighted
- 6-9s: "Agriculture" mentioned → Agriculture transition + line highlighted
... and so on
```

## Pro Tips

- **Audio Quality**: Uses Gemini TTS for natural-sounding voice
- **Sync Accuracy**: Works best with 4-8 subjects in the path
- **Replay**: Both audio and animation can be replayed independently
- **Download**: Use the debug player to download the audio file

## Known Quirks

- AI might go TOO hard on the brainrot (it's a feature, not a bug)
- Some lyrics may be incomprehensible (again, feature not bug)
- Timing is approximate - some subjects might get mentioned multiple times
- The more subjects, the faster the transitions (keeps audio sync tight)

---

**Enjoy the chaos! 🔥🧠🎵**
