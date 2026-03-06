import type { FullSchemaType, Relationship, Table } from "@synth/types";
import pg from "pg";

export async function introspectSchema(
	connectionString: string,
): Promise<FullSchemaType> {
	const client = new pg.Client({ connectionString });
	await client.connect();

	try {
		// 1. Get Tables and Columns
		const columnsRaw = await client.query(`
        SELECT 
          table_name, 
          column_name, 
          data_type, 
          is_nullable, 
          column_default,
          EXISTS (
            SELECT 1 FROM information_schema.key_column_usage kcu
            JOIN information_schema.table_constraints tc ON kcu.constraint_name = tc.constraint_name
            WHERE kcu.table_name = c.table_name 
            AND kcu.column_name = c.column_name 
            AND tc.constraint_type = 'PRIMARY KEY'
          ) as is_primary_key
        FROM information_schema.columns c
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `);

		const tablesMap = new Map<string, Table>();

		for (const row of columnsRaw.rows) {
			const tableName = row.table_name;
			if (!tablesMap.has(tableName)) {
				tablesMap.set(tableName, { name: tableName, columns: [] });
			}
			tablesMap.get(tableName)?.columns.push({
				name: row.column_name,
				type: row.data_type,
				isNullable: row.is_nullable === "YES",
				isPrimaryKey: row.is_primary_key,
				defaultValue: row.column_default,
			});
		}

		// 2. Get Relationships (Foreign Keys)
		const relationshipsRaw = await client.query(`
        SELECT
            tc.table_name AS from_table,
            kcu.column_name AS from_column,
            ccu.table_name AS to_table,
            ccu.column_name AS to_column
        FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
      `);

		const relationships: Relationship[] = relationshipsRaw.rows.map((row) => ({
			fromTable: row.from_table,
			fromColumn: row.from_column,
			toTable: row.to_table,
			toColumn: row.to_column,
		}));

		return {
			tables: Array.from(tablesMap.values()),
			relationships,
		};
	} finally {
		await client.end();
	}
}
