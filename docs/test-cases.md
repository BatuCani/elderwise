# Test cases: answer quality

Ten situations older adults really face. Each one was sent to the app's API (`POST /api/ask`, `lang=en`, today = Saturday 17 October 2026).
Photo cases describe the photo text inside the question, as the issue says.

**Rules for a GOOD answer:** headline at most 6 words, one sentence at most 20 words, at most 3 points of at most 12 words,
the right card type, 1 to 5 clear steps (title at most 5 words, detail says exactly what to do), scams always say
do not pay / click / share your PIN and offer to tell the trusted person, health and money answers explain but never advise,
`learned` teaches the AI skill just used and `tip` suggests a next skill.

## Summary

**10 of 10 GOOD after the new prompt** (5 of 10 before). A second full run with the new prompt also passed all length and card-type checks.

| # | Case | Before | After |
|---|---|---|---|
| 1 | Fake DHL text | GOOD | GOOD |
| 2 | Grandchild in trouble | GOOD | GOOD |
| 3 | Bank PIN email | GOOD | GOOD |
| 4 | Doctor's letter | NEEDS WORK | GOOD |
| 5 | Pension change | GOOD | GOOD |
| 6 | Medication box | NEEDS WORK | GOOD |
| 7 | Doctor reminder | NEEDS WORK | GOOD |
| 8 | Higher electricity bill | NEEDS WORK | GOOD |
| 9 | Microsoft virus call | GOOD | GOOD |
| 10 | Bigger phone text | NEEDS WORK | GOOD |

## 1. Fake DHL text

- **Spoken question:** I got this text message. Is this real? It says: "DHL: Your parcel is held at customs. Pay the 1.99 EUR fee here to release it: dhl-parcel-fee.info/pay"
- **Photo:** A screenshot of an SMS from an unknown number with a short link.
- **Perfect answer:** type warning. Headline like "Don't pay this text." Says it is a scam, do not click the link, do not pay. Steps: don't tap the link, delete the text, tell Anna. Action: tell daughter Anna.

### Before (old prompt): GOOD: warning card, says do not tap the link, offers to tell Anna; only the tip repeats the same skill.

<details><summary>Real answer</summary>

```json
{
  "type": "warning",
  "headline": "Don't pay this text, Ingrid.",
  "sentence": "This looks like a scam message pretending to be DHL.",
  "points": [
    "Real DHL does not ask for fees through odd web links.",
    "The website ending .info is not a real DHL address.",
    "A tiny fee is used to steal your card details."
  ],
  "steps": [
    {
      "title": "Do not tap the link",
      "detail": "Do not open the web address in the message. Do not enter any card details."
    },
    {
      "title": "Check your real parcels",
      "detail": "If you expect a parcel, open the official DHL app or type dhl.de yourself into the browser."
    },
    {
      "title": "Delete the message",
      "detail": "Press and hold the message, then choose Delete. You can also report it as junk."
    },
    {
      "title": "Tell Anna",
      "detail": "Let Anna know about the text so she can help if more messages come."
    },
    {
      "title": "If you already paid",
      "detail": "Call your bank at once and ask them to block your card."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You checked a suspicious text with AI before paying, which kept you safe.",
  "tip": "Next time, also tell the AI if you are really expecting a parcel, so it can help you check it.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Claimed sender",
      "value": "DHL"
    },
    {
      "label": "Amount asked",
      "value": "1.99 EUR"
    },
    {
      "label": "Web address",
      "value": "dhl-parcel-fee.info/pay"
    }
  ]
}
```

</details>

### After (new prompt): GOOD: warning card, the sentence itself says do not click or pay, 4 clear safety steps, tell Anna offered.

```json
{
  "type": "warning",
  "headline": "Don't pay this text.",
  "sentence": "Do not click the link or pay anything, because this looks like a scam message.",
  "points": [
    "Real DHL fees are not paid on strange websites.",
    "The small fee is bait to steal card details.",
    "The web address is not an official DHL one."
  ],
  "steps": [
    {
      "title": "Do not click",
      "detail": "Leave the link alone and do not type in any card details."
    },
    {
      "title": "Delete the message",
      "detail": "Press and hold the message, then tap Delete. You can also choose Report junk if you see it."
    },
    {
      "title": "Check real parcels",
      "detail": "If you expect a parcel, open the official DHL website or app by typing it yourself."
    },
    {
      "title": "Tell Anna",
      "detail": "Let Anna know about this message so she can help if more arrive."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You showed the AI a message and asked if it was real.",
  "tip": "Next time, ask the AI what to look for in a message to spot a scam.",
  "place": null,
  "link": null
}
```

