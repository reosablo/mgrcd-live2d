import type { Motion } from "../zod-schemas/Live2DViewerEX/model.model3.ts";
import type { stories } from "../data/magireco/general-scenario.ts";
import type { MotionIndex } from "./install.ts";
import type { motionEntries, presetMotions } from "./config.ts";

type assertExtends<_ extends Type, Type> = never;

type _ =
  & assertExtends<typeof presetMotions, readonly (readonly [string, Motion])[]>
  & assertExtends<
    typeof motionEntries,
    readonly (readonly [MotionIndex, string])[]
  >
  & assertExtends<
    typeof motionEntries,
    readonly (readonly [
      readonly [
        (typeof presetMotions)[number][0],
        (typeof presetMotions)[number][1]["Name"],
      ],
      keyof typeof stories,
    ])[]
  >;
