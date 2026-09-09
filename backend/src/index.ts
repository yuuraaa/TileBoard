import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { loadConfig, saveConfig } from "./config.js";
import { HttpError } from "./errors.js";
import { ConfigSchema } from "./schema.js";

const app = new Hono();
const FRONTEND_DIST = process.env.FRONTEND_DIST ?? "../frontend/dist";
const CONFIG_PATH = process.env.CONFIG_PATH ?? "../data/config.yaml";

function handleError(
  error: unknown,
  fallbackMessage: string,
): { message: string; status: ContentfulStatusCode } {
  if (error instanceof HttpError) {
    return {
      message: error.message,
      status: error.status as ContentfulStatusCode,
    };
  }
  console.error(fallbackMessage, error);
  return { message: fallbackMessage, status: 500 };
}

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.get("/api/config", async (c) => {
  try {
    const config = await loadConfig(CONFIG_PATH);
    return c.json(config);
  } catch (error) {
    const { message, status } = handleError(error, "設定の取得に失敗しました");
    return c.json({ error: message }, status);
  }
});

app.put("/api/config", async (c) => {
  const body = await c.req.json().catch(() => null);

  if (body === null) {
    return c.json({ error: "リクエストボディの形式が不正です" }, 400);
  }

  const result = ConfigSchema.safeParse(body);

  if (!result.success) {
    return c.json({ error: result.error.message }, 400);
  }

  try {
    await saveConfig(CONFIG_PATH, result.data);
  } catch (error) {
    const { message, status } = handleError(error, "設定の保存に失敗しました");
    return c.json({ error: message }, status);
  }

  return c.json(result.data);
});

app.use("/*", serveStatic({ root: FRONTEND_DIST }));
app.get("*", serveStatic({ path: `${FRONTEND_DIST}/index.html` }));

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TileBoard server listening on http://localhost:${info.port}`);
});
