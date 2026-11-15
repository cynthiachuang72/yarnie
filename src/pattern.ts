import { Project } from './types';

/**
 * Turn pasted pattern text into steps: one per line.
 * Strips numbering like "1.", "1)", "(1)", "1:", "Row 1:", "Rnd 1:" or circled numbers,
 * but keeps lines that genuinely start with a number (e.g. "2 sc in next st").
 */
export function parseSteps(text: string): string[] {
  return text
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*(?:(?:row|rnd|round|step|r)\s*\d+\s*[:.)-]?|\(\d+\)|\d+\s*[.):]|[①-⑳])\s*/i, '')
        .trim(),
    )
    .filter(Boolean);
}

const REF = /^(?:repeat|rep|same as|as)\s*(?:row|rnd|round|step)?\s*#?\(?\s*(\d+|[①-⑳])\s*\)?\.?$/i;

/** Resolve "Repeat 1" / "Same as row 2" to the instruction it points at. */
export function resolveStep(steps: string[], index: number): { text: string; sameAs?: number } {
  let i = index;
  let sameAs: number | undefined;
  for (let depth = 0; depth < 10; depth++) {
    const m = steps[i]?.match(REF);
    if (!m) break;
    const n = /\d/.test(m[1]) ? Number(m[1]) : m[1].charCodeAt(0) - 0x2460 + 1; // ① → 1
    const target = n - 1;
    if (target < 0 || target >= steps.length || target === i) break;
    sameAs = sameAs ?? target + 1;
    i = target;
  }
  return { text: steps[i] ?? '', sameAs };
}

export interface Tracker {
  step: number;
  repeat: number;
  autoRepeat: boolean;
  repeatDisplay: 'current' | 'done';
}

export function trackerOf(p: Project, stepCount: number): Tracker {
  return {
    step: Math.min(Math.max(p.step ?? 0, 0), Math.max(stepCount - 1, 0)),
    repeat: Math.max(p.repeat ?? 1, 1),
    autoRepeat: p.autoRepeat ?? true,
    repeatDisplay: p.repeatDisplay ?? 'current',
  };
}

export const isComplete = (repeat: number, target?: number) => !!target && repeat > target;

/** Position after tapping "Next step". */
export function nextPosition(t: Tracker, stepCount: number, target?: number) {
  if (isComplete(t.repeat, target)) return { step: t.step, repeat: t.repeat };
  if (t.step < stepCount - 1) return { step: t.step + 1, repeat: t.repeat };
  // Finished the last step of a repeat.
  if (!t.autoRepeat) return { step: 0, repeat: t.repeat };
  if (target && t.repeat >= target) return { step: t.step, repeat: target + 1 }; // all done
  return { step: 0, repeat: t.repeat + 1 };
}

/** Position after tapping "Back". */
export function prevPosition(t: Tracker, stepCount: number, target?: number) {
  if (isComplete(t.repeat, target)) return { step: stepCount - 1, repeat: target! };
  if (t.step > 0) return { step: t.step - 1, repeat: t.repeat };
  if (!t.autoRepeat) return { step: stepCount - 1, repeat: t.repeat };
  if (t.repeat > 1) return { step: stepCount - 1, repeat: t.repeat - 1 };
  return { step: 0, repeat: 1 };
}
