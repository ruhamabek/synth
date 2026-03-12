import { unifiedIntrospect } from "./index";
import { schemaToPrompt } from "./utils/schema-prompt";

async function main() {
	const connectionString = process.argv[2];
	if (!connectionString) {
		console.error("Usage: synth <connection-string>");
		process.exit(1);
	}

	try {
		console.log("🚀 Introspecting database...");
		const schema = await unifiedIntrospect(connectionString);
		console.log("✅ Schema extracted successfully!");

		const promptContext = schemaToPrompt(schema);
		console.log("\n--- SCHEMA CONTEXT ---");
		console.log(promptContext);

		// Generate base64 encoded schema for the URL
		const encodedSchema = Buffer.from(JSON.stringify(schema)).toString(
			"base64",
		);
		const url = `http://localhost:3001/gen-ui?schema=${encodedSchema}`;

		console.log("\n✨ Synth Generative UI is ready!");
		console.log("🔗 Open the link below to start building your dashboard:");
		console.log(`\x1b[36m${url}\x1b[0m\n`);
	} catch (error) {
		console.error("❌ Error during generation:", error);
		process.exit(1);
	}
}

main();
