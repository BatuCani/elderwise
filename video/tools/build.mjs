// Builds index.html (1080x1920, 9:16) and landscape/index.html (1920x1080, 16:9) from one scene list.
// Scene timing comes from timing.js, which tools/make_audio.py writes from the voiceover lengths.
// Usage: node tools/build.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const timingSrc = readFileSync(join(root, "timing.js"), "utf8");
const TIMING = JSON.parse(timingSrc.slice(timingSrc.indexOf("{"), timingSrc.lastIndexOf("}") + 1));

// Headline words: wrap a word in <a> to colour it moss. "|" breaks the line.
const SCENES = [
  { id: "hook", kind: "hook" },
  { id: "meet", head: "Meet <a>Grace.</a>", sub: "One button. One calm voice.", shots: ["talk"], logo: true },
  { id: "scam", head: "Is this text <a>real?</a>", sub: "Grace checks it with Claude.", shots: ["typed", "scam-steps", "scam-card"] },
  { id: "anna", head: "Tell Anna,|<a>in one tap.</a>", sub: "A ready-written message to family.", shots: ["tell-anna"] },
  { id: "scan", head: "Scan a letter.|<a>Understand it.</a>", sub: "Key facts highlighted, then explained.", shots: ["scan", "scan-reading", "scan-found", "scan-explained"] },
  { id: "learn", head: "One AI skill,|<a>every time.</a>", sub: "24 short lessons. My AI skills.", shots: ["learn", "skills"] },
  { id: "listen", head: "Listen for me|<a>at the doctor.</a>", sub: "Grace writes it down and sums it up.", shots: ["listen"] },
  { id: "voice", head: "A voice that|<a>feels right.</a>", sub: "Pick the assistant's voice.", shots: ["voice"] },
  { id: "tech", kind: "tech" },
  { id: "close", kind: "close" },
];

const words = (head) =>
  head
    .split("|")
    .map(
      (line) =>
        `<span class="line">${line
          .replace(/<a>(.*?)<\/a>/g, (_, w) => w.split(" ").map((x) => `\u0001${x}`).join(" "))
          .split(" ")
          .map((w) => (w.startsWith("\u0001") ? `<span class="w acc">${w.slice(1)}</span>` : `<span class="w">${w}</span>`))
          .join(" ")}</span>`,
    )
    .join("");

function sceneHtml(s, i) {
  const t = TIMING.scenes[i];
  const attrs = `id="sc-${s.id}" class="clip scene" data-start="${t.start}" data-duration="${t.duration}" data-track-index="1"`;
  if (s.kind === "hook") {
    return `<section ${attrs}>
  <div class="center">
    <div class="big"><span class="num">1</span> <span class="in">in</span> <span class="num">5</span></div>
    <p class="hl hook-l1">${words("older adults have been|targeted by <a>a scam.</a>")}</p>
    <p class="hl hook-l2 small">${words("AI could help them. But it was|<a>never built for them.</a>")}</p>
  </div>
</section>`;
  }
  if (s.kind === "tech") {
    return `<section ${attrs}>
  <div class="center">
    <p class="kicker">Under the hood</p>
    <div class="cards">
      <div class="card c1"><svg class="spark" viewBox="0 0 24 24"><path d="M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z"/></svg><p class="ct">Claude</p><p class="cs">by Anthropic</p><p class="cr">the brain</p></div>
      <div class="card c2"><div class="dotwave"><i></i><i></i><i></i><i></i><i></i></div><p class="ct">Gemini Live</p><p class="cs">real-time voice</p><p class="cr">the voice</p></div>
    </div>
  </div>
</section>`;
  }
  if (s.kind === "close") {
    return `<section ${attrs}>
  <div class="center">
    <img class="endlogo" src="assets/grace-logo.svg" alt="" />
    <p class="endname">Grace</p>
    <p class="hl endline">${words("AI that's <a>patient</a> with you.")}</p>
    <p class="url">elderwise-beryl.vercel.app</p>
    <p class="team">Sam · Ahmet · MaRie · Endrik · Batu</p>
    <p class="event">Built at Claude Impact Lab Berlin</p>
  </div>
</section>`;
  }
  return `<section ${attrs}>
  <div class="copy">
    ${s.logo ? `<img class="mark" src="assets/grace-logo.svg" alt="" />` : ""}
    <p class="hl">${words(s.head)}</p>
    <p class="sub">${s.sub}</p>
  </div>
  <div class="phone-wrap"><div class="phone">
    ${s.shots.map((x, k) => `<img class="shot s${k}" src="assets/shots/${x}.jpg" alt="" />`).join("\n    ")}
  </div></div>
</section>`;
}

