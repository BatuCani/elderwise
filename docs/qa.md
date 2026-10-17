# QA: accessibility and large text (Endrik)

Checked at iPhone SE (375×667) and iPhone 14 (390×844) size, English and German, text size Normal / Large / Extra large.

## Found and fixed
| Where | Problem | Fix | PR |
|---|---|---|---|
| Navbar | At Large / Extra large the tab labels ran into each other ("SprechenAntwortenProfil") | Labels truncate instead of colliding; spacing is fixed px (also #18) | #20 |
| Profile rows | "Sehr groß" ran 36 px off the right edge | Value wraps onto its own line when there is no room | #20 |
| Talk | Talk button grew into the tab bar at Extra large | Fixed size, offsets match the fixed navbar | #20, #18 |
| All tabs | Content hidden behind the floating navbar | Bottom padding matches the navbar, everything scrolls into view | #20 |
| Answer card | "Tell my daughter Anna" became a squashed oval when the label wrapped; phone icon shrank | Rounded rectangle, icon keeps its size | #20 |
| Welcome | "Schritt 1 von 3" broke into 3 lines | Stays on one line, wraps above "Skip" | #20 |
| Profile (VoiceOver) | Speaking speed was read as "0.9" | Read as "Slow / Normal / Fast" | #20 |
| Profile (VoiceOver) | Avatar letters ("I", "A") were read out | Hidden from screen readers | #20 |
| "Tell Anna" | Only opened a phone call; name and number were fixed | Sheet with a pre-written message (SMS or share sheet), call, cancel; trusted person and your own name editable in Profile | this PR |

## Checked and fine
- Text at least 19 px for content, tab labels 16 px+, buttons at least 48 px (sheet buttons 56 px).
- Icon-only buttons have labels (camera, done, close, mic).
- Nothing cuts off horizontally at Extra large on a 375 px screen.

## Open (for Batu)
- At Extra large on a small phone (iPhone SE), the listening waveform bar sits right against the camera / done buttons. It does not cover them, but it is tight.
- The old name is still visible in one place: `components/account/copy.ts` ("You can keep using Elderwise without one", EN and DE), shown when accounts are not available. (The "Tell Anna" message no longer says "from Elderwise".)
- Older saved answers keep the action label Claude wrote at the time ("Tell my daughter Anna") after the trusted person changes; new answers use the new name.
