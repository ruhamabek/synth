import { Hono } from "hono";
import {
	chatController,
	jsonRenderController,
	listModelsController,
	saveModelController,
	validateAiController,
} from "../controllers/ai.controller";

const router = new Hono();

router.get("/ai-models", listModelsController);
router.post("/ai-models", saveModelController);
router.post("/validate-ai", validateAiController);
router.post("/ai/chat", chatController);
router.post("/ai-json-render", jsonRenderController);

export default router;
