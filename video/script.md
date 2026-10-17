# Grace demo video

A 2-minute (1:59) product demo of Grace, built with [HyperFrames](https://hyperframes.heygen.com) (HTML video composition).
It comes in two cuts from the same scene list: 9:16 (1080x1920) and 16:9 (1920x1080).

## Style (from the reference video)
The reference is a 33-second SaaS launch reel (https://youtu.be/SgmuplXU2iY).
- Light, airy off-white background with soft colour glows, no dark scenes.
- Kinetic typography: one short phrase at a time, words fade and slide in one by one.
- Two-tone headlines: one accent word in the brand colour, the rest in near-black.
- Real product screens on tilted 3D phones that fly in, settle, and drift slowly.
- Snappy cuts every 1 to 3 seconds, each scene leaving with a quick lift and blur.
- Small iconic accents (sparkle, check mark, progress bar) between product shots.
- Logo end card with the product name and URL, held for a few seconds.
- Upbeat, light music bed with soft whooshes on the cuts; no voiceover in the reference.

For Grace we keep that look in the Grace palette (bone `#F4F1EA`, moss `#3F5A3A`, ink `#1E2420`), with Fraunces headlines and Atkinson Hyperlegible body text, and add a calm voiceover because the audience is older adults.

## Script
The voice lines live in `voiceover.txt` (one `id|text` line per scene, in order).

| # | Scene | On screen | Voiceover |
|---|---|---|---|
| 1 | Hook | "1 in 5 older adults have been targeted by a scam." | One in five older adults has been targeted by a scam. A.I. could help them. But most A.I. tools were never built for them, and scammers exploit that gap. |
| 2 | The problem | Apps assume you can read dense screens and type fast. | Apps and chatbots assume you can read dense screens and type fast. So most older adults never try A.I. at all. |
| 3 | Meet Grace | Logo, Talk screen with the orb | Meet Grace. A patient A.I. companion you simply talk to. One big button, one calm voice. No typing, no jargon. |
| 4 | Welcome | The calm welcome screen | Getting started is calm and simple. A short welcome, and an account is optional. |
| 5 | Scam check | Question about a fake DHL text, Claude's scam alert | Ingrid gets a text from "DHL", asking for a small customs fee. She asks Grace. In seconds: a clear scam alert. Don't click, don't pay, and here is why. |
| 6 | Read aloud | Read aloud / Say it again, slower | Every answer is read aloud. Too fast? Tap: say it again, slower. |
| 7 | Tell Anna | The ready-written message to Anna | One tap on Tell Anna, and a ready-written message goes to her daughter. The family knows, before any money is gone. |
| 8 | Scan a letter | Pension letter: reading, key facts, plain explanation | A confusing letter? Scan it. Grace reads it, highlights the sender, the date and the amounts, then explains it in plain words. Your pension goes up. |
| 9 | QR check | Payment QR code: Do not pay this code | Even a payment QR code gets checked before Ingrid pays. A surprise redelivery fee? Grace says: do not pay this code. |
| 10 | Learn | Learn hub, My AI skills | Every answer teaches one A.I. skill. In the Learn hub, Ingrid grows her A.I. skills, one short lesson at a time. |
| 11 | Listen for me | Listen for me screen | At the doctor, Listen for me writes down what is said, so Grace can sum it up afterwards. |
| 12 | Text size | Extra large text | Hard to read? Make the text extra large. The whole app grows, and nothing gets cut off. |
| 13 | Voice | Assistant voice picker | And Ingrid picks the voice that feels right for her. |
| 14 | Tech | Claude by Anthropic (the brain), Gemini Live (the voice) | Under the hood, Claude by Anthropic is Grace's brain, and Gemini Live gives her a real-time voice. |
| 15 | Close | Logo, "AI that's patient with you.", URL, team, event | Grace. A.I. that's patient with you. Built by Sam, Ahmet, MaRie, Endrik and Batu, at the Claude Impact Lab Berlin. Try it live today. |

The screens are real screenshots of the live app (https://elderwise-beryl.vercel.app) at 390x844 on a phone, with the fictional demo data (Ingrid, Anna, sample letters).
The scam alert is a real Claude answer to the typed DHL question.

## Audio
- Voiceover: ElevenLabs, voice "Sarah" (`eleven_multilingual_v2`), one file per scene; scene lengths follow the voice, with short gaps (silence trimmed, about 0.6 s between scenes).
- Music bed and whooshes: synthesized in `tools/make_audio.py` (sine pads, a plucked arpeggio and filtered noise), so there is no third-party music licence. The music ducks under the voice.

## How to rebuild
```bash
cd video
# 1. Voice lines: one <id>.wav per line of voiceover.txt, in some folder outside the repo.
# 2. Soundtrack + scene timing (needs numpy):
python tools/make_audio.py /path/to/voice-wavs
# 3. Compositions (index.html = 9:16, landscape/index.html = 16:9):
node tools/build.mjs
# 4. Preview and render:
npx hyperframes@0.8.168 preview
npx hyperframes@0.8.168 render -o renders/grace-demo-9x16.mp4
npx hyperframes@0.8.168 render --composition landscape/index.html -o renders/grace-demo-16x9.mp4
```
Edit scenes, headlines and screenshots in `tools/build.mjs`, styles in `style.css`; `index.html`, `landscape/index.html` and `timing.js` are generated.

## Credits
- [HyperFrames](https://github.com/heygen-com/hyperframes) and [GSAP](https://gsap.com) for the composition and animation.
- [ElevenLabs](https://elevenlabs.io) for the voiceover.
- [Fraunces](https://fonts.google.com/specimen/Fraunces) and [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) (both OFL) from Google Fonts.
- Music and sound effects: generated in `tools/make_audio.py`, no third-party audio.
