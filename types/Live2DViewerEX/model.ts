import {
  Model as Live2DModel,
  Motion as Live2DMotion,
} from "../Live2D/model.ts";
export * from "../Live2D/model.ts";

export type Controller = {
  enabled?: boolean;
  [x: string]: unknown;
};

export type Motion = Live2DMotion & {
  name?: string;
  text?: string;
  text_duration?: number;
  motion_duration?: number;
  priority?: number;
  command?: string;
  post_command?: string;
  time_limit?: {
    hour?: number;
    minute?: number;
    month?: number;
    day?: number;
    sustain?: number;
    birthday?: boolean;
    [x: string]: unknown;
  };
  ignorable?: boolean;
  intimacy?: {
    min?: number;
    max?: number;
    bonus?: number;
    [x: string]: unknown;
  };
  next_mtn?: string;
  weight?: number;
  [x: string]: unknown;
};

export type Model = Live2DModel & {
  motions?: Record<string, Motion[]>;
  controllers?: {
    mouse_tracking?: Controller;
    lip_sync?: Controller;
    eye_blink?: Controller;
    auto_breath?: Controller;
    extra_motion?: Controller;
    intimacy_system?: Controller & {
      init_value?: number;
      min_value?: number;
      max_value?: number;
      active_bonus?: number;
      inactive_bonus?: number;
      bonus_limit?: number;
      id?: string;
      [x: string]: unknown;
    };
    [x: string]: unknown;
  };
  options?: {
    id?: string;
    name?: string;
    scale_factor?: number;
    aniso_level?: number;
  };
  [x: string]: unknown;
};
