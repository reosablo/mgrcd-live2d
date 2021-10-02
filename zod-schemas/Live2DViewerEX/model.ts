import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import {
  modelSchema as live2dModelSchema,
  motionSchema as live2dMotionSchema,
} from "../Live2D/model.ts";
export * from "../Live2D/model.ts";

export const controllerSchema = z.object({
  enabled: z.boolean(),
}).partial().passthrough();

export const motionSchema = live2dMotionSchema.extend({
  name: z.string(),
  text: z.string(),
  text_duration: z.number(),
  motion_duration: z.number(),
  priority: z.number(),
  command: z.string(),
  post_command: z.string(),
  time_limit: z.object({
    hour: z.number(),
    minute: z.number(),
    month: z.number(),
    day: z.number(),
    sustain: z.number(),
    birthday: z.boolean(),
  }).partial().passthrough(),
  ignorable: z.boolean(),
  intimacy: z.object({
    min: z.number(),
    max: z.number(),
    bonus: z.number(),
  }).partial().passthrough(),
  next_mtn: z.string(),
  weight: z.number(),
}).partial().passthrough();

export const modelSchema = live2dModelSchema.extend({
  motions: z.object({}).catchall(z.array(motionSchema)),
  controllers: z.object({
    mouse_tracking: controllerSchema,
    lip_sync: controllerSchema,
    eye_blink: controllerSchema,
    auto_breath: controllerSchema,
    extra_motion: controllerSchema,
    intimacy_system: controllerSchema.extend({
      init_value: z.number(),
      min_value: z.number(),
      max_value: z.number(),
      active_bonus: z.number(),
      inactive_bonus: z.number(),
      bonus_limit: z.number(),
      id: z.string(),
    }).partial().passthrough(),
  }).partial().passthrough(),
  options: z.object({
    id: z.string(),
    name: z.string(),
    scale_factor: z.number(),
    aniso_level: z.number(),
  }).partial(),
}).partial().passthrough();
