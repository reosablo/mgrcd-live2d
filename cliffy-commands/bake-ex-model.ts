import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getStoryId } from "../data/magireco/general-scenario.ts";
import type { Scenario } from "../zod-schemas/magireco/scenario.ts";
import {
  getCharaIds,
  getModel,
  getModelPath,
  getParam,
  getScenario,
  setModel,
} from "../_internal/io.ts";
import {
  motionEntries,
  patchCharaName,
  postprocessModel,
  preprocessModel,
  presetMotions,
  Resolver,
} from "../_internal/config.ts";
import {
  buildStoryEntryCommand,
  getMotion,
  getRoleIds,
  installMotion,
  installParam,
  installScenario,
} from "../_internal/install.ts";

const castParameterPattern = /^(?<roleId>\d{6})=(?<charaId>\d{6})$/;
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
    "Change role id => chara id mapping",
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
        const charaIds = [] as string[];
        for await (const charaId of getCharaIds({ resource })) {
          charaIds.push(charaId);
        }
        targets = charaIds;
      }
      const baseCast = new Map(castArgs.map((arg) => {
        const { roleId, charaId } = arg.match(castParameterPattern)!.groups!;
        return [+roleId, +charaId] as const;
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
          { cast: (roleId) => `${cast.get(roleId) ?? roleId}` },
        );
        const roleIds = [...getRoleIds(filteredScenario)]
          .filter((roleId) => roleId !== undefined && roleId > 0) as number[];
        for (const roleId of roleIds) {
          const charaId = `${cast.get(roleId) ?? roleId}`;
          const [model, param] = await Promise.all([
            getModel(charaId, { resource }).catch((_) => undefined),
            getParam(charaId, { resource }).catch((_) => undefined),
          ]);
          if (model === undefined) {
            console.log(
              `Skipped because model not found: ${charaId} (roleId=${roleId})`,
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
              roleId,
              roleIds,
              storyMotionIndex,
              resolver,
            );
          }
          installScenario(model, filteredScenario, roleId, resolver);
          if (param !== undefined) {
            installParam(model, {
              ...param,
              charaName: patchCharaName(param.charaName),
            });
          }
          postprocessModel(model);
          const basename = roleIds.length > 1
            ? `model-${scenarioId}@${roleId}`
            : `model-${scenarioId}`;
          await setModel(charaId, model, { resource, basename });
          const modelPath = getModelPath(charaId, { resource, basename });
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
