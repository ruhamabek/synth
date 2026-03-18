import { consola } from "consola";
import { ok, fail } from "../../lib/response";
import {
	appendMessageSchema,
	createConversationSchema,
	updateConversationSchema,
} from "../schema/conversation.schema";
import {
	appendMessageService,
	createConversationService,
	deleteConversationService,
	getConversationService,
	listConversationsService,
	updateConversationService,
} from "../services/conversation.service";

export async function listConversationsController(c: any) {
	const projectName = c.req.param("projectName");
	try {
		const conversations = await listConversationsService(projectName);
		return c.json(ok({ conversations }));
	} catch (err: any) {
		return c.json(fail(err.message), 500);
	}
}

export async function getConversationController(c: any) {
	const projectName = c.req.param("projectName");
	const conversationId = c.req.param("id");
	try {
		const conversation = await getConversationService(projectName, conversationId);
		if (!conversation) {
			return c.json(fail("Conversation not found"), 404);
		}
		return c.json(ok({ conversation }));
	} catch (err: any) {
		return c.json(fail(err.message), 500);
	}
}

export async function createConversationController(c: any) {
	const projectName = c.req.param("projectName");
	try {
		const body = await c.req.json();
		const data = createConversationSchema.parse(body);
		consola.info(`Creating conversation for project: ${projectName}`);
		const conversation = await createConversationService(projectName, data);
		consola.success(`Conversation created: ${conversation.metadata.id}`);
		return c.json(ok({ conversation }));
	} catch (err: any) {
		consola.error("Conversation creation error:", err);
		return c.json(fail(err.message), 400);
	}
}

export async function updateConversationController(c: any) {
	const projectName = c.req.param("projectName");
	const conversationId = c.req.param("id");
	try {
		const body = await c.req.json();
		const data = updateConversationSchema.parse(body);
		const conversation = await updateConversationService(
			projectName,
			conversationId,
			data,
		);
		return c.json(ok({ conversation }));
	} catch (err: any) {
		return c.json(fail(err.message), 400);
	}
}

export async function appendMessageController(c: any) {
	const projectName = c.req.param("projectName");
	const conversationId = c.req.param("id");
	try {
		const body = await c.req.json();
		const data = appendMessageSchema.parse(body);
		const conversation = await appendMessageService(
			projectName,
			conversationId,
			data,
		);
		return c.json(ok({ conversation }));
	} catch (err: any) {
		return c.json(fail(err.message), 400);
	}
}

export async function deleteConversationController(c: any) {
	const projectName = c.req.param("projectName");
	const conversationId = c.req.param("id");
	try {
		await deleteConversationService(projectName, conversationId);
		return c.json(ok({}));
	} catch (err: any) {
		return c.json(fail(err.message), 500);
	}
}