## 2. Grandchild in trouble

- **Spoken question:** I got this WhatsApp from an unknown number: "Hi Grandma, this is my new number. I'm in trouble and I need 900 euro today. Please don't tell Mum." What should I do?
- **Photo:** A WhatsApp message from an unknown number.
- **Perfect answer:** type warning. Headline like "This is likely a scam." Do not send money. Call your grandchild on the old number you know. Action: tell Anna.

### Before (old prompt): GOOD: warning, clearly says do not send money and call the grandchild on the known number.

<details><summary>Real answer</summary>

```json
{
  "type": "warning",
  "headline": "This looks like a scam.",
  "sentence": "Do not send any money, Ingrid, because this message has the signs of a known trick.",
  "points": [
    "Unknown number claiming to be family",
    "Money needed today, so you feel rushed",
    "Asks you to keep it secret from Mum"
  ],
  "steps": [
    {
      "title": "Do not send money",
      "detail": "Do not pay anything and do not share bank details, even if you feel worried."
    },
    {
      "title": "Do not reply",
      "detail": "Do not answer the message or click any link in it."
    },
    {
      "title": "Call your grandchild",
      "detail": "Use the old number you already know. Or call their parent to check they are safe."
    },
    {
      "title": "Tell Anna",
      "detail": "Show Anna the message so she can help you check."
    },
    {
      "title": "Block and report",
      "detail": "In WhatsApp, open the chat, tap the name, then choose Block and Report."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked an AI to check a worrying message and found out it looks like a scam.",
  "tip": "Next time, take a photo of the message and ask, 'Is this a scam, and what should I do?'",
  "place": null,
  "link": null,
  "fields": []
}
```

</details>

### After (new prompt): GOOD: warning, 'Do not pay' up front, call the known number, show Anna, block and report.

```json
{
  "type": "warning",
  "headline": "Do not send this money",
  "sentence": "Do not pay anything, because this looks like a common scam where someone pretends to be a grandchild.",
  "points": [
    "Scammers use new numbers and urgent trouble.",
    "They ask you to keep it secret.",
    "Real family will not mind you checking."
  ],
  "steps": [
    {
      "title": "Do not reply",
      "detail": "Do not send money or answer the message. Do not click any links it may send."
    },
    {
      "title": "Call your grandchild",
      "detail": "Use the phone number you already have saved for them. Ask if they really sent this."
    },
    {
      "title": "Tell Anna",
      "detail": "Show Anna the message, even though it says not to. Anna can help check if it is true."
    },
    {
      "title": "Block and report",
      "detail": "Open the chat, tap the number at the top, then choose Block and Report."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You showed the AI a message from an unknown number and asked if it was safe.",
  "tip": "Next time, ask the AI to help you write a calm reply or a question only your real grandchild could answer.",
  "place": null,
  "link": null,
  "fields": []
}
```

## 3. Bank PIN email

- **Spoken question:** I got this email: "Your bank account is locked. Confirm your PIN here within 24 hours or your account will be closed." with a button that says Confirm now. Is this from my bank?
- **Photo:** An email with a "Confirm now" button.
- **Perfect answer:** type warning. Headline like "Never share your PIN." Banks never ask for your PIN by email. Do not click, do not share your PIN, call the bank on the number on your card. Action: tell Anna.

### Before (old prompt): GOOD: warning, says the bank never asks for the PIN and to call the number on the card.

<details><summary>Real answer</summary>

```json
{
  "type": "warning",
  "headline": "This is a scam email.",
  "sentence": "Your bank will never ask for your PIN in an email.",
  "points": [
    "It pushes you to act within 24 hours.",
    "It asks for your secret PIN.",
    "The Confirm now button may lead to a fake website."
  ],
  "steps": [
    {
      "title": "Do not press the button",
      "detail": "Do not tap Confirm now or any link in the email."
    },
    {
      "title": "Never share your PIN",
      "detail": "Your bank will never ask for your PIN by email, phone or text."
    },
    {
      "title": "Delete the email",
      "detail": "Move it to spam or junk, then delete it."
    },
    {
      "title": "Check with your bank",
      "detail": "If you worry, call the number on the back of your bank card."
    },
    {
      "title": "Tell Anna",
      "detail": "Let your daughter know, so she can help you stay safe."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You checked a suspicious email with AI before clicking, which kept you safe.",
  "tip": "Next time, say who the email claims to be from and read out the sender's address too.",
  "place": null,
  "link": null,
  "fields": []
}
```

