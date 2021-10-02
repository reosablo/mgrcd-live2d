import type { Param } from "../../types/magireco/model-params.ts";
import type { Param as ZodParam } from "./model-params.ts";

type assertExtends<_ extends Type, Type> = never;

type _ =
  & assertExtends<ZodParam, Param>
  & assertExtends<Param, ZodParam>;
