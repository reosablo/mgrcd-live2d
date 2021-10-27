import { Command } from "https://deno.land/x/cliffy@v0.20.0/command/mod.ts";
import { command as bakeExModelCommand } from "./cliffy-commands/bake-ex-model.ts";
import { command as listRoleCommand } from "./cliffy-commands/list-role.ts";
import { command as listCharaCommand } from "./cliffy-commands/list-chara.ts";
import { command as listScenarioCommand } from "./cliffy-commands/list-scenario.ts";
import { command as upgradeCommand } from "./cliffy-commands/upgrade.ts";
import { description, name, version } from "./package.ts";

const command = new Command<void>()
  .version(version)
  .name(name)
  .description(description)
  .command("bake-ex-model", bakeExModelCommand)
  .command("list-chara", listCharaCommand)
  .command("list-scenario", listScenarioCommand)
  .command("list-role", listRoleCommand)
  .command("upgrade", upgradeCommand);

await command.parse(Deno.args);
