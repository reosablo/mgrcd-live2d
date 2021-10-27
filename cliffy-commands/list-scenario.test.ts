import {
  fromFileUrl,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";
import { command } from "./list-scenario.ts";

Deno.chdir(joinPath(fromFileUrl(import.meta.url), "../../testdata"));
try {
  Deno.env.delete("MGRCD_RESOURCE");
} catch { /* noop */ }

Deno.test("list-scenario runs successfully", async () => {
  console.log = function () {};
  await command.parse([]);
});