</details>

### After (new prompt): GOOD: warning, do not click and never share your PIN in the first sentence, call the number on the card.

```json
{
  "type": "warning",
  "headline": "Do not confirm. It's a scam.",
  "sentence": "Do not click the button or share your PIN, because banks never ask for your PIN by email.",
  "points": [
    "Fake emails use fear and short deadlines.",
    "Your real bank already knows your PIN.",
    "The button may lead to a fake website."
  ],
  "steps": [
    {
      "title": "Do not click",
      "detail": "Leave the Confirm now button alone. Do not type your PIN anywhere."
    },
    {
      "title": "Delete the email",
      "detail": "Move the email to spam or the bin."
    },
    {
      "title": "Check with your bank",
      "detail": "If you worry, call the number on your bank card. Do not use any number from the email."
    },
    {
      "title": "Tell Anna",
      "detail": "Let your daughter know, so she can help if more emails come."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You showed the AI a message and asked if it was real.",
  "tip": "Next time, ask the AI to explain how to spot fake bank emails.",
  "place": null,
  "link": null
}
```

## 4. Doctor's letter

- **Spoken question:** My doctor sent me a letter. It says: "Diagnosis: mild hypertension. Recommendation: reduce sodium intake." What does this mean?
- **Photo:** A letter from the doctor's practice.
- **Perfect answer:** type explain. Headline like "Your blood pressure is a bit high." Explains hypertension = high blood pressure, sodium = salt. No medical advice beyond what is written; ask the doctor for details.

### Before (old prompt): NEEDS WORK: headline is 7 words and the steps give its own diet tips (food lists), which is medical advice.

<details><summary>Real answer</summary>

```json
{
  "type": "explain",
  "headline": "Your blood pressure is a bit high",
  "sentence": "Mild hypertension means your blood pressure is slightly higher than it should be.",
  "points": [
    "Sodium is the main part of salt.",
    "Eating less salt can help lower blood pressure.",
    "Mild means it is not severe, but it needs care."
  ],
  "steps": [
    {
      "title": "Eat less salt",
      "detail": "Try not to add salt at the table or while cooking. Taste your food first."
    },
    {
      "title": "Check food labels",
      "detail": "Look for the word sodium or salt on packets and tins. Choose ones with less."
    },
    {
      "title": "Limit salty foods",
      "detail": "Foods like bread, cheese, ham, sausage, soup and ready meals often hold a lot of salt."
    },
    {
      "title": "Ask your doctor",
      "detail": "If you are unsure how much salt is right for you, ask your doctor or pharmacist."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked an AI to explain medical words from your doctor's letter in plain language.",
  "tip": "Next time, also ask what questions you could bring to your doctor, such as what blood pressure number is your goal.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Diagnosis",
      "value": "mild hypertension"
    },
    {
      "label": "Recommendation",
      "value": "reduce sodium intake"
    }
  ]
}
```

</details>

### After (new prompt): GOOD: explains hypertension and sodium in plain words; steps send the person to the doctor and pharmacist instead of advising.

```json
{
  "type": "explain",
  "headline": "Blood pressure a bit high",
  "sentence": "Hypertension means high blood pressure, and mild means it is only a little above normal.",
  "points": [
    "Sodium is the main part of salt.",
    "Reduce sodium intake means eat less salt.",
    "Salt is also hidden in bread and ready meals."
  ],
  "steps": [
    {
      "title": "Keep the letter",
      "detail": "Put the letter somewhere safe so you can show it at your next visit."
    },
    {
      "title": "Ask your doctor",
      "detail": "Ask what eating less salt means for you, and whether you need a check-up."
    },
    {
      "title": "Ask the pharmacist",
      "detail": "If you have questions about medicine or food labels, the pharmacist can help in plain words."
    },
    {
      "title": "Tell Anna",
      "detail": "Share the letter with Anna so she can support you and help you remember."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked the AI to explain hard medical words from a letter in plain language.",
  "tip": "Next time, ask the AI to write down questions to take to your doctor.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Diagnosis",
      "value": "mild hypertension"
    },
    {
      "label": "Recommendation",
      "value": "reduce sodium intake"
    }
  ]
}
```

