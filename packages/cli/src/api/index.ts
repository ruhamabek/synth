import "dotenv/config";
import fs from "node:fs/promises";
import { unifiedIntrospect, schemaToPrompt } from "@synth/core";
import { consola } from "consola";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { z } from "zod";
import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import {
	ensureProjectDir,
	getProjectSchemaPath,
	PROJECTS_ROOT,
	readProjectConfig,
	writeProjectConfig,
} from "../lib/workspace";

// Define the catalog with shadcn/ui component definitions
const catalog = defineCatalog(schema, {
	components: {
		// Layout components
		Card: shadcnComponentDefinitions.Card,
		Stack: shadcnComponentDefinitions.Stack,
		Grid: shadcnComponentDefinitions.Grid,
		Heading: shadcnComponentDefinitions.Heading,
		Text: shadcnComponentDefinitions.Text,
		Separator: shadcnComponentDefinitions.Separator,

		// Form components
		Button: shadcnComponentDefinitions.Button,
		Input: shadcnComponentDefinitions.Input,
		Textarea: shadcnComponentDefinitions.Textarea,
		Select: shadcnComponentDefinitions.Select,
		Checkbox: shadcnComponentDefinitions.Checkbox,
		Switch: shadcnComponentDefinitions.Switch,
		Slider: shadcnComponentDefinitions.Slider,
		Radio: shadcnComponentDefinitions.Radio,

		// Data display
		Table: shadcnComponentDefinitions.Table,
		Badge: shadcnComponentDefinitions.Badge,
		Avatar: shadcnComponentDefinitions.Avatar,
		Image: shadcnComponentDefinitions.Image,

		// Feedback
		Alert: shadcnComponentDefinitions.Alert,
		Progress: shadcnComponentDefinitions.Progress,
		Skeleton: shadcnComponentDefinitions.Skeleton,
		Spinner: shadcnComponentDefinitions.Spinner,

		// Navigation
		Tabs: shadcnComponentDefinitions.Tabs,
		Accordion: shadcnComponentDefinitions.Accordion,
		Collapsible: shadcnComponentDefinitions.Collapsible,

		// Overlay
		Dialog: shadcnComponentDefinitions.Dialog,
		Drawer: shadcnComponentDefinitions.Drawer,
		Popover: shadcnComponentDefinitions.Popover,
		Tooltip: shadcnComponentDefinitions.Tooltip,
		DropdownMenu: shadcnComponentDefinitions.DropdownMenu,

		// Carousel
		Carousel: shadcnComponentDefinitions.Carousel,

		// Toggle components
		Toggle: shadcnComponentDefinitions.Toggle,
		ToggleGroup: shadcnComponentDefinitions.ToggleGroup,
		ButtonGroup: shadcnComponentDefinitions.ButtonGroup,

		// Link
		Link: shadcnComponentDefinitions.Link,

		// Pagination
		Pagination: shadcnComponentDefinitions.Pagination,
	},
	actions: {},
});

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

// AI JSON Render endpoint - generates UI using JSON Render format
app.post("/api/ai-json-render", async (c) => {
	try {
		const body = await c.req.json();
		const prompt = body.prompt;

		if (!prompt) {
			return c.json(
				{ error: "No prompt provided in request body." },
				400,
			);
		}

		// Check if API key is available
		const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
		if (!apiKey) {
			return c.json(
				{ error: "API key not configured. Please set GOOGLE_GENERATIVE_AI_API_KEY environment variable." },
				500,
			);
		}

		// Generate system prompt from catalog
		const systemPrompt = catalog.prompt({
			customRules: [
				"IMPORTANT:",
				"- ALWAYS respond with valid JSON only (no markdown, no explanations)",
				"- Use appropriate components based on the user's request",
				"- For tables, use the Table component with column definitions",
				"- For forms, use Input/Select/Checkbox components",
				"- For metrics, use Card with Text components inside",
			],
		});

		const result = streamText({
			model: google("gemini-2.5-flash"),
			system: systemPrompt,
			prompt,
		});

		return result.toTextStreamResponse();
	} catch (error: any) {
		consola.error("AI JSON Render API error:", error);
		return c.json(
			{
				error: "Failed to process AI request",
				message: error?.message || String(error),
			},
			500,
		);
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
