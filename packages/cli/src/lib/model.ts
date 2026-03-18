import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
 
export function createModel(provider: string, model: string, apiKey: string) {
	if (provider === "google") {
		return createGoogleGenerativeAI({ apiKey })(model);
	}

	if (provider === "openai") {
		return createOpenAI({ apiKey })(model);
	}

	throw new Error("Unsupported provider");
}