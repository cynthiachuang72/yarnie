export type Craft = 'knit' | 'crochet';

export type ProjectStatus = 'planned' | 'in progress' | 'finished';

export interface Project {
  id: string;
  name: string;
  craft: Craft;
  status: ProjectStatus;
  patternId?: string;
  yarnId?: string;
  notes: string;
  rows: number; // free row counter
  stitches: number; // stitch counter
  // Pattern tracker (used when the linked pattern has steps)
  step?: number; // 0-based index of the current step
  repeat?: number; // 1-based current repeat; > pattern.repeats means finished
  autoRepeat?: boolean; // finishing the last step moves to the next repeat (default true)
  repeatDisplay?: 'current' | 'done'; // show "Repeat 3 of 28" or "2 of 28 done"
  log?: { at: number; text: string }[]; // recent repeat changes, jumps and resets (newest last)
  createdAt: number;
}

export type Difficulty = 'beginner' | 'easy' | 'intermediate' | 'advanced';

export interface Pattern {
  id: string;
  name: string;
  craft: Craft;
  difficulty: Difficulty;
  link: string;
  notes: string;
  steps?: string[]; // the rows/rounds that repeat, one instruction each
  repeats?: number; // how many times to work the steps in total
  createdAt: number;
}

export type YarnWeight =
  | 'lace'
  | 'fingering'
  | 'sport'
  | 'DK'
  | 'worsted'
  | 'bulky'
  | 'super bulky';

export interface Yarn {
  id: string;
  name: string; // brand / line
  color: string;
  weight: YarnWeight;
  fiber: string;
  skeins: number;
  createdAt: number;
}
