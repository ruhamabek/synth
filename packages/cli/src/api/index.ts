import fs from "node:fs/promises";
import { unifiedIntrospect } from "@synth/core";
import { consola } from "consola";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import {
	ensureProjectDir,
	getProjectSchemaPath,
	PROJECTS_ROOT,
	readProjectConfig,
	writeProjectConfig,
} from "../lib/workspace";

const app = new Hono();

app.use("/*", cors());

app.get("/api/health", (c) => {
	return c.json({ status: "ok" });
});

app.get("/api/projects", async (c) => {
	try {
		const projects = await fs.readdir(PROJECTS_ROOT);
		return c.json({ success: true, projects });
	} catch (error) {
		return c.json({ success: true, projects: [] });
	}
});

app.get("/api/projects/:name", async (c) => {
	const name = c.req.param("name");
	try {
		const config = await readProjectConfig(name);
		const schemaPath = getProjectSchemaPath(name);
		const schemaData = await fs.readFile(schemaPath, "utf-8");
		const schema = JSON.parse(schemaData);
		return c.json({ success: true, config, schema });
	} catch (error: any) {
		return c.json({ success: false, error: error.message }, 404);
	}
});

app.post("/api/projects", async (c) => {
	const body = await c.req.json();
	const schema_validator = z.object({
		name: z.string(),
		dbType: z.enum(["postgresql", "mysql", "sqlite"]),
		connectionString: z.string(),
	});

	const { name, dbType, connectionString } = schema_validator.parse(body);

	try {
		consola.info(
			`Creating project ${name} with DB connection: ${connectionString}`,
		);
		const schema = await unifiedIntrospect(connectionString);

		// Ensure project directory and save config
		await ensureProjectDir(name);
		await writeProjectConfig(name, {
			name,
			dbType,
			connectionString,
			createdAt: new Date().toISOString(),
		});

		// Save schema
		const schemaPath = getProjectSchemaPath(name);
		await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2));

		return c.json({ success: true, schema });
	} catch (error: any) {
		consola.error("Project Creation Error:", error);
		return c.json({ success: false, error: error.message }, 400);
	}
});

app.post("/api/validate-db", async (c) => {
	const body = await c.req.json();
	const { connectionString } = z
		.object({ connectionString: z.string() })
		.parse(body);

	try {
		consola.info(`Validating DB connection: ${connectionString}`);
		const schema = await unifiedIntrospect(connectionString);
		return c.json({ success: true, schema });
	} catch (error: any) {
		consola.error("DB Validation Error:", error);
		return c.json({ success: false, error: error.message }, 400);
	}
});

app.post("/api/validate-ai", async (c) => {
	const body = await c.req.json();
	const { provider, model, apiKey } = z
		.object({
			provider: z.string(),
			model: z.string(),
			apiKey: z.string(),
		})
		.parse(body);

	try {
		consola.info(`Validating AI provider: ${provider}, model: ${model}`);
		// Mocking AI validation for now.
		// In actual implementation, we'd use the provided credentials to make a small test request.
		return c.json({ success: true });
	} catch (error: any) {
		consola.error("AI Validation Error:", error);
		return c.json({ success: false, error: error.message }, 400);
	}
});

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
