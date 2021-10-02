import type {
  Controller,
  Model,
  Motion,
} from "../../types/Live2DViewerEX/model.model3.ts";
import type {
  Controller as ZodController,
  Model as ZodModel,
  Motion as ZodMotion,
} from "./model.model3.ts";

type assertExtends<_ extends Type, Type> = never;

type _ =
  & assertExtends<ZodController, Controller>
  & assertExtends<ZodModel, Model>
  & assertExtends<ZodMotion, Motion>
  & assertExtends<Controller, ZodController>
  & assertExtends<Model, ZodModel>
  & assertExtends<Motion, ZodMotion>;
