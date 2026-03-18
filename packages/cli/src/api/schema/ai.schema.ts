import { z } from "zod";

export const aiModelSchema = z.object({
	name: z.string().optional(),
	provider: z.string(),
	model: z.string(),
	apiKey: z.string(),
});

export const chatSchema = z.object({
	messages: z.array(z.any()),
	modelId: z.string(),
});

export const validateAiSchema = z.object({
	provider: z.string(),
	model: z.string(),
	apiKey: z.string(),
});

export const jsonRenderSchema = z.object({
	prompt: z.string(),
	context: z.record(z.string(), z.any()).optional(),
	projectName: z.string().optional(),
	conversationId: z.string().optional(),
	modelId: z.string().optional(),
});