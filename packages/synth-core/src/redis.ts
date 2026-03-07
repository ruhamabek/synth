import type { FullSchemaType, Table } from "@synth/types";
import { createClient } from "redis";

export async function introspectSchema(
	connectionString: string,
): Promise<FullSchemaType> {
	const client = createClient({ url: connectionString });
	await client.connect();

	try {
		// Redis doesn't have a schema in the traditional sense.
		// We'll provide two virtual tables: 'keys' and 'info'

		const tables: Table[] = [
			{
				name: "keys",
				columns: [
					{
						name: "key",
						type: "string",
						isNullable: false,
						isPrimaryKey: true,
						defaultValue: null,
					},
					{
						name: "value",
						type: "string",
						isNullable: true,
						isPrimaryKey: false,
						defaultValue: null,
					},
					{
						name: "type",
						type: "string",
						isNullable: false,
						isPrimaryKey: false,
						defaultValue: null,
					},
					{
						name: "ttl",
						type: "number",
						isNullable: false,
						isPrimaryKey: false,
						defaultValue: null,
					},
					{
						name: "memory",
						type: "number",
						isNullable: true,
						isPrimaryKey: false,
						defaultValue: null,
					},
				],
			},
			{
				name: "info",
				columns: [
					{
						name: "section",
						type: "string",
						isNullable: false,
						isPrimaryKey: true,
						defaultValue: null,
					},
					{
						name: "key",
						type: "string",
						isNullable: false,
						isPrimaryKey: true,
						defaultValue: null,
					},
					{
						name: "value",
						type: "string",
						isNullable: false,
						isPrimaryKey: false,
						defaultValue: null,
					},
				],
			},
		];

		return {
			tables,
			relationships: [], // Redis doesn't have foreign keys
		};
	} finally {
		await client.disconnect();
	}
}
