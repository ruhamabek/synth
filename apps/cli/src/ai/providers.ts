import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createMistral } from "@ai-sdk/mistral";
import { createMoonshotAI } from "@ai-sdk/moonshotai";
import { createOpenAI } from "@ai-sdk/openai";
import { createXai } from "@ai-sdk/xai";
import type { LanguageModel } from "ai";
import { createMinimax } from "vercel-minimax-ai-provider";
import type { AIProvider, ProviderConfig } from "./config.js";

export function createProviderInstance(
	provider: AIProvider,
	apiKey: string,
	baseUrl?: string,
) {
	switch (provider) {
		case "openai":
			return createOpenAI({
				apiKey,
				baseURL: baseUrl,
			});

		case "anthropic":
			return createAnthropic({
				apiKey,
				baseURL: baseUrl,
			});

		case "google":
			return createGoogleGenerativeAI({
				apiKey,
				baseURL: baseUrl,
			});

		case "xai":
			return createXai({
				apiKey,
				baseURL: baseUrl,
			});

		case "groq":
			return createGroq({
				apiKey,
				baseURL: baseUrl,
			});

		case "deepseek":
			return createDeepSeek({
				apiKey,
				baseURL: baseUrl,
			});

		case "mistral":
			return createMistral({
				apiKey,
				baseURL: baseUrl,
			});

		case "moonshotai":
			return createMoonshotAI({
				apiKey,
				baseURL: baseUrl,
			});

		case "minimax":
			return createMinimax({
				apiKey,
				baseURL: baseUrl,
			});

		default:
			throw new Error(`Unsupported provider: ${provider}`);
	}
}

export function createLanguageModel(config: ProviderConfig): LanguageModel {
	const provider = createProviderInstance(
		config.provider,
		config.apiKey,
		config.baseUrl,
	);

	return provider(config.model);
}

export function getAvailableModels(provider: AIProvider): string[] {
	const modelLists: Record<AIProvider, string[]> = {
		openai: [
			"gpt-4.1-mini",
			"gpt-4.1",
			"gpt-4o-mini",
			"gpt-4o",
			"o3-mini",
			"o1",
		],
		anthropic: [
			"claude-3-7-sonnet-20250219",
			"claude-3-5-sonnet-20241022",
			"claude-3-5-haiku-20241022",
		],
		google: [
			"gemini-2.5-flash",
			"gemini-2.5-pro",
			"gemini-2.0-flash",
			"gemini-2.0-pro",
		],
		xai: ["grok-beta", "grok-vision-beta"],
		groq: [
			"llama-3.3-70b-instruct",
			"llama-3.1-8b-instruct",
			"mixtral-8x7b-32768",
		],
		deepseek: ["deepseek-chat", "deepseek-reasoner"],
		mistral: [
			"mistral-large-latest",
			"mistral-small-latest",
			"codestral-latest",
		],
		moonshotai: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
		minimax: ["abab6.5s-chat", "abab6.5-chat"],
	};

	return modelLists[provider] || [];
}
