# Grace - team plan

Claude Impact Lab Berlin, 17 Oct 2026.
Hard deadline **16:00**: public repo, README, 2-minute demo video.

## The product in one paragraph

Grace (first called Elderwise) is a patient voice AI companion for older adults.
The person shows something (a photo or screenshot of a letter, an SMS, a medication box, a timetable), presses one big glowing orb and asks out loud.
Claude answers in simple words, in very large text, and reads the answer aloud.
After every answer a learning card explains "this is what you just did with AI", so the person learns to use AI on their own.
Short guided exercises teach real skills: spotting a scam SMS, understanding a doctor's letter, asking a good question.
A family view lets a son or daughter see what was asked and get a warning when Claude suspects a scam.

- **Audience:** older adults (65+) and the family members who help them.
- **Their problem with AI today:** apps and chatbots assume you can read dense screens and type well, so most older adults never try AI, and scammers exploit the gap.
- **What the demo lets them do:** show something, ask out loud, get a clear spoken answer, and learn one AI skill each time.
- **Why it matters:** YC lists "AI for the Aging Population" as an open Request for Startups (voice interfaces, family caregiver coordination).

Live app: https://graceapp.vercel.app

## Stack and structure

Next.js (App Router, TypeScript) + Tailwind, Anthropic API (`claude-sonnet-5-5`, vision), `voice-glow` for the voice effect, browser Web Speech API.
English UI, simple language, huge tap targets, works on an iPhone in Safari.
Design (source of truth): https://app.paper.design/file/01M54P2AW7DMM9SRH5B5DKTZ5M

Three tabs in a bottom navbar:
1. **Talk** - only the voice interface (greeting, "How can I help?", the glowing "Just say it" pill). No answer on this screen.
2. **Answers** - the visual output page: newest answer as one big card (scam warning, explanation, steps, reminder), "Read aloud", the "You learned" card, earlier answers as rows.
3. **Profile** - name, text size, speaking speed, language, trusted person (Anna).

## Who does what

| Part | Owner | Files |
|---|---|---|
| Core: voice flow, Claude API route, Answers rendering, Liquid Glass look | Batu (+ AI agents) | `app/`, `app/api/ask/`, `components/` |
| Claude prompts and answer quality: test 10 real situations (scam SMS, doctor letter, pension letter, medication, appointment), tune `prompts/` so answers are short, kind and correct | **Sam** | `prompts/`, `docs/test-cases.md` |
| Demo sample images (5 fake realistic photos/screenshots) + the photo flow: camera/upload preview thumbnail inside the Talk pill, remove button | **Ahmet** | `public/samples/`, `components/PhotoPreview.tsx` |
| Answer card variants: reminder card with "Add to calendar" (.ics download), steps card, explain card, info card - all in the glass style, plus an empty state for Answers | **MaRie** | `components/cards/` |
| Profile tab polish + accessibility check (contrast, text size, VoiceOver labels) | **Endrik** (start after the glass PR is merged, ~15 min; meanwhile test the live app on your phone and list bugs in `docs/qa.md`) | `app/profile/`, `docs/qa.md` |

**Rule: only edit your own files.** Shared files (`app/layout.tsx`, `package.json`) only after telling the team.

## How to start (everyone)

1. Accept the GitHub invite, then `git clone https://github.com/BatuCani/grace && cd grace`.
2. `git pull` once Batu says the skeleton is on `main`.
3. `cp .env.example .env` and paste your Claude API key. Never commit `.env`.
4. `npm install && npm run dev`, open http://localhost:3000.
5. Open Claude Code in the repo (`claude`) and paste your prompt from below.
6. Work on a branch (`git checkout -b <your-name>/<part>`), commit small steps, push, open a PR to `main`.

## Copy-paste prompts for your AI agent

### Sam - prompts and answer quality

> Read CLAUDE.md and TEAM.md. Own `prompts/`. Write `docs/test-cases.md` with 10 real situations older adults face (scam SMS, phishing email, doctor's letter, pension letter, medication instructions, appointment reminder, utility bill, bank call, delivery notice, grandchild-in-trouble scam). Run each through `/api/ask` and tune the prompt so every answer is: max 6-word headline, one plain sentence, up to 3 reasons or steps, correct type (warning/explain/steps/reminder), and a one-line "You learned" tip. Never give medical or legal advice beyond explaining; suggest calling a trusted person or the doctor. Only edit `prompts/` and `docs/test-cases.md`. PR to main.

### Ahmet - demo samples + photo flow

> Read CLAUDE.md and TEAM.md. Create 5 fake but realistic demo images in `public/samples/` (PNG or SVG, phone-screenshot or photo look, no real personal data): DHL scam SMS, doctor's letter, pension letter, medication box with dosage, appointment card. Match the Paper design colors. Then build `components/PhotoPreview.tsx`: a small rounded thumbnail of the chosen photo with a remove (x) button, in the glass style, meant to sit inside the Talk pill; tell Batu when ready so the core wires it in. Only edit `public/samples/` and `components/PhotoPreview.tsx`. PR to main.

### MaRie - answer card variants

> Read CLAUDE.md and TEAM.md. Look at `components/AnswerView.tsx` and `lib/answers.ts` to see the answer JSON (type warning/explain/steps/reminder/info). Build polished card components in `components/cards/` in the Liquid Glass style of the Paper design (https://app.paper.design/file/01M54P2AW7DMM9SRH5B5DKTZ5M): ReminderCard (date/time big, "Add to calendar" button that downloads an .ics file), StepsCard (numbered big steps), ExplainCard (headline + plain sentence + key facts), InfoCard, and an empty state for the Answers tab ("Ask me anything on the Talk tab"). Export them from `components/cards/index.ts`; tell Batu when ready so the core wires them into AnswerView. Only edit `components/cards/`. PR to main.

### Endrik - Profile + accessibility + QA

> Read CLAUDE.md and TEAM.md. Own `app/profile/`. Match the Paper design: avatar + name, row cards for Text size (changes the app font size), Speaking speed (slider Slow-Fast, used by speech synthesis), Language, Trusted person card with call button. Store settings in localStorage. Then check the whole app for accessibility: contrast, min 19px text, 48px tap targets, aria-labels on icon buttons. Only edit `app/profile/` (report other issues to Batu). PR to main.

## Timeline

| Time | Goal |
|---|---|
| 12:30 | Skeleton on `main`, everyone pulls and starts their part |
| 13:00-13:45 | Lunch - something must already run |
| 14:30 | All parts merged into `main` |
| 15:00 | Feature freeze, record the 2-minute demo video |
| 15:45 | Submit via https://tally.so/r/1WPr9Q (team, members, repo link, video link, audience) |
