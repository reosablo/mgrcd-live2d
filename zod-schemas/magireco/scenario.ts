import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";

export const actionSchema = z.object({
  cheek: z.number(),
  eyeClose: z.number(),
  face: z.string(),
  id: z.number().int(),
  lipSynch: z.number(),
  motion: z.number().int(),
  mouthOpen: z.number(),
  soulGem: z.number(),
  tear: z.number(),
  textHome: z.string(),
  textHomeStatus: z.enum(["Clear"]).or(z.string()),
  voice: z.string(),
}).partial().passthrough();

export const sceneSchema = z.object({
  autoTurnFirst: z.number(),
  autoTurnLast: z.number(),
  chara: z.array(actionSchema),
}).partial().passthrough();

export const storySchema = z.array(sceneSchema);

export const scenarioSchema = z.object({
  story: z.object({}).catchall(storySchema),
  version: z.number(),
}).partial().passthrough();
