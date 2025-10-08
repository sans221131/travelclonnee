# Animation Frames Update

## Summary
Updated the Lottie animation data.json to include all available frames.

## What Was Done

### Before:
- Animation frames available: **287 frames** (out_0001.webp to out_0287.webp)
- Animation data.json referenced: **215 frames** (only up to out_0215.webp)
- **72 frames were unused!**

### After:
- ✅ Updated `data.json` to reference all **287 frames**
- ✅ Added 72 missing assets (image_215 to image_286)
- ✅ Added 72 missing layers (frames 216-287)
- ✅ Updated `op` (out point) from 215 to 287

## Details

### Files Updated:
- `public/animations/data.json` - Now includes all 287 animation frames

### Animation Specs:
- **Frame Rate:** 24 fps
- **Resolution:** 3840x2160 (4K)
- **Total Duration:** ~12 seconds (287 frames ÷ 24 fps)
- **Frame Format:** WebP
- **Frame Location:** `public/animations/images/`

### Frame Breakdown:
```
Frames 001-215: ✅ Already existed in data.json
Frames 216-287: ✅ Newly added (72 frames)
```

## Impact

### Longer Animation:
- **Old duration:** ~9 seconds (215 frames)
- **New duration:** ~12 seconds (287 frames)
- **Extra time:** +3 seconds of animation

### Performance:
- File size increased (JSON metadata only, images were already there)
- All frames now properly linked and will display
- Smoother, longer animation sequence

## Testing Checklist
- [ ] Animation plays all 287 frames
- [ ] No missing frames or gaps
- [ ] Animation loops smoothly
- [ ] Performance is acceptable (4K frames are large)
- [ ] Mobile devices handle the animation well

## Notes

### Destination Images
The destination images in `public/images/` are separate from these animation frames:
- assam.jpg
- bali.jpg
- bhutan.png
- dubai.jpg
- himachal.jpg
- kerala.jpg
- ladakh.jpg
- london.jpg
- maldives.jpg
- meghalaya.jpg
- mysore.jpg
- paris.jpg
- rajasthan.jpg
- switzerland.jpg
- thailand.jpg
- united-states.jpg
- uttarakhand.jpg

These are used for destination cards/displays, not the Lottie animation sequence.

### Script Created
`update-animation.js` - Can be run again if frames are added in the future.

Usage:
```bash
node update-animation.js
```

## Cleanup
You can delete the update script if you don't need it:
```bash
rm update-animation.js
```
