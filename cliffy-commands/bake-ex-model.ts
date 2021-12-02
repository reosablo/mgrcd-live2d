import { MuxAsyncIterator } from "https://deno.land/std@0.113.0/async/mux_async_iterator.ts";
import { join as joinPath } from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { bakeExModel, listChara } from "../mod.ts";
import {
  getFileSystemDirectoryHandle,
  validateFileSystemHandle,
} from "./_internal/fs.ts";
import { generalScenarioPath, live2dPath } from "../lib/_internal/io.ts";

const castParameterPattern = /^(?<roleId>\d{6})=(?<charaId>\d{6})$/;
const targetParameterPattern = /^(?<target>\d{6})$/;

export const command = new Command<void>()
  .description(
    "Generate standalone Live2D models for Live2DViewerEX from magireco data",
  )
  .arguments<[string[]]>("[...target:string]")
  .env<{ resource?: string }>(
    "MGRCD_RESOURCE=<path:string>",
    "magireco resource data directory path",
    { prefix: "MGRCD_" },
  )
  .option<{ resource?: string }>(
    "--resource <path:string>",
    "magireco resource data directory path",
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
  .option<{ spoiler: boolean }>(
    "--spoiler [spoiler:boolean]",
    "Allow spoilers that doesn't appear in game",
    { default: false },
  )
  .action(
    async (
      { resource = ".", all, cast: castArgs = [], spoiler },
      targetArgs = [],
    ) => {
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
          console.warn(
            `target parameters are ignored because --all parameter is specified`,
          );
        }
        const charaIds = [] as string[];
        for await (
          const { charaId } of listChara(handle, { detailed: false })
        ) {
          charaIds.push(charaId);
        }
        targets = charaIds;
      }
      const baseCast = new Map(castArgs.map((arg) => {
        const { roleId, charaId } = arg.match(castParameterPattern)!.groups!;
        return [+roleId, +charaId] as const;
      }));
      const iters = targets.map((target) =>
        bakeExModel(handle, target, {
          allowSpoiler: spoiler,
          cast: baseCast,
        })
      );
      type Item = typeof iters extends AsyncIterable<infer T>[] ? T : never;
      const mux = new MuxAsyncIterator<Item>();
      for (const iter of iters) {
        mux.add(iter);
      }
      for await (const result of mux) {
        output:
        switch (result.type) {
          case "success":
            console.log(`Generated: ${resource}/${joinPath(...result.path)}`);
            break;
          case "skip":
            switch (result.reason) {
              case "SCENARIO_NOT_FOUND":
                console.log(
                  `Skipped because scenario not found: ${result.target}`,
                );
                break output;
              case "MODEL_NOT_FOUND":
                console.log(
                  `Skipped because model not found: ${result.target}`,
                );
                break output;
            }
            /* falls through */
          default: {
            const error = result.error;
            const message = error instanceof Error ? error.message : error;
            console.error(`Error: ${message}`);
          }
        }
      }
    },
  );
