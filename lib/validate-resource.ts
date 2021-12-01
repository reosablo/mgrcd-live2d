/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import { validateResourceDirectory } from "./_internal/io.ts";

export async function validateResource(resource: FileSystemDirectoryHandle) {
  await validateResourceDirectory(resource);
}
