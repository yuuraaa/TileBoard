import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const app = new Hono();
const FRONTEND_DIST = process.env.FRONTEND_DIST ?? "../frontend/dist";

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.use("/*", serveStatic({ root: FRONTEND_DIST }));
app.get("*", serveStatic({ path: `${FRONTEND_DIST}/index.html` }));

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TileBoard server listening on http://localhost:${info.port}`);
});
