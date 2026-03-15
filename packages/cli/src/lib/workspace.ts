import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export const SYNTH_ROOT = path.join(os.homedir(), ".synth");
export const PROJECTS_ROOT = path.join(SYNTH_ROOT, "projects");

export async function ensureSynthWorkspace() {
	await fs.mkdir(PROJECTS_ROOT, { recursive: true });
}

export function getProjectDir(projectName: string) {
	return path.join(PROJECTS_ROOT, projectName);
}

export async function ensureProjectDir(projectName: string) {
	const projectDir = getProjectDir(projectName);
	await fs.mkdir(projectDir, { recursive: true });
	return projectDir;
}

export function getProjectConfigPath(projectName: string) {
	return path.join(getProjectDir(projectName), "config.json");
}

export function getProjectSchemaPath(projectName: string) {
	return path.join(getProjectDir(projectName), "schema.json");
}

export async function readProjectConfig(projectName: string) {
	const configPath = getProjectConfigPath(projectName);
	try {
		const data = await fs.readFile(configPath, "utf-8");
		return JSON.parse(data);
	} catch (_error) {
		return null;
	}
}

export async function writeProjectConfig(projectName: string, config: any) {
	const configPath = getProjectConfigPath(projectName);
	await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

// AI models config (~/.synth/ai-models.json)
export interface AIModelConfig {
	id: string;
	name?: string;
	provider: string;
	model: string;
	apiKey: string;
}

export interface AIModelsFile {
	models: AIModelConfig[];
}

export function getAIModelsPath() {
	return path.join(SYNTH_ROOT, "ai-models.json");
}

export async function readAIModels(): Promise<AIModelsFile> {
	const configPath = getAIModelsPath();
	try {
		const data = await fs.readFile(configPath, "utf-8");
		const parsed = JSON.parse(data) as AIModelsFile;
		return Array.isArray(parsed?.models) ? parsed : { models: [] };
	} catch (_error) {
		return { models: [] };
	}
}

export async function writeAIModels(config: AIModelsFile) {
	await fs.mkdir(SYNTH_ROOT, { recursive: true });
	const configPath = getAIModelsPath();
	await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}
