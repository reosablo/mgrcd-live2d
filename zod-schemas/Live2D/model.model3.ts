import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";

export const motionSchema = z.object({
  File: z.string(),
  Expression: z.string(),
  Sound: z.string(),
  FadeIn: z.number(),
  FadeOut: z.number(),
}).partial().passthrough();

export const expressionSchema = z.object({
  Name: z.string(),
  File: z.string(),
}).passthrough();

export const groupSchema = z.object({
  Target: z.string(),
  Name: z.enum(["EyeBlink", "LipSync"]),
  Ids: z.array(z.string()),
}).passthrough();

export const hitAreaSchema = z.object({
  Id: z.string(),
  Name: z.string(),
}).passthrough();

export const modelSchema = z.object({
  Version: z.number(),
  FileReferences: z.object({
    Moc: z.string(),
    Textures: z.array(z.string()),
    Physics: z.string().optional(),
    Pose: z.string().optional(),
    Expressions: z.array(expressionSchema).optional(),
    motions: z.object({}).catchall(z.array(motionSchema)).optional(),
  }),
  Groups: z.array(groupSchema).optional(),
  HitAreas: z.array(hitAreaSchema).optional(),
}).passthrough();
