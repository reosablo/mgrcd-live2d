import type { playlist, stories } from "./general-scenario.ts";

type assertExtends<_ extends Type, Type> = never;

type _ =
  & assertExtends<typeof stories, Record<string, { name: string }>>
  & assertExtends<
    typeof playlist,
    readonly {
      title: string;
      stories: readonly typeof stories[keyof typeof stories][];
    }[]
  >;
