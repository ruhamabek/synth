export interface RawCockroachColumn {
	table_name: string;
	column_name: string;
	data_type: string;
	is_nullable: string;
	column_default: string | null;
	is_primary_key: string;
}

export interface RawCockroachRelationship {
	from_table: string;
	from_column: string;
	to_table: string;
	to_column: string;
}
