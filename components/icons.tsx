// Simple line icons (inline SVG, 24px grid, stroke follows text color).
type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const MicIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
);
export const StopIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" /></svg>
);
export const SendIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);
export const CameraIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
);
export const AlertIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M12 3 2 20h20L12 3z" /><path d="M12 10v4M12 17h.01" /></svg>
);
export const CalendarIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
export const InfoIcon = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>
);
export const BookIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 21V5" /></svg>
);
export const SpeakerIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12" /></svg>
);
export const PhoneIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
);
export const ChatIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>
);
export const UserIcon = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const TextSizeIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 18 9 6l5 12M5.5 14h7M15 18l3-7 3 7M16 16h4" /></svg>
);
export const GlobeIcon = ({ className }: P) => (
  <svg {...base} className={className}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
);
export const BackIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M15 5l-7 7 7 7" /></svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const ListIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M5 12.5 10 17 19 7" /></svg>
);
export const RetryIcon = ({ className }: P) => (
  <svg {...base} className={className}><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" /></svg>
);
export const KeyboardIcon = ({ className }: P) => (
  <svg {...base} className={className}><rect x="2" y="6" width="20" height="13" rx="2" /><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h.01M18 14h.01M9 15h6" /></svg>
);
