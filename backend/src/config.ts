import { readFile, rename, writeFile } from "node:fs/promises";
import yaml from "js-yaml";
import { HttpError } from "./errors.js";
import { ConfigSchema, type Config } from "./schema.js";

export async function loadConfig(path: string): Promise<Config> {
  let raw: string;
  try {
    raw = await readFile(path, "utf-8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      throw new HttpError(404, "設定ファイルが見つかりません");
    }
    throw error;
  }

  let parsed: unknown;
  try {
    parsed = yaml.load(raw);
  } catch (error) {
    console.error(`設定ファイルのYAML解析に失敗しました: ${path}`, error);
    throw new HttpError(500, "設定ファイルの解析に失敗しました");
  }

  const result = ConfigSchema.safeParse(parsed);
  if (!result.success) {
    console.error(`設定ファイルの検証に失敗しました: ${path}`, result.error);
    throw new HttpError(500, "設定ファイルの内容が不正です");
  }

  return result.data;
}

export async function saveConfig(path: string, config: Config): Promise<void> {
  const raw = yaml.dump(config);
  const tmpPath = `${path}.tmp`;

  try {
    await writeFile(tmpPath, raw, "utf-8");
    await rename(tmpPath, path);
  } catch (error) {
    console.error(`設定ファイルの書き込みに失敗しました: ${path}`, error);
    throw new HttpError(500, "設定の保存に失敗しました");
  }
}
