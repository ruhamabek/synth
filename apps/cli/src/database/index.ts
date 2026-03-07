import type {
	BunSQL,
	DatabaseType,
	SchemaMetadata,
	TableColumn,
	TableMeta,
} from "../lib/types.js";

export function getDatabaseType(url: string): DatabaseType {
	const protocol = url.split("://")[0];
	if (protocol === "sqlite") return "sqlite";
	if (protocol === "postgres" || protocol === "postgresql") return "postgres";
	if (protocol === "mysql") return "mysql";
	throw new Error(`Unsupported database protocol: ${protocol}`);
}

export async function validateDatabaseConnection(databaseUrl: string) {
	const sql = new Bun.SQL(databaseUrl, {
		max: 1,
		idleTimeout: 0,
	}) as unknown as BunSQL;

	const dbType = getDatabaseType(databaseUrl);

	try {
		let database: string;

		if (dbType === "sqlite") {
			// For sqlite, extract the file path from the URL
			const dbPath = databaseUrl.replace("sqlite://", "");
			database = dbPath || ":memory:";
		} else if (dbType === "postgres" || dbType === "mysql") {
			const rows = await sql<
				{ database: string }[]
			>`select current_database() as database;`;
			database = rows[0]?.database ?? "";
			if (!database) {
				throw new Error("Unable to detect current database.");
			}
		} else {
			throw new Error(`Unsupported database type: ${dbType}`);
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

	const dbType = getDatabaseType(databaseUrl);

	try {
		let tables: {
			schema_name: string;
			table_name: string;
			estimated_rows: number | null;
		}[];
		let columns: {
			schema_name: string;
			table_name: string;
			column_name: string;
			data_type: string;
			is_nullable: string;
			column_default: string | null;
		}[];

		if (dbType === "sqlite") {
			// SQLite: Use pragma to get table info
			tables = await sql<
				{
					schema_name: string;
					table_name: string;
					estimated_rows: number | null;
				}[]
			>`
				SELECT
					'main' as schema_name,
					name as table_name,
					NULL as estimated_rows
				FROM sqlite_master
				WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
				ORDER BY name;
				`;

			columns = [];
			for (const table of tables) {
				const tableColumns = await sql<
					{
						column_name: string;
						data_type: string;
						notnull: number;
						dflt_value: string | null;
					}[]
				>`PRAGMA table_info('${table.table_name}');`;

				for (const col of tableColumns) {
					columns.push({
						schema_name: "main",
						table_name: table.table_name,
						column_name: col.column_name,
						data_type: col.data_type,
						is_nullable: col.notnull === 0 ? "YES" : "NO",
						column_default: col.dflt_value,
					});
				}
			}
		} else if (dbType === "postgres") {
			// PostgreSQL: Use information_schema
			tables = await sql<
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

			columns = await sql<
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
		} else if (dbType === "mysql") {
			// MySQL: Use information_schema
			tables = await sql<
				{
					schema_name: string;
					table_name: string;
					estimated_rows: number | null;
				}[]
			>`
		      SELECT
		        TABLE_SCHEMA as schema_name,
		        TABLE_NAME as table_name,
		        TABLE_ROWS as estimated_rows
		      FROM information_schema.TABLES
		      WHERE TABLE_TYPE = 'BASE TABLE'
		        AND TABLE_SCHEMA = DATABASE()
		      ORDER BY TABLE_SCHEMA, TABLE_NAME;
		    `;

			columns = await sql<
				{
					schema_name: string;
					table_name: string;
					column_name: string;
					data_type: string;
					is_nullable: string;
					column_default: string | null;
				}[]
			>`
		      SELECT
		        TABLE_SCHEMA as schema_name,
		        TABLE_NAME as table_name,
		        COLUMN_NAME as column_name,
		        DATA_TYPE as data_type,
		        IS_NULLABLE as is_nullable,
		        COLUMN_DEFAULT as column_default
		      FROM information_schema.COLUMNS
		      WHERE TABLE_SCHEMA = DATABASE()
		      ORDER BY TABLE_SCHEMA, TABLE_NAME, ORDINAL_POSITION;
		    `;
		} else {
			throw new Error(`Unsupported database type: ${dbType}`);
		}

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
		return (
			url.protocol === "sqlite:" ||
			url.protocol === "postgres:" ||
			url.protocol === "postgresql:" ||
			url.protocol === "mysql:"
		);
	} catch {
		return false;
	}
}
