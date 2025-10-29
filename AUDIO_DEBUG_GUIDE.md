# 🔧 Audio Playback Issue - Troubleshooting Guide

## Problem

Audio shows 0:00 seconds and play button is disabled.

## What I've Added

### 1. Debug Audio Player Component

The audio player now shows:

- ✅/⏳ Can Play status
- ✅/⏳ Duration (in seconds)
- Audio format (MIME type)
- Base64 data length
- Error messages if any

### 2. MIME Type Detection

- Now captures the actual MIME type from Gemini TTS
- Falls back to `audio/wav` if not specified
- Shows format in UI

### 3. Download Button

- Added "⬇️ Download Audio" button
- Download the audio file even if it won't play
- Listen in external player to verify it works

## How to Debug

### Step 1: Check Console

Look for these messages after generation:

```
✅ Voice audio generated successfully!
   - Audio length: XXXXX chars
   - MIME type: audio/XXX
```

### Step 2: Check Debug Info

In the audio player card, you'll see:

```
✅ Can Play: Yes/No
✅ Duration: X.XXs
Format: audio/wav (or audio/mpeg, etc.)
Base64 Length: XXX,XXX chars
```

### Step 3: Test Download

1. Click "⬇️ Download Audio" button
2. Open the downloaded file in VLC, QuickTime, or another player
3. If it plays there but not in browser → browser codec issue
4. If it doesn't play anywhere → generation issue

## Possible Causes & Solutions

### Cause 1: Unsupported Audio Format

**Symptom**: Duration shows 0:00, can't play
**Solution**:

- Check MIME type in debug info
- Try downloading and playing externally
- Browser may not support the codec

### Cause 2: Corrupted Base64 Data

**Symptom**: Error in debug info
**Solution**:

- Check console for generation errors
- Verify base64 length is reasonable (should be > 10,000 chars for a few seconds)

### Cause 3: Browser Codec Support

**Symptom**: Works in download but not in browser
**Solution**:

- Try different browser (Chrome, Firefox, Safari)
- Check browser's audio codec support
- May need to convert audio format

### Cause 4: Gemini TTS Output Format

**Symptom**: Consistent 0:00 duration
**Possible Fix**: Gemini TTS may output in a format browsers don't natively support

## Quick Test Commands

### Check if audio data exists:

```javascript
console.log("Audio data length:", rapSongData.audioBase64.length);
console.log("First 100 chars:", rapSongData.audioBase64.substring(0, 100));
```

### Test audio manually:

```javascript
const audio = new Audio(\`data:audio/wav;base64,\${rapSongData.audioBase64}\`);
audio.play().catch(e => console.error('Play failed:', e));
```

## Workarounds

### Option 1: Convert Audio Format

If Gemini returns unsupported format, we may need to:

1. Decode base64 to binary
2. Use Web Audio API to re-encode
3. Create playable format

### Option 2: Use External Player

1. Download the audio file
2. Play in system media player
3. Verify the audio is actually generated correctly

### Option 3: Different TTS Model

Try different Gemini TTS settings:

- Different voice
- Different audio config
- Request specific output format

## Next Steps

1. **Run the app** and generate audio
2. **Check the debug info** in the audio player
3. **Try downloading** the audio file
4. **Report back** with:
   - MIME type shown
   - Base64 length
   - Whether download plays
   - Any error messages
   - Browser you're using

This will help identify exactly what's wrong! 🔍
