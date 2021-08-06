import {
  basename as basenameOf,
  dirname as dirnameOf,
  join as joinPath,
} from "https://deno.land/std@0.100.0/path/mod.ts";
import { expandGlob } from "https://deno.land/std@0.100.0/fs/mod.ts";
import { parse as parseHjson } from "https://deno.land/x/hjson_deno@v1.0.1/mod.ts";
import { paramSchema } from "../zod-schemas/magireco/model-params.ts";
import {
  Model,
  modelSchema,
} from "../zod-schemas/Live2DViewerEX/model.model3.ts";
import { scenarioSchema } from "../zod-schemas/magireco/scenario.ts";

const live2dPath = ["image_native", "live2d_v4"] as const;
const modelFileBasename = "model" as const;
const modelFileExtension = ".model3.json" as const;
const paramFileName = "params.json" as const;
const generalScenarioPath = ["scenario", "json", "general"] as const;

export async function* getModelPaths({ resource }: { resource: string }) {
  const pattern = joinPath(
    getModelDirectoryPath("*", { resource }),
    `${modelFileBasename}${modelFileExtension}`,
  );
  for await (const entry of expandGlob(pattern)) {
    yield entry.path;
  }
}

export function getModelDirectoryPath(
  modelId: string,
  { resource }: { resource: string },
) {
  return joinPath(resource, ...live2dPath, modelId);
}

export function getModelPath(
  modelId: string,
  { resource, basename }: { resource: string; basename: string },
) {
  return joinPath(
    getModelDirectoryPath(modelId, { resource }),
    `${basename}${modelFileExtension}`,
  );
}

export async function* getModelIds({ resource }: { resource: string }) {
  for await (const path of getModelPaths({ resource })) {
    yield basenameOf(dirnameOf(path));
  }
}

export async function getModel(
  modelId: string,
  { resource, basename = modelFileBasename }: {
    resource: string;
    basename?: string;
  },
) {
  const path = getModelPath(modelId, { resource, basename });
  const json = await Deno.readTextFile(path);
  const model = JSON.parse(json);
  return modelSchema.parse(model);
}

export async function setModel(
  modelId: string,
  model: Model,
  { resource, basename }: { resource: string; basename: string },
) {
  const path = getModelPath(modelId, { resource, basename });
  const json = JSON.stringify(model, null, "\t");
  await Deno.writeTextFile(path, json);
}

export async function getModelName(
  modelId: string,
  { resource }: { resource: string },
) {
  const param = await getParam(modelId, { resource }).catch((_) => undefined);
  return param?.charaName;
}

export async function getParam(
  modelId: string,
  { resource }: { resource: string },
) {
  const path = joinPath(
    getModelDirectoryPath(modelId, { resource }),
    paramFileName,
  );
  const json = await Deno.readTextFile(path);
  const param = parseHjson(json);
  return paramSchema.parse(param);
}

export async function getScenario(
  scenarioId: number,
  { resource }: { resource: string },
) {
  const path = joinPath(resource, ...generalScenarioPath, `${scenarioId}.json`);
  const json = await Deno.readTextFile(path);
  const scenario = JSON.parse(json);
  return scenarioSchema.parse(scenario);
}

export async function* getScenarioPaths({ resource }: { resource: string }) {
  const pattern = joinPath(
    resource,
    ...generalScenarioPath,
    "[0-9]*.json",
  );
  for await (const entry of expandGlob(pattern)) {
    yield entry.path;
  }
}

export async function* getScenarioIds({ resource }: { resource: string }) {
  for await (const path of getScenarioPaths({ resource })) {
    yield basenameOf(path, ".json");
  }
}
