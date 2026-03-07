import type { AIProvider } from "../ai/config.js";

export type BunSQL = {
	<T = unknown>(
		strings: TemplateStringsArray,
		...values: unknown[]
	): Promise<T>;
	close(): Promise<void>;
};

export type CLIConfig = {
	version: 1;
	projectName: string;
	databaseUrl: string;
	ai?: {
		provider: AIProvider;
		apiKey: string;
		model: string;
		baseUrl?: string;
	};
	createdAt: string;
};

export type TableColumn = {
	name: string;
	dataType: string;
	nullable: boolean;
	defaultValue: string | null;
};

export type TableMeta = {
	schema: string;
	name: string;
	estimatedRows: number;
	columns: TableColumn[];
};

export type SchemaMetadata = {
	generatedAt: string;
	database: string;
	schemaCount: number;
	tableCount: number;
	tables: TableMeta[];
};
