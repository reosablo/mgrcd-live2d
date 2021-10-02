import {
  Model as Live2DModel,
  Motion as Live2DMotion,
} from "../Live2D/model.model3.ts";
export * from "../Live2D/model.model3.ts";

export type Controller = {
  Enabled?: boolean;
  [x: string]: unknown;
};

export type Motion = Live2DMotion & {
  Name?: string;
  FileLoop?: boolean;
  Text?: string;
  TextDuration?: number;
  MotionDuration?: number;
  Priority?: number;
  Interruptable?: boolean;
  Command?: string;
  PostCommand?: string;
  TimeLimit?: {
    Hour?: number;
    Minute?: number;
    Month?: number;
    Day?: number;
    Sustain?: number;
    Birthday?: boolean;
    [x: string]: unknown;
  };
  Ignorable?: boolean;
  Intimacy?: {
    Min?: number;
    Max?: number;
    Bonus?: number;
    [x: string]: unknown;
  };
  NextMtn?: string;
  Weight?: number;
  [x: string]: unknown;
};

export type Model = Live2DModel & {
  FileReferences: Live2DModel["FileReferences"] & {
    Motions: Record<string, Motion[]>;
  };
  Controllers?: {
    MouseTracking?: Controller;
    LipSync?: Controller;
    EyeBlink?: Controller;
    AutoBreath?: Controller;
    ExtraMotion?: Controller;
    IntimacySystem?: Controller & {
      InitValue?: number;
      MinValue?: number;
      MaxValue?: number;
      ActiveBonus?: number;
      InactiveBonus?: number;
      BonusLimit?: number;
      Id?: string;
      [x: string]: unknown;
    };
    [x: string]: unknown;
  };
  Options?: {
    Id?: string;
    Name?: string;
    ScaleFactor?: number;
    AnisoLevel?: number;
    [x: string]: unknown;
  };
  [x: string]: unknown;
};
