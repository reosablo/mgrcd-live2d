import { Command } from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getModelIds, getModelName } from "../_internal/io.ts";
import { patchModelName } from "../_internal/config.ts";

export const command = new Command<void>()
  .description("Display Live2D model ids from magireco data")
  .option<{ resource: string }>(
    "--resource <path:string>",
    "magireco resource data directory path",
    { default: "." },
  )
  .option<{ detailed: boolean }>(
    "--detailed [:boolean]",
    "Output with names",
    { default: true },
  ).action(async ({ resource, detailed }) => {
    for await (const modelId of getModelIds({ resource })) {
      if (detailed) {
        const name = await getModelName(modelId, { resource });
        console.log(`${modelId}${name ? `\t${patchModelName(name)}` : ""}`);
      } else {
        console.log(modelId);
      }
    }
  });
