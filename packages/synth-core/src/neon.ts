import { neon } from "@neondatabase/serverless";
import type { FullSchemaType, Relationship, Table } from "@synth/types";

export async function introspectSchema(
	connectionString: string,
): Promise<FullSchemaType> {
	console.log(
		"introspectSchema: Starting with connection string length:",
		connectionString?.length,
	);
	const sql = neon(connectionString);

	// 1. Get Tables and Columns
	console.log("introspectSchema: Executing table/column query...");
	const columnsRaw = await sql`
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
  `;
	console.log(
		"introspectSchema: Column query finished. Rows:",
		columnsRaw.length,
	);

	const tablesMap = new Map<string, Table>();

	for (const row of columnsRaw) {
		const tableName = row.table_name as string;
		if (!tablesMap.has(tableName)) {
			tablesMap.set(tableName, { name: tableName, columns: [] });
		}
		tablesMap.get(tableName)?.columns.push({
			name: row.column_name as string,
			type: row.data_type as string,
			isNullable: row.is_nullable === "YES",
			isPrimaryKey: row.is_primary_key as boolean,
			defaultValue: row.column_default as string | null,
		});
	}

	// 2. Get Relationships (Foreign Keys)
	const relationshipsRaw = await sql`
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
  `;

	const relationships: Relationship[] = relationshipsRaw.map((row) => ({
		fromTable: row.from_table as string,
		fromColumn: row.from_column as string,
		toTable: row.to_table as string,
		toColumn: row.to_column as string,
	}));

	return {
		tables: Array.from(tablesMap.values()),
		relationships,
	};
}

export * from "./orchestrator.js";
