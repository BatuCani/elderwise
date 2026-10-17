# Elderwise

### Show it. Ask it. Learn it.

A patient voice AI companion that helps people 65+ use AI on their own real problems, and learn how AI works while doing it.

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

Behind most of these sits the same moment: a letter, an SMS or a leaflet that nobody explains.

---

## The insight

Older adults don't learn AI from tutorials. They learn it by solving a problem that matters to them today.

Psychology calls this a mastery experience: succeeding at something yourself is the strongest source of confidence that you can do it again.

**Elderwise solves the problem first. Then it shows you how you did it.**

---

## How it works

**Show it.** Hold up a letter, an SMS, a medication box or a timetable.

**Ask it.** Press the big glowing orb and ask out loud. No typing, no menus, no prompts.

**Understand it.** Claude answers in simple words, in very large text, and reads the answer aloud.

**Learn it.** A short card explains what you just did with AI, so next time you know you can.

---

## Learning built in

**Guided exercises** teach real skills in a few minutes each: spotting a scam SMS, understanding a doctor's letter, asking a good question.

**A family view** lets a son or daughter see what was asked and get a warning when Claude suspects a scam.

The goal is independence, not dependence. Every answer makes the next question easier to ask alone.

---

## Design principles

**See and hear.** Every answer is spoken and shown in large text, because one in four users has hearing loss.

**One button.** One orb, huge tap targets, minimum 20px text.

**Simple, never childish.** Plain language that respects adults.

**Honest about limits.** No certainty claims on fraud, medicine or law. When unsure, Elderwise says who to ask. It never acts without a clear yes.

---

## Demo: Ingrid, 78

<!-- Keep in sync with docs/demo-script.md -->

Ingrid gets an SMS: "Your parcel is held, pay €1.99 here." She shows it to Elderwise and asks: "Is this real?"

Elderwise warns her, points out the warning signs, and reads it aloud.

The learning card: "You just asked AI to check a message. You can do this with any message."

Her daughter sees the scam warning in the family view.

---

## Under the hood

<!-- Update this slide to match what we actually built -->

Next.js and Tailwind, running in Safari on any phone. No install.

Claude Sonnet 5.5 with vision reads the photo and answers in plain language. All prompts live in `prompts/`.

Browser Web Speech API for listening and speaking. German first, any language next.

---

## Why now and who pays

Y Combinator lists *AI for the Aging Population* in its Requests for Startups.
<!-- Verify on ycombinator.com/rfs and link it before presenting -->

**Families:** a subscription to keep parents independent and safe.

**Banks and insurers:** fewer scam losses, fewer routine support calls.

**Cities and senior organisations:** digital inclusion at scale.

*Hypotheses we want to validate, not signed customers.*

---

## AI should adapt to people. Not the other way round.

### Elderwise.

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
