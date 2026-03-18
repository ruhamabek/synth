import { consola } from "consola";
import { startApiServer } from "../api/app";
import { killPort } from "../lib/port";
import { ensureProjectDir } from "../lib/workspace";

export async function startCommand(
	projectName: string,
	_options: Record<string, unknown>,
) {
	// Define Ports (could be configurable in the future)
	const apiPort = 4000;

	try {
		consola.start(`Starting synth project: ${projectName}`);

		// 1. Ensure project workspace exists
		const projectDir = await ensureProjectDir(projectName);
		consola.info(`Project directory: ${projectDir}`);

		// Kill existing processes on these ports before starting
		await killPort(apiPort);

		// 2. Start API Server
		startApiServer(apiPort);
		consola.success(`API server started on http://localhost:${apiPort}`);

		consola.info("\n🚀 Synth CLI is running!");
		consola.info(`   API: http://localhost:${apiPort}`);
		consola.info("\n💡 Start the web app separately:");
		consola.info("   cd apps/web && bun run dev");

		// 3. Handle Graceful Shutdown
		const cleanup = async () => {
			consola.info("\nGracefully shutting down...");

			// Kill ports on exit as requested
			await killPort(apiPort);

			process.exit(0);
		};

		process.on("SIGINT", cleanup);
		process.on("SIGTERM", cleanup);

		// Keep the process running
		await new Promise(() => {});
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		consola.error("Failed to start project:", message);

		// Ensure ports are killed even on failure
		await killPort(apiPort);

		process.exit(1);
	}
}
