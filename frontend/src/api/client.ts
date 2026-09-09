import type { Config } from "backend/schema";

const DEFAULT_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message = "ネットワークに接続できません") {
    super(message);
    this.name = "NetworkError";
  }
}

export class TimeoutError extends Error {
  constructor(message = "リクエストがタイムアウトしました") {
    super(message);
    this.name = "TimeoutError";
  }
}

async function request(
  input: RequestInfo,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new TimeoutError();
    }
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function extractErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  const body = await res.json().catch(() => null);

  return body && typeof body === "object" && "error" in body
    ? String((body as { error: unknown }).error)
    : fallback;
}

export async function fetchConfig(): Promise<Config> {
  const res = await request("/api/config");

  if (!res.ok) {
    throw new ApiError(
      res.status,
      await extractErrorMessage(res, "設定の取得に失敗しました"),
    );
  }

  return (await res.json()) as Config;
}

export async function updateConfig(config: Config): Promise<Config> {
  const res = await request("/api/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  if (!res.ok) {
    throw new ApiError(
      res.status,
      await extractErrorMessage(res, "設定の保存に失敗しました"),
    );
  }

  return (await res.json()) as Config;
}
