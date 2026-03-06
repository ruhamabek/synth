import { Database } from "bun:sqlite";
import type {
	FullSchemaType,
	RawSQLiteColumn,
	RawSQLiteRelationship,
	RawSQLiteTable,
	Relationship,
	Table,
} from "@synth/types";

export async function introspectSchema(path: string): Promise<FullSchemaType> {
	let dbPath = path.replace(/^file:/, "");

	if (dbPath.startsWith("~/")) {
		const homedir = process.env.HOME || process.env.USERPROFILE || "/root";
		dbPath = dbPath.replace("~", homedir);
	}

	let db: Database;
	try {
		db = new Database(dbPath, { readonly: true });
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		throw new Error(
			`Failed to open SQLite database at ${dbPath}: ${errorMessage}`,
		);
	}

	try {
		// 1. Get Tables (excluding internal sqlite tables)
		const tablesRes = db
			.query(`
            SELECT name 
            FROM sqlite_master 
            WHERE type = 'table' AND name NOT LIKE 'sqlite_%';
        `)
			.all() as RawSQLiteTable[];

		const tables: Table[] = [];
		const relationships: Relationship[] = [];

		for (const tableRow of tablesRes) {
			const tableName = tableRow.name;

			// 2. Get Columns and Primary Key for each table
			const columnsRes = db
				.query(`PRAGMA table_info("${tableName}");`)
				.all() as RawSQLiteColumn[];

			const columns = columnsRes.map((col) => ({
				name: col.name,
				type: col.type,
				isNullable: col.notnull === 0,
				isPrimaryKey: col.pk === 1,
				defaultValue: col.dflt_value === null ? null : String(col.dflt_value),
			}));

			tables.push({
				name: tableName,
				columns,
			});

			// 3. Get Foreign Keys (Relationships)
			const fksRes = db
				.query(`PRAGMA foreign_key_list("${tableName}");`)
				.all() as RawSQLiteRelationship[];

			for (const fk of fksRes) {
				relationships.push({
					fromTable: tableName,
					fromColumn: fk.from,
					toTable: fk.table,
					toColumn: fk.to,
				});
			}
		}

		return {
			tables,
			relationships,
		};
	} finally {
		db.close();
	}
}
