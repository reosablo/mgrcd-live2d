import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { getModelName, getScenario } from "../_internal/io.ts";
import { patchModelName } from "../_internal/config.ts";
import { getRoleIds } from "../_internal/install.ts";

const scenarioIdPattern = /^(?<target>\d{6})$/;

export const command = new Command<void>()
  .description("Display charas ids in a specific scenario")
  .arguments<[scenarioId: string]>("<scenario-id>")
  .option<{ resource: string }>(
    "--resource <path:string>",
    "magireco resource data directory path",
    { default: "." },
  )
  .option<{ detailed: boolean }>(
    "--detailed [:boolean]",
    "Output with names",
    { default: true },
  ).action(async ({ resource, detailed }, scenarioId) => {
    if (!scenarioIdPattern.test(scenarioId)) {
      throw new ValidationError(
        `positional parameters must match ${scenarioIdPattern}: "${scenarioId}"`,
      );
    }
    let scenario;
    try {
      scenario = await getScenario(+scenarioId, { resource });
    } catch {
      throw new ValidationError(`scenario not found: ${scenarioId}`);
    }
    const roleIds = [...getRoleIds(scenario)].sort((a, b) =>
      a === undefined ? 1 : b === undefined ? -1 : a - b
    );
    for (const roleId of roleIds) {
      if (detailed) {
        const name = await getModelName(`${roleId}`, { resource }).catch((_) =>
          undefined
        );
        console.log(`${roleId}${name ? `\t${patchModelName(name)}` : ""}`);
      } else {
        console.log(roleId);
      }
    }
  });