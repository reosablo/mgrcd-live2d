import {
  fromFileUrl,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";
import { command } from "./list-role.ts";

Deno.chdir(joinPath(fromFileUrl(import.meta.url), "../../testdata"));
try {
  Deno.env.delete("MGRCD_RESOURCE");
} catch { /* noop */ }

Deno.test("list-role command runs successfully", async () => {
  console.log = function () {};
  await command.parse(["100100"]);
});
