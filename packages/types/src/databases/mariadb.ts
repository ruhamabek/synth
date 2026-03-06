export interface RawMariaDBColumn {
	table_name: string;
	column_name: string;
	data_type: string;
	is_nullable: string;
	column_default: unknown;
	column_key: string;
}

export interface RawMariaDBRelationship {
	from_table: string;
	from_column: string;
	to_table: string;
	to_column: string;
}
