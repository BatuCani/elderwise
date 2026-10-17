# Endrik - "Tell Anna" + Profile + accessibility

When Elderwise spots a scam, the most important thing is that the family hears about it.
You make the "Tell my daughter Anna" button really send a message, let people set who their trusted person is, and check that everything is easy to read for older eyes.

Do the Setup in [README.md](README.md) first.
Then copy everything inside the box below into Claude Code.

## Prompt for Claude

```text
You are helping Endrik, who is not a developer, build one part of Elderwise at a hackathon.
Explain what you do in simple words, work in small steps, and show Endrik how to check each step in the browser.

STEP 0 - get your bearings from GitHub (do this first, every time you start):
- Run: git checkout main && git pull
- Read these files fully: CLAUDE.md, TEAM.md, team/README.md, team/ENDRIK.md
- Read the code you will work with: lib/profile.ts (name, fontSize, speechRate, lang, trusted person - saved in the browser), app/profile/page.tsx (the Profile tab), components/ProfileRoot.tsx (applies the font size to the whole app), components/AnswerView.tsx (look ONLY at the action button block that renders "Tell my daughter Anna" with a tel: link), lib/speech.ts (reading answers aloud)
- Summarize to Endrik in 5 bullet points what the Profile tab does today and what the "Tell Anna" button does today.
- Create a branch: git checkout -b endrik/tell-anna-profile

PRODUCT CONTEXT:
Elderwise is a mobile web app for older adults (65+), English UI, Liquid Glass look (frosted white glass cards over soft color blobs, background #F4F1EA, ink #1E2420, muted #5E6660, accent moss #3F5A3A, scam red #8E2424, fonts Fraunces for headlines and Atkinson Hyperlegible for text, min 19px text, min 48px tap targets). Design: https://app.paper.design/file/01M54P2AW7DMM9SRH5B5DKTZ5M (screen "4 Profile").

YOUR TASK:
Part A - "Tell Anna" really sends a message:
  Create components/TellTrustedButton.tsx. It receives the answer (headline, sentence, question) and the trusted person from the profile. Tapping it opens a small glass sheet with:
   - "Send a message" -> opens the phone's SMS app with a prefilled text, using an sms: link, e.g. "Hi Anna, Elderwise warned me about a message: 'Don't pay this text.' Can you call me? - Ingrid". On phones that support it, offer the native share sheet instead (navigator.share) with the same text.
   - "Call Anna" -> tel: link
   - "Cancel"
  Buttons at least 56px tall, 20px text, the trusted person's name taken from the profile (not hardcoded).
  Then replace ONLY the action button block in components/AnswerView.tsx with <TellTrustedButton ... />. Do not change anything else in that file (MaRie is editing the rest of it at the same time).

Part B - Profile tab works for real:
  - Text size row: tapping cycles Normal -> Large -> Extra large (or opens a small chooser) and the whole app's text grows immediately (check ProfileRoot already does this; fix if not).
  - Speaking speed: a big slider from Slow to Fast; it changes profile.speechRate and the "Read aloud" voice really gets slower/faster (check lib/speech.ts uses it).
  - Trusted person card: an "Edit" button opens a simple glass form with Name, Relation (e.g. daughter) and Phone number fields (big inputs, 20px text) and a "Save" button; saved into the profile.
  - Name: tapping the name lets Ingrid change it; the Talk tab greeting uses it.

Part C - accessibility check of the whole app (Talk, Answers, Profile) at iPhone size:
  - every text at least 19px (labels 16px minimum), contrast at least 4.5:1, every button at least 48px, every icon-only button has an aria-label, nothing is cut off or overlaps the floating navbar.
  - Write what you found and fixed in docs/qa.md. Fix issues only inside your files; list other issues for Batu in docs/qa.md.

Test in a phone-sized window (Chrome F12 -> phone icon -> iPhone 14). Show Endrik each part working.

FILES YOU MAY CHANGE: components/TellTrustedButton.tsx (new), the action button block in components/AnswerView.tsx, app/profile/page.tsx, components/ProfileRoot.tsx, lib/profile.ts, lib/speech.ts, docs/qa.md. Nothing else. If something else needs to change, write it down for Batu instead.

FINISH:
- Run: npm run lint and npm run build. Both must pass. Fix only problems in your files.
- Commit with clear messages, push: git push -u origin endrik/tell-anna-profile
- Open a Pull Request to main (gh pr create --fill, or tell Endrik to open it on github.com) with screenshots of the sheet and the Profile tab.
- Tell Endrik: "Send the PR link to Batu."

Never put an API key into any committed file. Never use real personal data (use invented phone numbers like +49 30 0000000).
```
