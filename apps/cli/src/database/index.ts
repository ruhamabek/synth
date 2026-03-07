import type {
	BunSQL,
	SchemaMetadata,
	TableColumn,
	TableMeta,
} from "../lib/types.js";

export async function validateDatabaseConnection(databaseUrl: string) {
	const sql = new Bun.SQL(databaseUrl, {
		max: 1,
		idleTimeout: 0,
	}) as unknown as BunSQL;
	try {
		const rows = await sql<
			{ database: string }[]
		>`select current_database() as database;`;
		const database = rows[0]?.database;
		if (!database) {
			throw new Error("Unable to detect current database.");
		}
		return { database };
	} finally {
		await sql.close();
	}
}

export async function introspectDatabase(
	databaseUrl: string,
	database: string,
): Promise<SchemaMetadata> {
	const sql = new Bun.SQL(databaseUrl, {
		max: 2,
		idleTimeout: 0,
	}) as unknown as BunSQL;

	try {
		const tables = await sql<
			{
				schema_name: string;
				table_name: string;
				estimated_rows: number | null;
			}[]
		>`
      select
        t.table_schema as schema_name,
        t.table_name as table_name,
        coalesce(s.n_live_tup, 0)::bigint as estimated_rows
      from information_schema.tables t
      left join pg_stat_user_tables s
        on s.schemaname = t.table_schema
        and s.relname = t.table_name
      where t.table_type = 'BASE TABLE'
        and t.table_schema not in ('pg_catalog', 'information_schema')
      order by t.table_schema, t.table_name;
    `;

		const columns = await sql<
			{
				schema_name: string;
				table_name: string;
				column_name: string;
				data_type: string;
				is_nullable: string;
				column_default: string | null;
			}[]
		>`
      select
        c.table_schema as schema_name,
        c.table_name as table_name,
        c.column_name as column_name,
        c.data_type as data_type,
        c.is_nullable as is_nullable,
        c.column_default as column_default
      from information_schema.columns c
      where c.table_schema not in ('pg_catalog', 'information_schema')
      order by c.table_schema, c.table_name, c.ordinal_position;
    `;

		const byTable = new Map<string, TableColumn[]>();
		for (const column of columns) {
			const key = `${column.schema_name}.${column.table_name}`;
			const bucket = byTable.get(key) ?? [];
			bucket.push({
				name: column.column_name,
				dataType: column.data_type,
				nullable: column.is_nullable === "YES",
				defaultValue: column.column_default,
			});
			byTable.set(key, bucket);
		}

		const tableMetadata: TableMeta[] = tables.map(
			(table: {
				schema_name: string;
				table_name: string;
				estimated_rows: number | null;
			}) => {
				const key = `${table.schema_name}.${table.table_name}`;
				return {
					schema: table.schema_name,
					name: table.table_name,
					estimatedRows: Number(table.estimated_rows ?? 0),
					columns: byTable.get(key) ?? [],
				};
			},
		);

		return {
			generatedAt: new Date().toISOString(),
			database,
			schemaCount: new Set(tableMetadata.map((table) => table.schema)).size,
			tableCount: tableMetadata.length,
			tables: tableMetadata,
		};
	} finally {
		await sql.close();
	}
}

export function validateDatabaseUrl(value: string) {
	try {
		const url = new URL(value);
		return url.protocol === "postgres:" || url.protocol === "postgresql:";
	} catch {
		return false;
	}
}
