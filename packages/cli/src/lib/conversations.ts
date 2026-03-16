import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import type { FullSchemaType } from "@synth/types";
import { ensureProjectDir, getProjectDir } from "./workspace";

export interface ConversationMessage {
	role: "user" | "assistant" | "system";
	content: string;
	timestamp: string;
}

export interface ConversationMetadata {
	id: string;
	projectName: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	schema: FullSchemaType;
	lastGeneratedUiJson?: unknown;
	lastMessageSummary?: string;
	messageCount: number;
}

export interface Conversation {
	metadata: ConversationMetadata;
	messages: ConversationMessage[];
}

export function getConversationsDir(projectName: string): string {
	return path.join(getProjectDir(projectName), "conversations");
}

export async function ensureConversationsDir(
	projectName: string,
): Promise<string> {
	await ensureProjectDir(projectName);
	const conversationsDir = getConversationsDir(projectName);
	await fs.mkdir(conversationsDir, { recursive: true });
	return conversationsDir;
}

export function getConversationPath(
	projectName: string,
	conversationId: string,
): string {
	return path.join(getConversationsDir(projectName), `${conversationId}.json`);
}

export async function createConversation(
	projectName: string,
	initialMetadata: {
		title?: string;
		schema: FullSchemaType;
	},
): Promise<Conversation> {
	const id = randomUUID();
	const now = new Date().toISOString();

	const conversation: Conversation = {
		metadata: {
			id,
			projectName,
			title: initialMetadata.title || "New Conversation",
			createdAt: now,
			updatedAt: now,
			schema: initialMetadata.schema,
			messageCount: 0,
		},
		messages: [],
	};

	await ensureConversationsDir(projectName);
	const conversationPath = getConversationPath(projectName, id);
	await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));

	return conversation;
}

export async function getConversation(
	projectName: string,
	conversationId: string,
): Promise<Conversation | null> {
	const conversationPath = getConversationPath(projectName, conversationId);
	try {
		const data = await fs.readFile(conversationPath, "utf-8");
		return JSON.parse(data) as Conversation;
	} catch (_error) {
		return null;
	}
}

export async function listConversations(
	projectName: string,
): Promise<ConversationMetadata[]> {
	const conversationsDir = getConversationsDir(projectName);

	try {
		const files = await fs.readdir(conversationsDir);
		const conversations: ConversationMetadata[] = [];

		for (const file of files) {
			if (file.endsWith(".json")) {
				const conversationId = file.replace(".json", "");
				const conversation = await getConversation(projectName, conversationId);
				if (conversation) {
					conversations.push(conversation.metadata);
				}
			}
		}

		// Sort by updatedAt descending (most recent first)
		return conversations.sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		);
	} catch (_error) {
		// Directory doesn't exist or is empty
		return [];
	}
}

export async function appendMessage(
	projectName: string,
	conversationId: string,
	message: ConversationMessage,
): Promise<void> {
	const conversation = await getConversation(projectName, conversationId);
	if (!conversation) {
		throw new Error(`Conversation ${conversationId} not found`);
	}

	conversation.messages.push(message);
	conversation.metadata.updatedAt = new Date().toISOString();
	conversation.metadata.messageCount = conversation.messages.length;

	// Update last message summary (first 100 chars of last message)
	const lastMessage = message.content;
	conversation.metadata.lastMessageSummary =
		lastMessage.length > 100 ? lastMessage.slice(0, 100) + "..." : lastMessage;

	// Update title if it's still "New Conversation" and this is the first user message
	if (
		conversation.metadata.title === "New Conversation" &&
		message.role === "user" &&
		conversation.messages.filter((m) => m.role === "user").length === 1
	) {
		conversation.metadata.title =
			message.content.length > 50
				? message.content.slice(0, 50) + "..."
				: message.content;
	}

	const conversationPath = getConversationPath(projectName, conversationId);
	await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
}

export async function updateConversationMetadata(
	projectName: string,
	conversationId: string,
	metadata: Partial<ConversationMetadata>,
): Promise<void> {
	const conversation = await getConversation(projectName, conversationId);
	if (!conversation) {
		throw new Error(`Conversation ${conversationId} not found`);
	}

	// Update allowed fields only
	if (metadata.title !== undefined) {
		conversation.metadata.title = metadata.title;
	}
	if (metadata.schema !== undefined) {
		conversation.metadata.schema = metadata.schema;
	}
	if (metadata.lastGeneratedUiJson !== undefined) {
		conversation.metadata.lastGeneratedUiJson = metadata.lastGeneratedUiJson;
	}

	conversation.metadata.updatedAt = new Date().toISOString();

	const conversationPath = getConversationPath(projectName, conversationId);
	await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
}

export async function deleteConversation(
	projectName: string,
	conversationId: string,
): Promise<void> {
	const conversationPath = getConversationPath(projectName, conversationId);
	try {
		await fs.unlink(conversationPath);
	} catch (_error) {
		// Ignore if file doesn't exist
	}
}
