import { consola } from "consola";
import { execa } from "execa";

/**
 * Kills a process running on a specific port.
 * @param port The port number to clear.
 */
export async function killPort(port: number) {
	try {
		// fuser -k {port}/tcp kills the process using that port
		// We use -s for silent mode to avoid unnecessary output if no process is found
		await execa("fuser", ["-k", `${port}/tcp`], { stdio: "ignore" });
		consola.success(`Cleared port ${port}`);
	} catch {
		// fuser returns non-zero if no process was using the port, so we ignore errors
	}
}