function timelineJs() {
  const lines = [];
  SCENES.forEach((s, i) => {
    const { start: t0, duration: d } = TIMING.scenes[i];
    const sel = `#sc-${s.id}`;
    lines.push(`// ${s.id}`);
    lines.push(`tl.fromTo("${sel} .w", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out", stagger: 0.09 }, ${t0 + 0.25});`);
    if (s.kind === "hook") {
      lines.push(`tl.fromTo("${sel} .big", { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.6)" }, ${t0 + 0.1});`);
      lines.push(`tl.set("${sel} .hook-l2 .w", { opacity: 0 }, ${t0});`);
      lines.push(`tl.fromTo("${sel} .hook-l2 .w", { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "power3.out", stagger: 0.09 }, ${t0 + 4.3});`);
    } else if (s.kind === "tech") {
      lines.push(`tl.fromTo("${sel} .kicker", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 }, ${t0 + 0.2});`);
      lines.push(`tl.fromTo("${sel} .c1", { opacity: 0, y: 80, rotateX: 30, transformPerspective: 1200 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "power3.out" }, ${t0 + 0.6});`);
      lines.push(`tl.fromTo("${sel} .c2", { opacity: 0, y: 80, rotateX: 30, transformPerspective: 1200 }, { opacity: 1, y: 0, rotateX: 0, duration: 0.8, ease: "power3.out" }, ${t0 + 3.6});`);
      lines.push(`tl.fromTo("${sel} .spark", { rotate: -90, scale: 0.4 }, { rotate: 0, scale: 1, duration: 1, ease: "back.out(2)" }, ${t0 + 0.8});`);
      lines.push(`tl.fromTo("${sel} .dotwave i", { scaleY: 0.3 }, { scaleY: 1, duration: 0.35, ease: "sine.inOut", stagger: { each: 0.08, repeat: 7, yoyo: true } }, ${t0 + 3.8});`);
    } else if (s.kind === "close") {
      lines.push(`tl.fromTo("${sel} .endlogo", { scale: 0.3, opacity: 0, rotate: -60 }, { scale: 1, opacity: 1, rotate: 0, duration: 1, ease: "back.out(1.7)" }, ${t0 + 0.1});`);
      lines.push(`tl.fromTo("${sel} .endname", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, ${t0 + 0.5});`);
      lines.push(`tl.fromTo("${sel} .url, ${sel} .team, ${sel} .event", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.5 }, ${t0 + 2.6});`);
    } else {
      if (s.logo) lines.push(`tl.fromTo("${sel} .mark", { scale: 0.3, opacity: 0, rotate: -60 }, { scale: 1, opacity: 1, rotate: 0, duration: 0.9, ease: "back.out(1.7)" }, ${t0 + 0.05});`);
      lines.push(`tl.fromTo("${sel} .sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, ${t0 + 1.1});`);
      // Phone flies in tilted in 3D, settles, then drifts slowly.
      lines.push(`tl.fromTo("${sel} .phone", { y: 260, rotateX: 28, rotateY: -22, rotateZ: 6, scale: 0.86, opacity: 0, transformPerspective: 1600 }, { y: 0, rotateX: 6, rotateY: -8, rotateZ: 1.5, scale: 1, opacity: 1, duration: 1.1, ease: "power3.out" }, ${t0 + 0.15});`);
      lines.push(`tl.to("${sel} .phone", { rotateX: 0, rotateY: 4, rotateZ: -1, y: -16, duration: ${(d - 1.3).toFixed(2)}, ease: "sine.inOut" }, ${t0 + 1.25});`);
      const n = s.shots.length;
      for (let k = 1; k < n; k++) {
        const at = t0 + 0.6 + ((d - 1.2) * k) / n;
        lines.push(`tl.fromTo("${sel} .s${k}", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, ${at.toFixed(2)});`);
      }
    }
    // Every scene leaves with a quick lift and fade, like the reference's snappy cuts.
    if (i < SCENES.length - 1) {
      lines.push(`tl.to("${sel} > *", { opacity: 0, y: -40, filter: "blur(8px)", duration: 0.3, ease: "power2.in" }, ${(t0 + d - 0.3).toFixed(2)});`);
    }
  });
  return lines.join("\n      ");
}

function page(orient) {
  const land = orient === "landscape";
  const up = land ? "../" : "";
  const [W, H] = land ? [1920, 1080] : [1080, 1920];
  return `<!doctype html>
<!-- Generated by tools/build.mjs. Edit the builder, then run: node tools/build.mjs -->
<html lang="en" data-resolution="${orient}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="${up}style.css" />
  </head>
  <body class="${orient}">
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TIMING.total}" data-width="${W}" data-height="${H}">
      <div class="bg"></div>
      ${SCENES.map(sceneHtml).join("\n      ").replaceAll('src="assets/', `src="${up}assets/`)}
      <audio id="soundtrack" src="${up}assets/soundtrack.m4a" data-start="0" data-duration="${TIMING.total}" data-track-index="2" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${timelineJs()}
      // Slow drift of the background glow across the whole film.
      tl.fromTo(".bg", { backgroundPosition: "0% 0%" }, { backgroundPosition: "100% 100%", duration: ${TIMING.total}, ease: "none" }, 0);
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
console.log(`built index.html + landscape.html, ${TIMING.total}s`);
