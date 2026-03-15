"use client";

import {
	ActionProvider,
	Renderer,
	StateProvider,
	useUIStream,
	ValidationProvider,
	VisibilityProvider,
} from "@json-render/react";
import type { FullSchemaType } from "@synth/types";
import {
	ArrowLeft,
	ChevronDownIcon,
	Code,
	MessageSquare,
	Plus,
	PlusIcon,
	SendIcon,
	SparklesIcon,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { registry } from "@/lib/json-render-registry";
import { generateRandomId } from "@/lib/utils";

const PROVIDER_MODELS: Record<string, string[]> = {
	google: [
		"gemini-2.5-flash",
		"gemini-2.0-flash",
		"gemini-1.5-flash",
		"gemini-1.5-pro",
	],
	openai: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
};

type AIModelSummary = {
	id: string;
	name?: string;
	provider: string;
	model: string;
};

const CLI_URL = "http://localhost:4000";

interface JsonRenderChatProps {
	projectName: string;
	schema: FullSchemaType;
	conversationId?: string;
	conversations: Array<{
		id: string;
		title: string;
		messageCount: number;
		updatedAt: string;
		lastGeneratedUiJson?: unknown;
	}>;
	onConversationChange?: (conversationId: string | undefined) => void;
	onNewMessage?: () => void;
	onLoadConversations?: () => void;
}

export function JsonRenderChat({
	projectName,
	schema,
	conversationId: propConversationId,
	conversations,
	onConversationChange,
	onNewMessage,
	onLoadConversations,
}: JsonRenderChatProps) {
	const [input, setInput] = useState("");
	const [conversationId, setConversationId] = useState(propConversationId);
	const [showList, setShowList] = useState(!propConversationId);
	const [messages, setMessages] = useState<
		Array<{ role: string; content: string }>
	>([]);
	const [storedSpec, setStoredSpec] = useState<unknown>(null);
	const lastPersistedSpecRef = useRef<string | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// AI model selection (same as /ai page)
	const [models, setModels] = useState<AIModelSummary[]>([]);
	const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [modelsError, setModelsError] = useState<string | null>(null);
	const [addProvider, setAddProvider] = useState<string>("google");
	const [addModel, setAddModel] = useState<string>(
		PROVIDER_MODELS.google[0] ?? "",
	);
	const [addApiKey, setAddApiKey] = useState("");
	const [addSaving, setAddSaving] = useState(false);
	const [addError, setAddError] = useState<string | null>(null);

	const fetchModels = useCallback(async () => {
		setModelsError(null);
		try {
			const res = await fetch(`${CLI_URL}/api/ai-models`);
			if (!res.ok) throw new Error("Failed to load models");
			const data = await res.json();
			const list = Array.isArray(data.models) ? data.models : [];
			setModels(list);
			setSelectedModelId((prev) => {
				if (list.length === 0) return null;
				if (!prev || !list.some((m: AIModelSummary) => m.id === prev))
					return list[0].id;
				return prev;
			});
		} catch (e) {
			setModelsError(
				"Could not load models. Start the Synth CLI to manage models.",
			);
			setModels([]);
		}
	}, []);

	useEffect(() => {
		fetchModels();
	}, [fetchModels]);

	const aiJsonRenderApi = `${CLI_URL}/api/ai-json-render`;
	const { spec, isStreaming, error, send, clear } = useUIStream({
		api: aiJsonRenderApi,
	});

	// Scroll to bottom when messages change
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	// Sync conversationId from props
	useEffect(() => {
		setConversationId(propConversationId);
		if (propConversationId) {
			setShowList(false);
		}
	}, [propConversationId]);

	// Load conversation messages when conversationId changes
	useEffect(() => {
		clear();
		lastPersistedSpecRef.current = null;

		if (conversationId) {
			// Load existing conversation messages
			fetch(`${CLI_URL}/api/conversations/${projectName}/${conversationId}`)
				.then((res) => res.json())
				.then((data) => {
					if (data.success && data.conversation) {
						setMessages(data.conversation.messages || []);
						setStoredSpec(
							data.conversation.metadata?.lastGeneratedUiJson ?? null,
						);
					}
				})
				.catch((err) =>
					console.error("Failed to load conversation messages:", err),
				);
		} else {
			// Clear messages when starting new conversation
			setMessages([]);
			setStoredSpec(null);
		}
	}, [conversationId, projectName, CLI_URL, clear]);

	// Persist the newest generated UI JSON on the active conversation.
	useEffect(() => {
		if (!conversationId || isStreaming || !spec) return;

		const serializedSpec = JSON.stringify(spec);
		if (lastPersistedSpecRef.current === serializedSpec) {
			return;
		}

		lastPersistedSpecRef.current = serializedSpec;
		setStoredSpec(spec);

		fetch(`${CLI_URL}/api/conversations/${projectName}/${conversationId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				lastGeneratedUiJson: spec,
			}),
		}).catch((err) =>
			console.error("Failed to persist generated UI JSON:", err),
		);
	}, [conversationId, isStreaming, spec, projectName, CLI_URL]);

	const handleBackToList = () => {
		setShowList(true);
	};

	const handleSelectConversation = (id: string) => {
		setConversationId(id);
		setShowList(false);
		onConversationChange?.(id);
	};

	const handleNewConversation = () => {
		setConversationId(undefined);
		setMessages([]);
		setStoredSpec(null);
		clear();
		setShowList(false);
		onConversationChange?.(undefined);
	};

	const handleDeleteConversation = async (id: string) => {
		if (!window.confirm("Delete this conversation?")) return;

		try {
			const res = await fetch(
				`${CLI_URL}/api/conversations/${projectName}/${id}`,
				{
					method: "DELETE",
				},
			);

			if (!res.ok) {
				console.error("Failed to delete conversation", await res.text());
				return;
			}

			if (conversationId === id) {
				setConversationId(undefined);
				setMessages([]);
				setStoredSpec(null);
				lastPersistedSpecRef.current = null;
				clear();
				onConversationChange?.(undefined);
			}

			onLoadConversations?.();
		} catch (error) {
			console.error("Error deleting conversation:", error);
		}
	};

	const handleAddModel = () => {
		setAddModalOpen(true);
		setAddError(null);
		setAddProvider("google");
		setAddModel(PROVIDER_MODELS.google[0] ?? "");
		setAddApiKey("");
	};

	const handleSaveModel = async (e: React.FormEvent) => {
		e.preventDefault();
		setAddError(null);
		if (!addApiKey.trim()) {
			setAddError("API key is required");
			return;
		}
		setAddSaving(true);
		try {
			const res = await fetch(`${CLI_URL}/api/ai-models`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					provider: addProvider,
					model: addModel,
					apiKey: addApiKey.trim(),
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error ?? "Failed to save model");
			setAddModalOpen(false);
			setSelectedModelId(data.id);
			await fetchModels();
		} catch (err: unknown) {
			setAddError(err instanceof Error ? err.message : "Failed to save model");
		} finally {
			setAddSaving(false);
		}
	};

	const hasModels = models.length > 0;
	const selectedModel = models.find((m) => m.id === selectedModelId);
	const canSend = hasModels && !!selectedModelId;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const text = input.trim();
		if (!text || isStreaming || !canSend) return;

		// Add user message to display immediately
		setMessages((prev) => [...prev, { role: "user", content: text }]);

		// Validate schema before creating conversation
		if (!schema || !schema.tables) {
			console.error("Invalid schema:", schema);
			send(text);
			setInput("");
			return;
		}

		// Create or get conversation
		let currentConversationId = conversationId;
		if (!currentConversationId) {
			try {
				const response = await fetch(
					`${CLI_URL}/api/conversations/${projectName}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ schema }),
					},
				);
				const data = await response.json();
				if (data.success && data.conversation?.metadata?.id) {
					currentConversationId = data.conversation.metadata.id;
					setConversationId(currentConversationId);
					if (currentConversationId) {
						onConversationChange?.(currentConversationId);
					}
				}
			} catch (error) {
				console.error("Error creating conversation:", error);
			}
		}

		// Save user message to conversation
		if (currentConversationId) {
			await fetch(
				`${CLI_URL}/api/conversations/${projectName}/${currentConversationId}/messages`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ role: "user", content: text }),
				},
			);
			onNewMessage?.();
		}

		// Enhance prompt with conversation context if we have a conversation
		let enhancedPrompt = text;
		if (currentConversationId) {
			try {
				const convResponse = await fetch(
					`${CLI_URL}/api/conversations/${projectName}/${currentConversationId}`,
				);
				const convData = await convResponse.json();
				if (convData.success && convData.conversation) {
					const recentMessages = convData.conversation.messages
						.slice(-6)
						.map(
							(m: { role: string; content: string }) =>
								`${m.role}: ${m.content}`,
						)
						.join("\n");
					if (recentMessages) {
						enhancedPrompt = `Previous conversation:\n${recentMessages}\n\nCurrent request: ${text}`;
					}
				}
			} catch (error) {
				console.error("Failed to load conversation context:", error);
			}
		}

		send(enhancedPrompt, {
			modelId: selectedModelId,
			projectName,
			conversationId: currentConversationId,
		});
		setInput("");
	};

	const previewSpec = spec ?? storedSpec;

	return (
		<div className="flex h-full w-full">
			{/* Left Panel: Conversation List or Chat */}
			<div className="flex w-[380px] shrink-0 flex-col border-r bg-background">
				{showList ? (
					<>
						{/* List Header */}
						<div className="flex items-center justify-between border-b px-4 py-3">
							<h3 className="font-medium text-foreground text-sm">
								Conversations
							</h3>
							<Button
								size="icon"
								variant="ghost"
								className="h-7 w-7"
								onClick={handleNewConversation}
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>

						{/* List Content */}
						<div className="flex-1 overflow-y-auto p-2">
							{conversations.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-12 text-center">
									<MessageSquare className="mb-3 h-8 w-8 text-muted-foreground/20" />
									<p className="font-medium text-muted-foreground text-xs">
										No conversations yet
									</p>
									<Button
										variant="link"
										className="mt-1 h-auto p-0 text-[11px] text-primary"
										onClick={handleNewConversation}
									>
										Start your first one
									</Button>
								</div>
							) : (
								<div className="space-y-1 px-1">
									{conversations.map((conv) => {
										const isActive = conversationId === conv.id;
										return (
											<div
												key={conv.id}
												className={`group relative flex items-center rounded-lg transition-all duration-200 ${
													isActive
														? "bg-accent/60 text-foreground ring-1 ring-border/50"
														: "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
												}`}
											>
												<button
													type="button"
													onClick={() => handleSelectConversation(conv.id)}
													className="min-w-0 flex-1 px-3 py-3 text-left"
												>
													<div className="truncate font-medium text-[13px] tracking-tight">
														{conv.title}
													</div>
													<div className="mt-1 flex items-center gap-2 text-[10px] opacity-60">
														<span>{conv.messageCount} messages</span>
													</div>
												</button>

												<div className="flex flex-col items-end gap-1 px-3 py-3 text-right">
													<span className="text-[10px] opacity-40 group-hover:hidden">
														{new Date(conv.updatedAt).toLocaleDateString()}
													</span>
													<div className="hidden transition-all duration-200 group-hover:flex">
														<Button
															type="button"
															variant="ghost"
															size="icon"
															className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive"
															onClick={(e) => {
																e.stopPropagation();
																handleDeleteConversation(conv.id);
															}}
															aria-label={`Delete conversation ${conv.title}`}
														>
															<Trash2 className="h-3.5 w-3.5" />
														</Button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					</>
				) : (
					<>
						{/* Chat Header */}
						<div className="flex items-center gap-2 border-b px-3 py-3">
							<Button
								variant="ghost"
								size="icon"
								className="-ml-1 h-7 w-7"
								onClick={handleBackToList}
							>
								<ArrowLeft className="h-4 w-4" />
							</Button>
							<div className="flex flex-col">
								<h3 className="font-medium text-xs leading-none">
									{conversations.find((c) => c.id === conversationId)?.title ||
										"New Chat"}
								</h3>
								<div className="mt-1 flex items-center gap-1.5">
									<div
										className={`h-1.5 w-1.5 rounded-full ${isStreaming ? "animate-pulse bg-yellow-500" : "bg-emerald-500"}`}
									/>
									<span className="font-medium text-[10px] text-muted-foreground uppercase tracking-wider">
										{isStreaming ? "Streaming" : "Ready"}
									</span>
								</div>
							</div>
						</div>

						{modelsError && (
							<div className="border-b border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 text-[10px] dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
								{modelsError}
							</div>
						)}
						{/* Chat Content */}
						<div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
							<div className="space-y-5">
								{messages.length === 0 && !spec && (
									<div className="flex flex-col gap-1.5">
										<div className="mb-1 flex items-center gap-2">
											<div className="flex h-5 w-5 items-center justify-center rounded bg-foreground">
												<SparklesIcon className="h-3 w-3 text-background" />
											</div>
											<span className="font-medium text-[11px] text-muted-foreground">
												Synth AI
											</span>
										</div>
										<div className="rounded-xl rounded-tl-sm border bg-muted/40 px-4 py-3 text-sm leading-relaxed">
											What would you like to build? I can generate UI components
											customized to your schema and data using JSON Render.
										</div>
									</div>
								)}

								{messages.map((msg) => (
									<div
										key={msg.content.slice(0, 30) + generateRandomId()} // Use content snippet + random ID for key
										className={`flex ${
											msg.role === "user" ? "justify-end" : "justify-start"
										}`}
									>
										<div
											className={`max-w-[85%] rounded-lg px-4 py-2 ${
												msg.role === "user"
													? "bg-primary text-primary-foreground shadow-sm"
													: "bg-muted text-foreground"
											} text-sm`}
										>
											{msg.content}
										</div>
									</div>
								))}

								{error && (
									<div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-500 text-sm">
										Error: {error.message}
									</div>
								)}

								{isStreaming && (
									<div className="flex items-center gap-2 text-muted-foreground text-xs">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										<span>Generating UI...</span>
									</div>
								)}
							</div>
						</div>

						{/* Input Area */}
						<div className="border-t p-3">
							<form
								className="flex flex-col overflow-hidden rounded-xl border bg-muted/30 transition-all focus-within:border-foreground/20"
								onSubmit={handleSubmit}
							>
								<textarea
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Describe your UI..."
									className="min-h-[56px] w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none"
									rows={2}
									disabled={isStreaming}
								/>
								<div className="flex items-center justify-between gap-2 border-border/50 border-t px-3 py-2">
									<span className="font-medium text-[10px] text-muted-foreground/60 uppercase tracking-wider">
										Enter to send
									</span>
									<div className="flex items-center gap-1.5">
										{hasModels ? (
											<DropdownMenu>
												<DropdownMenuTrigger
													render={
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="h-7 shrink-0 gap-1 rounded-full text-[10px]"
														>
															{selectedModel?.name ??
																selectedModel?.model ??
																"Model"}
															<ChevronDownIcon className="size-3" />
														</Button>
													}
												/>
												<DropdownMenuContent align="end" className="z-[100]">
													{models.map((m) => (
														<DropdownMenuItem
															key={m.id}
															onClick={() => setSelectedModelId(m.id)}
														>
															{m.name ?? m.model}
														</DropdownMenuItem>
													))}
													<DropdownMenuItem onClick={handleAddModel}>
														<PlusIcon className="mr-2 size-3" />
														Add model
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										) : (
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="h-7 shrink-0 rounded-full text-[10px]"
												onClick={handleAddModel}
											>
												Add model
											</Button>
										)}
										<Button
											type="submit"
											size="icon"
											className="h-7 w-7 rounded-full transition-transform active:scale-95"
											disabled={isStreaming || !input.trim() || !canSend}
										>
											<SendIcon className="-ml-0.5 h-3 w-3" />
										</Button>
									</div>
								</div>
							</form>
						</div>
					</>
				)}
			</div>

			{/* Right: Preview */}
			<div className="flex flex-1 flex-col">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<span className="text-muted-foreground text-sm">Preview</span>
					<Button
						variant="outline"
						size="sm"
						className="h-7 gap-1.5 rounded-lg border-dashed px-3 text-[11px]"
						onClick={() => {
							clear();
							setStoredSpec(null);
							lastPersistedSpecRef.current = null;

							if (conversationId) {
								fetch(
									`${CLI_URL}/api/conversations/${projectName}/${conversationId}`,
									{
										method: "PUT",
										headers: { "Content-Type": "application/json" },
										body: JSON.stringify({ lastGeneratedUiJson: null }),
									},
								).catch((err) =>
									console.error("Failed to clear generated UI JSON:", err),
								);
							}
						}}
					>
						<Code className="h-3 w-3" />
						Clear
					</Button>
				</div>
				<div className="flex flex-1 flex-col overflow-y-auto p-6">
					{previewSpec ? (
						<div className="w-full rounded-xl border bg-card p-6 shadow-sm">
							<StateProvider initialState={{}}>
								<VisibilityProvider>
									<ActionProvider
										handlers={{
											submit: (_params) => {
												// Handle submit action
											},
											navigate: (_params) => {
												// Handle navigate action
											},
										}}
									>
										<ValidationProvider customFunctions={{}}>
											<Renderer
												spec={
													previewSpec as Parameters<typeof Renderer>[0]["spec"]
												}
												registry={registry}
												loading={isStreaming}
											/>
										</ValidationProvider>
									</ActionProvider>
								</VisibilityProvider>
							</StateProvider>
						</div>
					) : (
						<div className="relative mx-auto flex w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-xl border p-16">
							{/* Dot grid background */}
							<div className="absolute inset-0 bg-[radial-gradient(oklch(0.3_0_0)_1px,transparent_1px)] opacity-20 [background-size:20px_20px]" />
							<div className="relative z-10 flex flex-col items-center">
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border bg-muted/30">
									<SparklesIcon className="h-4 w-4 text-muted-foreground/50" />
								</div>
								<p className="font-medium text-sm">Canvas is empty</p>
								<p className="mt-1 text-muted-foreground text-xs">
									Describe a UI to generate it using JSON Render
								</p>
							</div>
						</div>
					)}
				</div>
			</div>

			<Dialog
				open={addModalOpen}
				onOpenChange={(open) => setAddModalOpen(open === true)}
			>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Add AI model</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSaveModel} className="grid gap-4">
						<div className="grid gap-2">
							<Label htmlFor="add-provider">Provider</Label>
							<Select
								value={addProvider}
								onValueChange={(v) => {
									const provider = v ?? "google";
									setAddProvider(provider);
									const opts = PROVIDER_MODELS[provider];
									setAddModel(opts?.[0] ?? "");
								}}
							>
								<SelectTrigger id="add-provider" size="sm">
									<SelectValue placeholder="Select provider" />
								</SelectTrigger>
								<SelectContent>
									{Object.keys(PROVIDER_MODELS).map((p) => (
										<SelectItem key={p} value={p}>
											{p.charAt(0).toUpperCase() + p.slice(1)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="add-model">Model</Label>
							<Select
								value={addModel}
								onValueChange={(v) => setAddModel(v ?? "")}
							>
								<SelectTrigger id="add-model" size="sm">
									<SelectValue placeholder="Select model" />
								</SelectTrigger>
								<SelectContent>
									{(PROVIDER_MODELS[addProvider] ?? []).map((m) => (
										<SelectItem key={m} value={m}>
											{m}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="add-api-key">API key</Label>
							<Input
								id="add-api-key"
								type="password"
								value={addApiKey}
								onChange={(e) => setAddApiKey(e.target.value)}
								placeholder="Your API key"
								autoComplete="off"
								className="font-mono text-xs"
							/>
						</div>
						{addError && <p className="text-destructive text-xs">{addError}</p>}
						<DialogFooter showCloseButton={false}>
							<Button
								type="button"
								variant="outline"
								onClick={() => setAddModalOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={addSaving}>
								{addSaving ? "Saving…" : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
