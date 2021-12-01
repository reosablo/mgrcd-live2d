/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { getCharaIds, getCharaName } from "./_internal/io.ts";
import { patchCharaName } from "./_internal/config.ts";

export async function* listChara(
  resource: FileSystemDirectoryHandle,
  { detailed = true } = {},
) {
  for await (const charaId of getCharaIds({ resource })) {
    if (detailed) {
      const name = await getCharaName(charaId, { resource })
        .then(
          (name) => name !== undefined ? patchCharaName(name) : undefined,
          () => undefined,
        );
      yield { charaId, name } as const;
    } else {
      yield { charaId } as const;
    }
  }
}
