import {
  fromFileUrl,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { command } from "./list-role.ts";

const roleMap = {
  100100: [100100],
  100150: [100150],
} as const;

Deno.chdir(joinPath(fromFileUrl(import.meta.url), "../../testdata"));
try {
  Deno.env.delete("MGRCD_RESOURCE");
} catch { /* noop */ }

Deno.test("list-role command runs successfully", async () => {
  console.log = function () {};
  await command.parse(["100100"]);
});

Deno.test("list-role command stdout", async () => {
  for (const [scenarioId, roleIds] of Object.entries(roleMap)) {
    const outputs: string[] = [];
    console.log = function (...args: unknown[]) {
      outputs.push(args.map((arg) => `${arg}`).join(" "));
    };
    await command.parse([scenarioId]);

    const output = outputs.join("\n");
    assertEquals(outputs.length, roleIds.length, "output length");
    for (const roleId of roleIds) {
      assertMatch(
        output,
        new RegExp(String.raw`^${roleId}(?:\s|$)`, "m"),
        `output includes roleId: ${roleId}`,
      );
    }
  }
});
