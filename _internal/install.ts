import type {
  Expression,
  Model,
  Motion,
} from "../zod-schemas/Live2DViewerEX/model.model3.ts";
import type { Param } from "../zod-schemas/magireco/model-params.ts";
import type { Action, Scenario } from "../zod-schemas/magireco/scenario.ts";

const motionReferencePattern = /^(?<motionGroupName>.*?)(:(?<motionName>.*))?$/;

export function installScenario(
  model: Model,
  scenario: Scenario,
  roleId: number,
  resolver: Resolver,
) {
  model.FileReferences.Motions ??= {};
  for (const [storyId, story] of Object.entries(scenario.story ?? {})) {
    for (const [sceneIndex, scene] of story.entries()) {
      const motionIndex = resolver.getMotionIndex("scene", storyId, sceneIndex);
      const [motionGroupName, motionName] = motionIndex;
      const nextMotion = sceneIndex + 1 < story.length
        ? resolver.getMotionIndex("scene", storyId, sceneIndex + 1).join(":")
        : undefined;
      const motionDuration = scene.autoTurnFirst !== undefined
        ? scene.autoTurnFirst * 1000
        : undefined;
      const actions = scene.chara ?? [];
      const command = buildCommand(roleId, actions, resolver);
      const text = buildText(roleId, actions, resolver);
      installDependencies(model, roleId, actions, resolver);
      installMotion(model, motionGroupName, {
        Name: motionName,
        MotionDuration: motionDuration,
        Command: command,
        Text: text,
        NextMtn: nextMotion,
      });
    }
  }
}

export function* getRoleIds(scenario: Scenario, resolver: Resolver) {
  const roleIds = new Set<number | undefined>();
  for (const story of Object.values(scenario.story ?? {})) {
    for (const scene of story) {
      for (const action of scene.chara ?? []) {
        const roleId = resolver.getRoleId(action.id);
        if (!roleIds.has(roleId) && roleId !== undefined) {
          yield roleId;
          roleIds.add(roleId);
        }
      }
    }
  }
}

export type MotionIndex = readonly [
  motionGroupName: string,
  motionName?: string,
];

export function parseMotionIndex(motionPath: string) {
  const { motionGroupName, motionName } = motionPath.match(
    motionReferencePattern,
  )!.groups!;
  return (motionName !== undefined
    ? [motionGroupName, motionName]
    : [motionGroupName]) as MotionIndex;
}

export function stringifyMotionIndex(
  [motionGroupName, motionName]: MotionIndex,
) {
  return motionName !== undefined
    ? `${motionGroupName}:${motionName}` as const
    : motionGroupName;
}

export function getMotion(
  model: Model,
  [motionGroupName, motionName]: MotionIndex,
) {
  return motionName !== undefined
    ? model.FileReferences.Motions?.[motionGroupName]?.find((motion) =>
      motion.Name === motionName
    )
    : undefined;
}

export function getExpression(
  model: Model,
  expressionName: string,
) {
  return model.FileReferences.Expressions?.find((expression) =>
    expression.Name === expressionName
  );
}

export function isMotionInstalled(
  model: Model,
  [motionGroupName, motionName]: MotionIndex,
) {
  return motionName !== undefined &&
    !!model.FileReferences.Motions?.[motionGroupName]?.some((motion) =>
      motion.Name === motionName
    );
}

export function isExpressionInstalled(
  model: Model,
  expressionName: string,
) {
  return !!model.FileReferences.Expressions?.some((expression) =>
    expression.Name === expressionName
  );
}

export function installMotion(
  model: Model,
  motionGroupName: string,
  motion: Motion,
) {
  const motionGroup = (model.FileReferences.Motions ??= {})[motionGroupName] ??=
    [];
  const motionName = motion.Name;
  if (motionName === undefined) {
    motionGroup.push(motion);
  } else {
    const index = motionGroup.findIndex((motion) => motion.Name === motionName);
    if (index >= 0) {
      motionGroup.splice(index, 1, motion);
    } else {
      motionGroup.push(motion);
    }
  }
}

export function installExpression(
  model: Model,
  expression: Expression,
) {
  const expressions = model.FileReferences.Expressions ??= [];
  const expressionName = expression.Name;
  const index = expressions.findIndex(
    (expression) => expression.Name !== expressionName,
  );
  if (index >= 0) {
    expressions.splice(index, 1, expression);
  } else {
    expressions.push(expression);
  }
}

export function installParam(model: Model, param: Param) {
  const options = model.Options ??= {};
  options.Name = param.charaName;
  options.ScaleFactor = param.modelScale;
}

export function buildStoryEntryCommand(
  roleId: number,
  roleIds: Iterable<number | undefined>,
  motionIndex: MotionIndex,
  resolver: Resolver,
) {
  const motionRef = stringifyMotionIndex(motionIndex);
  const commands = [`start_mtn ${motionRef}`];
  for (const rid of roleIds) {
    if (rid === roleId || rid === undefined) {
      continue;
    }
    commands.push(`start_mtn ${resolver.getModelId(rid)} ${motionRef}`);
  }
  return commands.join(";");
}

