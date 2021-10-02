export type Action = {
  cheek?: number;
  effect?: "shake" | string;
  eyeClose?: number;
  face?: string;
  id?: number;
  lipSynch?: number;
  motion?: number;
  pos?: number;
  soulGem?: number;
  tear?: number;
  textHome?: string;
  textHomeStatus?: "Clear" | string;
  voice?: string;
  [x: string]: unknown;
};

export type Scene = {
  armatureList?: {
    animation: ("action" | string)[];
    armatureId: number;
    filePath: string;
    zOrder: "bgFront" | "messageBack" | string;
  }[];
  autoTurnFirst?: number;
  autoTurnLast?: number;
  chara?: Action[];
  deleteArmatureList?: number[];
  [x: string]: unknown;
};

export type Story = Scene[];

export type Scenario = {
  skipTransitionList?: unknown[];
  story?: Record<string, Story>;
  version?: number;
  [x: string]: unknown;
};
