import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";

export const motionSchema = z.object({
  file: z.string(),
  expression: z.string(),
  sound: z.string(),
  fade_in: z.number(),
  fade_out: z.number(),
}).partial().passthrough();

export const expressionSchema = z.object({
  name: z.string(),
  file: z.string(),
}).passthrough();

export const hitAreaSchema = z.object({
  id: z.string(),
  name: z.string(),
}).passthrough();

export const modelSchema = z.object({
  name: z.string(),
  model: z.string(),
  textures: z.array(z.string()),
  motions: z.object({}).catchall(z.array(motionSchema)),
  expressions: z.array(expressionSchema),
  physics: z.string(),
  pose: z.string(),
  hit_areas: z.array(hitAreaSchema),
}).partial().passthrough();
