import {
  basename as basenameOf,
  dirname as dirnameOf,
  isAbsolute as isAbsolutePath,
  join as joinPath,
  sep,
} from "https://deno.land/std@0.100.0/path/mod.ts";
import { expandGlob } from "https://deno.land/std@0.100.0/fs/mod.ts";
import { parse as parseHjson } from "https://deno.land/x/hjson_deno@v1.0.1/mod.ts";
import type { Model } from "../types/Live2DViewerEX/model.model3.ts";
import { paramSchema } from "../zod-schemas/magireco/model-params.ts";
import { modelSchema } from "../zod-schemas/Live2DViewerEX/model.model3.ts";
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
  charaId: string,
  { resource }: { resource: string },
) {
  return joinPath(resource, ...live2dPath, charaId);
}

export function getModelPath(
  charaId: string,
  { resource, basename }: { resource: string; basename: string },
) {
  return joinPath(
    getModelDirectoryPath(charaId, { resource }),
    `${basename}${modelFileExtension}`,
  );
}

export async function* getCharaIds({ resource }: { resource: string }) {
  for await (const path of getModelPaths({ resource })) {
    yield basenameOf(dirnameOf(path));
  }
}

export async function getModel(
  charaId: string,
  { resource, basename = modelFileBasename }: {
    resource: string;
    basename?: string;
  },
) {
  const path = getModelPath(charaId, { resource, basename });
  const json = await Deno.readTextFile(path);
  const model = JSON.parse(json);
  return modelSchema.parse(model);
}

export async function setModel(
  charaId: string,
  model: Model,
  { resource, basename }: { resource: string; basename: string },
) {
  const path = getModelPath(charaId, { resource, basename });
  const json = JSON.stringify(model, null, "\t");
  await Deno.writeTextFile(path, json);
}

export async function getCharaName(
  charaId: string,
  { resource }: { resource: string },
) {
  const param = await getParam(charaId, { resource }).catch((_) => undefined);
  return param?.charaName;
}

export async function getParam(
  charaId: string,
  { resource }: { resource: string },
) {
  const path = joinPath(
    getModelDirectoryPath(charaId, { resource }),
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

export async function validateResourceDirectory(resource: string) {
  const paths = ["image_native/live2d_v4", "scenario/json/general"];
  await Promise.all(
    paths.map(async (path) => {
      const fullPath = joinPath(resource, path);
      try {
        if (!(await Deno.stat(fullPath)).isDirectory) {
          throw null;
        }
      } catch {
        throw isAbsolutePath(fullPath) ? fullPath : `.${sep}${fullPath}`;
      }
    }),
  );
}
