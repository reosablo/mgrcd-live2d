import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import {
  modelSchema as live2dModelSchema,
  motionSchema as live2dMotionSchema,
} from "../Live2D/model.model3.ts";
export * from "../Live2D/model.model3.ts";

export const controllerSchema = z.object({
  Enabled: z.boolean(),
}).partial().passthrough();

export const motionSchema = live2dMotionSchema.extend({
  Name: z.string(),
  FileLoop: z.boolean(),
  Text: z.string(),
  TextDuration: z.number(),
  MotionDuration: z.number(),
  Priority: z.number(),
  Interruptable: z.boolean(),
  Command: z.string(),
  PostCommand: z.string(),
  TimeLimit: z.object({
    Hour: z.number(),
    Minute: z.number(),
    Month: z.number(),
    Day: z.number(),
    Sustain: z.number(),
    Birthday: z.boolean(),
  }).partial().passthrough(),
  Ignorable: z.boolean(),
  Intimacy: z.object({
    Min: z.number(),
    Max: z.number(),
    Bonus: z.number(),
  }).partial().passthrough(),
  NextMtn: z.string(),
  Weight: z.number(),
}).partial().passthrough();

export const modelSchema = live2dModelSchema.extend({
  FileReferences: live2dModelSchema.shape.FileReferences.extend({
    Motions: z.object({}).catchall(z.array(motionSchema)),
  }),
  Controllers: z.object({
    MouseTracking: controllerSchema,
    LipSync: controllerSchema,
    EyeBlink: controllerSchema,
    AutoBreath: controllerSchema,
    ExtraMotion: controllerSchema,
    IntimacySystem: controllerSchema.extend({
      InitValue: z.number(),
      MinValue: z.number(),
      MaxValue: z.number(),
      ActiveBonus: z.number(),
      InactiveBonus: z.number(),
      BonusLimit: z.number(),
      Id: z.string(),
    }).partial().passthrough(),
  }).partial().passthrough().optional(),
  Options: z.object({
    Id: z.string(),
    Name: z.string(),
    ScaleFactor: z.number(),
    AnisoLevel: z.number(),
  }).partial().optional(),
}).passthrough();
