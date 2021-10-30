import {
  fromFileUrl,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { command } from "./list-chara.ts";

const charaIds = [100100, 100101, 100150] as const;

Deno.chdir(joinPath(fromFileUrl(import.meta.url), "../../testdata"));
try {
  Deno.env.delete("MGRCD_RESOURCE");
} catch { /* noop */ }

Deno.test("list-chara command runs successfully", async () => {
  console.log = function () {};
  await command.parse([]);
});

Deno.test("list-chara command stdout", async () => {
  const outputs: string[] = [];
  console.log = function (...args: unknown[]) {
    outputs.push(args.map((arg) => `${arg}`).join(" "));
  };
  await command.parse([]);

  const output = outputs.join("\n");
  assertEquals(outputs.length, charaIds.length, "output length");
  for (const charaId of charaIds) {
    assertMatch(
      output,
      new RegExp(String.raw`^${charaId}\s+model-${charaId}$`, "m"),
      `output includes model-${charaId}`,
    );
  }
});
