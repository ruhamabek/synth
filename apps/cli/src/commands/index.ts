import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import {
	getAllProviders,
	getAvailableModels,
	getDefaultModelForProvider,
	getProviderName,
	parseProviderInput,
	validateAICredentialsWithSDK,
} from "../ai/utils.js";
import {
	introspectDatabase,
	validateDatabaseConnection,
	validateDatabaseUrl,
} from "../database/index.js";
import type { CLIConfig, SchemaMetadata } from "../lib/types.js";
import { sanitizeProjectName, writeSecureJson } from "../lib/utils.js";
import {
	createReadlineInterface,
	prompt,
	promptRadioOption,
	promptSecret,
	promptValidated,
} from "../prompts/index.js";
import { startServer } from "../server/index.js";

export function printUsage() {
	console.log("Usage:");
	console.log("  synth init           # interactive setup and local dashboard");
	console.log(
		"  synth start [name]   # start existing local dashboard project",
	);
	console.log("  synth --help");
}

export async function runInit() {
	const rl = createReadlineInterface();

	try {
		const defaultProjectName = sanitizeProjectName(
			basename(process.cwd()) || "synth-project",
		);
		const projectNameInput = await prompt(
			rl,
			`Project name (default: ${defaultProjectName}): `,
			false,
			defaultProjectName,
		);
		const projectName = sanitizeProjectName(
			projectNameInput || defaultProjectName,
		);

		const databaseUrl = await promptValidated(
			rl,
			"Postgres database URL: ",
			validateDatabaseUrl,
			"Please enter a valid postgres:// or postgresql:// URL.",
		);

		console.log("\nAI provider:");
		const providers = getAllProviders();
		const providerOptions = providers.map(
			(p) => `${getProviderName(p)} (${p})`,
		);
		providerOptions.forEach((option, index) => {
			console.log(`  [${index + 1}] ${option}`);
		});

		const providerInput = await promptRadioOption(
			rl,
			"Select provider (default: 1): ",
			providers,
			0,
		);
		const provider = parseProviderInput(providerInput);

		console.log(`\nAI model for ${getProviderName(provider)}:`);
		const models = getAvailableModels(provider);
		const defaultModel = getDefaultModelForProvider(provider);
		models.forEach((model, index) => {
			const marker = model === defaultModel ? " (default)" : "";
			console.log(`  [${index + 1}] ${model}${marker}`);
		});

		const apiKey = await promptSecret(rl, `API key for ${provider}: `);
		if (!apiKey) {
			throw new Error("AI API key is required.");
		}

		const defaultModelIndex = models.indexOf(defaultModel);
		const model = await promptRadioOption(
			rl,
			"Select model (default: 1): ",
			models,
			defaultModelIndex >= 0 ? defaultModelIndex : 0,
		);

		const baseUrl = await prompt(
			rl,
			"Custom base URL (optional, press Enter to skip): ",
			false,
			"",
		);

		console.log("\n[1/4] Validating database connection...");
		const dbValidation = await validateDatabaseConnection(databaseUrl);
		console.log(
			`✓ Connected to database "${dbValidation.database}" successfully.`,
		);

		const skipAIValidation = await prompt(
			rl,
			"Skip AI credential validation? (y/N, default: N): ",
			false,
			"N",
		);

		if (skipAIValidation.toUpperCase() === "Y") {
			console.log("⚠ Skipping AI validation - credentials not verified");
		} else {
			console.log("\n[2/4] Validating AI provider credentials...");
			console.log(`  Provider: ${getProviderName(provider)}`);
			console.log(`  Model: ${model}`);
			console.log("  Testing API connectivity...");

			const validationResult = await validateAICredentialsWithSDK({
				provider,
				apiKey,
				model,
				baseUrl: baseUrl || undefined,
			});

			if (!validationResult.valid) {
				throw new Error(
					`AI credential validation failed: ${validationResult.error}`,
				);
			}

			console.log(
				`✓ ${validationResult.details || "AI credentials validated successfully."}`,
			);
		}

		console.log("\n[3/4] Introspecting database schema...");
		console.log("  Querying tables and columns...");
		const metadata = await introspectDatabase(
			databaseUrl,
			dbValidation.database,
		);
		console.log(
			`✓ Found ${metadata.tableCount} tables across ${metadata.schemaCount} schemas.`,
		);

		const ROOT_DIR = resolveRootDir();
		console.log("\n[4/4] Creating project files...");
		const projectDir = join(ROOT_DIR, projectName);
		const { mkdir } = await import("node:fs/promises");
		await mkdir(projectDir, { recursive: true });
		console.log(`  Created directory: ${projectDir}`);

		const config: CLIConfig = {
			version: 1,
			projectName,
			databaseUrl,
			ai: {
				provider,
				apiKey,
				model,
				baseUrl: baseUrl || undefined,
			},
			createdAt: new Date().toISOString(),
		};

		console.log("  Writing config.json...");
		await writeSecureJson(join(projectDir, "config.json"), config);
		console.log("  Writing schema.json...");
		const { writeFile } = await import("node:fs/promises");
		await writeFile(
			join(projectDir, "schema.json"),
			JSON.stringify(metadata, null, 2),
			"utf8",
		);

		console.log(`\n✓ Saved local project to ${projectDir}`);
		console.log("\nStarting local dashboard server...");
		await startServer(projectDir, config, metadata);
	} finally {
		rl.close();
	}
}

export async function runStart(projectNameArg?: string) {
	const projectName = projectNameArg;

	if (!projectName || projectName === "") {
		console.error("Please provide a project name. Usage: synth start [name]");
		console.error("Run 'synth init' to create a new project first.");
		process.exitCode = 1;
		return;
	}

	const ROOT_DIR = resolveRootDir();
	const projectDir = join(ROOT_DIR, sanitizeProjectName(projectName));
	const configPath = join(projectDir, "config.json");
	const schemaPath = join(projectDir, "schema.json");

	if (!(await Bun.file(configPath).exists())) {
		throw new Error(`Project "${projectName}" not found in ${ROOT_DIR}.`);
	}

	const config = JSON.parse(await readFile(configPath, "utf8")) as CLIConfig;
	const metadata = JSON.parse(
		await readFile(schemaPath, "utf8"),
	) as SchemaMetadata;

	await startServer(projectDir, config, metadata);
}

function resolveRootDir() {
	const { resolve } = require("node:path");
	return resolve(process.cwd(), ".synth");
}
