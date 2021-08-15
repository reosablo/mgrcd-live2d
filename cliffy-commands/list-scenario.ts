import { Command } from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getCharaName, getScenarioIds } from "../_internal/io.ts";
import { patchCharaName } from "../_internal/config.ts";

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
        const name = await getCharaName(scenarioId, { resource }).catch((_) =>
          undefined
        );
        console.log(`${scenarioId}${name ? `\t${patchCharaName(name)}` : ""}`);
      } else {
        console.log(scenarioId);
      }
    }
  });