## 5. Pension change

- **Spoken question:** I got a letter from the pension office. It says: "From 1 November 2026 your monthly pension changes from 1,240.50 EUR to 1,268.20 EUR." What does this mean for me?
- **Photo:** A letter from the pension office.
- **Perfect answer:** type explain. Headline like "Your pension goes up." Repeats both amounts and the date exactly. No financial advice; ask the pension office or Anna if unsure. fields: date, old amount, new amount.

### Before (old prompt): GOOD: amounts and date repeated exactly, no financial advice, points to the pension office.

<details><summary>Real answer</summary>

```json
{
  "type": "explain",
  "headline": "Your pension is going up",
  "sentence": "From 1 November 2026, you will get a little more money each month.",
  "points": [
    "Now you get 1,240.50 EUR each month.",
    "From 1 November 2026 you get 1,268.20 EUR.",
    "That is 27.70 EUR more each month."
  ],
  "steps": [
    {
      "title": "Keep the letter safe",
      "detail": "Put it in your folder with other important papers."
    },
    {
      "title": "Check your bank account",
      "detail": "Look at your statement at the start of the new month to see if the new amount arrives."
    },
    {
      "title": "Ask if something looks wrong",
      "detail": "If the amount is different, call the pension office using the phone number on your letter, or ask Anna to help."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Show this letter to Anna"
  },
  "learned": "You asked an AI to explain a letter from the pension office in simple words.",
  "tip": "Next time, also tell the AI if the letter asks you to do anything, so it can check for deadlines.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Sender",
      "value": "Pension office"
    },
    {
      "label": "Change starts",
      "value": "1 November 2026"
    },
    {
      "label": "Old monthly pension",
      "value": "1,240.50 EUR"
    },
    {
      "label": "New monthly pension",
      "value": "1,268.20 EUR"
    }
  ]
}
```

</details>

### After (new prompt): GOOD: both amounts and the date exactly as printed, check the bank statement, ask the pension office.

```json
{
  "type": "explain",
  "headline": "Your pension goes up",
  "sentence": "From 1 November 2026, you will get 1,268.20 EUR each month instead of 1,240.50 EUR.",
  "points": [
    "The new amount starts on 1 November 2026.",
    "Your old amount was 1,240.50 EUR a month.",
    "That is 27.70 EUR more every month."
  ],
  "steps": [
    {
      "title": "Keep the letter",
      "detail": "Put the letter in a safe place with your other important papers."
    },
    {
      "title": "Check your bank account",
      "detail": "After 1 November 2026, look at your next pension payment. See if the amount matches 1,268.20 EUR."
    },
    {
      "title": "Ask the pension office",
      "detail": "If the amount is different, call the pension office using the number printed on your letter."
    },
    {
      "title": "Tell Anna",
      "detail": "You can share the good news with Anna. She can also help if something looks wrong."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked the AI to explain an official letter in plain words.",
  "tip": "Next time, take a photo of the whole letter and ask the AI what to do.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Sender",
      "value": "Pension office"
    },
    {
      "label": "Start date",
      "value": "1 November 2026"
    },
    {
      "label": "Old monthly pension",
      "value": "1,240.50 EUR"
    },
    {
      "label": "New monthly pension",
      "value": "1,268.20 EUR"
    }
  ]
}
```

## 6. Medication box

- **Spoken question:** This is on my medication box: "Take 1 tablet twice daily with food. Do not combine with alcohol." What does it mean?
- **Photo:** Text printed on a medication box.
- **Perfect answer:** type explain. Headline like "One tablet, twice a day." One tablet morning and evening, with a meal, no alcohol. Ask the pharmacist if unsure. No extra medical advice.

### Before (old prompt): NEEDS WORK: empty steps list, so the new Steps page would have nothing to show.

<details><summary>Real answer</summary>

```json
{
  "type": "explain",
  "headline": "How to take your tablets",
  "sentence": "Take one tablet in the morning and one in the evening, each time with food.",
  "points": [
    "Twice daily means two times in one day.",
    "With food means eat a meal or snack first.",
    "Do not drink beer, wine or spirits while taking it."
  ],
  "steps": [],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You, Ingrid, asked an AI to explain the words on your medication box in plain language.",
  "tip": "Next time, also tell the AI the medicine name so it can help you check what to ask your pharmacist.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Dose",
      "value": "1 tablet"
    },
    {
      "label": "How often",
      "value": "Twice daily"
    },
    {
      "label": "With food",
      "value": "Yes"
    },
    {
      "label": "Alcohol",
      "value": "Do not combine"
    }
  ]
}
```

