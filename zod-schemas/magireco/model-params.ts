import { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";

export const paramSchema = z.object({
  modelScale: z.number().optional(),
  charaName: z.string(),
});
