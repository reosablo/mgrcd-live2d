import type { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import type {
  Expression,
  HitArea,
  Model,
  Motion,
} from "../../types/Live2D/model.ts";
import type {
  expressionSchema,
  hitAreaSchema,
  modelSchema,
  motionSchema,
} from "./model.ts";

type assertExtends<_ extends Type, Type> = never;

type ZodExpression = z.infer<typeof expressionSchema>;
type ZodHitArea = z.infer<typeof hitAreaSchema>;
type ZodModel = z.infer<typeof modelSchema>;
type ZodMotion = z.infer<typeof motionSchema>;

type _ =
  & assertExtends<ZodExpression, Expression>
  & assertExtends<ZodHitArea, HitArea>
  & assertExtends<ZodModel, Model>
  & assertExtends<ZodMotion, Motion>
  & assertExtends<Expression, ZodExpression>
  & assertExtends<HitArea, ZodHitArea>
  & assertExtends<Model, ZodModel>
  & assertExtends<Motion, ZodMotion>;
