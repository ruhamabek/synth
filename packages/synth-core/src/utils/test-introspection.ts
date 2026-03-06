import { unifiedIntrospect } from "../index";

async function main() {
	const connectionString = process.argv[2];
	const authToken = process.argv[3];

	if (!connectionString) {
		console.error(
			"Usage: bun run src/utils/test-introspection.ts <connection-string> [auth-token]",
		);
		process.exit(1);
	}

	try {
		console.log("Introspecting database...");
		const schema = await unifiedIntrospect(connectionString, { authToken });
		console.log(JSON.stringify(schema, null, 2));
	} catch (error) {
		console.error("Introspection failed:", error);
		process.exit(1);
	}
}

main();
