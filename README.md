> 👋 **Starter for Claude Impact Lab teams.** Fill in each section below as you build and delete this note.
>
> 📅 **Agenda, rules, deadline and judging** are in the event repo: **[claude-impact-lab-berlin-2026-10-17](https://github.com/Claude-Community-Berlin/claude-impact-lab-berlin-2026-10-17)**. Read it first.
>
> ✅ **When you're finished:** record a 2-minute demo video, then submit with the **[submission form](https://tally.so/r/1WPr9Q)** before **16:00**. One submission per team.
>
> 🔑 Set your API key first: `cp .env.example .env`, then paste your key into `.env` (it's git-ignored, never commit it).

# Elderwise

**One line:** a patient voice AI companion for older adults: show something, press the orb, ask out loud, get a simple spoken answer and learn one AI skill each time.

- **Audience:** older adults (65+) in Germany and the family members who help them.
- **Their problem with AI today:** apps and chatbots assume you can read dense screens and type well, so most older adults never try AI, and scammers exploit the gap.
- **What the demo lets them do:** take a photo of a letter, SMS or timetable, ask about it out loud, hear a clear answer in plain German, and see "this is what you just did with AI" with a tip for next time.

## What it does
- Take or upload a photo (or tap one of three fake samples: scam SMS, doctor's letter, bus timetable).
- Press the big orb and speak the question (German by default, English toggle), or type it.
- Claude answers in at most four short sentences, shown in very large high-contrast text and read aloud.
- A learning card explains what the person just did with AI and gives one tip for asking better.

## How Claude is used
The API route `app/api/ask/route.ts` sends the photo (as an image block) and the spoken question to `claude-sonnet-5-5` with the official Anthropic TypeScript SDK.
The system prompt in `prompts/elderwise.ts` asks for plain language, scam warnings, and no invented doses or times.
Structured output (`output_config.format`, JSON schema) returns the answer, the "what you did" sentence and the tip as separate fields.
Server-side refusal fallback (`fallbacks: "default"`) is enabled so a declined request is retried on a fallback model.

## How to run it
```bash
cp .env.example .env    # paste your ANTHROPIC_API_KEY into .env
npm install
npm run dev             # open http://localhost:3000
```
On a phone in the same Wi-Fi, open `http://<your-laptop-ip>:3000`.
Voice input uses the browser Web Speech API (Chrome, Safari on iPhone); speech recognition needs HTTPS or localhost, so the typed field is the fallback elsewhere.

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
- Browser Web Speech API (SpeechRecognition and speechSynthesis).
- Sample images in `public/samples/` are fictional mocks made for this demo; no real personal data.
