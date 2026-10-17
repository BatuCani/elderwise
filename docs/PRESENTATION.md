# Grace: 5-minute finalist presentation

For the finalist round at 16:40 (6 minutes demo + 4 minutes Q&A). The script runs about 5 minutes, which leaves one minute of buffer.
Roles: **Speaker** (any teammate) talks. **Demo** (one teammate) drives the phone, mirrored to the big screen. **Doctor** (a second teammate) reads two lines in demo 2.

## Summary

Grace is a voice AI companion for people over 65. You talk to it or show it a photo, and Claude answers with one calm, large card that is read aloud. Every answer ends with "You learned", so people pick up one AI skill each time they use it. The live demo shows three moments: a scam text caught and explained, "Listen for me" writing along at the doctor's and summing up the visit, and the Learn tab with 24 short lessons. Claude is the brain behind every answer; the real-time voice only speaks for it.

## Before you go on stage

- Phone mirrored to the screen, sound on, silent mode off, notifications off.
- Live app open on the Talk tab: https://elderwise-beryl.vercel.app (Profile: English, text size Normal, name Ingrid, trusted person Anna).
- Answers tab cleared ("Clear history"), so the demo starts empty.
- A second browser tab already open on `/listen` (until "Listen for me" has its own button on Talk).
- One test question right before, so you know the API works.
- Backup: the 2-minute demo video, ready to play if the Wi-Fi or the API fails.

## Script

| Time | Who | What happens on screen | What is said |
|---|---|---|---|
| 0:00 | Speaker | Grace logo on the Talk screen | "Meet Ingrid. She's 78. She ran a bakery for thirty years and still does the crossword in pen. But lately the world speaks a language she never learned. Letters full of jargon. Apps that time out. And texts like this one." |
| 0:20 | Demo | Camera → "Add a photo" → example **parcel text message** | "Ingrid isn't alone. In the EU, only 28 percent of people aged 65 to 74 have basic digital skills. One in four people over 60 has disabling hearing loss. And every year, about one in eighteen older adults falls for a scam." |
| 0:40 | Speaker | Talk screen | "So we built Grace. Not another chatbot, but a companion you simply talk to. It reads the small print with you, and it teaches you a little AI every time you use it. Psychology tells us why people avoid AI. It's almost never that they can't. It's that nobody showed them, on a problem that matters to them." |
| 1:05 | Demo | Tap the big button and ask out loud: **"Grace, is this message real?"** The words appear large while speaking. | "One button. Ingrid just talks, the way she'd ask a person. Her words appear in big letters while she speaks." |
| 1:25 | Demo | Answers: the deep red **scam alert** card, read aloud | Let Grace read for a few seconds. Then: "One calm card. Deep red means scam. Three plain reasons, read aloud, and slower if she wants." |
| 1:50 | Demo | Tap **Tell Anna** | "One tap, and her daughter Anna gets a real message. Ingrid stays in charge, and her family stays in the loop." |
| 2:05 | Demo | Scroll to the **You learned** card | "And this is the part we care about most. 'You learned: you asked AI to check a message. You can do this with any text, letter or email.' Ingrid wasn't just helped. She learned something." |
| 2:30 | Demo | Switch to the `/listen` tab: the consent card | "Now something Ingrid couldn't do before. At the doctor's, she misses half of what is said. So Grace first shows a card she can hold up: 'I hear poorly. May my phone write down what you say? Nothing is saved as sound.' Respect for both sides of the desk." |
| 2:55 | Doctor, Demo | Tap **Start writing along**. Doctor reads: *"Your blood pressure is a little high. Please take one tablet every morning, and come back on Tuesday at ten thirty."* Huge live captions appear. | (Let the captions speak for themselves.) |
| 3:15 | Demo | Tap **Done, sum it up** → reminder card with the calendar block and **Add to calendar** | "Claude turns the conversation into one card: what to do, and the next appointment, straight into her calendar. It never adds anything the doctor didn't say, and it flags what may have been misheard." |
| 3:40 | Demo | Learn tab: topic tiles, open **Spot scams**, show a lesson and **Try it with Grace** | "When Ingrid is ready, the Learn tab has 24 short lessons: scams, letters, medicines, money, her phone. Each one ends with 'Try it with Grace'. Psychologists call this a mastery experience: succeeding yourself is the strongest source of confidence. That idea is behind every screen." |
| 4:15 | Speaker | Talk screen | "Under the hood, Claude Sonnet 5.5 is the brain. It reads the photo, spots the scam pattern and answers in a fixed structure that becomes these cards. The real-time voice only speaks; every real question goes to Claude. Big text, plain words, English and German, and it installs on any phone like an app." |
| 4:40 | Speaker | Grace logo | "Three weeks later, at her Thursday card club, Ingrid's friend Herbert holds up his phone, worried about a strange message. Ingrid smiles: 'Let me show you something.' That's AI education for everyone. This is Grace. Thank you." |

## If something goes wrong

- **No sound or no microphone:** type the question in the bar above the tab bar; the answer card is the same.
- **Claude is slow:** keep talking ("Claude is reading the photo right now"), don't wait in silence.
- **Live captions don't start:** say "this is where Grace writes along", and show the summary from the demo video instead.
- **Wi-Fi or API down:** switch to the backup video right away and narrate over it.

## Likely questions (short answers)

- **Privacy?** No sound is ever saved. Answers stay on the phone unless Ingrid creates an account. Text and photos go to Claude only to answer the question.
- **What if Claude is wrong?** It only explains what is printed or said, never invents numbers, and sends medical, legal and money decisions to the doctor, pharmacist or bank. When unsure, it says so.
- **False scam alarms?** Grace says "likely", gives the reasons, and suggests checking with the trusted person. People learn the warning signs instead of blindly trusting a verdict.
- **Why a second AI for the voice?** Real-time conversation needs a voice model. Every real question and every answer card comes from Claude.
- **Who pays?** Hypotheses, not customers yet: families as a subscription, banks and insurers to reduce scam losses and support calls, cities and senior organisations for digital inclusion.
- **Why not just a general voice assistant?** It expects you to know what to ask, answers in a wall of text, and teaches nothing. Grace starts from the letter on the kitchen table, answers in one calm card, and ends every answer with a skill.

## Sources for the numbers

See `docs/PITCH.md`: Eurostat 2023 (digital skills), WHO (hearing loss), Burnes et al. 2017 (fraud prevalence), FBI IC3 2024 (fraud losses), Bandura 1977 (mastery experiences).
