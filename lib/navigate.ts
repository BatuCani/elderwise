"use client";

// Native-feeling tab changes: the View Transitions API slides the old screen out and the new one in
// (direction follows the tab order) while the tab bar's pill glides to the new tab.
// Browsers without it, and people who prefer reduced motion, just switch screens.
const TABS = ["/", "/answers", "/profile"];

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> };
};

let committed: (() => void) | null = null;

export function navigate(push: (href: string) => void, from: string, to: string) {
  const doc = document as ViewTransitionDocument;
  if (from === to || !doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    push(to);
    return;
  }
  const root = document.documentElement;
  root.dataset.navDir = TABS.indexOf(to) < TABS.indexOf(from) ? "back" : "forward";
  const vt = doc.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        committed = resolve;
        push(to);
        // Never hold the old screen frozen if the new route is slow to render.
        setTimeout(resolve, 600);
      }),
  );
  vt.finished.finally(() => delete root.dataset.navDir);
}

// The tab bar calls this once the new route has rendered, so the transition captures the new screen.
export function routeCommitted() {
  committed?.();
  committed = null;
}

// True while a view transition is running; the plain fade fallback stays out of its way.
export function inViewTransition() {
  return "navDir" in document.documentElement.dataset;
}
