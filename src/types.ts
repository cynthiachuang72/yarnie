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
  rows: number; // row counter
  stitches: number; // stitch counter
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
