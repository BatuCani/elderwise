// "9:38" for today, "Yesterday" for yesterday, "Mon 12 Oct" for anything older.
// todayKey is new Date().toDateString(), read once per render outside the component.

export function friendlyTime(at: number, todayKey: string, locale: string, yesterday: string): string {
  const d = new Date(at);
  const today = todayKey ? new Date(todayKey) : null;
  if (today && d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  }
  if (today) {
    const y = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return yesterday;
  }
  return d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short" });
}

export function todayKey(): string {
  return new Date().toDateString();
}
