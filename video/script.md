# Grace promo video

A 1:50 promo of Grace, built with [HyperFrames](https://hyperframes.heygen.com) (HTML video composition).
It comes in two cuts from one timeline: 16:9 (1920x1080) and 9:16 (1080x1920).

## Style (from the reference video)
The reference is a 33-second SaaS launch reel (https://youtu.be/SgmuplXU2iY).
- Light, near-white background with lots of white space, no dark scenes.
- Kinetic typography: short centered phrases, words slide in one by one with a blur.
- Two-tone words: the first word in near-black, the second in a gradient accent (ours: moss to sage).
- Fast cuts every 1 to 1.5 seconds, locked to the beat of an upbeat electronic track.
- Real product screens in 3D: a tunnel of tilted screens rushing at the camera, floating rotating cards, a wide screen sliding in at an angle.
- A big gradient swoosh as a transition.
- A progress bar filling with a score, then a "Done" check circle with confetti.
- A cursor tapping UI, and a dark pill button that turns into the gradient style when tapped.
- Outro: tagline, the logo animating in, then logo + wordmark with the URL small underneath.

## Structure
| Time | Part | What you see |
|---|---|---|
| 0:00-0:38 | Promo intro | "Show letters", "Ask out loud", "Any message", "Instantly", "Just talk" with a tap on the orb, a tunnel of Grace screens ("Letters. Scams. Doctors."), swoosh, scam check 0-100, Done + confetti, floating answer cards ("Explained simply"), the wide Learn hub, the "Tell my daughter Anna" button being tapped, "Patient with you", "Pick a personality" (the four assistant bots hop in one by one and the picked Patient helper jumps), "Now watch it work". |
| 0:38-1:44 | Real app test | 12 quick phone segments with a caption and a tap cursor: welcome, Talk, asking "Is this text real?", Claude's answer, the scam alert, Tell Anna, scanning a letter, the explanation, a payment QR code check, Learn, Listen for me, the assistant's voice and text size. |
| 1:44-1:50 | Outro | "Grace. AI that is patient with you.", logo, wordmark, graceapp.vercel.app |

The screens are real screenshots of the live app at 390x844 (phone) and 1440x900 (wide Learn hub), with the fictional demo data (Ingrid, Anna, sample letters).
The scam alert is a real Claude answer to a typed DHL question.
The four bots in `assets/bots` are stills of the app's own assistant avatars (bot-avatars, fabric shading, the same props as `components/AssistantSettings.tsx`), exported at 1260 px and cropped to 600 px.

## Audio
Music only, no voiceover, like the reference.
The track (120 bpm kick, clap, hats, bass, chord stabs), the whoosh and the tap clicks are synthesized in `tools/make_music.py`, so there is no third-party audio licence.

## How to rebuild
```bash
cd video
node tools/build.mjs          # writes index.html (9:16), landscape/index.html (16:9) and cues.json
python tools/make_music.py    # writes assets/promo-music.m4a from cues.json (needs numpy)
npx hyperframes@0.8.168 preview
npx hyperframes@0.8.168 render --composition landscape/index.html -o renders/grace-promo-16x9.mp4
npx hyperframes@0.8.168 render -o renders/grace-promo-9x16.mp4
```
Edit scenes, captions and screenshots in `tools/build.mjs`, styles in `style.css`; `index.html`, `landscape/index.html` and `cues.json` are generated.

## Credits
- [HyperFrames](https://github.com/heygen-com/hyperframes) and [GSAP](https://gsap.com) for the composition and animation.
- [Fraunces](https://fonts.google.com/specimen/Fraunces) and [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) (both OFL) from Google Fonts.
- [bot-avatars](https://github.com/Jakubantalik/Libraries.dev) (MIT) for the assistant bots.
- Music and sound effects: generated in `tools/make_music.py`, no third-party audio.
