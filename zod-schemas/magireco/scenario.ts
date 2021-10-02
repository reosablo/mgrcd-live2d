import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";

export const actionSchema = z.object({
  cheek: z.number(),
  effect: z.enum(["shake"]).or(z.string()),
  eyeClose: z.number(),
  face: z.string(),
  id: z.number().int().nonnegative(),
  lipSynch: z.number(),
  motion: z.number().int().nonnegative(),
  pos: z.number().int().nonnegative(),
  soulGem: z.number(),
  tear: z.number(),
  textHome: z.string(),
  textHomeStatus: z.enum(["Clear"]).or(z.string()),
  voice: z.string(),
}).partial().passthrough();

export const sceneSchema = z.object({
  armatureList: z.array(z.object({
    animation: z.array(z.enum(["action"]).or(z.string())),
    armatureId: z.number(),
    filePath: z.string(),
    zOrder: z.enum(["bgFront", "messageBack"]).or(z.string()),
  })),
  autoTurnFirst: z.number(),
  autoTurnLast: z.number(),
  chara: z.array(actionSchema),
  deleteArmatureList: z.array(z.number()),
}).partial().passthrough();

export const storySchema = z.array(sceneSchema);

export const scenarioSchema = z.object({
  skipTransitionList: z.array(z.unknown()).optional(),
  story: z.object({}).catchall(storySchema),
  version: z.number(),
}).partial().passthrough();
