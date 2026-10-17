> 👋 **Starter for Claude Impact Lab teams.** Fill in each section below as you build and delete this note.
>
> 📅 **Agenda, rules, deadline and judging** are in the event repo: **[claude-impact-lab-berlin-2026-10-17](https://github.com/Claude-Community-Berlin/claude-impact-lab-berlin-2026-10-17)**. Read it first.
>
> ✅ **When you're finished:** record a 2-minute demo video, then submit with the **[submission form](https://tally.so/r/1WPr9Q)** before **16:00**. One submission per team.
>
> 🔑 Set your API key first: `cp .env.example .env`, then paste your key into `.env` (it's git-ignored, never commit it).

# Elderwise

**One line:** a patient voice AI companion for older adults: say what you need (and show a photo if you like), and get a simple visual answer that is read aloud, plus one AI skill learned each time.

- **Audience:** older adults (65+) and the family members who help them.
- **Their problem with AI today:** apps and chatbots assume you can read dense screens and type well, so most older adults never try AI, and scammers exploit the gap.
- **What the demo lets them do:** press one button, ask out loud about a letter, text message or appointment, and get a big, calm answer card with a "You learned" tip.

## What it does
Three tabs, nothing more:
- **Talk:** "How can I help?" and one input pill. Tap the mic and speak (live transcript shown), or type; the camera button adds a photo. The pill glows with your voice (VoiceBeam).
- **Answers:** the newest answer as one big visual card (deep red scam alert, explanation, steps or reminder) with up to 3 numbered points and an optional "Tell my daughter Anna" call button, a "Read aloud" pill and a "You learned:" card. Older answers are listed below. Saved in the browser.
- **Profile:** text size, speaking speed slider, language (English or German), and the trusted person with a call button. Saved in the browser, fake demo data.

## How Claude is used
`app/api/ask/route.ts` sends the photo (as an image block) and the spoken question to `claude-sonnet-5-5` with the official Anthropic TypeScript SDK.
The system prompt in `prompts/elderwise.ts` asks for plain language, scam warnings, and numbers copied exactly from the photo.
Structured output (`output_config.format`, JSON schema) returns the card type, a headline of at most 6 words, one sentence, up to 3 points, an optional action, and the "You learned" text.
Server-side refusal fallback (`fallbacks: "default"`) is enabled so a declined request is retried on a fallback model.

## How to run it
```bash
cp .env.example .env    # paste your ANTHROPIC_API_KEY into .env
npm install
npm run dev             # open http://localhost:3000
```
On a phone in the same Wi-Fi, open `http://<your-laptop-ip>:3000`.
Voice input uses the browser Web Speech API (Chrome, Safari on iPhone). The microphone needs HTTPS or localhost, so on a phone over plain http the typed field is the fallback.

**Live link (if any):** <link>

## Screenshots / demo
<Drop screenshots here, or link your 2-minute demo video.>

## Team
Teams of 5 (at least 1 builder, 1 product or design, 1 domain expert; plus founder or anyone). Link each name to a GitHub or LinkedIn profile, and replace the example row with your team.

| Name | Role / background |
|---|---|
| [Mehul Patel](https://github.com/nomadicmehul) *(example)* | Claude Ambassador, DevRel |
| [Your name](https://www.linkedin.com/in/your-profile) | Builder / Product or design / Domain expert / Founder |
| [Your name](https://github.com/your-username) | |
| [Your name](https://github.com/your-username) | |
| [Your name](https://github.com/your-username) *(optional)* | |
| [Your name](https://github.com/your-username) *(optional)* | |

## Credits
- [Next.js](https://nextjs.org) (MIT), [React](https://react.dev) (MIT), [Tailwind CSS](https://tailwindcss.com) (MIT).
- [Anthropic TypeScript SDK](https://github.com/anthropics/anthropic-sdk-typescript) (MIT) and the Claude API.
- [voice-glow](https://www.npmjs.com/package/voice-glow) for the voice-reactive glow around the input.
- [Atkinson Hyperlegible](https://fonts.google.com/specimen/Atkinson+Hyperlegible) (OFL) and [Fraunces](https://fonts.google.com/specimen/Fraunces) (OFL) via Google Fonts.
- Browser Web Speech API (SpeechRecognition and speechSynthesis).
- Sample images in `public/samples/` are fictional mocks made for this demo; no real personal data.
