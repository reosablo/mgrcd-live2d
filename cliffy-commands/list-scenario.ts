import { join as joinPath } from "https://deno.land/std@0.113.0/path/mod.ts";
import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { listScenario } from "../mod.ts";
import {
  getFileSystemDirectoryHandle,
  validateFileSystemHandle,
} from "./_internal/fs.ts";
import { generalScenarioPath, live2dPath } from "../lib/_internal/io.ts";

export const command = new Command<void>()
  .description("Display Live2D scenario ids from magireco data")
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
  ).action(async ({ resource = ".", detailed }) => {
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
    const handle = await getFileSystemDirectoryHandle(resource);
    for await (
      const { scenarioId, name } of listScenario(handle, { detailed })
    ) {
      console.log(`${scenarioId}${name !== undefined ? `\t${name}` : ""}`);
    }
  });
