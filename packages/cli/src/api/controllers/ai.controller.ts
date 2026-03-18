import {
	aiModelSchema,
	chatSchema,
	jsonRenderSchema,
	validateAiSchema,
} from "../schema/ai.schema";
import {
	chat,
	jsonRender,
	listModels,
	saveModel,
	validateAi,
} from "../services/ai.service";
import { ok, fail } from "../../lib/response";
import { consola } from "consola";

export async function listModelsController(c: any) {
	try {
		const models = await listModels();
		return c.json({ models });
	} catch (err: any) {
		consola.error("AI models list error:", err);
		return c.json(fail(err.message), 500);
	}
}

export async function saveModelController(c: any) {
	try {
		const body = await c.req.json();
		const data = aiModelSchema.parse(body);
		const result = await saveModel(data);
		const { apiKey, ...safe } = result as any;
		return c.json(safe);
	} catch (err: any) {
		consola.error("AI model save error:", err);
		return c.json(fail(err.message), 400);
	}
}

export async function validateAiController(c: any) {
	try {
		const body = await c.req.json();
		const data = validateAiSchema.parse(body);
		await validateAi(data);
		return c.json(ok({}));
	} catch (err: any) {
		consola.error("AI Validation Error:", err);
		return c.json(fail(err.message), 400);
	}
}

export async function chatController(c: any) {
	try {
		const body = await c.req.json();
		const { messages, modelId } = chatSchema.parse(body);
		const result = await chat(messages, modelId);
		return result.toUIMessageStreamResponse();
	} catch (err: any) {
		consola.error("AI chat error:", err);
		return c.json(
			{ error: "Failed to process AI request", message: err?.message },
			500,
		);
	}
}

export async function jsonRenderController(c: any) {
	try {
		const body = await c.req.json();
		const projectName = body.projectName || body.context?.projectName;
		const conversationId = body.conversationId || body.context?.conversationId;
		const modelId = body.modelId || body.context?.modelId || c.req.query("modelId");

		const data = jsonRenderSchema.parse({
			...body,
			projectName,
			conversationId,
			modelId,
		});

		const result = await jsonRender(data);
		return result.toTextStreamResponse();
	} catch (err: any) {
		consola.error("AI JSON Render API error:", err);
		return c.json(
			{
				error: "Failed to process AI request",
				message: err?.message || String(err),
			},
			500,
		);
	}
}
