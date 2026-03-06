import { createClient } from "@libsql/client";
import type { FullSchemaType, Relationship, Table } from "@synth/types";

export async function introspectSchema(
	connectionString: string,
	authToken?: string,
): Promise<FullSchemaType> {
	const client = createClient({
		url: connectionString,
		authToken: authToken,
	});

	try {
		// 1. Get Tables (excluding internal sqlite tables)
		const tablesRes = await client.execute(`
            SELECT name 
            FROM sqlite_master 
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
        `);

		const tables: Table[] = [];
		const relationships: Relationship[] = [];

		for (const tableRow of tablesRes.rows) {
			const tableName = tableRow.name as string;

			// 2. Get Columns and Primary Key for each table
			const columnsRes = await client.execute(
				`PRAGMA table_info("${tableName}");`,
			);
			const columns = columnsRes.rows.map((col) => ({
				name: col.name as string,
				type: col.type as string,
				isNullable: col.notnull === 0,
				isPrimaryKey: col.pk === 1,
				defaultValue: col.dflt_value === null ? null : String(col.dflt_value),
			}));

			tables.push({
				name: tableName,
				columns,
			});

			// 3. Get Foreign Keys (Relationships)
			const fksRes = await client.execute(
				`PRAGMA foreign_key_list("${tableName}");`,
			);
			for (const fk of fksRes.rows) {
				relationships.push({
					fromTable: tableName,
					fromColumn: fk.from as string,
					toTable: fk.table as string,
					toColumn: fk.to as string,
				});
			}
		}

		return {
			tables,
			relationships,
		};
	} finally {
		client.close();
	}
}
