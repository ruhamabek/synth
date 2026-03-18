import { z } from "zod";

export const createProjectSchema = z.object({
	name: z.string(),
	dbType: z.enum([
		"postgresql",
		"mysql",
		"sqlite",
		"libsql",
		"mssql",
		"redis",
		"cockroach",
		"mariadb",
		"neon",
	]),
	connectionString: z.string(),
});

export const validateDbSchema = z.object({
	connectionString: z.string(),
});