import { readFile, writeFile } from "node:fs/promises";
import yaml from "js-yaml";
import { ConfigSchema, type Config } from "./schema.js";

export async function loadConfig(path: string): Promise<Config> {
  const raw = await readFile(path, "utf-8");
  const parsed = yaml.load(raw);
  const result = ConfigSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`設定ファイルの検証に失敗しました: ${path}\n${result.error.message}`);
  }

  return result.data;
}

export async function saveConfig(path: string, config: Config): Promise<void> {
  const result = ConfigSchema.safeParse(config);

  if (!result.success) {
    throw new Error(`設定内容の検証に失敗しました: ${path}\n${result.error.message}`);
  }

  const raw = yaml.dump(result.data);
  await writeFile(path, raw, "utf-8");
}
