import type { Resolver as ResolverType } from "./install.ts";
import type { Model, Motion } from "../../types/Live2DViewerEX/model.model3.ts";
import type { Scenario } from "../../types/magireco/scenario.ts";
import type { stories } from "../../data/magireco/general-scenario.ts";

export const presetMotionMeta = Symbol();

export const presetMotions = [
  ["Start", {
    Name: "Intro1",
    Priority: 9,
    Intimacy: { Max: 0 },
    [presetMotionMeta]: { storyKey: "intro_1" },
  }],
  ["Start", {
    Name: "Intro2",
    Priority: 9,
    Intimacy: { Max: 8 },
    [presetMotionMeta]: { storyKey: "intro_2" },
  }],
  ["Start", {
    Name: "GreetFirst",
    Priority: 9,
    Intimacy: { Min: 1, Bonus: 4 },
    [presetMotionMeta]: { storyKey: "greet_first" },
  }],
  ["Tap", {
    Name: "Talk1",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_1" },
  }],
  ["Tap", {
    Name: "Talk2",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_2" },
  }],
  ["Tap", {
    Name: "Talk3",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_3" },
  }],
  ["Tap", {
    Name: "Talk4",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_4" },
  }],
  ["Tap", {
    Name: "Talk5",
    Priority: 9,
    Intimacy: { Min: 8, Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_5" },
  }],
  ["Tap", {
    Name: "Talk6",
    Priority: 9,
    Intimacy: { Min: 16, Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_6" },
  }],
  ["Tap", {
    Name: "Talk7",
    Priority: 9,
    Intimacy: { Min: 24, Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_7" },
  }],
  ["Tap", {
    Name: "Talk8",
    Priority: 9,
    Intimacy: { Min: 32, Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_8" },
  }],
  ["Tap", {
    Name: "Talk9",
    Priority: 9,
    Intimacy: { Min: 40, Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_9" },
  }],
  ["Tap", {
    Name: "Talk10",
    Priority: 9,
    Intimacy: { Min: 48, Bonus: 1 },
    [presetMotionMeta]: { storyKey: "talk_10" },
  }],
  ["Tap", {
    Name: "GreetMorning",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 6, Sustain: 180 },
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet_morning" },
  }],
  ["Tap", {
    Name: "GreetDay",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 11, Sustain: 120 },
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet_day" },
  }],
  ["Tap", {
    Name: "GreetEvening",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 17, Sustain: 120 },
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet_evening" },
  }],
  ["Tap", {
    Name: "GreetNight",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 22, Sustain: 120 },
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet_night" },
  }],
  ["Tap", {
    Name: "Greet",
    Priority: 9,
    ignorable: true,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet" },
  }],
  ["Tap", {
    Name: "GreetAP",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet_ap" },
  }],
  ["Tap", {
    Name: "GreetBP",
    Priority: 9,
    Intimacy: { Bonus: 1 },
    [presetMotionMeta]: { storyKey: "greet_bp" },
  }],
] as [
  string,
  Motion & { [presetMotionMeta]: { storyKey: keyof typeof stories } },
][];

export class Resolver implements ResolverType {
  private readonly familyId: number | undefined;

  constructor(
    private readonly scenarioId: string,
    { cast: _cast }: { cast?: (roleId: number) => string } = {},
  ) {
    if (/^\d{6}$/.test(scenarioId)) {
      this.familyId = +scenarioId.replace(/.{2}$/, "00");
    }
  }

  getRoleId(...args: Parameters<ResolverType["getRoleId"]>) {
    const [actorId] = args;
    if (actorId === undefined || actorId === 0) {
      return undefined;
    }
    const { scenarioId, familyId } = this;
    if (actorId === familyId) {
      return +scenarioId;
    }
    return actorId;
  }

  getModelId(...args: Parameters<ResolverType["getModelId"]>) {
    const [roleId] = args;
    return `${roleId}` as const;
  }

  getMotionIndex(...args: Parameters<ResolverType["getMotionIndex"]>) {
    switch (args[0]) {
      case "scene": {
        const [_type, storyId, sceneIndex] = args;
        return [`Story#1`, `${storyId}_${sceneIndex + 1}`] as const;
      }
      case "motion": {
        const [_type, _roleId, motion] = args;
        return [`Motion#2`, `${motion}`] as const;
      }
      case "voice": {
        const [_type, _roleId, voice] = args;
        return [`Voice#3`, voice] as const;
      }
      case "voiceFull": {
        const [_type, _roleId, voiceFull] = args;
        return [`VoiceFull#3`, voiceFull] as const;
      }
      case "face": {
        const [_type, _roleId, face] = args;
        const expressionId = extractExpressionId(face);
        return [
          `Face#4`,
          expressionId !== undefined ? `${expressionId}` : face,
        ] as const;
      }
    }
  }

  getExpressionName(...args: Parameters<ResolverType["getExpressionName"]>) {
    switch (args[0]) {
      case "face": {
        const [_type, _roleId, face] = args;
        return patchFace(face);
      }
    }
  }

  getFilePath(...args: Parameters<ResolverType["getFilePath"]>) {
    switch (args[0]) {
      case "motion": {
        const [_type, _roleId, motion] = args;
        return `mtn/motion_${
          motion.toString().padStart(3, "0")
        }.motion3.json` as const;
      }
      case "face": {
        const [_type, _roleId, face] = args;
        return `exp/${patchFace(face)}` as const;
      }
      case "voice": {
        const [_type, _roleId, voice] = args;
        return `../../../sound_native/voice/${voice}_hca.mp3` as const;
      }
      case "voiceFull": {
        const [_type, _roleId, voiceFull] = args;
        return `../../../sound_native/${voiceFull}_hca.mp3` as const;
      }
    }
  }
}

export function preprocessModel(_model: Model) {}

export function postprocessModel(model: Model) {
  const controllers = model.Controllers ??= {};
  const options = model.Options ??= {};
  const intimacyMaxValue = Object.values(model.FileReferences.Motions).flat()
    .reduce(
      (intimacyMaxValue, motion) =>
        motion.Intimacy?.Min
          ? Math.max(intimacyMaxValue ?? 0, motion.Intimacy.Min)
          : intimacyMaxValue,
      undefined as number | undefined,
    );
  controllers.IntimacySystem = {
    Enabled: true,
    MaxValue: intimacyMaxValue,
  };
  options.AnisoLevel = 2;
}

export function patchCharaName(charaName: string) {
  return charaName.trim().replace(/_?\(?圧縮\)?|\(画面表示\)/g, "");
}

export function patchScenario(scenario: Scenario, scenarioId: string) {
  // Karin Misono episode_1
  if (/^1012\d\d$/.test(scenarioId)) {
    const action = scenario.story?.group_2?.[1]?.chara?.[0];
    if (action?.id === 101201) {
      delete action.id;
    }
  }
  // Ayame Mikuri talk_3
  if (scenarioId === "350303") {
    const action = scenario.story?.group_27?.[2]?.chara?.[0];
    if (action?.id === 305303) {
      delete action.id;
    }
  }
  // Darc (School uniform) talk_6
  if (scenarioId === "402150") {
    const actions = scenario.story?.group_30?.[0]?.chara;
    if (actions?.at(-1)?.id === 0) {
      actions.pop();
    }
  }
  // Tsubasa Hanekawa episode_2
  if (/^4045\d\d$/.test(scenarioId)) {
    const action = scenario.story?.group_3?.[1]?.chara?.[0];
    if (action?.id === 100100) {
      delete action.id;
    }
  }
}

function extractExpressionId(face: string) {
  const facePattern = /^mtn_ex_(?<face>\d{1,})\.exp3?\.json$/;
  const id = face.match(facePattern)?.groups!.face;
  return id !== undefined ? +id : undefined;
}

function patchFace(face: string) {
  const expressionId = extractExpressionId(face);
  return expressionId !== undefined
    ? `mtn_ex_${`${expressionId}`.padStart(3, "0")}.exp3.json`
    : face;
}