export type Resolver = {
  getRoleId(actorId: number | undefined): number | undefined;

  getModelId(roleId: number): string;

  getMotionIndex(
    ...args:
      | [type: "scene", storyId: string, sceneIndex: number]
      | [type: "motion", roleId: number | undefined, motion: number]
      | [type: "voice", roleId: number | undefined, voice: string]
      | [type: "voiceFull", roleId: number | undefined, voiceFull: string]
      | [type: "face", roleId: number | undefined, face: string]
  ): MotionIndex;

  getExpressionName(
    ...args: [type: "face", roleId: number | undefined, face: string]
  ): string;

  getFilePath(
    ...args:
      | [type: "motion", roleId: number | undefined, motion: number]
      | [type: "voice", roleId: number | undefined, voice: string]
      | [type: "voiceFull", roleId: number | undefined, voiceFull: string]
      | [type: "face", roleId: number | undefined, face: string]
  ): string;
};

function installDependencies(
  model: Model,
  roleId: number,
  actions: Iterable<Action>,
  resolver: Resolver,
) {
  for (const action of actions) {
    if (resolver.getRoleId(action.id) !== roleId) {
      continue;
    }
    const { motion, face, voice } = action;
    if (motion !== undefined) {
      const motionIndex = resolver.getMotionIndex("motion", roleId, motion);
      if (!isMotionInstalled(model, motionIndex)) {
        const [motionGroupName, motionName] = motionIndex;
        const filePath = resolver.getFilePath("motion", roleId, motion);
        if (motion < 100) {
          const loopMotionName = `${motionName}_loop`;
          const nextMotion = [motionGroupName, `${motionName}_loop`].join(":");
          installMotion(model, motionGroupName, {
            Name: motionName,
            File: filePath,
            Command: "eye_blink enforce",
            FadeOut: 0,
            NextMtn: nextMotion,
          });
          installMotion(model, motionGroupName, {
            Name: loopMotionName,
            File: filePath,
            FadeIn: 0,
            FadeOut: 0,
            NextMtn: nextMotion,
          });
        } else {
          installMotion(model, motionGroupName, {
            Name: motionName,
            Command: "eye_blink enforce",
            File: filePath,
          });
        }
      }
    }
    if (face !== undefined) {
      const motionIndex = resolver.getMotionIndex("face", roleId, face);
      const expressionName = resolver.getExpressionName("face", roleId, face);
      if (!isMotionInstalled(model, motionIndex)) {
        const [motionGroupName, motionName] = motionIndex;
        installMotion(model, motionGroupName, {
          Name: motionName,
          Expression: expressionName,
        });
      }
      if (!isExpressionInstalled(model, expressionName)) {
        const filePath = resolver.getFilePath("face", roleId, face);
        installExpression(model, {
          Name: expressionName,
          File: filePath,
        });
      }
    }
    if (voice !== undefined) {
      const motionIndex = resolver.getMotionIndex("voice", roleId, voice);
      if (!isMotionInstalled(model, motionIndex)) {
        const [motionGroupName, motionName] = motionIndex;
        const filePath = resolver.getFilePath("voice", roleId, voice);
        installMotion(model, motionGroupName, {
          Name: motionName,
          Sound: filePath,
        });
      }
    }
  }
}

function buildCommand(
  roleId: number,
  actions: Iterable<Action>,
  resolver: Resolver,
) {
  const commands = ["parameters unlock"];
  for (const action of actions) {
    if (resolver.getRoleId(action.id) !== roleId) {
      continue;
    }
    const {
      motion,
      face,
      voice,
      lipSynch,
      cheek,
      eyeClose,
      soulGem,
      tear,
      textHomeStatus,
    } = action;
    if (motion !== undefined) {
      const motionIndex = resolver.getMotionIndex("motion", roleId, motion);
      commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
    }
    if (face !== undefined) {
      const motionIndex = resolver.getMotionIndex("face", roleId, face);
      commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
    }
    if (voice !== undefined) {
      const motionIndex = resolver.getMotionIndex("voice", roleId, voice);
      commands.push(`start_mtn ${stringifyMotionIndex(motionIndex)}`);
    }
    if (lipSynch !== undefined) {
      commands.push(`lip_sync ${lipSynch ? "enable" : "disable"}`);
    }
    if (cheek !== undefined) {
      commands.push(`parameters lock ParamCheek ${cheek}`);
    }
    if (eyeClose !== undefined) {
      commands.push(
        `parameters lock ParamEyeLOpen ${1 - eyeClose}`,
        `parameters lock ParamEyeROpen ${1 - eyeClose}`,
      );
    }
    if (soulGem !== undefined) {
      commands.push(`parameters lock ParamSoulgem ${soulGem}`);
    }
    if (tear !== undefined) {
      commands.push(`parameters lock ParamTear ${tear}`);
    }
    if (textHomeStatus === "Clear") {
      commands.push(`hide_text`);
    }
  }
  return commands.join(";") || undefined;
}

function buildText(
  roleId: number,
  actions: Iterable<Action>,
  resolver: Resolver,
) {
  const texts = [] as string[];
  for (const action of actions) {
    if (resolver.getRoleId(action.id) !== roleId) {
      continue;
    }
    const { textHome } = action;
    if (textHome !== undefined) {
      const text = textHome
        .replace(/\[.*?\]/g, "")
        .replace(/@/g, "\n");
      texts.push(text);
    }
  }
  return texts.join("{$br}") || undefined;
}
