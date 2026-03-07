// AI provider configuration types and utilities

export type AIProvider =
	| "openai"
	| "anthropic"
	| "google"
	| "xai"
	| "groq"
	| "deepseek"
	| "mistral"
	| "moonshotai"
	| "minimax";

export interface ProviderConfig {
	provider: AIProvider;
	apiKey: string;
	model: string;
	baseUrl?: string;
}

export interface ProviderMetadata {
	id: AIProvider;
	name: string;
	package: string;
	defaultModel: string;
	requiresBaseUrl: boolean;
	apiKeyPrefix?: string;
}

export const PROVIDER_METADATA: Record<AIProvider, ProviderMetadata> = {
	openai: {
		id: "openai",
		name: "OpenAI",
		package: "@ai-sdk/openai",
		defaultModel: "gpt-4.1-mini",
		requiresBaseUrl: false,
		apiKeyPrefix: "sk-",
	},
	anthropic: {
		id: "anthropic",
		name: "Anthropic",
		package: "@ai-sdk/anthropic",
		defaultModel: "claude-3-7-sonnet-20250219",
		requiresBaseUrl: false,
		apiKeyPrefix: "sk-ant-",
	},
	google: {
		id: "google",
		name: "Google AI",
		package: "@ai-sdk/google",
		defaultModel: "gemini-2.5-flash",
		requiresBaseUrl: false,
	},
	xai: {
		id: "xai",
		name: "xAI",
		package: "@ai-sdk/xai",
		defaultModel: "grok-beta",
		requiresBaseUrl: false,
	},
	groq: {
		id: "groq",
		name: "Groq",
		package: "@ai-sdk/groq",
		defaultModel: "llama-3.3-70b-instruct",
		requiresBaseUrl: false,
	},
	deepseek: {
		id: "deepseek",
		name: "DeepSeek",
		package: "@ai-sdk/deepseek",
		defaultModel: "deepseek-chat",
		requiresBaseUrl: false,
	},
	mistral: {
		id: "mistral",
		name: "Mistral AI",
		package: "@ai-sdk/mistral",
		defaultModel: "mistral-large-latest",
		requiresBaseUrl: false,
	},
	moonshotai: {
		id: "moonshotai",
		name: "Moonshot AI",
		package: "@ai-sdk/moonshotai",
		defaultModel: "moonshot-v1-8k",
		requiresBaseUrl: false,
	},
	minimax: {
		id: "minimax",
		name: "MinMax",
		package: "vercel-minimax-ai-provider",
		defaultModel: "abab6.5s-chat",
		requiresBaseUrl: false,
	},
};

export function getDefaultModelForProvider(provider: AIProvider): string {
	return PROVIDER_METADATA[provider].defaultModel;
}

export function getProviderName(provider: AIProvider): string {
	return PROVIDER_METADATA[provider].name;
}

export function getAllProviders(): AIProvider[] {
	return Object.keys(PROVIDER_METADATA) as AIProvider[];
}

export function isValidProvider(value: string): value is AIProvider {
	return value in PROVIDER_METADATA;
}

export function normalizeProvider(input: string): AIProvider {
	const normalized = input.toLowerCase().trim();
	if (isValidProvider(normalized)) {
		return normalized;
	}
	// Handle common aliases
	const aliases: Record<string, AIProvider> = {
		openai: "openai",
		anthropic: "anthropic",
		claude: "anthropic",
		google: "google",
		gemini: "google",
		xai: "xai",
		grok: "xai",
		"x.ai": "xai",
		groq: "groq",
		"z.ai": "groq",
		deepseek: "deepseek",
		mistral: "mistral",
		moonshot: "moonshotai",
		"moonshot-ai": "moonshotai",
		minimax: "minimax",
		"min-max": "minimax",
	};

	return aliases[normalized] || "openai";
}
