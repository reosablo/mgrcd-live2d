import type {
  Expression,
  HitArea,
  Model,
  Motion,
} from "../../types/Live2D/model.ts";
import type {
  Expression as ZodExpression,
  HitArea as ZodHitArea,
  Model as ZodModel,
  Motion as ZodMotion,
} from "./model.ts";

type assertExtends<_ extends Type, Type> = never;

type _ =
  & assertExtends<ZodExpression, Expression>
  & assertExtends<ZodHitArea, HitArea>
  & assertExtends<ZodModel, Model>
  & assertExtends<ZodMotion, Motion>
  & assertExtends<Expression, ZodExpression>
  & assertExtends<HitArea, ZodHitArea>
  & assertExtends<Model, ZodModel>
  & assertExtends<Motion, ZodMotion>;
