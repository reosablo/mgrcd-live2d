// deno-lint-ignore-file camelcase

export type Motion = {
  file?: string;
  expression?: string;
  sound?: string;
  fade_in?: number;
  fade_out?: number;
  [x: string]: unknown;
};

export type Expression = {
  name: string;
  file: string;
  [x: string]: unknown;
};

export type HitArea = {
  id: string;
  name: string;
  [x: string]: unknown;
};

export type Model = {
  name?: string;
  model?: string;
  textures?: string[];
  motions?: Record<string, Motion[]>;
  expressions?: Expression[];
  physics?: string;
  pose?: string;
  hit_areas?: HitArea[];
};
