import { generateText } from "ai";
import type { AIProvider, ProviderConfig } from "./config.js";
import { getDefaultModelForProvider, PROVIDER_METADATA } from "./config.js";
import { createProviderInstance } from "./providers.js";

export interface ValidationResult {
	valid: boolean;
	error?: string;
	details?: string;
}

export async function validateAPIKeyFormat(
	provider: AIProvider,
	apiKey: string,
): Promise<ValidationResult> {
	if (!apiKey || apiKey.length < 8) {
		return {
			valid: false,
			error: "API key is too short (must be at least 8 characters)",
		};
	}

	const metadata = PROVIDER_METADATA[provider];

	if (metadata.apiKeyPrefix && !apiKey.startsWith(metadata.apiKeyPrefix)) {
		return {
			valid: false,
			error: `API key should start with "${metadata.apiKeyPrefix}" for ${metadata.name}`,
		};
	}

	return { valid: true };
}

export async function validateAICredentialsWithSDK(
	config: ProviderConfig,
): Promise<ValidationResult> {
	try {
		// First validate format
		const formatValidation = await validateAPIKeyFormat(
			config.provider,
			config.apiKey,
		);
		if (!formatValidation.valid) {
			return formatValidation;
		}

		// Create provider instance
		const provider = createProviderInstance(
			config.provider,
			config.apiKey,
			config.baseUrl,
		);

		// Create model instance
		const model = provider(config.model);

		// Test with a minimal generateText call with timeout
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(
				() => reject(new Error("Request timed out after 30 seconds")),
				30000,
			),
		);

		const generatePromise = generateText({
			model,
			prompt: "test",
		});

		await Promise.race([generatePromise, timeoutPromise]);

		return {
			valid: true,
			details: `Successfully connected to ${PROVIDER_METADATA[config.provider].name} using model ${config.model}`,
		};
	} catch (error) {
		let errorMessage = "Failed to validate credentials";

		if (error instanceof Error) {
			// Parse common error types
			const message = error.message.toLowerCase();

			if (message.includes("401") || message.includes("unauthorized")) {
				errorMessage = "Invalid API key";
			} else if (
				message.includes("404") ||
				message.includes("not found") ||
				message.includes("model")
			) {
				errorMessage = `Model "${config.model}" not found or not accessible`;
			} else if (message.includes("429") || message.includes("rate limit")) {
				errorMessage = "Rate limit exceeded. Please try again later";
			} else if (
				message.includes("connection") ||
				message.includes("network") ||
				message.includes("fetch") ||
				message.includes("timeout") ||
				message.includes("econnrefused")
			) {
				errorMessage =
					"Network error or timeout. Please check your connection and verify the API endpoint is accessible";
			} else {
				errorMessage = error.message;
			}
		}

		return {
			valid: false,
			error: errorMessage,
		};
	}
}

export async function suggestDefaultModel(
	provider: AIProvider,
	apiKey: string,
): Promise<string> {
	const defaultModel = getDefaultModelForProvider(provider);

	// Try to validate with default model
	const result = await validateAICredentialsWithSDK({
		provider,
		apiKey,
		model: defaultModel,
	});

	if (result.valid) {
		return defaultModel;
	}

	// If default fails, return it anyway - user can override
	return defaultModel;
}
