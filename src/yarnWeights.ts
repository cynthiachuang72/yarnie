import { YarnWeight } from './types';

/**
 * Standard yarn weights (Craft Yarn Council, numbers 0–7) with the other names
 * people use and the usual needle / hook sizes printed on yarn labels.
 */
export const YARN_WEIGHTS: {
  id: YarnWeight;
  name: string;
  alsoCalled: string;
  needles: string;
  hook: string;
}[] = [
  { id: '0', name: 'Lace', alsoCalled: 'Fingering 10-count, crochet thread', needles: '1.5–2.25 mm (US 000–1)', hook: '1.4–2.25 mm (steel 6–8, B-1)' },
  { id: '1', name: 'Super Fine', alsoCalled: 'Fingering, sock, baby', needles: '2.25–3.25 mm (US 1–3)', hook: '2.25–3.5 mm (B-1 to E-4)' },
  { id: '2', name: 'Fine', alsoCalled: 'Sport, baby', needles: '3.25–3.75 mm (US 3–5)', hook: '3.5–4.5 mm (E-4 to 7)' },
  { id: '3', name: 'Light', alsoCalled: 'DK, light worsted, double knit', needles: '3.75–4.5 mm (US 5–7)', hook: '4.5–5.5 mm (7 to I-9)' },
  { id: '4', name: 'Medium', alsoCalled: 'Worsted, aran, afghan', needles: '4.5–5.5 mm (US 7–9)', hook: '5.5–6.5 mm (I-9 to K-10½)' },
  { id: '5', name: 'Bulky', alsoCalled: 'Chunky, craft, rug', needles: '5.5–8 mm (US 9–11)', hook: '6.5–9 mm (K-10½ to M-13)' },
  { id: '6', name: 'Super Bulky', alsoCalled: 'Super chunky, roving', needles: '8–12.75 mm (US 11–17)', hook: '9–15 mm (M-13 to Q)' },
  { id: '7', name: 'Jumbo', alsoCalled: 'Roving', needles: '12.75 mm and up (US 17+)', hook: '15 mm and up (Q and up)' },
];

// Older Yarnie versions saved weights by name; map them to the standard numbers.
const LEGACY: Record<string, YarnWeight> = {
  lace: '0',
  fingering: '1',
  sport: '2',
  DK: '3',
  worsted: '4',
  bulky: '5',
  'super bulky': '6',
};

export function weightInfo(w: string | undefined) {
  const id = (w && (LEGACY[w] ?? w)) as YarnWeight;
  return YARN_WEIGHTS.find((x) => x.id === id);
}

/** Short label like "3 · Light (DK)". */
export function weightLabel(w: string | undefined) {
  const info = weightInfo(w);
  if (!info) return w ?? '';
  return `${info.id} · ${info.name} (${info.alsoCalled.split(',')[0]})`;
}

/** Full description shown under the weight picker. */
export function weightDescription(w: string | undefined) {
  const info = weightInfo(w);
  if (!info) return '';
  return `Also called: ${info.alsoCalled}\nKnitting needles: ${info.needles}\nCrochet hook: ${info.hook}`;
}
