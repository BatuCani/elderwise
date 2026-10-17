# Sam - Elderwise's brain (how Claude answers)

You make sure every answer Elderwise gives is short, kind, correct and helpful for a 78-year-old.
This is the part judges notice most: if the answers are great, the demo is great.

Do the Setup in [README.md](README.md) first.
Then copy everything inside the box below into Claude Code.

## Prompt for Claude

```text
You are helping Sam, who is not a developer, build one part of Elderwise at a hackathon.
Explain what you do in simple words, work in small steps, and show Sam how to check each step in the browser.

STEP 0 - get your bearings from GitHub (do this first, every time you start):
- Run: git checkout main && git pull
- Read these files fully: CLAUDE.md, TEAM.md, team/README.md, team/SAM.md
- Read the code you will work with: prompts/elderwise.ts (the system prompt and the Answer type), app/api/ask/route.ts (how the question and photo go to Claude and how the JSON answer comes back), components/AnswerView.tsx (how an answer is shown)
- Summarize to Sam in 5 bullet points how a question becomes an answer card.
- Create a branch: git checkout -b sam/answer-quality

PRODUCT CONTEXT:
Elderwise is a mobile web app for older adults (65+). They speak a question and optionally add a photo (a letter, a text message, a medication box). Claude answers with JSON that the app turns into one visual card. Answer types: warning, explain, steps, reminder, info. Each answer has a short headline, one plain sentence, up to 3 points, an optional action (e.g. "Tell my daughter Anna"), a "learned" sentence and a tip. Audience: English UI, simple words, no jargon, calm and respectful tone ("you"), never patronizing.

YOUR TASK:
1. Create docs/test-cases.md with 10 realistic situations older adults face. For each: a title, the exact spoken question, a description of the photo if there is one, and what a perfect answer looks like (type, headline, key points). Use these 10:
   1. Fake DHL text asking for a 1.99 customs fee with a link
   2. "Grandchild in trouble" WhatsApp: "Hi Grandma, new number, I need 900 euro today"
   3. Email "Your bank account is locked, confirm your PIN here"
   4. A doctor's letter with a diagnosis in medical words (e.g. "mild hypertension, reduce sodium")
   5. A pension notice saying the monthly amount changes next month
   6. A medication box: "Take 1 tablet twice daily with food, do not combine with alcohol"
   7. "Remind me: doctor appointment Tuesday 10:30 at Dr. Weber"
   8. An electricity bill that is higher than usual
   9. A phone call where someone says they are from Microsoft and your computer has a virus
   10. "How do I make the text on my phone bigger?"
2. For each test case, send it to the running app's API and save the real answer. Use curl against http://localhost:3000/api/ask with form fields: question (the text) and lang=en, for example:
   curl -s -X POST http://localhost:3000/api/ask -F 'question=Is this real? ...' -F lang=en
   (For photo cases, describe the photo text inside the question for now.)
   Paste each real answer under its test case in docs/test-cases.md and mark it GOOD or NEEDS WORK with one sentence why.
3. Improve the system prompt in prompts/elderwise.ts until all 10 are GOOD. Rules for a perfect answer:
   - headline: max 6 words, says the most important thing ("Don't pay this text.")
   - sentence: one plain sentence, max 20 words
   - points: max 3, each max 12 words, concrete
   - type: warning for any scam or danger, reminder when a date/time is involved, steps for "how do I", explain for letters and documents, info otherwise
   - scams: always say clearly "do not pay / do not click / do not share your PIN", and offer the action to tell the trusted person
   - health and money: explain, never give medical, legal or financial advice; suggest asking the doctor, pharmacist or a trusted person
   - learned: one sentence that teaches the AI skill the person just used ("You showed the AI a photo and asked if it was real.")
   - tip: one sentence with a next AI skill to try
   Keep the JSON shape exactly the same (do not rename or remove fields), otherwise the app breaks.
4. After changing the prompt, re-run all 10 and update docs/test-cases.md.
5. Check in the browser at http://localhost:3000: ask 2 of the questions on the Talk tab and look at the Answers tab. Tell Sam what to look for.

FILES YOU MAY CHANGE: prompts/elderwise.ts, docs/test-cases.md. Nothing else. If something else needs to change, write it down for Batu instead.

FINISH:
- Run: npm run lint and npm run build. Both must pass. Fix only problems in your files.
- Commit with a clear message, push the branch: git push -u origin sam/answer-quality
- Open a Pull Request to main with the GitHub CLI if available (gh pr create --fill) or tell Sam to open it on github.com. In the PR description list the 10 cases and how many are GOOD.
- Tell Sam: "Send the PR link to Batu."

Never put an API key into any committed file. Never use real personal data.
```
