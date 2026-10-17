# Elderwise - team plan

Claude Impact Lab Berlin, 17 Oct 2026.
Hard deadline **16:00**: public repo, README, 2-minute demo video.

## The product in one paragraph

Elderwise is a patient voice AI companion for older adults.
The person shows something (a photo or screenshot of a letter, an SMS, a medication box, a timetable), presses one big glowing orb and asks out loud.
Claude answers in simple words, in very large text, and reads the answer aloud.
After every answer a learning card explains "this is what you just did with AI", so the person learns to use AI on their own.
Short guided exercises teach real skills: spotting a scam SMS, understanding a doctor's letter, asking a good question.
A family view lets a son or daughter see what was asked and get a warning when Claude suspects a scam.

- **Audience:** older adults (65+) and the family members who help them.
- **Their problem with AI today:** apps and chatbots assume you can read dense screens and type well, so most older adults never try AI, and scammers exploit the gap.
- **What the demo lets them do:** show something, ask out loud, get a clear spoken answer, and learn one AI skill each time.
- **Why it matters:** YC lists "AI for the Aging Population" as an open Request for Startups (voice interfaces, family caregiver coordination).

## Stack and structure

Next.js (App Router, TypeScript) + Tailwind, Anthropic API (`claude-sonnet-5-5`, vision), browser Web Speech API for speaking and listening.
German UI first, simple language, huge tap targets, works on an iPhone in Safari.

| Folder | What lives there | Owner |
|---|---|---|
| `app/page.tsx`, `app/api/ask/` | Main flow: photo + voice question -> Claude -> big answer + read aloud | Batu (core) |
| `prompts/` | All Claude prompts, one file per use | whoever owns the feature |
| `app/learn/`, `prompts/exercises/` | Guided exercises (scam SMS, doctor letter, good questions) | Exercises owner |
| `app/family/`, `app/api/family/` | Family view: what was asked, scam warnings (fake sample data) | Family owner |
| `components/`, `app/globals.css` | Orb button, large-text cards, colors, accessibility | Design owner |
| `public/samples/` | Fake demo images (scam SMS, doctor letter, timetable, medication) | Design owner |
| `README.md`, `docs/demo-script.md` | Pitch, demo script, how to run, credits | Pitch owner |

**Rule: only edit your own folders.** Shared files (`app/layout.tsx`, `package.json`) only after telling the team.

## How to start (everyone)

1. Accept the GitHub invite, then `git clone https://github.com/BatuCani/elderwise && cd elderwise`.
2. Wait until the skeleton is on `main` (about 12:30, Batu says when), then `git pull`.
3. `cp .env.example .env` and paste your Claude API key. Never commit `.env`.
4. `npm install && npm run dev`, open http://localhost:3000.
5. Open Claude Code in the repo (`claude`) and paste your prompt from below.
6. Work on a branch (`git checkout -b <your-name>/<feature>`), commit small steps, push, open a PR to `main`.
   Pull `main` often.

## Copy-paste prompts for your AI agent

### Exercises owner

> Read CLAUDE.md and TEAM.md. Build the guided exercises in `app/learn/` with prompts in `prompts/exercises/`. Three exercises for older adults, German, very simple language, huge buttons: (1) "Ist diese SMS echt?" - show a fake scam SMS, the user guesses, Claude explains the warning signs; (2) "Arztbrief verstehen" - a fake doctor's letter, Claude explains it in plain words and the user learns to ask "Was bedeutet das für mich?"; (3) "Gute Fragen stellen" - the user asks Claude something, Claude gives gentle feedback on how to ask better. Use the existing `/api/ask` route or add `app/api/learn/`. Add a link from the main page. Only edit `app/learn/`, `prompts/exercises/` and the one link. Commit small steps on a branch and open a PR.

### Family owner

> Read CLAUDE.md and TEAM.md. Build the family view in `app/family/` (+ `app/api/family/` if needed). A son or daughter sees a simple timeline of what their parent asked Elderwise (use fake sample data in `app/family/sample-data.ts`), with a red warning card when Claude flagged a likely scam, and a one-tap "call Mum" button (tel: link). Claude writes a short daily summary for the family from the sample timeline. Clean, calm design. Only edit `app/family/` and `app/api/family/`. Commit small steps on a branch and open a PR.

### Design owner

> Read CLAUDE.md and TEAM.md. Own the look in `components/` and `app/globals.css`: a big glowing, breathing orb button (CSS animation, pulses while listening, ripples while speaking), very large high-contrast answer cards, calm warm colors, minimum 20px text, 64px tap targets, works in light and dark. Also create 4 fake demo images in `public/samples/` (scam SMS, doctor's letter, train timetable, medication box) as clean SVG or PNG mocks with no real personal data. Only edit `components/`, `app/globals.css` and `public/samples/`. Commit small steps on a branch and open a PR.

### Pitch owner

> Read CLAUDE.md and TEAM.md. Own `README.md` and `docs/demo-script.md`. README: Elderwise in one line, who it is for, their problem with AI today, what the demo lets them do (one sentence each), screenshots, how to run, tech stack, credits for open-source libraries, team members. Demo script: a 2-minute story with one older person (e.g. "Ingrid, 78, gets a suspicious SMS"), showing the orb, the spoken answer, the learning card, one exercise and the family warning. Mention YC's "AI for the Aging Population" Request for Startups as market proof. Only edit `README.md` and `docs/`.

## Timeline

| Time | Goal |
|---|---|
| 12:30 | Skeleton on `main`, everyone pulls and starts their part |
| 13:00-13:45 | Lunch - something must already run |
| 14:30 | All parts merged into `main` |
| 15:00 | Feature freeze, record the 2-minute demo video |
| 15:45 | Submit via https://tally.so/r/1WPr9Q (team, members, repo link, video link, audience) |
