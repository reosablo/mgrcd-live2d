import {
  GithubProvider,
  UpgradeCommand,
} from "https://deno.land/x/cliffy@v0.20.0/command/upgrade/mod.ts";

export const command = new UpgradeCommand({
  main: "cli.ts",
  args: [
    "--allow-read",
    "--allow-write",
    "--allow-env",
    "--allow-run",
    "--allow-net",
  ],
  provider: new GithubProvider({ repository: "reosablo/mgrcd-live2d" }),
});
