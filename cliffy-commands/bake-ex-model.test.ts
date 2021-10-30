import {
  fromFileUrl,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.113.0/testing/asserts.ts";
import { command } from "./bake-ex-model.ts";

Deno.chdir(joinPath(fromFileUrl(import.meta.url), "../../testdata"));
try {
  Deno.env.delete("MGRCD_RESOURCE");
} catch { /* noop */ }

const modelPaths = [
  String.raw`image_native/live2d_v4/100100/model-100100\.model3\.json`,
  String.raw`image_native/live2d_v4/100101/model-100100\.model3\.json`,
  String.raw`image_native/live2d_v4/100150/model-100150\.model3\.json`,
] as const;

Deno.test("bake-ex-model command runs successfully", async () => {
  console.log = function () {};
  await command.parse(["100100"]);
});

Deno.test("bake-ex-model command stdout", async () => {
  const outputs: string[] = [];
  console.log = function (...args: unknown[]) {
    outputs.push(args.map((arg) => `${arg}`).join(" "));
  };
  await command.parse(["--all"]);

  const output = outputs.join("\n");
  assertEquals(outputs.length, modelPaths.length, "output length");
  for (const modelPath of modelPaths) {
    assertMatch(
      output,
      new RegExp(String.raw`^Generated: .*${modelPath}$`, "m"),
      `output includes model ${modelPath}`,
    );
  }
});
