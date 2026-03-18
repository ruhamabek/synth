import { Hono } from "hono";
import {
	createProjectController,
	getProjectController,
	listProjectsController,
	validateDbController,
} from "../controllers/project.controller";

const router = new Hono();

router.get("/", listProjectsController);
router.post("/", createProjectController);
router.get("/:name", getProjectController);
router.post("/validate-db", (c) => validateDbController(c)); // This will be handled by mounting

export default router;