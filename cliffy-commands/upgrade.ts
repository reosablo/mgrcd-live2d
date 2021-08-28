import {
  GithubProvider,
  UpgradeCommand,
} from "https://deno.land/x/cliffy@v0.19.5/command/upgrade/mod.ts";

export const command = new UpgradeCommand({
  main: "cli.ts",
  args: [
    "--allow-read",
    "--allow-write",
    "--allow-env",
    "--allow-run",
    "--allow-net",
    "--unstable",
  ],
  provider: new GithubProvider({ repository: "reosablo/mgrcd-live2d" }),
});
