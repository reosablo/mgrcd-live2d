import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.19.5/command/mod.ts";
import {
  getCharaIds,
  getCharaName,
  validateResourceDirectory,
} from "../_internal/io.ts";
import { patchCharaName } from "../_internal/config.ts";

export const command = new Command<void>()
  .description("Display magireco chara ids from magireco data")
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
      await validateResourceDirectory(resource);
    } catch (error) {
      if (typeof error === "string") {
        throw new ValidationError(
          `resource data directory path invalid: ${error} not found`,
        );
      }
      throw error;
    }
    for await (const charaId of getCharaIds({ resource })) {
      if (detailed) {
        const name = await getCharaName(charaId, { resource });
        console.log(`${charaId}${name ? `\t${patchCharaName(name)}` : ""}`);
      } else {
        console.log(charaId);
      }
    }
  });