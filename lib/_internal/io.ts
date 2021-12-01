/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { parse as parseHjson } from "https://deno.land/x/hjson_deno@v1.0.1/mod.ts";
import type { Model } from "../../types/Live2DViewerEX/model.model3.ts";
import { paramSchema } from "../../zod-schemas/magireco/model-params.ts";
import { modelSchema } from "../../zod-schemas/Live2DViewerEX/model.model3.ts";
import { scenarioSchema } from "../../zod-schemas/magireco/scenario.ts";

export const live2dPath = ["image_native", "live2d_v4"] as const;
export const generalScenarioPath = ["scenario", "json", "general"] as const;
const modelFileBasename = "model" as const;
const modelFileExtension = ".model3.json" as const;
const paramFileName = "params.json" as const;

async function getDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  segments: readonly string[],
) {
  return await segments.reduce(
    async (handle, segment) => await (await handle).getDirectoryHandle(segment),
    Promise.resolve(handle),
  );
}

async function getFileHandle(
  handle: FileSystemDirectoryHandle,
  [...segments]: readonly [...string[], string],
  option?: FileSystemGetFileOptions,
) {
  const filename = segments.pop()!;
  return await getDirectoryHandle(handle, segments).then((handle) =>
    handle.getFileHandle(filename, option)
  );
}

export function getModelDirectoryPath(charaId: string) {
  return [...live2dPath, charaId] as const;
}

export function getModelPath(
  charaId: string,
  { basename }: { basename: string },
) {
  return [
    ...getModelDirectoryPath(charaId),
    `${basename}${modelFileExtension}`,
  ] as const;
}

export async function* getCharaIds(
  { resource }: { resource: FileSystemDirectoryHandle },
) {
  const handle = await getDirectoryHandle(resource, live2dPath);
  for await (const name of handle.keys()) {
    if (/^\d{6}$/.test(name)) {
      yield name;
    }
  }
}

export async function getModel(
  charaId: string,
  { resource, basename = modelFileBasename }: {
    resource: FileSystemDirectoryHandle;
    basename?: string;
  },
) {
  const path = getModelPath(charaId, { basename });
  const json = await getFileHandle(resource, path)
    .then((handle) => handle.getFile())
    .then((file) => file.text());
  const model = JSON.parse(json);
  return modelSchema.parse(model);
}

export async function setModel(
  charaId: string,
  model: Model,
  { resource, basename }: {
    resource: FileSystemDirectoryHandle;
    basename: string;
  },
) {
  const path = getModelPath(charaId, { basename });
  const json = JSON.stringify(model, null, "\t");
  await getFileHandle(resource, path, { create: true })
    .then((handle) => handle.createWritable())
    .then(async (writable) => {
      try {
        await writable.truncate(0);
        await writable.write(json);
      } finally {
        await writable.close();
      }
    });
}

export async function getCharaName(
  charaId: string,
  { resource }: { resource: FileSystemDirectoryHandle },
) {
  const param = await getParam(charaId, { resource }).catch((_) => undefined);
  return param?.charaName;
}

export async function getParam(
  charaId: string,
  { resource }: { resource: FileSystemDirectoryHandle },
) {
  const path = [
    ...getModelDirectoryPath(charaId),
    paramFileName,
  ] as const;
  const json = await getFileHandle(resource, path)
    .then((handle) => handle.getFile())
    .then((file) => file.text());
  const param = parseHjson(json);
  return paramSchema.parse(param);
}

export async function getScenario(
  scenarioId: number,
  { resource }: { resource: FileSystemDirectoryHandle },
) {
  const path = [...generalScenarioPath, `${scenarioId}.json`] as const;
  const json = await getFileHandle(resource, path)
    .then((handle) => handle.getFile())
    .then((file) => file.text());
  const scenario = JSON.parse(json);
  return scenarioSchema.parse(scenario);
}

export async function* getScenarioIds(
  { resource }: { resource: FileSystemDirectoryHandle },
) {
  const handle = await getDirectoryHandle(resource, generalScenarioPath);
  for await (const name of handle.keys()) {
    if (/^\d{6}\.json$/i.test(name)) {
      yield name.slice(0, 6);
    }
  }
}

export async function validateResourceDirectory(
  resource: FileSystemDirectoryHandle,
) {
  const paths = [live2dPath, generalScenarioPath];
  await Promise.all(
    paths.map(async (path) => {
      try {
        await getDirectoryHandle(resource, path);
      } catch {
        throw path;
      }
    }),
  );
}
