#!/usr/bin/env bun
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

type AIProvider = "openai" | "anthropic" | "google" | "other";

type CLIConfig = {
	version: 1;
	projectName: string;
	databaseUrl: string;
	ai: {
		provider: AIProvider;
		apiKey: string;
		model: string;
		baseUrl?: string;
	};
	createdAt: string;
};

type TableColumn = {
	name: string;
	dataType: string;
	nullable: boolean;
	defaultValue: string | null;
};

type TableMeta = {
	schema: string;
	name: string;
	estimatedRows: number;
	columns: TableColumn[];
};

type SchemaMetadata = {
	generatedAt: string;
	database: string;
	schemaCount: number;
	tableCount: number;
	tables: TableMeta[];
};

const DEFAULT_PORT = 4040;
const ROOT_DIR = resolve(process.cwd(), ".synth");

const command = process.argv[2] ?? "init";
const commandArg = process.argv[3];

if (command === "--help" || command === "-h") {
	printUsage();
} else if (command === "init") {
	if (commandArg === "--help" || commandArg === "-h") {
		printUsage();
	} else {
		await runInit();
	}
} else if (command === "start") {
	if (commandArg === "--help" || commandArg === "-h") {
		printUsage();
	} else {
		await runStart(commandArg);
	}
} else {
	printUsage();
	process.exitCode = 1;
}

function printUsage() {
	console.log("Usage:");
	console.log("  synth init           # interactive setup and local dashboard");
	console.log(
		"  synth start [name]   # start existing local dashboard project",
	);
	console.log("  synth --help");
}

async function runInit() {
	const rl = createInterface({ input, output });

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

		const providerInput = (
			await prompt(
				rl,
				"AI provider (openai/anthropic/google/other, default: openai): ",
				false,
				"openai",
			)
		).toLowerCase();
		const provider = normalizeProvider(providerInput);

		const apiKey = await promptSecret("AI API key: ");
		if (!apiKey) {
			throw new Error("AI API key is required.");
		}

		const defaultModel = defaultModelFor(provider);
		const model = await prompt(
			rl,
			`AI model (default: ${defaultModel}): `,
			false,
			defaultModel,
		);
		const baseUrl =
			provider === "other"
				? await prompt(rl, "AI base URL (optional): ", false, "")
				: undefined;

		console.log("\nValidating database connection...");
		const dbValidation = await validateDatabaseConnection(databaseUrl);
		console.log(
			`Connected to database "${dbValidation.database}" successfully.`,
		);

		console.log("Validating AI provider credentials...");
		await validateAICredentials(provider, apiKey, baseUrl);
		console.log("AI credential format looks valid.");

		console.log("Introspecting schema...");
		const metadata = await introspectDatabase(
			databaseUrl,
			dbValidation.database,
		);

		const projectDir = join(ROOT_DIR, projectName);
		await mkdir(projectDir, { recursive: true });

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

		await writeSecureJson(join(projectDir, "config.json"), config);
		await writeFile(
			join(projectDir, "schema.json"),
			JSON.stringify(metadata, null, 2),
			"utf8",
		);

		console.log(`Saved local project to ${projectDir}`);
		await startServer(projectDir, config, metadata);
	} finally {
		rl.close();
	}
}

