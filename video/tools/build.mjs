// Builds the Grace promo in two cuts from one timeline:
//   index.html            1080x1920 (9:16)
//   landscape/index.html  1920x1080 (16:9)
// Structure: a ~38 s promo intro in the style of the reference reel (kinetic two-tone words,
// a 3D tunnel of phone screens, a gradient swoosh, a progress bar, Done + confetti, floating cards,
// a wide UI slide, a pill button being tapped and the four assistant bots hopping in), then ~65 s of the real app being tested in
// phone frames, then a logo outro. Cuts sit on the 120 bpm grid of tools/make_music.py.
// Usage: node tools/build.mjs && python tools/make_music.py
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// Real app test segments: [caption kicker, caption title, frames, tap (x%, y%) or null].
const TEST = [
  ["Live test", "A calm welcome", ["welcome", "talk"], [50, 88]],
  ["Talk", "One big button", ["talk", "talk-listening"], [50, 64]],
  ["Ask", "Is this text real?", ["typed"], [88, 79]],
  ["Real Claude answer", "Checking the text", ["typed", "scam-steps"], null],
  ["Answers", "Scam alert", ["scam-card"], null],
  ["Family", "Tell Anna in one tap", ["scam-card", "tell-anna"], [50, 88]],
  ["Scan a letter", "A pension letter", ["scan", "scan-reading"], [30, 30]],
  ["Explained", "Key facts, plain words", ["scan-found", "scan-explained"], null],
  ["Pay safely", "QR code checked", ["qr-found", "qr-explained"], null],
  ["Learn", "One AI skill each time", ["learn", "skills"], null],
  ["Doctor visit", "Listen for me", ["listen", "listen-writing"], [50, 70]],
  ["Profile", "Your own assistant", ["voice", "text-xl"], [80, 40]],
];
const SEG = 5.5;
// The four assistant personalities from the Profile tab, as drawn by bot-avatars in the app
// (stills in assets/bots, exported from the app's own avatar settings). Patient helper is picked.
const BOTS = [
  ["patient", "Patient helper"],
  ["cheerful", "Cheerful friend"],
  ["short", "Short and clear"],
  ["storyteller", "Storyteller"],
];
const BOTS_AT = 30;
const BOT_TAP = BOTS_AT + 2.5;
const INTRO = 38;
const TEST_END = INTRO + TEST.length * SEG;
const TOTAL = TEST_END + 6;

const WORDS = [
  [0, "Show", "letters"],
  [1.5, "Ask", "out loud"],
  [3, "Any", "message"],
  [4.5, "", "Instantly"],
];

