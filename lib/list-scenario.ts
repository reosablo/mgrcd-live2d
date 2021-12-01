/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { getCharaName, getScenarioIds } from "./_internal/io.ts";
import { patchCharaName } from "./_internal/config.ts";

export async function* listScenario(
  resource: FileSystemDirectoryHandle,
  { detailed = true } = {},
) {
  for await (const scenarioId of getScenarioIds({ resource })) {
    if (detailed) {
      const name = await getCharaName(scenarioId, { resource })
        .then(
          (name) => name !== undefined ? patchCharaName(name) : undefined,
          () => undefined,
        );
      yield { scenarioId, name } as const;
    } else {
      yield { scenarioId } as const;
    }
  }
}
