import { Command } from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getModelName, getScenarioIds } from "../_internal/io.ts";
import { patchModelName } from "../_internal/config.ts";

export const command = new Command<void>()
  .description("Display Live2D scenario ids from magireco data")
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
    for await (const scenarioId of getScenarioIds({ resource })) {
      if (detailed) {
        const name = await getModelName(scenarioId, { resource }).catch((_) =>
          undefined
        );
        console.log(`${scenarioId}${name ? `\t${patchModelName(name)}` : ""}`);
      } else {
        console.log(scenarioId);
      }
    }
  });
