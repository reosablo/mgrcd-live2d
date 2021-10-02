import type {
  Expression,
  Group,
  HitArea,
  Model,
  Motion,
} from "../../types/Live2D/model.model3.ts";
import type {
  Expression as ZodExpression,
  Group as ZodGroup,
  HitArea as ZodHitArea,
  Model as ZodModel,
  Motion as ZodMotion,
} from "./model.model3.ts";

type assertExtends<_ extends Type, Type> = never;

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
