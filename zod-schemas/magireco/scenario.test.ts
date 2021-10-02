import type {
  Action,
  Scenario,
  Scene,
  Story,
} from "../../types/magireco/scenario.ts";
import type {
  Action as ZodAction,
  Scenario as ZodScenario,
  Scene as ZodScene,
  Story as ZodStory,
} from "./scenario.ts";

type assertExtends<_ extends Type, Type> = never;

type _ =
  & assertExtends<ZodAction, Action>
  & assertExtends<ZodScenario, Scenario>
  & assertExtends<ZodScene, Scene>
  & assertExtends<ZodStory, Story>
  & assertExtends<Action, ZodAction>
  & assertExtends<Scenario, ZodScenario>
  & assertExtends<Scene, ZodScene>
  & assertExtends<Story, ZodStory>;