function page(orient) {
  const land = orient === "landscape";
  const [W, H] = land ? [1920, 1080] : [1080, 1920];
  const up = land ? "../" : "";
  const u = (px) => `${Math.round(px * (land ? 1 : 1.08))}px`;
  const phoneW = land ? 400 : 560;
  const tunnelShots = ["talk", "scam-card", "scan-found", "learn", "tell-anna", "voice", "listen", "skills"];
  const cards = ["scam-card", "learn", "tell-anna", "scan-explained"];
  const tl = [];
  const T = (s) => tl.push(s);

  // 1. Kinetic words.
  WORDS.forEach(([t], i) => {
    T(`tl.fromTo("#kw${i} .k", {y: 60, opacity: 0, filter: "blur(12px)"}, {y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out", stagger: 0.12}, ${t + 0.05});`);
  });
  // 2. Just talk + phone + tap on the mic.
  T(`tl.fromTo("#jt .k", {y: 60, opacity: 0}, {y: 0, opacity: 1, duration: 0.45, ease: "power3.out", stagger: 0.12}, 6.05);`);
  T(`tl.fromTo("#jt-phone", {x: ${land ? 600 : 0}, y: ${land ? 200 : 900}, rotateY: -35, rotateX: 20, rotateZ: 8, transformPerspective: 1600}, {x: 0, y: 0, rotateY: -12, rotateX: 6, rotateZ: 2, duration: 0.8, ease: "power3.out"}, 6.1);`);
  T(`tl.fromTo("#jt .cursor", {x: 220, y: 260, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 0.5, ease: "power2.inOut"}, 6.45);`);
  T(`tl.fromTo("#jt .ripple", {scale: 0, opacity: 0.7}, {scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out"}, 7.0);`);
  // 3. Tunnel: phones on the walls rush toward the camera.
  T(`tl.fromTo("#tunnel .walls", {z: -900}, {z: 1300, duration: 2.5, ease: "power1.in"}, 8.5);`);
  T(`tl.fromTo("#tunnel .k", {opacity: 0, scale: 0.8}, {opacity: 1, scale: 1, duration: 0.35, stagger: 0.5}, 8.6);`);
  // 4. Swoosh.
  T(`tl.fromTo("#swoosh .blob", {xPercent: -160, rotate: -20, scale: 1}, {xPercent: 160, rotate: 10, scale: 1.4, duration: 1.1, ease: "power2.inOut"}, 10.4);`);
  // 5. Progress bar.
  T(`tl.fromTo("#prog .row", {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4}, 12.05);`);
  T(`tl.fromTo("#prog .fill", {scaleX: 0}, {scaleX: 1, duration: 2.2, ease: "power2.inOut"}, 12.2);`);
  T(`tl.fromTo("#prog .num", {textContent: 0}, {textContent: 100, duration: 2.2, ease: "power2.inOut", snap: {textContent: 1}}, 12.2);`);
  // 6. Done + confetti.
  T(`tl.fromTo("#done .check", {scale: 0, rotate: -90}, {scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2)"}, 15.05);`);
  T(`tl.fromTo("#done .path", {strokeDashoffset: 80}, {strokeDashoffset: 0, duration: 0.4, ease: "power2.out"}, 15.4);`);
  T(`tl.fromTo("#done .word", {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4}, 15.15);`);
  for (let i = 0; i < 28; i++) {
    const ang = (i / 28) * Math.PI * 2 + (i % 3) * 0.2;
    const r = (land ? 520 : 440) * (0.6 + ((i * 37) % 10) / 25);
    T(`tl.fromTo("#cf${i}", {x: 0, y: 0, rotate: 0, opacity: 1}, {x: ${Math.round(Math.cos(ang) * r)}, y: ${Math.round(Math.sin(ang) * r + 160)}, rotate: ${(i * 67) % 360}, opacity: 0, duration: 1.6, ease: "power2.out"}, 15.25);`);
  }
  // 7. Floating cards.
  cards.forEach((c, i) => {
    T(`tl.fromTo("#fc${i}", {y: 500, rotateY: ${i % 2 ? 40 : -40}, rotateX: 30, opacity: 0, transformPerspective: 1600}, {y: 0, rotateY: ${i % 2 ? -14 : 14}, rotateX: 8, opacity: 1, duration: 0.8, ease: "power3.out"}, ${17.1 + i * 0.25});`);
    T(`tl.to("#fc${i}", {rotateY: ${i % 2 ? 6 : -6}, y: -30, duration: 2.4, ease: "sine.inOut"}, ${18.0 + i * 0.25});`);
  });
  T(`tl.fromTo("#cards .k", {opacity: 0, y: 40}, {opacity: 1, y: 0, duration: 0.45, stagger: 0.12}, 17.2);`);
  // 8. Wide UI slides in at an angle; cursor moves over it.
  T(`tl.fromTo("#wide .screen", {x: ${land ? 900 : 700}, rotateY: -30, rotateX: 12, transformPerspective: 2000, opacity: 0}, {x: 0, rotateY: -10, rotateX: 6, opacity: 1, duration: 0.9, ease: "power3.out"}, 20.6);`);
  T(`tl.to("#wide .screen", {rotateY: 0, rotateX: 0, scale: 1.04, duration: 2.6, ease: "sine.inOut"}, 21.5);`);
  T(`tl.fromTo("#wide .cursor", {x: 300, y: 300, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 1.2, ease: "power2.inOut"}, 21.6);`);
  // 9. Pill button gets tapped and turns into the gradient style.
  T(`tl.fromTo("#pill .btn", {scale: 0.7, opacity: 0}, {scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.8)"}, 24.1);`);
  T(`tl.fromTo("#pill .cursor", {x: 260, y: 260, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 0.9, ease: "power2.inOut"}, 24.5);`);
  T(`tl.to("#pill .btn", {scale: 0.92, duration: 0.1}, 25.45);`);
  T(`tl.to("#pill .btn", {scale: 1.06, duration: 0.3, ease: "back.out(2)"}, 25.55);`);
  T(`tl.fromTo("#pill .grad", {opacity: 0}, {opacity: 1, duration: 0.3}, 25.5);`);
  T(`tl.fromTo("#pill .ripple", {scale: 0, opacity: 0.6}, {scale: 3, opacity: 0, duration: 0.7, ease: "power2.out"}, 25.5);`);
  T(`tl.fromTo("#pill .sent", {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.4}, 26.0);`);
  // 10. Patient with you, then "now watch it work".
  T(`tl.fromTo("#pat .k", {y: 60, opacity: 0, filter: "blur(12px)"}, {y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out", stagger: 0.15}, 27.55);`);
  // 11. Pick a personality: the four bots hop in one by one, the cursor picks Patient helper and it jumps for joy.
  T(`tl.fromTo("#bots .k", {y: 60, opacity: 0, filter: "blur(12px)"}, {y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out", stagger: 0.12}, ${BOTS_AT + 0.05});`);
  BOTS.forEach((_, i) => {
    const at = BOTS_AT + 0.45 + i * 0.3;
    T(`tl.fromTo("#bt${i} .hop", {y: 260, scale: 0.4, opacity: 0}, {y: 0, scale: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)"}, ${at.toFixed(2)});`);
    T(`tl.fromTo("#bt${i} .body", {scaleX: 1.12, scaleY: 0.86}, {scaleX: 1, scaleY: 1, duration: 0.35, ease: "back.out(3)"}, ${(at + 0.45).toFixed(2)});`);
    T(`tl.fromTo("#bt${i} .blabel", {opacity: 0, y: 16}, {opacity: 1, y: 0, duration: 0.35}, ${(at + 0.25).toFixed(2)});`);
  });
  T(`tl.fromTo("#bots .cursor", {x: 240, y: 280, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power2.inOut"}, ${BOT_TAP - 0.65});`);
  T(`tl.fromTo("#bots .ripple", {scale: 0, opacity: 0.7}, {scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out"}, ${BOT_TAP});`);
  T(`tl.fromTo("#bt0 .ring", {scale: 0.8, opacity: 0}, {scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)"}, ${BOT_TAP});`);
  T(`tl.fromTo("#bt0 .happy", {opacity: 0}, {opacity: 1, duration: 0.12}, ${BOT_TAP + 0.05});`);
  T(`tl.to("#bots .bot:not(#bt0)", {opacity: 0.45, duration: 0.4}, ${BOT_TAP + 0.1});`);
  [0, 0.75].forEach((d, j) => {
    const h = j ? 70 : 150;
    T(`tl.to("#bt0 .body", {scaleX: 1.1, scaleY: 0.88, duration: 0.1, ease: "power2.out"}, ${(BOT_TAP + 0.1 + d).toFixed(2)});`);
    T(`tl.to("#bt0 .hop", {y: -${h}, duration: 0.3, ease: "power2.out"}, ${(BOT_TAP + 0.2 + d).toFixed(2)});`);
    T(`tl.to("#bt0 .body", {scaleX: 0.94, scaleY: 1.08, duration: 0.2}, ${(BOT_TAP + 0.2 + d).toFixed(2)});`);
    T(`tl.to("#bt0 .hop", {y: 0, duration: 0.25, ease: "power2.in"}, ${(BOT_TAP + 0.5 + d).toFixed(2)});`);
    T(`tl.to("#bt0 .body", {scaleX: 1.08, scaleY: 0.9, duration: 0.08}, ${(BOT_TAP + 0.75 + d).toFixed(2)});`);
    T(`tl.to("#bt0 .body", {scaleX: 1, scaleY: 1, duration: 0.3, ease: "back.out(3)"}, ${(BOT_TAP + 0.83 + d).toFixed(2)});`);
  });
  T(`tl.fromTo("#bots .picked", {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.4}, ${BOT_TAP + 0.5});`);
  // 12. Now watch it work.
  T(`tl.fromTo("#watch .k", {y: 60, opacity: 0, filter: "blur(12px)"}, {y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, ease: "power3.out", stagger: 0.15}, ${BOTS_AT + 5.05});`);
  T(`tl.fromTo("#watch .sub", {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.4}, ${BOTS_AT + 5.9});`);
  // 13. Real test segments.
  TEST.forEach(([, , frames, tap], i) => {
    const t0 = INTRO + i * SEG;
    T(`tl.fromTo("#ts${i} .phone", {y: 120, rotateY: ${i % 2 ? 18 : -18}, rotateX: 10, scale: 0.92, opacity: 0, transformPerspective: 1800}, {y: 0, rotateY: ${i % 2 ? 6 : -6}, rotateX: 3, scale: 1, opacity: 1, duration: 0.6, ease: "power3.out"}, ${t0 + 0.05});`);
    T(`tl.to("#ts${i} .phone", {rotateY: ${i % 2 ? -3 : 3}, rotateX: 0, duration: ${SEG - 0.8}, ease: "sine.inOut"}, ${t0 + 0.65});`);
    T(`tl.fromTo("#ts${i} .cap > *", {opacity: 0, y: 30}, {opacity: 1, y: 0, duration: 0.4, stagger: 0.12, ease: "power3.out"}, ${t0 + 0.2});`);
    const step = (SEG - 0.9) / frames.length;
    frames.forEach((_, k) => {
      if (k) T(`tl.fromTo("#ts${i} .f${k}", {opacity: 0}, {opacity: 1, duration: 0.15}, ${(t0 + 0.4 + k * step).toFixed(2)});`);
    });
    if (tap) {
      const at = t0 + 1.6;
      T(`tl.fromTo("#ts${i} .cursor", {x: 220, y: 260, opacity: 0}, {x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power2.inOut"}, ${(at - 0.65).toFixed(2)});`);
      T(`tl.fromTo("#ts${i} .ripple", {scale: 0, opacity: 0.7}, {scale: 2.6, opacity: 0, duration: 0.6, ease: "power2.out"}, ${at.toFixed(2)});`);
    }
  });
  // 14. Outro.
  T(`tl.fromTo("#outro .tag .k", {y: 50, opacity: 0, filter: "blur(10px)"}, {y: 0, opacity: 1, filter: "blur(0px)", duration: 0.45, stagger: 0.1, ease: "power3.out"}, ${TEST_END + 0.05});`);
  T(`tl.to("#outro .tag", {opacity: 0, y: -40, duration: 0.3}, ${TEST_END + 2.2});`);
  T(`tl.fromTo("#outro .logo", {scale: 0, rotate: -120, opacity: 0}, {scale: 1, rotate: 0, opacity: 1, duration: 0.9, ease: "back.out(1.6)"}, ${TEST_END + 2.5});`);
  T(`tl.fromTo("#outro .wm, #outro .url", {opacity: 0, x: -30}, {opacity: 1, x: 0, duration: 0.5, stagger: 0.25, ease: "power3.out"}, ${TEST_END + 3.1});`);

  const kw = (a, b) => `<p class="kin">${a ? `<span class="k ink">${a}</span> ` : ""}${b.split(" ").map((w) => `<span class="k grad-t">${w}</span>`).join(" ")}</p>`;
  const clip = (id, s, d, inner) => `<section id="${id}" class="clip scene" data-start="${s}" data-duration="${d}" data-track-index="1">${inner}</section>`;
  const cursor = `<svg class="cursor" viewBox="0 0 32 32"><path d="M6 3l20 11-9 2.5L12 26z" fill="#1E2420" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`;
  const shot = (n) => (n.startsWith("f1") ? `assets/flow/${n}.jpg` : `assets/shots/${n}.jpg`);

  const walls = tunnelShots.map((s, i) => {
    const side = i % 4; // left, right, top, bottom
    const depth = -Math.floor(i / 4) * 900 - 200;
    const tf = [
      `translate3d(${-W * 0.42}px, 0, ${depth}px) rotateY(70deg)`,
      `translate3d(${W * 0.42}px, 0, ${depth - 500}px) rotateY(-70deg)`,
      `translate3d(0, ${-H * 0.46}px, ${depth - 250}px) rotateX(-70deg) rotateZ(90deg)`,
      `translate3d(0, ${H * 0.46}px, ${depth - 750}px) rotateX(70deg) rotateZ(90deg)`,
    ][side];
    return `<div class="tphone" style="transform: translate(-50%, -50%) ${tf}"><img src="${up}assets/shots/${s}.jpg" alt="" /></div>`;
  });

  const scenes = [
    ...WORDS.map(([t, a, b], i) => clip(`kw${i}`, t, 1.5, `<div class="center">${kw(a, b)}</div>`)),
    clip("jt", 6, 2.5, `<div class="split"><div class="cap">${kw("Just", "talk")}</div><div class="pw"><div class="phone" id="jt-phone"><img class="f0" src="${up}assets/shots/talk.jpg" alt="" /><div class="tap" style="left:50%;top:64%">${cursor}<i class="ripple"></i></div></div></div></div>`),
    clip("tunnel", 8.5, 2.5, `<div class="stage"><div class="walls">${walls.join("")}</div></div><div class="center over"><p class="kin small"><span class="k ink">Letters.</span> <span class="k grad-t">Scams.</span> <span class="k ink">Doctors.</span></p></div>`),
    clip("swoosh", 10.3, 1.7, `<div class="blob"></div>`),
    clip("prog", 12, 3, `<div class="center"><div class="row"><p class="plabel">Checking the message</p><p class="pscore"><span class="num">0</span><span class="of">/100</span></p><div class="bar"><div class="fill"></div></div><p class="pnote">Scam check</p></div></div>`),
    clip("done", 15, 2, `<div class="center"><div class="cfwrap">${Array.from({ length: 28 }, (_, i) => `<i id="cf${i}" class="cf c${i % 3}"></i>`).join("")}</div><svg class="check" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" /><path class="path" d="M38 62l15 15 30-32" /></svg><p class="word grad-t">Done</p></div>`),
    clip("cards", 17, 3.5, `<div class="cardrow">${cards.map((c, i) => `<div class="fcard" id="fc${i}"><img src="${up}assets/shots/${c}.jpg" alt="" /></div>`).join("")}</div><div class="cap-bottom">${kw("Explained", "simply")}</div>`),
    clip("wide", 20.5, 3.5, `<div class="center"><div class="screen"><img src="${up}assets/shots/d-learn.jpg" alt="" /><div class="cursor-wrap">${cursor}</div></div></div>`),
    clip("pill", 24, 3.5, `<div class="center"><div class="btn"><span class="grad"></span><span class="lbl">Tell my daughter Anna</span><i class="ripple"></i><div class="pcur">${cursor}</div></div><p class="sent">Message ready for Anna</p></div>`),
    clip("pat", 27.5, 2.5, `<div class="center">${kw("Patient", "with you")}</div>`),
    clip("bots", BOTS_AT, 5, `<div class="center"><p class="kin bots-t"><span class="k ink">Pick</span> <span class="k ink">a</span> <span class="k grad-t">personality</span></p><div class="botrow">${BOTS.map(([b, label], i) => `<div class="bot" id="bt${i}"><div class="hop"><i class="ring"></i><div class="body"><img src="${up}assets/bots/${b}-default.png" alt="" />${i ? "" : `<img class="happy" src="${up}assets/bots/${b}-working.png" alt="" /><div class="tap">${cursor}<i class="ripple"></i></div>`}</div></div><p class="blabel">${label}</p></div>`).join("")}</div><p class="picked">Same Grace, your kind of voice.</p></div>`),
    clip("watch", BOTS_AT + 5, 3, `<div class="center">${kw("Now", "watch it work")}<p class="sub">Real app. Real Claude answers.</p></div>`),
    ...TEST.map(([kick, title, frames, tap], i) =>
      clip(`ts${i}`, INTRO + i * SEG, SEG, `<div class="split test"><div class="cap"><p class="kick">${kick}</p><p class="ttl">${title}</p></div><div class="pw"><div class="phone">${frames.map((f, k) => `<img class="f${k}" src="${up}${shot(f)}" alt="" />`).join("")}${tap ? `<div class="tap" style="left:${tap[0]}%;top:${tap[1]}%">${cursor}<i class="ripple"></i></div>` : ""}</div></div></div>`),
    ),
    clip("outro", TEST_END, 6, `<div class="center"><p class="kin tag"><span class="k ink">Grace.</span> <span class="k ink">AI</span> <span class="k ink">that</span> <span class="k ink">is</span> <span class="k grad-t">patient</span> <span class="k ink">with</span> <span class="k ink">you.</span></p><div class="lockup"><img class="logo" src="${up}assets/grace-logo.svg" alt="" /><div><p class="wm">Grace</p><p class="url">graceapp.vercel.app</p></div></div></div>`),
  ];

  return `<!doctype html>
<!-- Generated by tools/build.mjs. Edit the builder, then run: node tools/build.mjs -->
<html lang="en" data-resolution="${orient}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="${up}style.css" />
    <style>
      html, body { width: ${W}px; height: ${H}px; }
      .kin { font-size: ${u(land ? 150 : 120)}; }
      .kin.small { font-size: ${u(land ? 110 : 84)}; }
      .phone { width: ${phoneW}px; }
      .tphone { width: ${land ? 520 : 460}px; }
      .ttl { font-size: ${u(land ? 96 : 76)}; }
      .kick { font-size: ${u(30)}; }
      .fcard { width: ${land ? 300 : 230}px; }
      .screen { width: ${land ? 1500 : 980}px; }
      .tag { font-size: ${u(land ? 86 : 64)}; }
      .bots-t { font-size: ${u(land ? 110 : 96)}; }
      .bot { width: ${land ? 390 : 440}px; }
    </style>
  </head>
  <body class="${orient}">
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
      <div class="bg"></div>
      ${scenes.join("\n      ")}
      <audio id="music" src="${up}assets/promo-music.m4a" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${tl.join("\n      ")}
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
`;
}

writeFileSync(join(root, "index.html"), page("portrait"));
// The landscape cut lives in a subfolder: a project may only have one root composition.
mkdirSync(join(root, "landscape"), { recursive: true });
writeFileSync(join(root, "landscape", "index.html"), page("landscape"));
writeFileSync(join(root, "cues.json"), JSON.stringify({ total: TOTAL, intro: INTRO, testEnd: TEST_END, clicks: [7.0, 25.5, BOT_TAP, ...TEST.map((x, i) => (x[3] ? INTRO + i * SEG + 1.6 : null)).filter((x) => x !== null)], whooshes: [10.75] }) + "\n");
console.log(`built index.html + landscape/index.html, ${TOTAL}s`);
