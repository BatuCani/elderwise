"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

type Props = { open: boolean; title: string; closeLabel: string; onClose: () => void; children: ReactNode };

const noSubscribe = () => () => {};

// Bottom sheet in the glass style of PhotoSheet: dimmed backdrop, slides up, Escape or backdrop closes it.
export function GlassSheet({ open, title, closeLabel, onClose, children }: Props) {
  const portalReady = useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!portalReady) return null;
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={`fixed inset-0 z-50 transition-[visibility] ${open ? "visible" : "invisible delay-300"}`}
    >
      <div onClick={onClose} className={`absolute inset-0 bg-ink/40 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`} />
      <div
        className={`glass absolute inset-x-0 bottom-0 mx-auto max-h-[88dvh] max-w-xl overflow-y-auto rounded-t-[32px] px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ background: "rgba(250, 248, 243, 0.92)" }}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted/40" />
        <div className="mb-4 flex items-center gap-2">
          <h2 className="flex-1 font-serif text-[28px] font-medium leading-tight text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/75 text-muted"
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>
        {/* Only render the content while open, so form fields start fresh every time. */}
        {open && children}
      </div>
    </div>,
    document.body,
  );
}
