# Cinematic scroll-scrub clips

Drop short video clips here that `ScrubVideo` components reference.

## Slots

| File | Used by |
| --- | --- |
| `hero.mp4` | Hero pinned scene background |

## Encode spec (important for smooth scrubbing)

- Length: 6–10 seconds max
- Resolution: 1920×1080 or 1280×720 (keep bitrate ~4–6 Mbps)
- Codec: H.264 MP4, **no audio track**
- Keyframe interval: every 1–2 seconds (`-g 30` at 30fps) — scrubbing seeks to keyframes, dense keyframes = smooth scrub
- Example ffmpeg command:
  ```
  ffmpeg -i input.mp4 -an -vcodec libx264 -pix_fmt yuv420p -crf 22 -g 30 -movflags +faststart hero.mp4
  ```

Generate clips with Higgsfield / Runway / Kling etc., then export with the settings above.
