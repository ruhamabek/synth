import { env } from "@synth/env/web";

const CLI_URL = env.VITE_CLI_URL;
export const API = {
  fetchHealth: async () => {
	const res = await fetch(`${CLI_URL}/api/health`, {
		signal: AbortSignal.timeout(5000),
	});
	return res.ok;
},
 
   fetchConversations: async (projectName: string) => {
	const res = await fetch(`${CLI_URL}/api/conversations/${projectName}`);
	if (!res.ok) throw new Error("Failed to fetch conversations");

	const data = await res.json();
	return data.success ? data.conversations : [];
},

   fetchSchema: async(projectName: string) => {
	const res = await fetch(`${CLI_URL}/api/projects/${projectName}`);
	if (!res.ok) throw new Error("Failed to fetch schema");

	const data = await res.json();
	return data.success ? data.schema : null;
}

}