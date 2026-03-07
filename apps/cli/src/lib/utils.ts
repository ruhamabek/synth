import { chmod, writeFile } from "node:fs/promises";

export function sanitizeProjectName(value: string) {
	return (
		value
			.toLowerCase()
			.replaceAll(/[^a-z0-9-]/g, "-")
			.replaceAll(/-{2,}/g, "-")
			.replaceAll(/^-|-$/g, "") || "synth-project"
	);
}

export async function writeSecureJson(path: string, payload: unknown) {
	await writeFile(path, JSON.stringify(payload, null, 2), "utf8");
	try {
		await chmod(path, 0o600);
	} catch {
		// Best effort only. Some environments may not support chmod.
	}
}
