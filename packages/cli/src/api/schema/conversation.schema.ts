import { z } from "zod";

export const createConversationSchema = z.object({
	title: z.string().optional(),
	schema: z.object({
		tables: z.array(z.any()),
		relationships: z.array(z.any()),
	}),
});

export const updateConversationSchema = z.object({
	title: z.string().optional(),
	schema: z
		.object({
			tables: z.array(z.any()),
			relationships: z.array(z.any()),
		})
		.optional(),
	lastGeneratedUiJson: z.unknown().optional(),
});

export const appendMessageSchema = z.object({
	role: z.enum(["user", "assistant", "system"]),
	content: z.string(),
});
