export type Motion = {
  File?: string;
  Expression?: string;
  Sound?: string;
  FadeIn?: number;
  FadeOut?: number;
  [x: string]: unknown;
};

export type Expression = {
  Name: string;
  File: string;
  [x: string]: unknown;
};

export type Group = {
  Target: string;
  Name: "EyeBlink" | "LipSync";
  Ids: string[];
  [x: string]: unknown;
};

export type HitArea = {
  Id: string;
  Name: string;
  [x: string]: unknown;
};

export type Model = {
  Version: number;
  FileReferences: {
    Moc: string;
    Textures: string[];
    Physics?: string;
    Pose?: string;
    Expressions?: Expression[];
    motions?: Record<string, Motion[]>;
  };
  Groups?: Group[];
  HitAreas?: HitArea[];
  [x: string]: unknown;
};
