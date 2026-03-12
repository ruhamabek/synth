import type { FullSchemaType } from "@synth/types";

/**
 * Converts a database schema into a concise prompt string for the AI.
 */
export function schemaToPrompt(schema: FullSchemaType): string {
	let prompt = "DATABASE SCHEMA:\n";

	for (const table of schema.tables) {
		prompt += `- Table: ${table.name}\n`;
		prompt += `  Columns: ${table.columns
			.map((c) => `${c.name} (${c.type}${c.isPrimaryKey ? ", PK" : ""})`)
			.join(", ")}\n`;
	}

	if (schema.relationships.length > 0) {
		prompt += "\nRELATIONSHIPS:\n";
		for (const rel of schema.relationships) {
			prompt += `- ${rel.fromTable}.${rel.fromColumn} -> ${rel.toTable}.${rel.toColumn}\n`;
		}
	}

	return prompt;
}
