import type { CLIConfig, SchemaMetadata } from "../lib/types.js";
import {
	renderDashboardPage,
	renderTableDetailPage,
	renderTablesPage,
} from "./renderer.js";

const DEFAULT_PORT = 4040;

export async function findAvailablePort(startPort: number) {
	for (let port = startPort; port < startPort + 20; port++) {
		try {
			const probe = Bun.serve({
				port,
				fetch() {
					return new Response("ok");
				},
			});
			probe.stop();
			return port;
		} catch {}
	}
	throw new Error(`No free port found from ${startPort} to ${startPort + 19}.`);
}

export function htmlResponse(body: string) {
	return new Response(body, {
		headers: {
			"content-type": "text/html; charset=utf-8",
		},
	});
}

export async function startServer(
	projectDir: string,
	config: CLIConfig,
	metadata: SchemaMetadata,
) {
	const port = await findAvailablePort(DEFAULT_PORT);
	const server = Bun.serve({
		port,
		fetch(req) {
			const url = new URL(req.url);
			const pathname = url.pathname;

			if (pathname === "/api/schema") {
				return Response.json(metadata);
			}

			if (pathname === "/tables") {
				return htmlResponse(renderTablesPage(metadata, config.projectName));
			}

			if (pathname.startsWith("/tables/")) {
				const slug = decodeURIComponent(pathname.replace("/tables/", ""));
				const table = metadata.tables.find(
					(item) => `${item.schema}.${item.name}` === slug,
				);
				if (!table) {
					return new Response("Table not found", { status: 404 });
				}
				return htmlResponse(renderTableDetailPage(table, config.projectName));
			}

			return htmlResponse(
				renderDashboardPage(metadata, config.projectName, projectDir),
			);
		},
	});

	const localUrl = `http://localhost:${server.port}`;
	console.log(`\nSynth local dashboard: ${localUrl}`);
	console.log(`Tables: ${localUrl}/tables`);
	console.log("Press Ctrl+C to stop.\n");

	process.on("SIGINT", () => {
		server.stop();
		process.exit(0);
	});
}
