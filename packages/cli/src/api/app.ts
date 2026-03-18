import "dotenv/config";
import { consola } from "consola";
import { Hono } from "hono";
import { cors } from "hono/cors";
import aiRoutes from "./routes/ai.routes";
import conversationRoutes from "./routes/conversation.routes";
import projectRoutes from "./routes/project.routes";
import { validateDbController } from "./controllers/project.controller";

const app = new Hono();

app.use("/*", cors());

app.get("/api/health", (c) => {
	return c.json({ status: "ok" });
});

app.route("/api/projects", projectRoutes);
app.post("/api/validate-db", validateDbController);
app.route("/api", aiRoutes); 
app.route("/api/conversations", conversationRoutes);

export function startApiServer(port: number) {
	consola.info(`Starting CLI API server on port ${port}...`);
	return {
		port,
		server: Bun.serve({
			port,
			fetch: app.fetch,
		}),
	};
}