</details>

### After (new prompt): GOOD: explains 'twice daily' and 'with food', 4 concrete steps, sends questions to the pharmacist.

```json
{
  "type": "explain",
  "headline": "How to take your tablets",
  "sentence": "Take one tablet in the morning and one in the evening, each time with a meal, and no alcohol.",
  "points": [
    "Twice daily means two times in one day.",
    "With food means eat something when you take it.",
    "Alcohol can cause problems with this medicine."
  ],
  "steps": [
    {
      "title": "Pick two meal times",
      "detail": "Choose two meals, such as breakfast and dinner. Take one tablet with each meal."
    },
    {
      "title": "Skip alcohol",
      "detail": "Do not drink wine, beer or spirits while you take this medicine."
    },
    {
      "title": "Ask the pharmacist",
      "detail": "If you are unsure about timing or alcohol, ask your pharmacist or doctor."
    },
    {
      "title": "Keep the box",
      "detail": "Keep the box and leaflet together so you can read them again."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked the AI to explain the words on a medication box in plain language.",
  "tip": "Next time, take a photo of the box and leaflet and ask the AI for a simple daily plan to discuss with your pharmacist.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Dose",
      "value": "1 tablet"
    },
    {
      "label": "How often",
      "value": "Twice daily"
    },
    {
      "label": "With food",
      "value": "Yes"
    },
    {
      "label": "Alcohol",
      "value": "Do not combine"
    }
  ]
}
```

## 7. Doctor reminder

- **Spoken question:** Remind me: doctor appointment Tuesday 10:30 at Dr. Weber.
- **Photo:** none
- **Perfect answer:** type reminder. when = "Tuesday 20 October 2026, 10:30" (or as said). Headline like "Dr. Weber, Tuesday 10:30". Steps to prepare (e.g. bring insurance card).

### Before (old prompt): NEEDS WORK: right type and date, but the steps list is empty, so the Steps page is blank.

<details><summary>Real answer</summary>

```json
{
  "type": "reminder",
  "headline": "Doctor visit on Tuesday",
  "sentence": "You have an appointment with Dr. Weber on Tuesday at 10:30.",
  "points": [
    "Tuesday is 20 October 2026.",
    "Leave a little early so you are not rushed.",
    "Take your insurance card with you."
  ],
  "steps": [],
  "when": "Tuesday, 20 October 2026, 10:30",
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked an AI to help you remember a doctor appointment just by speaking.",
  "tip": "Next time, also say the place or what you need to bring, and the AI can remind you of that too.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Who",
      "value": "Dr. Weber"
    },
    {
      "label": "Day",
      "value": "Tuesday, 20 October 2026"
    },
    {
      "label": "Time",
      "value": "10:30"
    }
  ]
}
```

</details>

### After (new prompt): GOOD: reminder with the real date in 'when' and 4 steps to get ready (calendar, insurance card, trip, Anna).

```json
{
  "type": "reminder",
  "headline": "Doctor visit Tuesday at 10:30",
  "sentence": "Your appointment with Dr. Weber is on Tuesday, 20 October 2026, at 10:30.",
  "points": [
    "Today is Saturday, so it is in three days.",
    "Try to arrive a few minutes early."
  ],
  "steps": [
    {
      "title": "Write it down",
      "detail": "Put the appointment on your calendar or on a note by the phone. Write Tuesday, 20 October, 10:30, Dr. Weber."
    },
    {
      "title": "Get your things ready",
      "detail": "On Monday evening, put your insurance card and any medicines you take in your bag."
    },
    {
      "title": "Plan your trip",
      "detail": "Decide how you will get there and leave early enough to arrive by 10:15."
    },
    {
      "title": "Tell Anna",
      "detail": "Let Anna know about the visit so she can check on you afterwards."
    }
  ],
  "when": "Tuesday, 20 October 2026, 10:30",
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked the AI to remember an appointment and work out the exact date for you.",
  "tip": "You can also ask the AI to remind you the day before.",
  "place": null,
  "link": null,
  "fields": []
}
```

## 8. Higher electricity bill

- **Spoken question:** My electricity bill came. Last time it was 62 EUR a month, now it says 89 EUR a month. Why is it higher and what can I do?
- **Photo:** An electricity bill showing the new monthly amount.
- **Perfect answer:** type explain. Headline like "Your bill went up." Repeats 62 and 89 EUR exactly. Common reasons (new prices, more use) without guessing which. Suggest calling the supplier or asking Anna. No financial advice.

