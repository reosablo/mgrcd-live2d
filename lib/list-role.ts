/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { getCharaName, getScenario } from "./_internal/io.ts";
import { patchCharaName, patchScenario, Resolver } from "./_internal/config.ts";
import { getRoleIds } from "./_internal/install.ts";

export async function* listRole(
  resource: FileSystemDirectoryHandle,
  scenarioId: string,
  { detailed = true } = {},
) {
  let scenario;
  try {
    scenario = await getScenario(+scenarioId, { resource });
  } catch (error) {
    throw new Error("scenario not found", { cause: error });
  }
  patchScenario(scenario, scenarioId);
  const resolver = new Resolver(scenarioId);
  const roleIds = [...getRoleIds(scenario, resolver)].sort((a, b) =>
    a === undefined ? 1 : b === undefined ? -1 : a - b
  );
  for (const roleId of roleIds) {
    if (detailed) {
      const name = await getCharaName(`${roleId}`, { resource })
        .then(
          (name) => name !== undefined ? patchCharaName(name) : undefined,
          () => undefined,
        );
      yield { roleId, name } as const;
    } else {
      yield { roleId } as const;
    }
  }
}
