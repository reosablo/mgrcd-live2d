import type { z } from "https://deno.land/x/zod@v3.9.0/mod.ts";
import type {
  Action,
  Scenario,
  Scene,
  Story,
} from "../../types/magireco/scenario.ts";
import type {
  actionSchema,
  scenarioSchema,
  sceneSchema,
  storySchema,
} from "./scenario.ts";

type assertExtends<_ extends Type, Type> = never;

type ZodAction = z.infer<typeof actionSchema>;
type ZodScenario = z.infer<typeof scenarioSchema>;
type ZodScene = z.infer<typeof sceneSchema>;
type ZodStory = z.infer<typeof storySchema>;

type _ =
  & assertExtends<ZodAction, Action>
  & assertExtends<ZodScenario, Scenario>
  & assertExtends<ZodScene, Scene>
  & assertExtends<ZodStory, Story>
  & assertExtends<Action, ZodAction>
  & assertExtends<Scenario, ZodScenario>
  & assertExtends<Scene, ZodScene>
  & assertExtends<Story, ZodStory>;