### Before (old prompt): NEEDS WORK: says 'I cannot see the bill' although the person gave the amounts, uses German words in English and a 6-word step title.

<details><summary>Real answer</summary>

```json
{
  "type": "explain",
  "headline": "Why your bill went up",
  "sentence": "I cannot see the bill in a photo, so I can only tell you the usual reasons.",
  "points": [
    "The price per unit may have gone up.",
    "You may have used more power this year.",
    "Your monthly payment may be adjusted to match real use."
  ],
  "steps": [
    {
      "title": "Find the reason on the bill",
      "detail": "Look for words like 'Abschlag', 'Preisänderung' or 'Verbrauch'. These often explain the change."
    },
    {
      "title": "Compare your usage",
      "detail": "Check the kWh number now and last year. If it is similar, the price went up."
    },
    {
      "title": "Call your electricity company",
      "detail": "Use the phone number printed on your bill. Ask why the monthly amount changed and if a cheaper plan exists."
    },
    {
      "title": "Ask Anna to compare prices",
      "detail": "Anna can check other providers on a comparison site with you. Do not sign anything over the phone with callers who contact you first."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Ask my daughter Anna to help"
  },
  "learned": "You asked an AI to explain why your bill went up and what you can do.",
  "tip": "Next time, take a clear photo of the whole bill so I can read the exact reason and amounts.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Old monthly amount",
      "value": "62 EUR"
    },
    {
      "label": "New monthly amount",
      "value": "89 EUR"
    }
  ]
}
```

</details>

### After (new prompt): GOOD: starts straight with 62 to 89 EUR, gives possible reasons without guessing, sends the question to the provider and Anna.

```json
{
  "type": "explain",
  "headline": "Your monthly amount went up",
  "sentence": "Your bill rose from 62 EUR to 89 EUR a month, which is 27 EUR more.",
  "points": [
    "Prices per unit may have gone up.",
    "You may have used more power lately.",
    "The bill may show a new yearly estimate."
  ],
  "steps": [
    {
      "title": "Find the reason",
      "detail": "Look in the letter for words like price change, new tariff or estimated use. It should explain the increase."
    },
    {
      "title": "Compare the numbers",
      "detail": "Check the price per unit and the yearly use on the old and new bills. See which one changed."
    },
    {
      "title": "Ask the provider",
      "detail": "Call the number on the bill and ask why the monthly amount rose. You can ask if the estimate can be checked."
    },
    {
      "title": "Keep the paper",
      "detail": "Put the bill in a safe place. You may need it when you talk to the provider."
    },
    {
      "title": "Ask Anna to help",
      "detail": "Anna can look at the bill with you and make the call with you."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked the AI to explain a bill and what you can do about it.",
  "tip": "Next time, take a photo of the bill and ask the AI to point out the price change.",
  "place": null,
  "link": null,
  "fields": [
    {
      "label": "Old monthly amount",
      "value": "62 EUR"
    },
    {
      "label": "New monthly amount",
      "value": "89 EUR"
    }
  ]
}
```

## 9. Microsoft virus call

- **Spoken question:** A man just called me. He said he is from Microsoft and my computer has a virus. He wants me to install a program so he can fix it. Should I do it?
- **Photo:** none
- **Perfect answer:** type warning. Headline like "Hang up. This is a scam." Microsoft never calls. Do not install anything, do not give access or bank details. Action: tell Anna.

### Before (old prompt): GOOD: warning, hang up and do not install anything, tells Anna.

<details><summary>Real answer</summary>

```json
{
  "type": "warning",
  "headline": "Do not install anything. Scam call.",
  "sentence": "Microsoft never phones people to say their computer has a virus.",
  "points": [
    "This is a very common trick to take over your computer.",
    "The program would let him see your files and bank details.",
    "Real companies do not pressure you by phone."
  ],
  "steps": [
    {
      "title": "Hang up the phone",
      "detail": "Put the phone down now. You do not need to be polite or explain."
    },
    {
      "title": "Do not install anything",
      "detail": "Do not open any website or program he asked for. Do not give him any codes or passwords."
    },
    {
      "title": "If you already installed it",
      "detail": "Turn off your computer and unplug the internet. Then ask Anna or a trusted repair shop to check it."
    },
    {
      "title": "Change passwords if needed",
      "detail": "If you gave any password or bank details, call your bank at once. Use the number on your bank card."
    },
    {
      "title": "Tell Anna",
      "detail": "Let Anna know about the call so she can help and watch for more calls."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked an AI to check a worrying phone call before acting, and that kept you safe.",
  "tip": "Next time, tell the AI exactly what the caller said and whether you already clicked or paid anything.",
  "place": null,
  "link": null,
  "fields": []
}
```

