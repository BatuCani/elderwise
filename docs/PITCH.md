# Grace

### Just say it.

A patient voice AI companion for people 65+. Say what you need, show a photo if you like, and get one calm answer that is read aloud. Every answer teaches one AI skill.

*Claude Impact Lab Berlin, 17 October 2026*

---

## The problem

880 million people worldwide are 65 or older.

AI could help them every day. Almost none of them use it, because every AI product assumes you can read dense screens, type well and know what to ask.

Meanwhile scammers already use AI against them.

---

## The numbers

| | |
|---|---|
| **28%** | of people aged 65 to 74 in the EU have basic digital skills. The other 72% don't. |
| **1 in 4** | people over 60 live with disabling hearing loss |
| **39%** | of US adults over 65 take five or more medications every day |
| **1 in 18** | older adults fall victim to fraud or scams every year |
| **$4.9 bn** | lost by Americans over 60 to reported online fraud in 2024 |

Behind most of these sits the same moment: a letter, a text message or a medication box that nobody explains.

---

## The insight

Older adults don't learn AI from tutorials. They learn it by solving a problem that matters to them today.

Psychology calls this a mastery experience: succeeding at something yourself is the strongest source of confidence that you can do it again.

**Grace solves the problem first. Then it shows you what you just did.**

---

## How it works

**Talk.** One question on the screen: "How can I help?" One glowing button: just say it. Add a photo of the letter or text if you like.

**Answers.** One big, calm card: a scam alert, an explanation, steps or a reminder. A headline of six words at most, one sentence, three points at most. Read aloud.

**You learned.** Every answer ends with what you just did with AI, and one tip to ask even better next time.

**Profile.** Text size, speaking speed, English or German, and a trusted person one tap away.

---

## Designed with psychology

**One screen, one job.** No menus, no chat history to scroll through.

**Plain words.** No "online", no "upload", no jargon. Numbers and amounts are copied exactly from the photo, never invented.

**See and hear.** Every answer is shown in large text and read aloud, because one in four users has hearing loss.

**Calm, never shaming.** A scam alert says what to do, not what you did wrong.

**The person decides.** Grace explains and suggests. Calling the trusted person is always one tap, never automatic.

---

## Demo: Ingrid, 78

<!-- Keep in sync with docs/demo-script.md -->

Ingrid gets a text: her parcel is held, she should pay a small fee via a link.

She opens Grace, taps the glowing button and asks: "Is this real?" The button glows with her voice.

The Answers card turns deep red: a scam alert, three plain reasons, read aloud. One tap: "Tell my daughter Anna".

The "You learned" card: she just asked AI to check a message, and she can do this with any text, letter or email.

---

## Under the hood

Next.js and Tailwind in the phone's browser. No install.

Claude Sonnet 5.5 with vision reads the photo and the spoken question.

Structured output (a JSON schema) turns every answer into a visual card instead of a wall of text: type, headline, sentence, points, action, "You learned" and tip.

The real-time voice is Gemini Live, but it only speaks for Claude: every real question goes to Claude through one tool, and the card on screen is Claude's answer.

All prompts live in one file, `prompts/elderwise.ts`. voice-glow for the live voice effect, English and German.

---

## Why now and who pays

Y Combinator lists *AI for the Aging Population* in its Requests for Startups.
<!-- Verify on ycombinator.com/rfs and link it before presenting -->

**Families:** a subscription to keep parents independent and safe.

**Banks and insurers:** fewer scam losses, fewer routine support calls.

**Cities and senior organisations:** digital inclusion at scale.

*Hypotheses we want to validate, not signed customers.*

---

## What comes next

**Family code word.** Grace helps the family agree on a secret word, so Ingrid can tell a fake "grandchild" call from a real one.

**Step by step.** For letters that need action, one step per screen, with two buttons only: "Done" or "I don't understand".

**Practise.** Short exercises like "Real or fake?" with harmless sample messages.

**My skills.** Every solved problem becomes a skill Ingrid keeps: "I can check if a message is real."

---

## AI should adapt to people. Not the other way round.

### Grace.

<!-- Team: add names and roles here -->

---

### Sources

Population 65+: UN World Population Prospects 2024, projection for 2026 (8.3 bn people, 10.6% aged 65+)
Digital skills: [Eurostat, Digital skills in 2023](https://ec.europa.eu/eurostat/statistics-explained/index.php/Skills_for_the_digital_age)
Hearing loss: WHO, World Report on Hearing 2021
Medications: [Liu et al., BMC Geriatrics 2023](https://pmc.ncbi.nlm.nih.gov/articles/PMC9900971)
Fraud prevalence: [Burnes et al., American Journal of Public Health 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5508139)
Fraud losses: FBI Internet Crime Complaint Center, 2024 Internet Crime Report, Elder Fraud section ($4.885 bn, 147,127 complaints)
Mastery experiences: Bandura, A. (1977). Self-efficacy: Toward a unifying theory of behavioral change. Psychological Review, 84(2).
