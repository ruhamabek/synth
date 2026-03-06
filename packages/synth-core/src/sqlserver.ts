import type {
	FullSchemaType,
	RawSQLServerColumn,
	RawSQLServerRelationship,
	Relationship,
	Table,
} from "@synth/types";
import sql from "mssql";

export async function introspectSchema(
	connectionString: string,
): Promise<FullSchemaType> {
	const pool = await new sql.ConnectionPool(connectionString).connect();

	try {
		// 1. Get Tables and Columns
		const columnsRaw = await pool.request().query<RawSQLServerColumn>(`
            SELECT 
                TABLE_SCHEMA as table_schema,
                TABLE_NAME as table_name,
                COLUMN_NAME as column_name,
                DATA_TYPE as data_type,
                IS_NULLABLE as is_nullable,
                COLUMN_DEFAULT as column_default,
                CASE 
                    WHEN EXISTS (
                        SELECT 1 
                        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                        JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                        WHERE kcu.TABLE_NAME = c.TABLE_NAME 
                        AND kcu.COLUMN_NAME = c.COLUMN_NAME 
                        AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                        AND kcu.TABLE_SCHEMA = c.TABLE_SCHEMA
                    ) THEN 'YES' 
                    ELSE 'NO' 
                END as is_primary_key
            FROM INFORMATION_SCHEMA.COLUMNS c
            ORDER BY TABLE_NAME, ORDINAL_POSITION;
        `);

		const tablesMap = new Map<string, Table>();

		for (const row of columnsRaw.recordset) {
			const tableName = row.table_name;
			if (!tablesMap.has(tableName)) {
				tablesMap.set(tableName, { name: tableName, columns: [] });
			}
			tablesMap.get(tableName)?.columns.push({
				name: row.column_name,
				type: row.data_type,
				isNullable: row.is_nullable === "YES",
				isPrimaryKey: row.is_primary_key === "YES",
				defaultValue: row.column_default,
			});
		}

		// 2. Get Relationships (Foreign Keys)
		const relationshipsRaw = await pool
			.request()
			.query<RawSQLServerRelationship>(`
            SELECT
                fk.TABLE_NAME as from_table,
                fcu.COLUMN_NAME as from_column,
                pk.TABLE_NAME as to_table,
                pcu.COLUMN_NAME as to_column
            FROM
                INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            JOIN
                INFORMATION_SCHEMA.TABLE_CONSTRAINTS fk ON rc.CONSTRAINT_NAME = fk.CONSTRAINT_NAME
            JOIN
                INFORMATION_SCHEMA.TABLE_CONSTRAINTS pk ON rc.UNIQUE_CONSTRAINT_NAME = pk.CONSTRAINT_NAME
            JOIN
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE fcu ON fk.CONSTRAINT_NAME = fcu.CONSTRAINT_NAME
            JOIN
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE pcu ON pk.CONSTRAINT_NAME = pcu.CONSTRAINT_NAME 
                AND fcu.ORDINAL_POSITION = pcu.ORDINAL_POSITION;
        `);

		const relationships: Relationship[] = relationshipsRaw.recordset.map(
			(row: RawSQLServerRelationship) => ({
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
		await pool.close();
	}
}