</details>

### After (new prompt): GOOD: warning, 'Do not install anything' up front, hang up, keep details private, tell Anna.

```json
{
  "type": "warning",
  "headline": "Do not install anything. Scam.",
  "sentence": "Do not install anything, because Microsoft never calls people to say their computer has a virus.",
  "points": [
    "Real companies do not phone you about viruses.",
    "The program would let him control your computer.",
    "He wants to scare you into acting fast."
  ],
  "steps": [
    {
      "title": "Hang up the phone",
      "detail": "Do not talk any more. You do not have to be polite to him."
    },
    {
      "title": "Install nothing",
      "detail": "Do not open any website or program he asked for. Do not let him see your screen."
    },
    {
      "title": "Keep your details private",
      "detail": "Never share passwords, bank details or PINs with a caller."
    },
    {
      "title": "Tell Anna",
      "detail": "Let your daughter know about the call. If you already installed something, tell her right away."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Tell my daughter Anna"
  },
  "learned": "You asked the AI whether a strange phone call was real before doing anything.",
  "tip": "Next time, ask the AI to explain what to do if you already clicked or shared something.",
  "place": null,
  "link": null,
  "fields": []
}
```

## 10. Bigger phone text

- **Spoken question:** How do I make the text on my phone bigger?
- **Photo:** none
- **Perfect answer:** type steps. Headline like "Make your text bigger". Steps: open Settings, Display (or Accessibility), Text size / Font size, slide to make bigger. Mentions iPhone and Android names may differ.

### Before (old prompt): NEEDS WORK: good steps for iPhone and Android, but one step title is 6 words (limit is 5).

<details><summary>Real answer</summary>

```json
{
  "type": "steps",
  "headline": "Make your phone text bigger",
  "sentence": "You can do this in your phone's Settings, and it only takes a minute.",
  "points": [
    "Steps differ a little on iPhone and Android.",
    "You can change it back at any time."
  ],
  "steps": [
    {
      "title": "Open the Settings app",
      "detail": "Look for a grey icon with a gear on your home screen. Tap it once."
    },
    {
      "title": "Find the display settings",
      "detail": "On iPhone, tap Display and Brightness, then Text Size. On Android, tap Display, then Font size and style."
    },
    {
      "title": "Slide to make text bigger",
      "detail": "Touch the slider with your finger and move it to the right. The sample text will grow as you move it."
    },
    {
      "title": "Check it looks good",
      "detail": "Pick the size that is easiest to read. On Android, tap the back arrow to save it."
    },
    {
      "title": "Ask Anna if you get stuck",
      "detail": "If you cannot find these settings, Anna can help you on a call or visit."
    }
  ],
  "when": null,
  "action": {
    "kind": "call_trusted",
    "label": "Ask my daughter Anna"
  },
  "learned": "You asked an AI how to change something on your phone and got clear steps in order.",
  "tip": "Next time, tell the AI your phone brand, like iPhone or Samsung, so the steps match your phone exactly.",
  "place": null,
  "link": null,
  "fields": []
}
```

</details>

### After (new prompt): GOOD: steps card, 5 short steps with exact menu names for iPhone and Android in the detail.

```json
{
  "type": "steps",
  "headline": "Make your phone text bigger",
  "sentence": "You can make the writing bigger in your phone settings in a few taps.",
  "points": [
    "The steps differ a little on iPhone and Android.",
    "You can change it back at any time."
  ],
  "steps": [
    {
      "title": "Open Settings",
      "detail": "Look for a grey icon with a gear on your home screen. Tap it once."
    },
    {
      "title": "Find the display options",
      "detail": "On iPhone, tap Display and Brightness. On Android, tap Display."
    },
    {
      "title": "Choose text size",
      "detail": "Tap Text Size, or Font Size and Style on Android. You will see a slider with small and big letters."
    },
    {
      "title": "Slide to the right",
      "detail": "Put your finger on the round button and drag it right. The writing above grows as you slide."
    },
    {
      "title": "Check and go back",
      "detail": "Press the home button or swipe up to leave. Your messages should now look bigger."
    }
  ],
  "when": null,
  "action": null,
  "learned": "You asked the AI to explain how to do something on your phone, step by step.",
  "tip": "Next time, tell the AI your phone brand, such as iPhone or Samsung, to get exact steps.",
  "place": null,
  "link": null
}
```


