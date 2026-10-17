// Builds a calendar file (.ics) in the browser and hands it to the phone.
// No library needed: the format is plain text.

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
const hms = (d: Date) => `${pad(d.getHours())}${pad(d.getMinutes())}00`;
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

type Event = { title: string; description: string; place: string | null; start: Date; hasTime: boolean };

export function buildIcs({ title, description, place, start, hasTime }: Event): string {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Elderwise//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT"];
  lines.push(`UID:${crypto.randomUUID()}@elderwise`, `DTSTAMP:${stamp}`);
  if (hasTime) {
    // Local time as written on the letter, one hour long.
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    lines.push(`DTSTART:${ymd(start)}T${hms(start)}`, `DTEND:${ymd(end)}T${hms(end)}`);
  } else {
    const next = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    lines.push(`DTSTART;VALUE=DATE:${ymd(start)}`, `DTEND;VALUE=DATE:${ymd(next)}`);
  }
  lines.push(`SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(description)}`);
  if (place) lines.push(`LOCATION:${esc(place)}`);
  if (hasTime) {
    // A gentle reminder one hour before.
    lines.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(title)}`, "TRIGGER:-PT1H", "END:VALARM");
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export function downloadIcs(event: Event) {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "elderwise-reminder.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