async function runStart(projectNameArg?: string) {
	let projectName = projectNameArg;

	if (!projectName) {
		const entries = (await Bun.file(ROOT_DIR).exists())
			? Array.from(new Bun.Glob("*").scanSync(ROOT_DIR))
			: [];

		if (entries.length === 0) {
			throw new Error("No local synth projects found. Run `synth init` first.");
		}

		projectName = entries[0] ?? "";
	}

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

async function startServer(
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

function renderDashboardPage(
	metadata: SchemaMetadata,
	projectName: string,
	projectDir: string,
) {
	const distinctSchemas = new Set(metadata.tables.map((table) => table.schema))
		.size;
	const estimatedRows = metadata.tables.reduce(
		(sum, table) => sum + table.estimatedRows,
		0,
	);
	const largestTables = [...metadata.tables]
		.sort((a, b) => b.estimatedRows - a.estimatedRows)
		.slice(0, 8);

	const rows = largestTables
		.map(
			(table) => `
      <tr>
        <td>${escapeHTML(table.schema)}.${escapeHTML(table.name)}</td>
        <td>${table.columns.length}</td>
        <td>${table.estimatedRows.toLocaleString()}</td>
        <td><a href="/tables/${encodeURIComponent(`${table.schema}.${table.name}`)}">Open</a></td>
      </tr>`,
		)
		.join("");

	return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Synth Dashboard</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <header>
      <h1>${escapeHTML(projectName)} Dashboard</h1>
      <nav><a href="/">Dashboard</a> <a href="/tables">Tables</a> <a href="/api/schema">Schema JSON</a></nav>
    </header>
    <main>
      <section class="cards">
        <article><h2>${metadata.tableCount}</h2><p>Tables</p></article>
        <article><h2>${distinctSchemas}</h2><p>Schemas</p></article>
        <article><h2>${estimatedRows.toLocaleString()}</h2><p>Estimated Rows</p></article>
        <article><h2>${escapeHTML(metadata.database)}</h2><p>Database</p></article>
      </section>

      <section>
        <h3>Largest Tables</h3>
        <table>
          <thead>
            <tr><th>Table</th><th>Columns</th><th>Estimated Rows</th><th>View</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>

      <section>
        <h3>Project</h3>
        <p><strong>Location:</strong> ${escapeHTML(projectDir)}</p>
        <p><strong>Generated:</strong> ${escapeHTML(metadata.generatedAt)}</p>
      </section>
    </main>
  </body>
  </html>`;
}

function renderTablesPage(metadata: SchemaMetadata, projectName: string) {
	const rows = metadata.tables
		.map(
			(table) => `
      <tr>
        <td>${escapeHTML(table.schema)}</td>
        <td>${escapeHTML(table.name)}</td>
        <td>${table.columns.length}</td>
        <td>${table.estimatedRows.toLocaleString()}</td>
        <td><a href="/tables/${encodeURIComponent(`${table.schema}.${table.name}`)}">Open</a></td>
      </tr>`,
		)
		.join("");

	return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Synth Tables</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <header>
      <h1>${escapeHTML(projectName)} Tables</h1>
      <nav><a href="/">Dashboard</a> <a href="/tables">Tables</a></nav>
    </header>
    <main>
      <table>
        <thead>
          <tr><th>Schema</th><th>Table</th><th>Columns</th><th>Estimated Rows</th><th>View</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
  </html>`;
}

function renderTableDetailPage(table: TableMeta, projectName: string) {
	const rows = table.columns
		.map(
			(column) => `
      <tr>
        <td>${escapeHTML(column.name)}</td>
        <td>${escapeHTML(column.dataType)}</td>
        <td>${column.nullable ? "YES" : "NO"}</td>
        <td>${column.defaultValue ? escapeHTML(column.defaultValue) : "-"}</td>
      </tr>`,
		)
		.join("");

	return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHTML(table.schema)}.${escapeHTML(table.name)}</title>
    <style>${baseStyles()}</style>
  </head>
  <body>
    <header>
      <h1>${escapeHTML(projectName)}: ${escapeHTML(table.schema)}.${escapeHTML(table.name)}</h1>
      <nav><a href="/">Dashboard</a> <a href="/tables">Tables</a></nav>
    </header>
    <main>
      <section class="cards">
        <article><h2>${table.columns.length}</h2><p>Columns</p></article>
        <article><h2>${table.estimatedRows.toLocaleString()}</h2><p>Estimated Rows</p></article>
      </section>
      <table>
        <thead>
          <tr><th>Column</th><th>Type</th><th>Nullable</th><th>Default</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </main>
  </body>
  </html>`;
}

function htmlResponse(body: string) {
	return new Response(body, {
		headers: {
			"content-type": "text/html; charset=utf-8",
		},
	});
}

function escapeHTML(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function baseStyles() {
	return `
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
    header { padding: 16px 24px; border-bottom: 1px solid #cbd5e1; background: white; display: flex; justify-content: space-between; align-items: center; }
    nav a { margin-left: 12px; color: #0369a1; text-decoration: none; font-weight: 600; }
    main { max-width: 1080px; margin: 0 auto; padding: 20px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; margin-bottom: 20px; }
    article { background: white; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; }
    h1, h2, h3 { margin: 0 0 8px 0; }
    table { width: 100%; border-collapse: collapse; background: white; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; }
    th, td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 14px; }
    th { background: #f1f5f9; }
    a { color: #0369a1; }
  `;
}

async function validateDatabaseConnection(databaseUrl: string) {
	const sql = new Bun.SQL(databaseUrl, { max: 1, idleTimeout: 0 });
	try {
		const rows = await sql<
			{ database: string }[]
		>`select current_database() as database;`;
		const database = rows[0]?.database;
		if (!database) {
			throw new Error("Unable to detect current database.");
		}
		return { database };
	} finally {
		await sql.close();
	}
}

async function introspectDatabase(
	databaseUrl: string,
	database: string,
): Promise<SchemaMetadata> {
	const sql = new Bun.SQL(databaseUrl, { max: 2, idleTimeout: 0 });

	try {
		const tables = await sql<
			{
				schema_name: string;
				table_name: string;
				estimated_rows: number | null;
			}[]
		>`
      select
        t.table_schema as schema_name,
        t.table_name as table_name,
        coalesce(s.n_live_tup, 0)::bigint as estimated_rows
      from information_schema.tables t
      left join pg_stat_user_tables s
        on s.schemaname = t.table_schema
        and s.relname = t.table_name
      where t.table_type = 'BASE TABLE'
        and t.table_schema not in ('pg_catalog', 'information_schema')
      order by t.table_schema, t.table_name;
    `;

		const columns = await sql<
			{
				schema_name: string;
				table_name: string;
				column_name: string;
				data_type: string;
				is_nullable: string;
				column_default: string | null;
			}[]
		>`
      select
        c.table_schema as schema_name,
        c.table_name as table_name,
        c.column_name as column_name,
        c.data_type as data_type,
        c.is_nullable as is_nullable,
        c.column_default as column_default
      from information_schema.columns c
      where c.table_schema not in ('pg_catalog', 'information_schema')
      order by c.table_schema, c.table_name, c.ordinal_position;
    `;

		const byTable = new Map<string, TableColumn[]>();
		for (const column of columns) {
			const key = `${column.schema_name}.${column.table_name}`;
			const bucket = byTable.get(key) ?? [];
			bucket.push({
				name: column.column_name,
				dataType: column.data_type,
				nullable: column.is_nullable === "YES",
				defaultValue: column.column_default,
			});
			byTable.set(key, bucket);
		}

		const tableMetadata: TableMeta[] = tables.map((table) => {
			const key = `${table.schema_name}.${table.table_name}`;
			return {
				schema: table.schema_name,
				name: table.table_name,
				estimatedRows: Number(table.estimated_rows ?? 0),
				columns: byTable.get(key) ?? [],
			};
		});

		return {
			generatedAt: new Date().toISOString(),
			database,
			schemaCount: new Set(tableMetadata.map((table) => table.schema)).size,
			tableCount: tableMetadata.length,
			tables: tableMetadata,
		};
	} finally {
		await sql.close();
	}
}

function validateDatabaseUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === "postgres:" || url.protocol === "postgresql:";
	} catch {
		return false;
	}
}

function normalizeProvider(providerInput: string): AIProvider {
	if (providerInput === "openai") return "openai";
	if (providerInput === "anthropic") return "anthropic";
	if (providerInput === "google") return "google";
	return "other";
}

function defaultModelFor(provider: AIProvider) {
	if (provider === "openai") return "gpt-4.1-mini";
	if (provider === "anthropic") return "claude-3-7-sonnet-latest";
	if (provider === "google") return "gemini-2.5-flash";
	return "custom-model";
}

async function validateAICredentials(
	provider: AIProvider,
	apiKey: string,
	baseUrl?: string,
) {
	if (apiKey.length < 8) {
		throw new Error("AI API key looks too short.");
	}

	if (provider === "openai" && !apiKey.startsWith("sk-")) {
		throw new Error("OpenAI API key should usually start with `sk-`.");
	}

	if (provider === "anthropic" && !apiKey.startsWith("sk-ant-")) {
		throw new Error("Anthropic API key should usually start with `sk-ant-`.");
	}

	if (provider === "other" && baseUrl) {
		try {
			new URL(baseUrl);
		} catch {
			throw new Error("AI base URL must be a valid URL.");
		}
	}
}

async function findAvailablePort(startPort: number) {
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

async function prompt(
	rl: ReturnType<typeof createInterface>,
	question: string,
	required = true,
	defaultValue = "",
) {
	while (true) {
		const answer = (await rl.question(question)).trim();
		if (answer) return answer;
		if (defaultValue) return defaultValue;
		if (!required) return "";
		console.log("This field is required.");
	}
}

async function promptValidated(
	rl: ReturnType<typeof createInterface>,
	question: string,
	validator: (value: string) => boolean,
	errorMessage: string,
) {
	while (true) {
		const answer = await prompt(rl, question, true);
		if (validator(answer)) {
			return answer;
		}
		console.log(errorMessage);
	}
}

async function promptSecret(question: string) {
	if (typeof Bun.password === "function") {
		const value = (await Bun.password(question)).trim();
		return value;
	}

	const rl = createInterface({ input, output });
	try {
		return await prompt(rl, question, true);
	} finally {
		rl.close();
	}
}

async function writeSecureJson(path: string, payload: unknown) {
	await writeFile(path, JSON.stringify(payload, null, 2), "utf8");
	try {
		await chmod(path, 0o600);
	} catch {
		// Best effort only. Some environments may not support chmod.
	}
}

function sanitizeProjectName(value: string) {
	return (
		value
			.toLowerCase()
			.replaceAll(/[^a-z0-9-]/g, "-")
			.replaceAll(/-{2,}/g, "-")
			.replaceAll(/^-|-$/g, "") || "synth-project"
	);
}
