export interface RawMySQLColumn {
	table_name: string;
	column_name: string;
	data_type: string;
	is_nullable: string;
	column_default: unknown;
	column_key: string;
}

export interface RawMySQLRelationship {
	from_table: string;
	from_column: string;
	referenced_table_name: string;
	referenced_column_name: string;
}

// Map the SQL aliases to the raw fields
export interface RawMySQLRelationshipRow {
	from_table: string;
	from_column: string;
	to_table: string;
	to_column: string;
}
