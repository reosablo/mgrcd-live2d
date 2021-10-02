import type { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import type { Param } from "../../types/magireco/model-params.ts";
import type { paramSchema } from "./model-params.ts";

type assertExtends<_ extends Type, Type> = never;

type ZodParam = z.infer<typeof paramSchema>;

type _ =
  & assertExtends<ZodParam, Param>
  & assertExtends<Param, ZodParam>;
