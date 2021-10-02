import type { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import type {
  Controller,
  Model,
  Motion,
} from "../../types/Live2DViewerEX/model.ts";
import type { controllerSchema, modelSchema, motionSchema } from "./model.ts";

type assertExtends<_ extends Type, Type> = never;

type ZodController = z.infer<typeof controllerSchema>;
type ZodModel = z.infer<typeof modelSchema>;
type ZodMotion = z.infer<typeof motionSchema>;

type _ =
  & assertExtends<ZodController, Controller>
  & assertExtends<ZodModel, Model>
  & assertExtends<ZodMotion, Motion>
  & assertExtends<Controller, ZodController>
  & assertExtends<Model, ZodModel>
  & assertExtends<Motion, ZodMotion>;
