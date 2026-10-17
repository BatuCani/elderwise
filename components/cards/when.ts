// Reads a date and time out of Claude's free-text "when" field, for example
// "Tuesday 10:30 at Dr. Weber", "21 October, 3 pm" or "morgen um 9 Uhr".
// Relative words (tomorrow, Tuesday) count from the moment the answer was given.

export type ParsedWhen = { date: Date; hasTime: boolean; place: string | null };

const MONTHS: Record<string, number> = {
  january: 0, jan: 0, januar: 0, "jänner": 0,
  february: 1, feb: 1, februar: 1,
  march: 2, mar: 2, "märz": 2, maerz: 2,
  april: 3, apr: 3,
  may: 4, mai: 4,
  june: 5, jun: 5, juni: 5,
  july: 6, jul: 6, juli: 6,
  august: 7, aug: 7,
  september: 8, sept: 8, sep: 8,
  october: 9, oct: 9, oktober: 9, okt: 9,
  november: 10, nov: 10,
  december: 11, dec: 11, dezember: 11, dez: 11,
};

const WEEKDAYS: Record<string, number> = {
  sunday: 0, sonntag: 0,
  monday: 1, montag: 1,
  tuesday: 2, dienstag: 2,
  wednesday: 3, mittwoch: 3,
  thursday: 4, donnerstag: 4,
  friday: 5, freitag: 5,
  saturday: 6, samstag: 6, sonnabend: 6,
};

// Alternation of whole words, longest first so "march" wins over "mar".
function words(list: Record<string, number>): string {
  return Object.keys(list)
    .sort((a, b) => b.length - a.length)
    .join("|");
}

// Built with new RegExp so letter classes (\p{L}) and lookbehind work in every modern browser.
const W = (pattern: string) => new RegExp(pattern, "iu");
const MONTH = words(MONTHS);
const WEEKDAY = words(WEEKDAYS);
// Short forms, only removed as decoration once a real date was found.
const SHORT_WEEKDAY = "tues|thurs|thur|mon|tue|wed|thu|fri|sat|sun|mo|di|mi|fr|sa";

export function parseWhen(text: string, base: Date): ParsedWhen | null {
  let rest = ` ${text} `;
  const take = (re: RegExp) => {
    const m = rest.match(re);
    if (m) rest = rest.replace(m[0], " ");
    return m;
  };

  // 1. Time of day.
  let hours: number | null = null;
  let minutes = 0;
  let m = take(W("(?<!\\d)(\\d{1,2}):(\\d{2})\\s*(a\\.?m\\.?|p\\.?m\\.?|uhr)?"));
  if (m) {
    hours = Number(m[1]);
    minutes = Number(m[2]);
  } else if ((m = take(W("(?<!\\d)(\\d{1,2})\\s*(a\\.?m\\.?|p\\.?m\\.?)(?!\\p{L})")))) {
    hours = Number(m[1]);
  } else if ((m = take(W("(?<!\\d)(\\d{1,2})(?:\\.(\\d{2}))?\\s*uhr(?!\\p{L})")))) {
    hours = Number(m[1]);
    minutes = m[2] ? Number(m[2]) : 0;
  }
  const suffix = m?.[3] ?? m?.[2] ?? "";
  if (hours !== null && /^p/i.test(suffix) && hours < 12) hours += 12;
  if (hours !== null && /^a/i.test(suffix) && hours === 12) hours = 0;
  if (hours !== null && (hours > 23 || minutes > 59)) hours = null;

  // 2. The day.
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;
  let offset: number | null = null;

  if ((m = take(W("(?<!\\d)(\\d{4})-(\\d{1,2})-(\\d{1,2})(?!\\d)")))) {
    year = Number(m[1]);
    month = Number(m[2]) - 1;
    day = Number(m[3]);
  } else if ((m = take(W(`(?<!\\d)(\\d{1,2})(?:st|nd|rd|th|\\.)?\\s+(?:of\\s+)?(${MONTH})(?!\\p{L})\\.?(?:,?\\s+(\\d{4}))?`)))) {
    day = Number(m[1]);
    month = MONTHS[m[2].toLowerCase()];
    year = m[3] ? Number(m[3]) : null;
  } else if ((m = take(W(`(?<!\\p{L})(${MONTH})(?!\\p{L})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?!\\d)(?:,?\\s+(\\d{4}))?`)))) {
    month = MONTHS[m[1].toLowerCase()];
    day = Number(m[2]);
    year = m[3] ? Number(m[3]) : null;
  } else if ((m = take(W("(?<!\\d)(\\d{1,2})[./](\\d{1,2})(?:[./](\\d{2,4}))?(?!\\d)")))) {
    day = Number(m[1]);
    month = Number(m[2]) - 1;
    year = m[3] ? (m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3])) : null;
  } else if (take(W("(?<!\\p{L})(today|heute)(?!\\p{L})"))) {
    offset = 0;
  } else if (take(W("(?<!\\p{L})(übermorgen|uebermorgen|day after tomorrow)(?!\\p{L})"))) {
    offset = 2;
  } else if (take(W("(?<!\\p{L})(tomorrow|morgen)(?!\\p{L})"))) {
    offset = 1;
  } else if ((m = take(W(`(?<!\\p{L})(${WEEKDAY})(?!\\p{L})`)))) {
    offset = (WEEKDAYS[m[1].toLowerCase()] - base.getDay() + 7) % 7;
    const earlierToday =
      hours !== null && (hours < base.getHours() || (hours === base.getHours() && minutes <= base.getMinutes()));
    if (offset === 0 && earlierToday) offset = 7;
  }
  // A weekday next to a full date ("Tuesday, 21 October", "Mon 3 March") is just decoration.
  take(W(`(?<!\\p{L})(${WEEKDAY})(?!\\p{L})`));
  take(W(`(?<!\\p{L})(${SHORT_WEEKDAY})(?!\\p{L})\\.?`));

  let date: Date;
  if (month !== null && day !== null) {
    if (month < 0 || month > 11 || day < 1 || day > 31) return null;
    const y = year ?? base.getFullYear();
    date = new Date(y, month, day, hours ?? 0, minutes);
    if (date.getMonth() !== month) return null;
    // No year given and the day has already passed: it means next year.
    if (year === null && date.getTime() < base.getTime() - 24 * 60 * 60 * 1000) {
      date = new Date(y + 1, month, day, hours ?? 0, minutes);
    }
  } else if (offset !== null) {
    date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + offset, hours ?? 0, minutes);
  } else {
    return null;
  }

  // 3. The place: whatever follows "at", "bei", "im" or "in" once date and time are gone.
  const left = rest.replace(/[,;]+/g, " ").replace(/\s+/g, " ").trim();
  const p = left.match(W("(?<!\\p{L})(?:at|bei|im|in der|in)\\s+(.+)$"));
  // No "at" or "bei": whatever is left is most likely the place ("Praxis Dr. Weber").
  let place: string | null = p ? p[1] : left;
  while (place && W("^(?:at|bei|im|in der|in|um|am|on|the|den|der|die|das)\\s+").test(place)) {
    place = place.replace(W("^(?:at|bei|im|in der|in|um|am|on|the|den|der|die|das)\\s+"), "");
  }
  place = place ? place.replace(/[.\s]+$/, "").trim() : null;
  if (!place || !W("\\p{L}{3}").test(place)) place = null;

  return { date, hasTime: hours !== null, place };
}
