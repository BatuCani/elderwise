"use client";

import type { Lang } from "@/prompts/elderwise";

// Reads QR codes and barcodes: the browser's own BarcodeDetector when it has one,
// otherwise zxing-wasm (loaded only when needed). Then turns the raw text into plain facts.

export type Code = { text: string; format: string };
export type Field = { label: string; value: string };
export type CodeKind = "payment" | "medicine" | "product" | "link" | "text";
export type ReadCode = { code: Code; kind: CodeKind; fields: Field[] };

type NativeDetector = { detect: (src: ImageBitmapSource) => Promise<{ rawValue: string; format: string }[]> };
type NativeCtor = new (opts: { formats: string[] }) => NativeDetector;

const NATIVE_FORMATS = ["qr_code", "ean_13", "ean_8", "code_39", "code_128", "data_matrix", "upc_a"];
let native: NativeDetector | null | undefined;

function nativeDetector(): NativeDetector | null {
  if (native !== undefined) return native;
  const Ctor = (globalThis as unknown as { BarcodeDetector?: NativeCtor }).BarcodeDetector;
  try {
    native = Ctor ? new Ctor({ formats: NATIVE_FORMATS }) : null;
  } catch {
    native = null;
  }
  return native;
}

// One frame (from the camera) or one picture (a sample or upload). Returns null if nothing was found.
export async function readCode(src: ImageData | Blob): Promise<Code | null> {
  const det = nativeDetector();
  if (det) {
    try {
      const bitmap = await createImageBitmap(src);
      const [hit] = await det.detect(bitmap);
      bitmap.close();
      if (hit) return { text: hit.rawValue, format: hit.format };
    } catch {
      // Some browsers expose the API but cannot run it; fall through to zxing.
    }
  }
  const { readBarcodes } = await import("zxing-wasm/reader");
  const [hit] = await readBarcodes(src, {
    formats: ["QRCode", "EAN13", "EAN8", "UPCA", "Code39", "PZN", "Code128", "DataMatrix"],
    tryHarder: true,
    maxNumberOfSymbols: 1,
  });
  return hit?.isValid ? { text: hit.text, format: hit.format } : null;
}

const LABELS = {
  en: {
    to: "Pay to", iban: "IBAN", amount: "Amount", reference: "Reference", pzn: "Medicine number (PZN)",
    product: "Product number", link: "Web address", text: "Text", batch: "Batch", expiry: "Use by",
  },
  de: {
    to: "Empfänger", iban: "IBAN", amount: "Betrag", reference: "Verwendungszweck", pzn: "Arzneimittelnummer (PZN)",
    product: "Produktnummer", link: "Internetadresse", text: "Text", batch: "Charge", expiry: "Verwendbar bis",
  },
};

const groupIban = (iban: string) => iban.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim();

// EPC / GiroCode bank transfer: "BCD", version, charset, "SCT", BIC, name, IBAN, "EUR12.50", purpose, reference, text.
function parseEpc(text: string, lang: Lang): Field[] | null {
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== "BCD" || lines[3]?.trim() !== "SCT") return null;
  const L = LABELS[lang];
  const [, , , , , name, iban, amount, , ref, note] = lines.map((l) => l.trim());
  const fields: Field[] = [];
  if (name) fields.push({ label: L.to, value: name });
  if (iban) fields.push({ label: L.iban, value: groupIban(iban) });
  const m = amount?.match(/^([A-Z]{3})(\d+(?:\.\d{1,2})?)$/);
  if (m) {
    const value = new Intl.NumberFormat(lang === "de" ? "de-DE" : "en-US", { style: "currency", currency: m[1] }).format(Number(m[2]));
    fields.push({ label: L.amount, value });
  }
  if (ref || note) fields.push({ label: L.reference, value: ref || note });
  return fields;
}

// Medicine packs carry a PZN (Code 39 "-12345678") or, newer, a Data Matrix with PPN "9N11..." plus batch and expiry.
function parseMedicine(code: Code, lang: Lang): Field[] | null {
  const L = LABELS[lang];
  const pzn = code.text.match(/^-?(\d{7,8})$/);
  if (pzn && /39|pzn/i.test(code.format)) return [{ label: L.pzn, value: pzn[1] }];
  const ppn = code.text.match(/9N11(\d{8})/);
  if (ppn) {
    const fields: Field[] = [{ label: L.pzn, value: ppn[1] }];
    const batch = code.text.match(/1T([A-Za-z0-9-]+)/);
    const exp = code.text.match(/D(\d{2})(\d{2})(\d{2})/);
    if (batch) fields.push({ label: L.batch, value: batch[1] });
    if (exp) fields.push({ label: L.expiry, value: `${exp[2]}/20${exp[1]}` });
    return fields;
  }
  return null;
}

export function describeCode(code: Code, lang: Lang): ReadCode {
  const L = LABELS[lang];
  const epc = parseEpc(code.text, lang);
  if (epc) return { code, kind: "payment", fields: epc };
  const med = parseMedicine(code, lang);
  if (med) return { code, kind: "medicine", fields: med };
  if (/^https?:\/\//i.test(code.text) || /^www\./i.test(code.text)) {
    return { code, kind: "link", fields: [{ label: L.link, value: code.text }] };
  }
  if (/^\d{8,14}$/.test(code.text)) return { code, kind: "product", fields: [{ label: L.product, value: code.text }] };
  return { code, kind: "text", fields: [{ label: L.text, value: code.text.slice(0, 300) }] };
}

// What we ask Claude after a code was read: the decoded facts in plain words, plus the safety question.
export function codeQuestion(read: ReadCode, lang: Lang): string {
  const facts = read.fields.map((f) => `${f.label}: ${f.value}`).join("\n");
  if (lang === "de") {
    const ask =
      read.kind === "payment"
        ? "Ist diese Zahlungsaufforderung sicher? Soll ich das bezahlen?"
        : read.kind === "medicine"
          ? "Welches Medikament ist das wahrscheinlich, und worauf muss ich achten?"
          : read.kind === "link"
            ? "Ist dieser Link sicher zu öffnen?"
            : "Was bedeutet das, und ist es sicher?";
    return `Ich habe einen Code gescannt (${read.code.format}). Er enthält:\n${facts}\n${ask}`;
  }
  const ask =
    read.kind === "payment"
      ? "Is this payment request safe? Should I pay it?"
      : read.kind === "medicine"
        ? "Which medicine is this likely to be, and what should I watch out for?"
        : read.kind === "link"
          ? "Is this link safe to open?"
          : "What does this mean, and is it safe?";
  return `I scanned a code (${read.code.format}). It contains:\n${facts}\n${ask}`;
}
