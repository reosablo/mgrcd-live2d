/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { MuxAsyncIterator } from "https://deno.land/std@0.113.0/async/mux_async_iterator.ts";
import {
  getStoryId,
  spoilerStoryKeys,
} from "../data/magireco/general-scenario.ts";
import type { Scenario } from "../types/magireco/scenario.ts";
import {
  getModel,
  getModelPath,
  getParam,
  getScenario,
  setModel,
} from "./_internal/io.ts";
import {
  patchCharaName,
  patchScenario,
  postprocessModel,
  preprocessModel,
  presetMotionMeta,
  presetMotions,
  Resolver,
} from "./_internal/config.ts";
import {
  buildStoryEntryCommand,
  getMotion,
  getRoleIds,
  installMotion,
  installParam,
  installScenario,
} from "./_internal/install.ts";

export async function* bakeExModel(
  resource: FileSystemDirectoryHandle,
  target: string,
  {
    allowSpoiler,
    cast: baseCast,
  }: {
    allowSpoiler?: boolean;
    cast?: Map<number, number>;
  } = {},
) {
  try {
    const familyId = target.replace(/.{2}$/, "00");
    let scenarioId: string, scenario: Scenario;
    try {
      [scenarioId, scenario] = await getScenario(+target, { resource })
        .then(
          (scenario) => [target, scenario] as const,
          (_) =>
            getScenario(+familyId, { resource })
              .then(
                (scenario) => [familyId, scenario] as const,
              ),
        );
    } catch (error) {
      yield {
        type: "skip",
        reason: "SCENARIO_NOT_FOUND",
        target,
        error,
      } as const;
      return;
    }
    patchScenario(scenario, scenarioId);
    const cast = baseCast?.has(+familyId) ? baseCast : new Map(baseCast ?? [])
      .set(+familyId, baseCast?.get(+target) ?? +target);
    const filteredPresetMotions = presetMotions.filter(([_, motion]) =>
      allowSpoiler ||
      !spoilerStoryKeys.includes(motion[presetMotionMeta].storyKey)
    );
    const motionEntries = filteredPresetMotions.map((
      [motionGroupName, motion],
    ) =>
      [
        [motionGroupName, motion.Name],
        motion[presetMotionMeta].storyKey,
      ] as const
    );
    const storyIds = filteredPresetMotions
      .map(([_, motion]) => motion[presetMotionMeta].storyKey)
      .map((storyKey) => getStoryId(scenarioId, scenario, storyKey))
      .filter((storyId) => storyId !== undefined) as string[];
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
    const roleIds = [...getRoleIds(filteredScenario, resolver)]
      .filter((roleId) => roleId !== undefined && roleId > 0) as number[];
    const iters = roleIds.map(async function* (roleId) {
      try {
        const charaId = `${cast.get(roleId) ?? roleId}`;
        const [model, param] = await Promise.all([
          getModel(charaId, { resource }).catch((_) => undefined),
          getParam(charaId, { resource }).catch((_) => undefined),
        ]);
        if (model === undefined) {
          yield {
            type: "skip",
            reason: "MODEL_NOT_FOUND",
            target,
            charaId,
            roleId,
          } as const;
          return;
        }
        preprocessModel(model);
        for (const [motionGroupName, motion] of filteredPresetMotions) {
          installMotion(model, motionGroupName, { ...motion });
        }
        for (const [motionIndex, storyKey] of motionEntries) {
          const motion = getMotion(model, motionIndex)!;
          const storyId = getStoryId(scenarioId, scenario, storyKey)!;
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
        (model.Options ??= {}).Id = resolver.getModelId(roleId);
        postprocessModel(model);
        const basename = roleIds.length > 1
          ? `model-${scenarioId}@${roleId}`
          : `model-${scenarioId}`;
        await setModel(charaId, model, { resource, basename });
        const path = getModelPath(charaId, { basename });
        yield { type: "success", path, target, charaId, roleId } as const;
      } catch (error) {
        yield { type: "fail", error } as const;
      }
    });
    type Item = typeof iters extends AsyncIterable<infer T>[] ? T : never;
    const mux = new MuxAsyncIterator<Item>();
    for (const iter of iters) {
      mux.add(iter);
    }
    yield* mux;
  } catch (error) {
    yield { type: "fail", error } as const;
  }
}
