import { Command } from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getCharaIds, getCharaName } from "../_internal/io.ts";
import { patchCharaName } from "../_internal/config.ts";

export const command = new Command<void>()
  .description("Display magireco chara ids from magireco data")
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
    for await (const charaId of getCharaIds({ resource })) {
      if (detailed) {
        const name = await getCharaName(charaId, { resource });
        console.log(`${charaId}${name ? `\t${patchCharaName(name)}` : ""}`);
      } else {
        console.log(charaId);
      }
    }
  });