# Transit tool: "When does my bus come?" (issue #15)

Claude can now call the `berlin_transit` tool, which looks up live Berlin buses and trains at https://v6.bvg.transport.rest (free, no key).

**Note:** during testing on 17 October 2026 the real BVG service was down (HTTP 503 and timeouts). So:
- the **fallback** was tested against the real (broken) service, and
- the **normal answers** were tested against a small local fake service with sample departures in the same format (`BVG_API_URL=http://localhost:3999`). The times below are sample data, not a real timetable.

## 11. Next bus from Hermannplatz

- **Spoken question:** When does the next bus leave from Hermannplatz?
- **Perfect answer:** type info, headline like "Bus M41 in 4 minutes", the next 2 or 3 departures as points, steps to find the right bus. No invented times.

### Real BVG service down: GOOD
Grace said "Timetable not available right now: I could not check the timetable just now, so I do not want to guess any times."
Steps: check the stop board, open the BVG app, ask Anna (with the Anna button).

### With sample data: GOOD: right type, headline with line and minutes, departures exactly as given.

```json
{
  "type": "info",
  "headline": "Bus M41 in 4 minutes",
  "sentence": "The next bus at Hermannplatz leaves at 14:57, going towards Hauptbahnhof.",
  "points": [
    "M41 to Hauptbahnhof at 14:57 (in 4 min)",
    "M41 to Sonnenallee at 15:00 (in 7 min), 2 min late",
    "171 to U Rathaus Neukölln at 15:02 (in 9 min)"
  ],
  "steps": [
    {
      "title": "Go to the stop",
      "detail": "Walk to the bus stop at Hermannplatz now. The first bus is only 4 minutes away."
    },
    {
      "title": "Check the bus front",
      "detail": "Look for the line and direction on the front of the bus. Make sure it says the place you want."
    },
    {
      "title": "Check the board",
      "detail": "Look at the timetable board at the stop. It shows if a bus is late."
    }
  ],
  "when": null,
  "action": null,
  "learned": "You asked the AI for live bus times and got a clear answer.",
  "tip": "Next time, tell the AI where you want to go and it can find the right bus.",
  "place": null,
  "link": null
}
```

## 12. Trip from Alexanderplatz to Zoologischer Garten

- **Spoken question:** How do I get from Alexanderplatz to Zoologischer Garten?
- **Perfect answer:** type steps, headline naming the line(s), one step per part of the trip: line, direction, where to get on and off, times.

### Real BVG service down: GOOD
Grace said "Timetable could not be checked" and suggested the BVG app with start and goal filled in, the departure board, and Anna.

### With sample data: GOOD: steps card, direct S5 first with direction and times, U2 plus a 450 m walk as the second option.

```json
{
  "type": "steps",
  "headline": "S5 straight to Zoo",
  "sentence": "The S5 train goes directly from Alexanderplatz to Zoologischer Garten, with no change.",
  "points": [
    "S5 towards Westkreuz at 14:59",
    "Arrive at Zoologischer Garten at 15:15",
    "Or U2 at 14:56, then walk 450 m"
  ],
  "steps": [
    {
      "title": "Go to the S-Bahn",
      "detail": "At Alexanderplatz, follow the signs for the S-Bahn platform. Look for the S5 towards Westkreuz."
    },
    {
      "title": "Take the S5",
      "detail": "Board the S5 towards Westkreuz at 14:59. Stay on the train for the whole ride."
    },
    {
      "title": "Get off at Zoo",
      "detail": "Leave the train at Zoologischer Garten. You should arrive at 15:15."
    },
    {
      "title": "Or take the U2",
      "detail": "The U2 towards Ruhleben leaves at 14:56. Get off at Wittenbergplatz at 15:13 and walk 450 m to Zoologischer Garten."
    }
  ],
  "when": null,
  "action": null,
  "learned": "You asked the AI to plan a trip across Berlin with live times.",
  "tip": "Next time, tell the AI when you want to leave, so it can plan around that.",
  "place": null,
  "link": null
}
```
