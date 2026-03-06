export interface RawSQLiteTable {
	name: string;
}

export interface RawSQLiteColumn {
	name: string;
	type: string;
	notnull: number;
	pk: number;
	dflt_value: unknown;
}

export interface RawSQLiteRelationship {
	table: string;
	from: string;
	to: string;
}
