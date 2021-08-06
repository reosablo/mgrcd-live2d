import { Command } from "https://deno.land/x/cliffy@v0.19.4/command/mod.ts";
import { command as bakeExModelCommand } from "./cliffy-commands/bake-ex-model.ts";
import { command as listCharaCommand } from "./cliffy-commands/list-chara.ts";
import { command as listModelCommand } from "./cliffy-commands/list-model.ts";
import { command as listScenarioCommand } from "./cliffy-commands/list-scenario.ts";

const command = new Command()
  .command("bake-ex-model", bakeExModelCommand)
  .command("list-model", listModelCommand)
  .command("list-scenario", listScenarioCommand)
  .command("list-chara", listCharaCommand);

await command.parse(Deno.args);
