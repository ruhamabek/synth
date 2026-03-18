import { createProjectSchema, validateDbSchema } from "../schema/project.schema";
import {
	createProject,
	getProject,
	listProjects,
	validateDb,
} from "../services/project.service";
import { ok, fail } from "../../lib/response";

export async function listProjectsController(c: any) {
	try {
		const projects = await listProjects();
		return c.json(ok({ projects }));
	} catch (err: any) {
		return c.json(fail(err.message), 500);
	}
}

export async function getProjectController(c: any) {
	try {
		const name = c.req.param("name");
		const data = await getProject(name);
		return c.json(ok(data));
	} catch (err: any) {
		return c.json(fail(err.message), 404);
	}
}

export async function createProjectController(c: any) {
	try {
		const body = await c.req.json();
		const data = createProjectSchema.parse(body);

		const schema = await createProject(data);

		return c.json(ok({ schema }));
	} catch (err: any) {
		return c.json(fail(err.message), 400);
	}
}

export async function validateDbController(c: any) {
	try {
		const body = await c.req.json();
		const { connectionString } = validateDbSchema.parse(body);

		const schema = await validateDb(connectionString);
		return c.json(ok({ schema }));
	} catch (err: any) {
		return c.json(fail(err.message), 400);
	}
}