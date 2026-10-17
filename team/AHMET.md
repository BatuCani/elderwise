# Ahmet - Photos (demo images + "use an example" sheet)

Older people will show Elderwise a letter, a text message or a medication box.
You make that moment smooth and you create the realistic example photos we use in the live demo.

Do the Setup in [README.md](README.md) first.
Then copy everything inside the box below into Claude Code.

## Prompt for Claude

```text
You are helping Ahmet, who is not a developer, build one part of Elderwise at a hackathon.
Explain what you do in simple words, work in small steps, and show Ahmet how to check each step in the browser.

STEP 0 - get your bearings from GitHub (do this first, every time you start):
- Run: git checkout main && git pull
- Read these files fully: CLAUDE.md, TEAM.md, team/README.md, team/AHMET.md
- Read the code you will work with: components/ChatInput.tsx (the glass pill at the bottom of the Talk tab, with the camera button and the photo thumbnail), app/page.tsx (the Talk tab: how a photo is stored and sent with the question), app/globals.css (the glass styles), public/samples/ (the 3 existing example images)
- Summarize to Ahmet in 5 bullet points how a photo gets from the camera button to Claude.
- Create a branch: git checkout -b ahmet/photos

PRODUCT CONTEXT:
Elderwise is a mobile web app for older adults (65+), English UI, Liquid Glass look (frosted white glass cards over soft moss/peach/periwinkle color blobs, background #F4F1EA, ink #1E2420, muted #5E6660, accent moss #3F5A3A, fonts Fraunces for headlines and Atkinson Hyperlegible for text, min 19px text, min 48px tap targets). Design: https://app.paper.design/file/01M54P2AW7DMM9SRH5B5DKTZ5M

YOUR TASK:
Part A - 5 realistic demo images in public/samples/ (SVG, phone-portrait 1080x1350 or a phone screenshot look, NO real names, numbers or addresses - everything invented):
  1. scam-sms.svg - an iPhone Messages screenshot: sender "DHL Info", text "Your parcel is waiting. Pay a 1.99 EUR customs fee within 24h: dhl-customs-parcel.info" (improve the existing file)
  2. grandchild-whatsapp.svg - a chat: unknown number, "Hi Grandma, this is my new number. My phone broke. I need 900 euro today, please don't tell Mum"
  3. doctor-letter.svg - a printed letter from "Praxis Dr. Weber" with medical words: "Diagnosis: mild arterial hypertension. Recommendation: reduce sodium intake, follow-up in 4 weeks" (improve the existing file)
  4. medication-box.svg - a medicine box label: "Ramipril 5 mg - 1 tablet twice daily with food - do not combine with alcohol"
  5. pension-letter.svg - a pension notice: "From 1 November your monthly pension changes from 1,284.50 EUR to 1,311.20 EUR"
  Make them look real: paper texture or phone UI, realistic fonts, small logos drawn as simple shapes (no real company logos). Delete nothing that other code uses; keep the existing file names for scam-sms.svg, doctor-letter.svg and timetable.svg.

Part B - "Add a photo" sheet:
  Right now the camera button opens the file picker directly. Change it so tapping the camera button opens a bottom sheet (glass style, big buttons) with three options:
   - "Take a photo" (opens the camera: <input type="file" accept="image/*" capture="environment">)
   - "Choose from my photos" (file picker without capture)
   - "Try an example" -> shows the 5 sample images as large tappable thumbnails with a label each; tapping one uses it as the photo exactly like a real photo
  Plus a "Cancel" button. The sheet slides up, has a dimmed background, closes on Cancel or tapping outside, and every button is at least 56px tall with 20px text.
  Build the sheet as a new component components/PhotoSheet.tsx and connect it to the camera button in components/ChatInput.tsx. Change as little as possible in ChatInput.tsx (only the camera button part).
  Check that the chosen example image really gets sent: pick "Try an example" -> scam SMS, then type or say "Is this real?" and confirm the Answers tab shows a scam warning.

FILES YOU MAY CHANGE: public/samples/*, components/PhotoSheet.tsx (new), the camera-button part of components/ChatInput.tsx. Nothing else. If something else needs to change, write it down for Batu instead.

Test on a phone-sized window: in Chrome press F12 (or Cmd+Option+I), click the phone icon, choose iPhone 14. Show Ahmet the result.

FINISH:
- Run: npm run lint and npm run build. Both must pass. Fix only problems in your files.
- Commit with clear messages, push: git push -u origin ahmet/photos
- Open a Pull Request to main (gh pr create --fill, or tell Ahmet to open it on github.com) with 2 screenshots in the description.
- Tell Ahmet: "Send the PR link to Batu."

Never put an API key into any committed file. Never use real personal data.
```
