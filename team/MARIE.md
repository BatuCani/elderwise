# MaRie - Answer cards (the Answers tab)

The Answers tab is where Elderwise shows what Claude said, as one big visual card instead of a wall of text.
You make every kind of answer look clear and beautiful: reminders, step-by-step help, explanations.

Do the Setup in [README.md](README.md) first.
Then copy everything inside the box below into Claude Code.

## Prompt for Claude

```text
You are helping MaRie, who is not a developer, build one part of Elderwise at a hackathon.
Explain what you do in simple words, work in small steps, and show MaRie how to check each step in the browser.

STEP 0 - get your bearings from GitHub (do this first, every time you start):
- Run: git checkout main && git pull
- Read these files fully: CLAUDE.md, TEAM.md, team/README.md, team/MARIE.md
- Read the code you will work with: prompts/elderwise.ts (the Answer type: type, headline, sentence, points, when, action, learned, tip), components/AnswerView.tsx (how one answer is drawn today), app/answers/page.tsx (the Answers tab: newest answer big, older ones as rows), lib/answers.ts (answers saved in the browser), app/globals.css (the glass styles)
- Summarize to MaRie in 5 bullet points how an answer is shown today.
- Create a branch: git checkout -b marie/answer-cards

PRODUCT CONTEXT:
Elderwise is a mobile web app for older adults (65+), English UI, Liquid Glass look (white glass cards with a 1px border on a flat warm cream canvas, background #F4F1EA, ink #1E2420, muted #5E6660, accent moss #3F5A3A, scam red #8E2424, fonts Fraunces for headlines and Atkinson Hyperlegible for text, min 19px text, min 48px tap targets). Design: https://app.paper.design/file/01M54P2AW7DMM9SRH5B5DKTZ5M (screen "3 Answers"). The red warning card already exists and looks right - keep it as the reference for quality.

YOUR TASK:
Make each answer type its own polished card. Create the folder components/cards/ with:
  1. ReminderCard.tsx - for type "reminder": a big calendar-style block (weekday + day number large, time large, place below), the headline, and a big moss button "Add to calendar" that downloads an .ics file for that date/time (build the .ics text in the browser, no library needed; use answer.when; if when is missing, hide the button).
  2. StepsCard.tsx - for type "steps": the headline, then each point as a numbered step in its own glass row with a big number circle (1, 2, 3), so someone can follow along.
  3. ExplainCard.tsx - for type "explain": headline, the plain sentence large, and the points as "What this means for you" bullets with a small moss check icon.
  4. InfoCard.tsx - for type "info": simple glass card with headline and sentence.
  5. EmptyAnswers.tsx - shown on the Answers tab when there are no answers yet: a friendly illustration made with simple shapes (no emoji), "No answers yet", and a big button "Ask something" that goes to the Talk tab (link to "/").
  6. index.ts that exports all of them.
Then in components/AnswerView.tsx pick the right card by answer.type (keep the existing red warning card exactly as it is for "warning"). In app/answers/page.tsx show EmptyAnswers when the list is empty.
IMPORTANT: leave the action button block in AnswerView.tsx (the "Tell my daughter Anna" button) where it is and unchanged - Endrik is rebuilding that button at the same time. Just make sure every card still shows it below the card when answer.action exists.

To test without speaking, open http://localhost:3000 and type these on the Talk tab:
  - "Remind me: doctor appointment Tuesday 10:30 at Dr. Weber" (reminder)
  - "How do I make the text on my phone bigger?" (steps)
  - "Explain: Diagnosis mild arterial hypertension, reduce sodium intake" (explain)
  - "What is the weather usually like in Berlin in October?" (info)
Each one should land on the Answers tab with the right card. Test in a phone-sized window (Chrome F12 -> phone icon -> iPhone 14) and show MaRie.

FILES YOU MAY CHANGE: components/cards/* (new), components/AnswerView.tsx (except the action button block), app/answers/page.tsx. Nothing else. If something else needs to change, write it down for Batu instead.

FINISH:
- Run: npm run lint and npm run build. Both must pass. Fix only problems in your files.
- Commit with clear messages, push: git push -u origin marie/answer-cards
- Open a Pull Request to main (gh pr create --fill, or tell MaRie to open it on github.com) with a screenshot of each card in the description.
- Tell MaRie: "Send the PR link to Batu."

Never put an API key into any committed file. Never use real personal data.
```
