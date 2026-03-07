import type { LanguageModel } from "ai";
import type { AIProvider, ProviderConfig } from "./config.js";
import {
	getAllProviders,
	getDefaultModelForProvider,
	getProviderName,
	isValidProvider,
	normalizeProvider,
} from "./config.js";
import { createLanguageModel, getAvailableModels } from "./providers.js";
import { validateAICredentialsWithSDK } from "./validation.js";

export {
	getAllProviders,
	getDefaultModelForProvider,
	getProviderName,
	isValidProvider,
	normalizeProvider,
	createLanguageModel,
	getAvailableModels,
	validateAICredentialsWithSDK,
};

export function formatProviderList(): string {
	const providers = getAllProviders();
	return providers.map((p) => `  - ${getProviderName(p)} (${p})`).join("\n");
}

export function getModelSuggestions(provider: AIProvider): string {
	const models = getAvailableModels(provider);
	const defaultModel = getDefaultModelForProvider(provider);

	return `Available models for ${getProviderName(provider)}:
${models.map((m) => (m === defaultModel ? `  - ${m} (default)` : `  - ${m}`)).join("\n")}`;
}

export async function createAndValidateModel(
	config: ProviderConfig,
): Promise<{ model: LanguageModel; error?: string }> {
	const validation = await validateAICredentialsWithSDK(config);

	if (!validation.valid) {
		return {
			model: createLanguageModel(config),
			error: validation.error,
		};
	}

	return {
		model: createLanguageModel(config),
	};
}

export function parseProviderInput(input: string): AIProvider {
	const trimmed = input.toLowerCase().trim();

	// Direct match
	if (isValidProvider(trimmed)) {
		return trimmed;
	}

	// Try to normalize
	const normalized = normalizeProvider(trimmed);
	if (isValidProvider(normalized)) {
		return normalized;
	}

	// Default to openai if no match
	return "openai";
}

export function isModelAvailable(provider: AIProvider, model: string): boolean {
	const availableModels = getAvailableModels(provider);
	return availableModels.includes(model);
}

export function getProviderInfo(provider: AIProvider): {
	name: string;
	defaultModel: string;
	availableModels: string[];
} {
	return {
		name: getProviderName(provider),
		defaultModel: getDefaultModelForProvider(provider),
		availableModels: getAvailableModels(provider),
	};
}
