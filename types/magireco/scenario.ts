export type Action = {
  cheek?: number;
  eyeClose?: number;
  face?: string;
  id?: number;
  lipSynch?: number;
  motion?: number;
  mouthOpen?: number;
  soulGem?: number;
  tear?: number;
  textHome?: string;
  textHomeStatus?: "Clear" | string;
  voice?: string;
  [x: string]: unknown;
};

export type Scene = {
  autoTurnFirst?: number;
  autoTurnLast?: number;
  chara?: Action[];
  [x: string]: unknown;
};

export type Story = Scene[];

export type Scenario = {
  story?: Record<string, Story>;
  version?: number;
  [x: string]: unknown;
};
