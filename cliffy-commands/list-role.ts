/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { join as joinPath } from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { listRole } from "../mod.ts";
import {
  getFileSystemDirectoryHandle,
  validateFileSystemHandle,
} from "./_internal/fs.ts";
import { generalScenarioPath, live2dPath } from "../lib/_internal/io.ts";

const scenarioIdPattern = /^(?<target>\d{6})$/;

export const command = new Command<void>()
  .description("Display charas ids in a specific scenario")
  .arguments<[scenarioId: string]>("<scenario-id>")
  .env<{ resource?: string }>(
    "MGRCD_RESOURCE=<path:string>",
    "magireco resource data directory path",
    { prefix: "MGRCD_" },
  )
  .option<{ resource?: string }>(
    "--resource <path:string>",
    "magireco resource data directory path",
  )
  .option<{ detailed: boolean }>(
    "--detailed [:boolean]",
    "Output with names",
    { default: true },
  ).action(async ({ resource = ".", detailed }, scenarioId) => {
    let handle: FileSystemDirectoryHandle;
    try {
      await Promise.all(
        [live2dPath, generalScenarioPath].map(async (pathSegments) => {
          const path = joinPath(resource, ...pathSegments);
          const handle = await getFileSystemDirectoryHandle(path);
          try {
            await validateFileSystemHandle(handle);
          } catch {
            throw path;
          }
        }),
      );
      handle = await getFileSystemDirectoryHandle(resource);
    } catch (error) {
      if (typeof error === "string") {
        console.error(
          `resource data directory path invalid: ${error} not found`,
        );
        return;
      } else {
        throw error;
      }
    }
    if (!scenarioIdPattern.test(scenarioId)) {
      throw new ValidationError(
        `positional parameters must match ${scenarioIdPattern}: "${scenarioId}"`,
      );
    }
    for await (
      const { roleId, name } of listRole(handle, scenarioId, { detailed })
    ) {
      console.log(`${roleId}${name !== undefined ? `\t${name}` : ""}`);
    }
  });
