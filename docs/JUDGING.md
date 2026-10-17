# Judging, rules and submission

Source of truth: the official event page
https://github.com/Claude-Community-Berlin/claude-impact-lab-berlin-2026-10-17
(summarised here on 17 Oct 2026, 14:00. If anything differs, the event page wins.)

## Official judging criteria

The event page lists five criteria. It gives **no point values** and does not say how grades are combined.

| Criterion | Guiding question from the event page |
|---|---|
| **Impact** | Does it solve a real problem from the themes? Who benefits? |
| **Use of Claude** | Is Claude used in a smart, meaningful way? |
| **Execution** | Does it work? Can we see it working? |
| **Creativity** | Is the idea or approach fresh? |
| **Presentation** | Is it clear in 6 minutes? |

Our team template (`CLAUDE.md`) uses a different, weighted version. We treat it as a guide to what matters most:

| Criterion (CLAUDE.md) | Points |
|---|---|
| Impact: does it help a real audience learn or use AI, would they actually use it? | 40 |
| Working demo: does it really run? | 20 |
| Technical quality: is it well built? | 20 |
| Creativity: is the idea fresh? | 20 |

## Official timeline

| Time | What |
|---|---|
| 15:00 | Record the demo video now |
| **16:00** | **Hard submission deadline.** Late submissions are not judged |
| 16:05 | Judges review submissions and pick **5 finalists** |
| 16:40 | Finalists present: **6-minute demo + 4 minutes Q&A** |
| 17:30 | Judges grade |
| 17:45 | Winners announced |

Team-internal: everything merged into `main` by **15:30**.

## Official rules (short)

Build on the day. Claude must be part of the solution, not just the tool that wrote the code. Teams of 3 to 5 with mixed backgrounds. Public repo with a README anyone can follow. No secrets in Git (keys only in the git-ignored `.env`). Credit open-source libraries, APIs and assets in the README. Be kind. 16:00 is final.

## How to submit (official event page)

**Option A, no git needed:** in the event repo, go to Issues → New issue → "Team submission", fill in the form, submit. A bot creates `submissions/<team-name>.md` and opens a pull request. To change something later, edit the issue.

**Option B, by hand:** copy `submissions/_TEMPLATE.md` to `submissions/<team-name>.md` in the event repo, fill in the repo link, one-line pitch and team (all required) and the 2-minute demo video (optional), and open a pull request that adds only that file.

Note: our `CLAUDE.md` also mentions a Tally form (https://tally.so/r/1WPr9Q). Ask the organisers which one counts, or submit through both to be safe.

## Where Elderwise stands and how we reach full marks

**Impact.** Strong audience and problem. Missing: proof that older people want it, and visible learning. Actions: one real voice over 65 in the video or pitch; make learning cumulative (an "Aha" card per answer and a "My skills" list), not a single sentence.

**Use of Claude.** Vision on messy photos, structured output that becomes visual cards, fallback model. Risk: if Gemini Live (PR #9) does the talking, the pitch must make clear that every answer, warning and lesson comes from Claude.

**Execution.** Our strongest area: live, installable on iPhone, many merged pull requests. Actions: freeze at 15:30, run the full demo once on a real iPhone, record a backup video.

**Creativity.** Our weakest area: "voice assistant for seniors" is familiar. Proposed signature idea: a **family code word**. The family sets a secret word in Profile; when Claude spots a "grandchild in trouble" or "new number" scam, the red card says "Ask them for your family word". A low-tech human ritual against AI voice clones, taught by AI. Pitch-only vision: a monthly harmless practice scam ("scam vaccine") and "teach a friend" cards.

**Presentation.** Prepare the 6-minute finalist slot now: live demo on a phone mirrored to the screen, backup video, and short answers to the obvious questions (privacy, wrong answers, false scam alarms, who pays, why not just use a general voice assistant).
