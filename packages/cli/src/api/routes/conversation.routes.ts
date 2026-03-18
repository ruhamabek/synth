import { Hono } from "hono";
import {
	appendMessageController,
	createConversationController,
	deleteConversationController,
	getConversationController,
	listConversationsController,
	updateConversationController,
} from "../controllers/conversation.controller";

const router = new Hono();

router.get("/:projectName", listConversationsController);
router.post("/:projectName", createConversationController);
router.get("/:projectName/:id", getConversationController);
router.put("/:projectName/:id", updateConversationController);
router.post("/:projectName/:id/messages", appendMessageController);
router.delete("/:projectName/:id", deleteConversationController);

export default router;
