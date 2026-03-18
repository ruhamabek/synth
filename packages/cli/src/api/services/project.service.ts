import fs from "node:fs/promises";
import { unifiedIntrospect } from "@synth/core";
import {
	ensureProjectDir,
	getProjectSchemaPath,
	writeProjectConfig,
	PROJECTS_ROOT,
	readProjectConfig,
} from "../../lib/workspace";

export async function listProjects() {
	try {
		return await fs.readdir(PROJECTS_ROOT);
	} catch (error) {
		return [];
	}
}

export async function getProject(name: string) {
	const config = await readProjectConfig(name);
	const schemaPath = getProjectSchemaPath(name);
	const schemaData = await fs.readFile(schemaPath, "utf-8");
	const schema = JSON.parse(schemaData);
	return { config, schema };
}

export async function createProject(data: {
	name: string;
	dbType: string;
	connectionString: string;
}) {
	const schema = await unifiedIntrospect(data.connectionString);

	await ensureProjectDir(data.name);

	await writeProjectConfig(data.name, {
		...data,
		createdAt: new Date().toISOString(),
	});

	const schemaPath = getProjectSchemaPath(data.name);
	await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2));

	return schema;
}

export async function validateDb(connectionString: string) {
	return await unifiedIntrospect(connectionString);
}