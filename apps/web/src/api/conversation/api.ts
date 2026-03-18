import type { FullSchemaType } from "@synth/types";

export const CLI_URL = "http://localhost:4000";

export const API = {
	getConversations: async (projectName: string) => {
		const res = await fetch(`${CLI_URL}/api/conversations/${projectName}`);
		return res.json();
	},

	getConversation: async (projectName: string, id: string) => {
		const res = await fetch(`${CLI_URL}/api/conversations/${projectName}/${id}`);
		return res.json();
	},

	createConversation: async (projectName: string, schema: FullSchemaType) => {
		const res = await fetch(`${CLI_URL}/api/conversations/${projectName}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ schema }),
		});
		return res.json();
	},

	saveMessage: async (
		projectName: string,
		conversationId: string,
		message: { role: string; content: string },
	) => {
		return fetch(
			`${CLI_URL}/api/conversations/${projectName}/${conversationId}/messages`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(message),
			},
		);
	},

	deleteConversation: async (projectName: string, id: string) => {
		return fetch(`${CLI_URL}/api/conversations/${projectName}/${id}`, {
			method: "DELETE",
		});
	},

	updateConversation: async (
		projectName: string,
		conversationId: string,
		metadata: any,
	) => {
		return fetch(`${CLI_URL}/api/conversations/${projectName}/${conversationId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(metadata),
		});
	},

	getModels: async () => {
		const res = await fetch(`${CLI_URL}/api/ai-models`);
		return res.json();
	},
};
