# PRESET IMAGE SETUP GUIDE

## 📸 You need to add preset images!

The app is configured with preset end subjects, but the actual image files are missing.

### Required Images:

Add these images to the `public/preset-images/` directory:

1. **beabadoobee.jpg** - Image of Beabadoobee (singer)
2. **taylor-swift.jpg** - Image of Taylor Swift
3. **barack-obama.jpg** - Image of Barack Obama
4. **eiffel-tower.jpg** - Image of the Eiffel Tower
5. **mona-lisa.jpg** - Image of the Mona Lisa painting
6. **einstein.jpg** - Image of Albert Einstein

### How to Add:

1. Download or create square images (recommended: 300x300px to 500x500px)
2. Name them exactly as shown above
3. Place them in `/public/preset-images/`
4. Remove this file (`SETUP_NEEDED.md`)

### Format:

- Supported: `.jpg`, `.jpeg`, `.png`, `.webp`
- Recommended: JPEG format for smaller file size
- Size: < 1MB per image

### Testing:

Once you add the images, you should see them in the "Choose Preset End Subject" section when you run the app!

---

**Note:** You can customize the preset list in `/components/PresetImageSelector.tsx`
