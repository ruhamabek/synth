import path from "node:path";
import { consola } from "consola";
import { execa } from "execa";
import open from "open";
import { startApiServer } from "../api";
import { killPort } from "../lib/port";
import { ensureProjectDir, SYNTH_ROOT } from "../lib/workspace";

export async function startCommand(
	projectName: string,
	_options: Record<string, unknown>,
) {
	// Define Ports (could be configurable in the future)
	const apiPort = 4000;
	const webPort = 3000;

	try {
		consola.start(`Starting synth project: ${projectName}`);

		// 1. Ensure project workspace exists
		const projectDir = await ensureProjectDir(projectName);
		consola.info(`Project directory: ${projectDir}`);

		// Kill existing processes on these ports before starting
		await killPort(apiPort);
		await killPort(webPort);

		// 3. Start API Server
		const _apiServer = startApiServer(apiPort);
		consola.success(`API server started on http://localhost:${apiPort}`);

		// 4. Start Web App
		// Calculate repo root relative to this file (src/commands/start.ts)
		// __dirname is not available in Bun modules, use import.meta.dir
		const currentDir = import.meta.dir;
		const repoRoot = path.resolve(currentDir, "../../../../");

		consola.info(`Repo root: ${repoRoot}`);

		consola.info("Launching Web App...");

		// Injecting ENV variables
		const webProcess = execa("bun", ["run", "dev"], {
			cwd: path.join(repoRoot, "apps/web"),
			env: {
				...process.env,
				PORT: webPort.toString(),
				SYNTH_PROJECT_NAME: projectName,
				SYNTH_PROJECT_DIR: projectDir,
				SYNTH_ROOT_DIR: SYNTH_ROOT,
				SYNTH_API_PORT: apiPort.toString(),
				SYNTH_WEB_PORT: webPort.toString(),
				SYNTH_MODE: "local",
			},
			stdio: "inherit",
		});

		consola.success(`Web app starting on http://localhost:${webPort}`);

		// 5. Open Browser (with a slight delay to let the server start)
		setTimeout(async () => {
			consola.info("Opening browser...");
			await open(`http://localhost:${webPort}`);
		}, 3000);

		// 6. Handle Graceful Shutdown
		const cleanup = async () => {
			consola.info("\nGracefully shutting down...");
			webProcess.kill("SIGINT");

			// Kill ports on exit as requested
			await killPort(apiPort);
			await killPort(webPort);

			process.exit(0);
		};

		process.on("SIGINT", cleanup);
		process.on("SIGTERM", cleanup);

		// Wait for the web process to finish (or be killed)
		await webProcess;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : String(error);
		consola.error("Failed to start project:", message);

		// Ensure ports are killed even on failure
		await killPort(apiPort);
		await killPort(webPort);

		process.exit(1);
	}
}
