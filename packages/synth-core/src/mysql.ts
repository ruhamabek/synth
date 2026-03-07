import type {
	FullSchemaType,
	RawMySQLColumn,
	RawMySQLRelationshipRow,
	Relationship,
	Table,
} from "@synth/types";
import mysql from "mysql2/promise";

function resolveDefault(defaultValue: string | number | null | unknown) {
	if (!defaultValue) return null;
	const strValue = String(defaultValue);
	if (strValue.toLowerCase() === "null") return null;
	return strValue;
}

export async function introspectSchema(
	connectionString: string,
): Promise<FullSchemaType> {
	const connection = await mysql.createConnection(connectionString);

	try {
		// 1. Get Tables and Columns
		const [columnsRaw] = (await connection.execute(`
            SELECT 
                table_name, 
                column_name, 
                data_type, 
                is_nullable, 
                column_default,
                column_key
            FROM information_schema.columns 
            WHERE table_schema = DATABASE()
            ORDER BY table_name, ordinal_position;
        `)) as unknown as [RawMySQLColumn[]];

		const tablesMap = new Map<string, Table>();

		for (const row of columnsRaw) {
			const tableName = row.table_name;
			if (!tablesMap.has(tableName)) {
				tablesMap.set(tableName, { name: tableName, columns: [] });
			}
			tablesMap.get(tableName)?.columns.push({
				name: row.column_name,
				type: row.data_type,
				isNullable: row.is_nullable === "YES",
				isPrimaryKey: row.column_key === "PRI",
				defaultValue: resolveDefault(row.column_default),
			});
		}

		// 2. Get Relationships (Foreign Keys)
		const [relationshipsRaw] = (await connection.execute(`
            SELECT
                table_name AS from_table,
                column_name AS from_column,
                referenced_table_name AS to_table,
                referenced_column_name AS to_column
            FROM
                information_schema.key_column_usage
            WHERE
                referenced_table_name IS NOT NULL
                AND table_schema = DATABASE();
        `)) as unknown as [RawMySQLRelationshipRow[]];

		const relationships: Relationship[] = relationshipsRaw.map(
			(row: RawMySQLRelationshipRow) => ({
				fromTable: row.from_table,
				fromColumn: row.from_column,
				toTable: row.to_table,
				toColumn: row.to_column,
			}),
		);

		return {
			tables: Array.from(tablesMap.values()),
			relationships,
		};
	} finally {
		await connection.end();
	}
}
