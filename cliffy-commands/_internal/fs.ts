/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="dom" />
/// <reference lib="deno.ns" />
/// <reference path="https://cdn.skypack.dev/@types/wicg-file-system-access@2020.9.4/index.d.ts?dts" />

import {
  basename,
  join as joinPath,
} from "https://deno.land/std@0.113.0/path/mod.ts";

const factoryKey = Symbol();
const validateKey = Symbol();

export async function getFileSystemDirectoryHandle(path: string) {
  return await FileSystemDirectoryHandle[factoryKey](path);
}

export async function validateFileSystemHandle(
  handle: FileSystemDirectoryHandle | FileSystemFileHandle,
) {
  await handle[validateKey]();
}

export abstract class FileSystemHandle {
  readonly name;
  protected constructor(path: string) {
    this.name = basename(path);
  }
  abstract get kind(): globalThis.FileSystemHandle["kind"];
  /** not implemented */
  get isDirectory(): this["kind"] extends "directory" ? true : false {
    throw new Error("not implemented: isDirectory");
  }
  /** not implemented */
  get isFile(): this["kind"] extends "file" ? true : false {
    throw new Error("not implemented: isFile");
  }
  /** not implemented */
  isSameEntry(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["isSameEntry"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["isSameEntry"]> {
    throw new Error("not implemented: isSameEntry");
  }
  /** not implemented */
  queryPermission(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["queryPermission"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["queryPermission"]> {
    throw new Error("not implemented: queryPermission");
  }
  /** not implemented */
  requestPermission(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["requestPermission"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["requestPermission"]> {
    throw new Error("not implemented: requestPermission");
  }
  abstract [validateKey](): void;
}

export class FileSystemDirectoryHandle extends FileSystemHandle
  implements globalThis.FileSystemDirectoryHandle {
  private constructor(path: string) {
    super(path);
    this.#path = path;
  }
  override get kind() {
    return "directory" as const;
  }
  async getDirectoryHandle(
    name: string,
    options?: FileSystemGetDirectoryOptions,
  ) {
    const path = joinPath(this.#path, name);
    return await FileSystemDirectoryHandle[factoryKey](path, options);
  }
  async getFileHandle(name: string, options?: FileSystemGetFileOptions) {
    const path = joinPath(this.#path, name);
    return await FileSystemFileHandle[factoryKey](path, options);
  }
  async *keys() {
    for await (const entry of Deno.readDir(this.#path)) {
      yield entry.name;
    }
  }
  async *entries() {
    for await (const entry of Deno.readDir(this.#path)) {
      const path = joinPath(this.#path, entry.name);
      if (entry.isDirectory) {
        yield [
          entry.name,
          await FileSystemDirectoryHandle[factoryKey](path),
        ] as [string, FileSystemDirectoryHandle];
      } else if (entry.isFile) {
        yield [
          entry.name,
          await FileSystemFileHandle[factoryKey](path),
        ] as [string, FileSystemFileHandle];
      }
    }
  }
  async *values() {
    for await (const [_name, value] of this.entries()) {
      yield value;
    }
  }
  /** not implemented */
  removeEntry(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["removeEntry"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["removeEntry"]> {
    throw new Error("not implemented: removeEntry");
  }
  /** not implemented */
  resolve(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["resolve"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["resolve"]> {
    throw new Error("not implemented: resolve");
  }
  /** not implemented */
  getFile(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["getFile"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["getFile"]> {
    throw new Error("not implemented: getFile");
  }
  /** not implemented */
  getDirectory(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["getDirectory"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["getDirectory"]> {
    throw new Error("not implemented: getDirectory");
  }
  /** not implemented */
  getEntries(
    ..._: Parameters<globalThis.FileSystemDirectoryHandle["getEntries"]>
  ): ReturnType<globalThis.FileSystemDirectoryHandle["getEntries"]> {
    throw new Error("not implemented: getEntries");
  }
  /** not implemented */
  [Symbol.asyncIterator](): ReturnType<
    globalThis.FileSystemDirectoryHandle[typeof Symbol.asyncIterator]
  > {
    throw new Error("not implemented: [Symbol.asyncIterator]");
  }
  static async [factoryKey](
    path: string,
    options?: FileSystemGetDirectoryOptions,
  ) {
    if (options?.create) {
      await Deno.mkdir(path).catch(() => {});
    }
    return new FileSystemDirectoryHandle(path);
  }
  async [validateKey]() {
    const stat = await Deno.stat(this.#path);
    if (!stat.isDirectory) {
      throw new Error(`not a directory: ${this.#path}`, { cause: stat });
    }
  }
  readonly #path;
}

export class FileSystemFileHandle extends FileSystemHandle
  implements globalThis.FileSystemFileHandle {
  private constructor(path: string) {
    super(path);
    this.#path = path;
  }
  override get kind() {
    return "file" as const;
  }
  async createWritable(options?: FileSystemCreateWritableOptions) {
    if (options?.keepExistingData) {
      throw new Error("not implemented");
    }
    const file = await Deno.open(this.#path, { create: true, write: true });
    return await FileSystemWritableFileStream[factoryKey](file);
  }
  async getFile() {
    return await Deno.readFile(this.#path)
      .then((buffer) => new File([buffer], this.name));
  }
  /** not implemented */
  isSameEntry(
    ..._: Parameters<globalThis.FileSystemFileHandle["isSameEntry"]>
  ): ReturnType<globalThis.FileSystemFileHandle["isSameEntry"]> {
    throw new Error("not implemented: isSameEntry");
  }
  /** not implemented */
  queryPermission(
    ..._: Parameters<globalThis.FileSystemFileHandle["queryPermission"]>
  ): ReturnType<globalThis.FileSystemFileHandle["queryPermission"]> {
    throw new Error("not implemented: queryPermission");
  }
  /** not implemented */
  requestPermission(
    ..._: Parameters<globalThis.FileSystemFileHandle["requestPermission"]>
  ): ReturnType<globalThis.FileSystemFileHandle["requestPermission"]> {
    throw new Error("not implemented: requestPermission");
  }
  // deno-lint-ignore require-await
  static async [factoryKey](path: string, _options?: FileSystemGetFileOptions) {
    return new FileSystemFileHandle(path);
  }
  async [validateKey]() {
    const stat = await Deno.stat(this.#path);
    if (!stat.isFile) {
      throw new Error(`not a file: ${this.#path}`, { cause: stat });
    }
  }
  readonly #path;
}

export class FileSystemWritableFileStream
  implements globalThis.FileSystemWritableFileStream {
  private constructor(file: Deno.File) {
    this.#file = file;
  }
  async close() {
    await this.#file.close();
  }
  async truncate(size: number) {
    await this.#file.truncate(size);
  }
  async write(data: FileSystemWriteChunkType) {
    if (typeof data !== "string") {
      throw new Error("not implemented: write: data must be string");
    }
    const buffer = new TextEncoder().encode(data);
    await this.#file.write(buffer);
  }
  /** not implemented */
  get locked(): globalThis.FileSystemWritableFileStream["locked"] {
    throw new Error("not implemented: locked");
  }
  /** not implemented */
  abort(
    ..._: Parameters<globalThis.FileSystemWritableFileStream["abort"]>
  ): ReturnType<globalThis.FileSystemWritableFileStream["abort"]> {
    throw new Error("not implemented: abort");
  }
  /** not implemented */
  getWriter(
    ..._: Parameters<globalThis.FileSystemWritableFileStream["getWriter"]>
  ): ReturnType<globalThis.FileSystemWritableFileStream["getWriter"]> {
    throw new Error("not implemented: getWriter");
  }
  /** not implemented */
  seek(
    ..._: Parameters<globalThis.FileSystemWritableFileStream["seek"]>
  ): ReturnType<globalThis.FileSystemWritableFileStream["seek"]> {
    throw new Error("not implemented: seek");
  }
  // deno-lint-ignore require-await
  static async [factoryKey](file: Deno.File) {
    return new FileSystemWritableFileStream(file);
  }
  readonly #file;
}
