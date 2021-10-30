import {
  fromFileUrl,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { command } from "./list-scenario.ts";

const scenarioIds = [100100, 100150] as const;

Deno.chdir(joinPath(fromFileUrl(import.meta.url), "../../testdata"));
try {
  Deno.env.delete("MGRCD_RESOURCE");
} catch { /* noop */ }

Deno.test("list-scenario runs successfully", async () => {
  console.log = function () {};
  await command.parse([]);
});

Deno.test("list-scenario command stdout", async () => {
  const outputs: string[] = [];
  console.log = function (...args: unknown[]) {
    outputs.push(args.map((arg) => `${arg}`).join(" "));
  };
  await command.parse([]);

  const output = outputs.join("\n");
  assertEquals(outputs.length, scenarioIds.length, "output length");
  for (const scenarioId of scenarioIds) {
    assertMatch(
      output,
      new RegExp(String.raw`^${scenarioId}(?:\s|$)`, "m"),
      `output includes scenarioId: ${scenarioId}`,
    );
  }
});
