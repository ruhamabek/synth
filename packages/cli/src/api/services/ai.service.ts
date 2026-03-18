import { google } from "@ai-sdk/google";
import { catalog } from "@synth/core";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { randomUUID } from "node:crypto";
import { createModel } from "../../lib/model";
import { readAIModels, writeAIModels } from "../../lib/workspace";
import { getConversation } from "../../lib/conversations";

export async function listModels() {
	const { models } = await readAIModels();
	return models.map(({ id, name, provider, model }) => ({
		id,
		name,
		provider,
		model,
	}));
}

type CompatibleModel = Parameters<typeof streamText>[0]["model"];

export async function saveModel(data: {
	name?: string;
	provider: string;
	model: string;
	apiKey: string;
}) {
	const config = await readAIModels();
	const id = randomUUID();
	config.models.push({ id, ...data });
	await writeAIModels(config);
	return { id, ...data };
}

export async function validateAi(_data: {
	provider: string;
	model: string;
	apiKey: string;
}) {
	// Mocking AI validation for now
	return true;
}

export async function chat(messages: UIMessage[], modelId: string) {
	const config = await readAIModels();
	const modelConfig = config.models.find((m) => m.id === modelId);
	if (!modelConfig) throw new Error("Model not found");

	const model = createModel(
		modelConfig.provider,
		modelConfig.model,
		modelConfig.apiKey,
	);

	return streamText({
		model: model as CompatibleModel,
		messages: await convertToModelMessages(messages),
	});
}

export async function jsonRender(data: {
	prompt: string;
	context?: Record<string, unknown>;
	projectName?: string;
	conversationId?: string;
	modelId?: string;
}) {
	const { prompt, projectName, conversationId, modelId } = data;

	let model: CompatibleModel;
	if (modelId) {
		const config = await readAIModels();
		const modelConfig = config.models.find((m) => m.id === modelId);
		if (!modelConfig) throw new Error("Model not found");
		model = createModel(
			modelConfig.provider,
			modelConfig.model,
			modelConfig.apiKey,
		) as CompatibleModel;
	} else {
		if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
			throw new Error("API key not configured");
		}
		model = google("gemini-2.5-flash");
	}

	let conversationContext = "";
	if (projectName && conversationId) {
		const conversation = await getConversation(projectName, conversationId);
		if (conversation && conversation.messages.length > 0) {
			const recentMessages = conversation.messages.slice(-10);
			const historyText = recentMessages
				.map((m) => `${m.role}: ${m.content}`)
				.join("\n");
			conversationContext = `\n\nCONVERSATION HISTORY:\n${historyText}\n`;
		}
	}

	const systemPrompt = catalog.prompt({
		customRules: [
			"IMPORTANT:",
			"- ALWAYS respond with valid JSON only (no markdown, no explanations)",
			"- Use appropriate components based on the user's request",
			"- For tables, use the Table component with column definitions",
			"- For forms, use Input/Select/Checkbox components",
			"- For metrics, use Card with Text components inside",
		],
	});

	const enhancedPrompt = conversationContext
		? `${conversationContext}\nCurrent user request: ${prompt}`
		: prompt;

	return streamText({
		model: model,
		system: systemPrompt,
		prompt: enhancedPrompt,
	});
}
