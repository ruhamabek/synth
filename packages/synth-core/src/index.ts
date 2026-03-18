import type { FullSchemaType } from "@synth/types";
import * as cockroach from "./cockroach";
import * as libsql from "./libsql";
import * as mariadb from "./mariadb";
import * as mysql from "./mysql";
import * as neon from "./neon";
import * as postgres from "./postgres";
import * as redis from "./redis";
import * as sqlite from "./sqlite";
import * as sqlserver from "./sqlserver";

export async function unifiedIntrospect(
	connectionString: string,
	options?: { authToken?: string },
): Promise<FullSchemaType> {
	if (
		connectionString.includes("neon.tech") ||
		connectionString.startsWith("postgres://") ||
		connectionString.startsWith("postgresql://")
	) {
		if (connectionString.includes("neon.tech")) {
			return neon.introspectSchema(connectionString);
		}
		if (
			connectionString.includes("cockroachlabs.cloud") ||
			connectionString.includes("cockroach")
		) {
			return cockroach.introspectSchema(connectionString);
		}
		return postgres.introspectSchema(connectionString);
	}

	if (connectionString.startsWith("mysql://")) {
		return mysql.introspectSchema(connectionString);
	}

	if (connectionString.startsWith("mariadb://")) {
		return mariadb.introspectSchema(connectionString);
	}

	if (
		connectionString.startsWith("redis://") ||
		connectionString.startsWith("rediss://")
	) {
		return redis.introspectSchema(connectionString);
	}

	if (
		connectionString.startsWith("mssql://") ||
		connectionString.startsWith("sqlserver://")
	) {
		return sqlserver.introspectSchema(connectionString);
	}

	if (
		connectionString.startsWith("libsql://") ||
		connectionString.startsWith("http://") ||
		connectionString.startsWith("https://")
	) {
		return libsql.introspectSchema(connectionString, options?.authToken);
	}

	if (
		connectionString.startsWith("file:") ||
		connectionString.endsWith(".db") ||
		connectionString.endsWith(".sqlite")
	) {
		return sqlite.introspectSchema(connectionString);
	}

	throw new Error(
		`Unsupported database type for connection string: ${connectionString}`,
	);
}

export * as cockroach from "./cockroach";
export * as libsql from "./libsql";
export * as mariadb from "./mariadb";
export * as mysql from "./mysql";
export * as neon from "./neon";
export * from "./orchestrator";
export * as postgres from "./postgres";
export * as redis from "./redis";
export * as sqlite from "./sqlite";
export * as sqlserver from "./sqlserver";
export * from "./utils/schema-prompt";
export * from "./catalog";
