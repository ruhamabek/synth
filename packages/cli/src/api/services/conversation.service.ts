import {
	appendMessage,
	createConversation,
	deleteConversation,
	getConversation,
	listConversations,
	updateConversationMetadata,
} from "../../lib/conversations";
import type { ConversationMessage } from "../../lib/conversations";

export async function listConversationsService(projectName: string) {
	return await listConversations(projectName);
}

export async function getConversationService(
	projectName: string,
	conversationId: string,
) {
	return await getConversation(projectName, conversationId);
}

export async function createConversationService(
	projectName: string,
	data: { title?: string; schema: any },
) {
	return await createConversation(projectName, data);
}

export async function updateConversationService(
	projectName: string,
	conversationId: string,
	data: any,
) {
	await updateConversationMetadata(projectName, conversationId, data);
	return await getConversation(projectName, conversationId);
}

export async function appendMessageService(
	projectName: string,
	conversationId: string,
	message: { role: "user" | "assistant" | "system"; content: string },
) {
	await appendMessage(projectName, conversationId, {
		...message,
		timestamp: new Date().toISOString(),
	} as ConversationMessage);
	return await getConversation(projectName, conversationId);
}

export async function deleteConversationService(
	projectName: string,
	conversationId: string,
) {
	await deleteConversation(projectName, conversationId);
}
