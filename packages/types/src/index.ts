import { z } from "zod";

export const ColumnSchema = z.object({
	name: z.string(),
	type: z.string(),
	isNullable: z.boolean(),
	isPrimaryKey: z.boolean(),
	defaultValue: z.string().nullable(),
});

export const TableSchema = z.object({
	name: z.string(),
	columns: z.array(ColumnSchema),
});

export const RelationshipSchema = z.object({
	fromTable: z.string(),
	fromColumn: z.string(),
	toTable: z.string(),
	toColumn: z.string(),
});

export const FullSchema = z.object({
	tables: z.array(TableSchema),
	relationships: z.array(RelationshipSchema),
});

export type Column = z.infer<typeof ColumnSchema>;
export type Table = z.infer<typeof TableSchema>;
export type Relationship = z.infer<typeof RelationshipSchema>;
export type FullSchemaType = z.infer<typeof FullSchema>;

export const SynthManifestSchema = z.object({
	pages: z.array(
		z.object({
			name: z.string(),
			description: z.string(),
			table: z.string(),
			features: z.array(
				z.enum(["list", "create", "edit", "delete", "search", "filter"]),
			),
			layout: z.enum(["table", "grid", "detail"]),
		}),
	),
	permissions: z.array(
		z.object({
			role: z.string(),
			access: z.array(
				z.object({
					page: z.string(),
					actions: z.array(z.string()),
				}),
			),
		}),
	),
	branding: z.object({
		title: z.string(),
		primaryColor: z.string(),
	}),
});

export type SynthManifest = z.infer<typeof SynthManifestSchema>;

export * from "./databases/cockroach";
export * from "./databases/mariadb";
export * from "./databases/mysql";
export * from "./databases/sqlite";
export * from "./databases/sqlserver";
export * from "./conversation";
