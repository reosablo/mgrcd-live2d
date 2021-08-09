import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getStoryId } from "../data/magireco/general-scenario.ts";
import type { Scenario } from "../zod-schemas/magireco/scenario.ts";
import {
  getModel,
  getModelIds,
  getModelPath,
  getParam,
  getScenario,
  setModel,
} from "../_internal/io.ts";
import {
  motionEntries,
  patchModelName,
  postprocessModel,
  preprocessModel,
  presetMotions,
  Resolver,
} from "../_internal/config.ts";
import {
  buildStoryEntryCommand,
  getCharaIds,
  getMotion,
  installMotion,
  installParam,
  installScenario,
} from "../_internal/install.ts";

const castParameterPattern = /^(?<charaId>\d{6})=(?<modelId>\d{6})$/;
const targetParameterPattern = /^(?<target>\d{6})$/;

export const command = new Command<void>()
  .description(
    "Generate standalone Live2D models for Live2DViewerEX from magireco data",
  )
  .arguments<[string[]]>("[...target:string]")
  .option<{ resource: string }>(
    "--resource <path:string>",
    "magireco resource data directory path",
    { default: "." },
  )
  .option<{ all: boolean }>(
    "--all [all:boolean]",
    "Generate all models with default target",
    { default: false },
  )
  .option<{ cast?: string[] }>(
    "--cast [cast:string]",
    "Change chara id => model id mapping",
    {
      collect: true,
      value: (arg: string, cast: string[] = []) => {
        if (!castParameterPattern.test(arg)) {
          throw new ValidationError(
            `--cast parameter must match ${castParameterPattern}: "${arg}"`,
          );
        }
        return [...cast, arg];
      },
    },
  )
  .action(
    async ({ resource, all, cast: castArgs = [] }, targetArgs = []) => {
      let targets = [...targetArgs.reduce((targetArgs, targetArg) => {
        if (!targetParameterPattern.test(targetArg)) {
          throw new ValidationError(
            `positional parameters must match ${targetParameterPattern}: "${targetArg}"`,
          );
        }
        return targetArgs.add(targetArg);
      }, new Set<string>())];
      if (all) {
        if (targets.length > 0) {
          console.info(
            `target parameters are ignored because --all parameter is specified`,
          );
        }
        const modelIds = [] as string[];
        for await (const modelId of getModelIds({ resource })) {
          modelIds.push(modelId);
        }
        targets = modelIds;
      }
      const baseCast = new Map(castArgs.map((arg) => {
        const { charaId, modelId } = arg.match(castParameterPattern)!.groups!;
        return [+charaId, +modelId] as const;
      }));
      await Promise.allSettled(targets.map(async (target) => {
        const familyId = target.replace(/.{2}$/, "00");
        let scenarioId: string, scenario: Scenario;
        try {
          [scenarioId, scenario] = await getScenario(+target, {
            resource,
          })
            .then(
              (scenario) => [target, scenario] as const,
              (_) =>
                getScenario(+familyId, { resource })
                  .then((scenario) => [familyId, scenario] as const, (_) => {
                    throw null;
                  }),
            );
        } catch {
          console.log(`Skipped because scenario not found: ${target}`);
          return;
        }
        const cast = baseCast.has(+familyId) ? baseCast : new Map(baseCast).set(
          +familyId,
          baseCast.get(+target) ?? +target,
        );
        const storyIds = motionEntries.map(([_motionIndex, storyId]) =>
          getStoryId(scenarioId, storyId)
        ).filter((storyId) => storyId !== undefined) as string[];
        const filteredScenario = {
          ...scenario,
          story: Object.fromEntries(
            Object.entries(scenario.story ?? {})
              .filter(([storyId, _story]) => storyIds.includes(storyId)),
          ),
        };
        const resolver = new Resolver(
          scenarioId,
          { cast: (charaId) => `${cast.get(charaId) ?? charaId}` },
        );
        const charaIds = [...getCharaIds(filteredScenario)]
          .filter((charaId) =>
            charaId !== undefined && charaId > 0
          ) as number[];
        for (const charaId of charaIds) {
          const modelId = `${cast.get(charaId) ?? charaId}`;
          const [model, param] = await Promise.all([
            getModel(modelId, { resource }).catch((_) => undefined),
            getParam(modelId, { resource }).catch((_) => undefined),
          ]);
          if (model === undefined) {
            console.log(
              `Skipped because model not found: ${modelId} (charaId=${charaId})`,
            );
            continue;
          }
          preprocessModel(model);
          for (const [motionGroupName, motion] of presetMotions) {
            installMotion(model, motionGroupName, motion);
          }
          for (const [motionIndex, storyKey] of motionEntries) {
            const motion = getMotion(model, motionIndex)!;
            const storyId = getStoryId(scenarioId, storyKey)!;
            const storyMotionIndex = resolver.getMotionIndex(
              "scene",
              storyId,
              0,
            );
            motion.Command = buildStoryEntryCommand(
              charaId,
              charaIds,
              storyMotionIndex,
              resolver,
            );
          }
          installScenario(model, filteredScenario, charaId, resolver);
          if (param !== undefined) {
            installParam(model, {
              ...param,
              charaName: patchModelName(param.charaName),
            });
          }
          postprocessModel(model);
          const basename = charaIds.length > 1
            ? `model-${scenarioId}@${charaId}`
            : `model-${scenarioId}`;
          await setModel(modelId, model, { resource, basename });
          const modelPath = getModelPath(modelId, { resource, basename });
          console.log(`Generated: ${modelPath}`);
        }
      })).then((results) => {
        for (const result of results) {
          if (result.status === "rejected") {
            const { reason } = result;
            console.error(reason instanceof Error ? reason.message : reason);
          }
        }
      });
    },
  );
