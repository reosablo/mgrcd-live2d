import type { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import type {
  Expression,
  Group,
  HitArea,
  Model,
  Motion,
} from "../../types/Live2D/model.model3.ts";
import type {
  expressionSchema,
  groupSchema,
  hitAreaSchema,
  modelSchema,
  motionSchema,
} from "./model.model3.ts";

type assertExtends<_ extends Type, Type> = never;

type ZodExpression = z.infer<typeof expressionSchema>;
type ZodGroup = z.infer<typeof groupSchema>;
type ZodHitArea = z.infer<typeof hitAreaSchema>;
type ZodModel = z.infer<typeof modelSchema>;
type ZodMotion = z.infer<typeof motionSchema>;

type _ =
  & assertExtends<ZodExpression, Expression>
  & assertExtends<ZodGroup, Group>
  & assertExtends<ZodHitArea, HitArea>
  & assertExtends<ZodModel, Model>
  & assertExtends<ZodMotion, Motion>
  & assertExtends<Expression, ZodExpression>
  & assertExtends<Group, ZodGroup>
  & assertExtends<HitArea, ZodHitArea>
  & assertExtends<Model, ZodModel>
  & assertExtends<Motion, ZodMotion>;
