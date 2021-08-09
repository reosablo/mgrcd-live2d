import type { Resolver as ResolverType } from "./install.ts";
import type { Model } from "../zod-schemas/Live2DViewerEX/model.model3.ts";

export const presetMotions = [
  ["Start", {
    Name: "Intro1",
    Priority: 9,
    Intimacy: { Max: 0 },
  }],
  ["Start", {
    Name: "Intro2",
    Priority: 9,
    Intimacy: { Max: 8 },
  }],
  ["Start", {
    Name: "GreetFirst",
    Priority: 9,
    Intimacy: { Min: 1, Bonus: 4 },
  }],
  ["Tap", {
    Name: "Talk1",
    Priority: 9,
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk2",
    Priority: 9,
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk3",
    Priority: 9,
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk4",
    Priority: 9,
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk5",
    Priority: 9,
    Intimacy: { Min: 8, Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk6",
    Priority: 9,
    Intimacy: { Min: 16, Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk7",
    Priority: 9,
    Intimacy: { Min: 24, Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk8",
    Priority: 9,
    Intimacy: { Min: 32, Bonus: 1 },
  }],
  ["Tap", {
    Name: "Talk9",
    Priority: 9,
    Intimacy: { Min: 40, Bonus: 1 },
  }],
  ["Tap", {
    Name: "GreetMorning",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 6, Sustain: 180 },
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "GreetDay",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 11, Sustain: 120 },
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "GreetEvening",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 17, Sustain: 120 },
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "GreetNight",
    Priority: 9,
    Weight: 2,
    TimeLimit: { Hour: 22, Sustain: 120 },
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "Greet",
    Priority: 9,
    ignorable: true,
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "GreetAP",
    Priority: 9,
    Intimacy: { Bonus: 1 },
  }],
  ["Tap", {
    Name: "GreetBP",
    Priority: 9,
    Intimacy: { Bonus: 1 },
  }],
] as const;

export const motionEntries = [
  [["Start", "Intro1"], "intro_1"],
  [["Start", "Intro2"], "intro_2"],
  [["Start", "GreetFirst"], "greet_first"],
  [["Tap", "Talk1"], "talk_1"],
  [["Tap", "Talk2"], "talk_2"],
  [["Tap", "Talk3"], "talk_3"],
  [["Tap", "Talk4"], "talk_4"],
  [["Tap", "Talk5"], "talk_5"],
  [["Tap", "Talk6"], "talk_6"],
  [["Tap", "Talk7"], "talk_7"],
  [["Tap", "Talk8"], "talk_8"],
  [["Tap", "Talk9"], "talk_9"],
  [["Tap", "GreetMorning"], "greet_morning"],
  [["Tap", "GreetDay"], "greet_day"],
  [["Tap", "GreetEvening"], "greet_evening"],
  [["Tap", "GreetNight"], "greet_night"],
  [["Tap", "Greet"], "greet"],
  [["Tap", "GreetAP"], "greet_ap"],
  [["Tap", "GreetBP"], "greet_bp"],
] as const;

export class Resolver implements ResolverType {
  constructor(
    public readonly scenarioId: string,
    { cast: _cast }: { cast?: (charaId: number) => string } = {},
  ) {}

  getModelId(...args: Parameters<ResolverType["getModelId"]>) {
    const [charaId] = args;
    return `${charaId}` as const;
  }

  getMotionIndex(...args: Parameters<ResolverType["getMotionIndex"]>) {
    switch (args[0]) {
      case "scene": {
        const [_type, storyId, sceneIndex] = args;
        return [`Story#1`, `${storyId}_${sceneIndex + 1}`] as const;
      }
      case "motion": {
        const [_type, _charaId, motion] = args;
        return [`Motion#2`, `${motion}`] as const;
      }
      case "voice": {
        const [_type, _charaId, voice] = args;
        return [`Voice#3`, voice] as const;
      }
      case "voiceFull": {
        const [_type, _charaId, voiceFull] = args;
        return [`VoiceFull#3`, voiceFull] as const;
      }
      case "face": {
        const [_type, _charaId, face] = args;
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
        const [_type, _charaId, face] = args;
        return patchFace(face);
      }
    }
  }

  getFilePath(...args: Parameters<ResolverType["getFilePath"]>) {
    switch (args[0]) {
      case "motion": {
        const [_type, _charaId, motion] = args;
        return `mtn/motion_${
          motion.toString().padStart(3, "0")
        }.motion3.json` as const;
      }
      case "face": {
        const [_type, _charaId, face] = args;
        return `exp/${patchFace(face)}` as const;
      }
      case "voice": {
        const [_type, _charaId, voice] = args;
        return `../../../sound_native/voice/${voice}_hca.mp3` as const;
      }
      case "voiceFull": {
        const [_type, _charaId, voiceFull] = args;
        return `../../../sound_native/${voiceFull}_hca.mp3` as const;
      }
    }
  }
}

export function preprocessModel(_model: Model) {}

export function postprocessModel(model: Model) {
  const controllers = model.Controllers ??= {};
  const options = model.Options ??= {};
  controllers.IntimacySystem = {
    Enabled: true,
    MaxValue: 40,
  };
  options.AnisoLevel = 2;
}

export function patchModelName(modelName: string) {
  return modelName.trim().replace(/_?\(?圧縮\)?|\(画面表示\)/g, "");
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
