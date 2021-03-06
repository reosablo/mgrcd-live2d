import {
  Command,
  ValidationError,
} from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import {
  getCharaName,
  getScenario,
  validateResourceDirectory,
} from "../_internal/io.ts";
import {
  patchCharaName,
  patchScenario,
  Resolver,
} from "../_internal/config.ts";
import { getRoleIds } from "../_internal/install.ts";

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
    patchScenario(scenario, scenarioId);
    const resolver = new Resolver(scenarioId);
    const roleIds = [...getRoleIds(scenario, resolver)].sort((a, b) =>
      a === undefined ? 1 : b === undefined ? -1 : a - b
    );
    for (const roleId of roleIds) {
      if (detailed) {
        const name = await getCharaName(`${roleId}`, { resource }).catch((_) =>
          undefined
        );
        console.log(`${roleId}${name ? `\t${patchCharaName(name)}` : ""}`);
      } else {
        console.log(roleId);
      }
    }
  });
