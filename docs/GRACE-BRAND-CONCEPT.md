# Grace: brand and positioning concept proposal

**Status:** proposal for discussion; naming, copy, and icon directions are not approved launch assets.  
**Date:** 17 October 2026  
**Scope:** positioning, naming routes, story, taglines, verbal identity, and icon directions.

## Recommendation

Grace has the right emotional character for this product: approachable, patient, and adult. Build the brand around **help that makes everyday things clearer and leaves people feeling more capable**.

The recommended creative platform is:

> **Grace**  
> **Everyday, explained.**

Use **You can ask that.** as the campaign territory and **Help that respects what you already know.** as the internal design principle.

There is a substantial naming finding: **Ask Grace already exists as an AI companion for seniors**, advertising voice input, adjustable text, scam warnings, and reminders. This is a close overlap in both name and proposition. Continue exploring Grace creatively, but do not treat Ask Grace as an available launch name. Trademark, domain, and market availability have not been established. [Existing Ask Grace product](https://www.askgrace.org/faq)

## 1. Product truth and evidence

The original exploration inspected [commit 6a78789](https://github.com/BatuCani/elderwise/tree/6a78789fe1093515e59089d074a350335ef541ea), including the README, pitch documents, prompts, API routes, screens, voice implementation, answer cards, and storage. The deployed onboarding and a typed question-to-answer flow were checked successfully. Voice, photo interpretation, and calendar export were inspected in code rather than tested end to end.

Before saving this proposal, the repository was refreshed to **273816d**. That newer snapshot already includes Grace branding, editable profile details, assistant preferences, trusted-person message sharing, and generated place/link cards. The capability table below reflects that source snapshot. These additions received code inspection, not a new end-to-end deployment test. This corrects statements in the earlier exploration that the trusted contact was fixed and place/link cards were preview-only.

### Implemented in the inspected source

| Capability | Current behavior and boundary |
|---|---|
| Asking questions | Typed input, browser speech recognition, and a hands-free voice integration with fallback. |
| Showing something confusing | Camera/photo selection in the voice flow and five fictional examples, including letters, a medicine box, and suspicious messages. |
| Understanding the answer | Explanation, warning, steps, reminder, information, place, and link cards. The core answer format uses short headlines and up to three points, with speech playback. |
| Checking suspicious messages | AI-generated warnings and suggested next steps. Detection reliability has not been established by this inspection. |
| Remembering appointments | Reminder cards and a downloadable calendar file when a date can be parsed. This is not a standalone notification service. |
| Contacting someone trusted | Editable trusted-person details; an answer action opens choices for a prefilled SMS, phone call, or system sharing where supported. The person completes sending in their chosen app. There is no automatic family notification. |
| Places and useful links | Generated place/link answers can open map searches, transit directions, or external websites. These are handoffs, not verified local-service availability, live search results within the app, or completed bookings. |
| Adapting the experience | English/German, three text sizes, speaking-speed control, and assistant name, voice, and personality preferences. The source applies voice/personality preferences to the live voice session. |
| Learning and history | A learning sentence and prompting tip per answer, with up to 30 answers stored in the browser. |
| Current visual identity | Grace naming and a six-petal outline mark are already present in the source. The icon proposals below are alternatives for review, not descriptions of the implemented mark. |

Source entry points: [Talk](../app/page.tsx), [answer presentation](../components/AnswerView.tsx), [trusted-person actions](../components/TellTrustedButton.tsx), [profile editing](../app/profile/EditDetails.tsx), [assistant preferences](../lib/assistant.ts), [answer schema and instructions](../prompts/elderwise.ts), [calendar export](../components/cards/ics.ts), and [current logo](../public/grace-logo.svg).

### Aspirations, not current promises

- Booking doctors, ordering groceries, arranging helpers, or sending responses autonomously.
- Finding verified local services, current appointment availability, or community activities through a dedicated live directory integration.
- Shared family accounts, background monitoring, or automatic family alerts.
- A family code word, guided practice exercises, and a cumulative My skills experience.
- Demonstrated improvements in independence, confidence, AI literacy, or fraud outcomes. These remain goals to validate with users.

The live voice instructions explicitly limit autonomous transactions and communications. User-initiated SMS/share/dialler handoffs should be described separately from an assistant sending or calling on someone's behalf. [Voice instructions](../prompts/live.ts)

History is stored in the browser, but questions and photos are sent for external AI processing; live voice also uses an external provider. **Everything stays on your phone** would be an inaccurate privacy promise. [Question request](../lib/ask.ts), [server route](../app/api/ask/route.ts), [live voice](../lib/live.ts)

## 2. Positioning

### Start with a recognizable moment

A letter arrives. A message asks for money. An instruction is difficult to follow.

The immediate question is:

> What does this mean, and what should I do next?

That is a concrete starting point for the product and its communication.

### Concise value proposition

**Grace helps older adults understand everyday letters, messages, and instructions through spoken questions, simple explanations, and clear next steps.**

For someone using the app:

> Show Grace a letter or message. Ask in your own words. Hear it explained.

Calm describes how the experience behaves. **Clarity is the immediate benefit. Confidence is the longer-term ambition.**

### The difference to develop

The learning loop is promising: each useful answer introduces something the person can ask again tomorrow. The product implements a lesson and tip; increased confidence and transferable skills are outcomes to validate.

Keep three ideas aligned:

1. **Practical clarity:** explain the thing in front of the person.
2. **Personal agency:** make options understandable and leave the person in control.
3. **Growing familiarity:** show another useful way to ask for help from AI.

Position the service for older adults who want everyday things explained clearly. Family members can support adoption, while the person using Grace remains the central audience.

## 3. Naming exploration

| Route | Creative strength | Limitation | Recommendation |
|---|---|---|---|
| **Grace** | Warm, composed, memorable; works naturally in Grace, what does this mean? | Gives little functional explanation alone and needs further public-use research. | Strongest creative foundation; current in-app name. |
| **Gracie** | Cheerful, familiar, conversational. | Can feel younger or overly cute, depending on execution; already used by AI businesses. | Explore only if a brighter personality is desired. |
| **Ask Grace** | Immediately communicates the behavior and is easy to recommend aloud. | Already used by a closely overlapping senior AI product. | Strong language, but not recommended as the launch name on current evidence. |
| **Grace AI** | Makes the technology explicit. | AI adds little personality or distinctiveness and makes the name feel like a software label. | Better as an explanatory descriptor than the main identity. |

Gracie is already marketed as an AI receptionist. Ask Grace is also used by Gloucestershire County Council for a digital assistant supporting unpaid carers. Moving to Gracie or adding AI does not establish a distinct naming space. [Gracie](https://thisisgracie.com/), [Gloucestershire's Ask Grace](https://www.gloucestershire.gov.uk/ask-grace)

These observations are an initial public-use check, not a determination of legal availability. Preserve Grace's emotional character while evaluating the public launch identity in the intended markets.

## 4. Three creative territories

| Territory | Lead line | Desired response | Best application |
|---|---|---|---|
| **Everyday clarity** | **Everyday, explained.** | This can help with the thing in front of me. | Primary positioning and first introduction. |
| **Permission to ask** | **You can ask that.** | My question belongs here. | Campaigns, onboarding, and example questions. |
| **Personal agency** | **A little help. Your own way.** | I remain in charge. | Brand philosophy and family-facing communication. |

**Everyday clarity** is the lead recommendation. It fits the implemented product and provides tangible creative material: envelopes, messages, appointment letters, and instructions.

**You can ask that.** is the strongest campaign territory. Lead with recognizable questions:

> What are they asking me to pay?  
> Does this message look suspicious?  
> What should I bring to this appointment?

Each example demonstrates potential usefulness before explaining the technology.

**A little help. Your own way.** carries the emotional purpose. Independence should be a design goal, not presented as an established product outcome.

## 5. Brand story

The name does not need a historical namesake or a fictional woman's biography. Its meaning should become visible through the way the product responds.

### Proposed story copy

> A letter on the kitchen table.  
> A message that doesn't feel right.  
> An instruction that could use explaining.
>
> Grace starts there.
>
> Show her what you're looking at and ask in your own words. She explains the important parts, reads the answer aloud, and helps you see your next step.
>
> At your pace. With room to ask again.
>
> We call her Grace because that is how help should feel: patient, respectful, and easy to ask for.
>
> **Grace. Everyday, explained.**

### Internal principle

**Help that respects what you already know.**

Use this to judge product behavior, writing, and design. The person brings a lifetime of experience. Grace contributes a useful explanation of the question at hand.

## 6. Tagline shortlist

| Line | Role |
|---|---|
| **Everyday, explained.** | Clearest primary tagline. |
| **You can ask that.** | Most promising campaign line. |
| **A little help. Your own way.** | Strongest expression of agency. |
| **Make sense of it.** | Direct, practical alternative. |
| **Life, a little clearer.** | Warmer and broader; needs concrete supporting copy. |
| **Ask in your own words.** | Useful onboarding or activation line. |

Drop **Come help with Grace** because its meaning is unclear. **Help with Grace** sounds more natural but still needs another sentence to explain the product. **Calm Help** captures the atmosphere while leaving the practical value vague.

These are creative proposals; availability and distinctiveness have not been established.

## 7. Verbal identity

Grace should feel like a capable person taking a question seriously: warm, specific, and unhurried. Use ordinary adult language, short sentences, and honest uncertainty. Show personality through attention and useful explanations. Make the AI nature clear rather than inventing a human biography.

| Moment | Proposed language |
|---|---|
| First introduction | I'm Grace, your AI helper. I can explain letters, messages, and everyday instructions. |
| Home screen | What would you like to understand? |
| Main button | Tap to talk |
| Reading a photo | I'm looking at your photo. |
| An unreadable detail | I can't read the date clearly. Could you take a closer photo? |
| A suspicious message | This message has signs of a scam. Don't use the link. |
| Direct phone action | Call Anna |
| Choosing a contact action | Tell Anna, followed by explicit message, call, and share choices. |
| Learning moment | You can ask this again. |
| Service failure | I couldn't get an answer just now. Please try again. |

The trusted-person labels should reflect the actual selected action. The newer source supports a choice of messaging, calling, and sharing; sending remains under the person's control.

Test **You can ask this again** against **You learned** for the learning card. It may make the lesson feel more immediately useful. Keep claims specific, for example: You can show me another message and ask about warning signs. Avoid implying that the person can establish a message is safe through AI alone.

Keep **Tap to talk** visible. Hey Grace can appear in conversational examples, but the current product has no implemented wake-word activation.

## 8. Icon and visual directions

The existing moss green, warm paper background, serif headlines, and large readable body text are a useful foundation. The animated orb gives the assistant a presence, and the current source now has a six-petal outline logo. Preserve continuity while evaluating recognition and distinctiveness.

The alternatives below are concept directions for review, not final artwork or instructions to replace the existing mark.

| Direction | Visual idea | Why it fits | What to watch |
|---|---|---|---|
| **The Open G — preferred study** | A broad, rounded G with an open right side and a subtly conversational terminal. Cream mark on deep moss. | Connects the name with an invitation to speak; provides a simple repeatable signature. | Must read clearly at small sizes without a complicated hidden symbol. |
| **The Listening Light** | Evolve the orb into a solid circular mark with one distinctive crescent cut or opening. | Connects to listening and speaking states and the current interaction. | A gradient orb alone is difficult to distinguish from other AI assistants. |
| **The Open Page** | Two substantial rounded shapes suggesting an opening page or letter. | Communicates explanation and the strongest current use case. | Could suggest a reading app and understate voice interaction. |

Compare the Open G with the existing petal mark before choosing. A promising combination is the Open G for static recognition, with the orb's motion informing live interaction.

### Design brief

- A strong silhouette at 24, 48, and 192 pixels, including in one color.
- Broad shapes and generous gaps.
- A readable Grace wordmark with restrained customization.
- State labels alongside motion, with a still alternative for reduced motion.
- Photography of capable adults doing ordinary things, with letters and messages as tangible product context.
- Avoid a nurse character, an elderly caricature, tiny decorative details, or a symbol that needs a long explanation.

Grace can feel personal through behavior and voice. A literal human face is not necessary.

## 9. Presentation-ready concept copy

> **Grace**  
> **Everyday, explained.**
>
> A letter you don't understand?  
> A message you're unsure about?
>
> Show Grace and ask in your own words. Get a simple explanation, hear it read aloud, and see clear next steps.
>
> **Tap to talk.**
>
> Grace is an AI helper designed with older adults in mind.

## 10. Decisions for the team

1. Take everyday clarity forward as the lead positioning territory.
2. Evaluate Grace as a public identity in the intended markets, accounting for the close existing use of Ask Grace.
3. Compare the current petal mark with an Open G study at actual app-icon sizes.
4. Test the proposition, example questions, and learning-card language with older adults. Check what they think the product will do before explaining it.
5. Validate any future claim about confidence, independence, learning, or scam protection before treating it as an established benefit.

This proposal records a creative direction and its evidence boundaries. It does not approve a launch name, establish outcomes, or change the application.
