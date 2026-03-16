import { useChat } from "@ai-sdk/react";
import { createFileRoute } from "@tanstack/react-router";
import { DefaultChatTransport } from "ai";
import { ChevronDownIcon, PlusIcon, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

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

const CLI_URL = "http://localhost:4000";

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

export const Route = createFileRoute("/ai")({
	component: RouteComponent,
});

function RouteComponent() {
	const [input, setInput] = useState("");
	const [models, setModels] = useState<AIModelSummary[]>([]);
	const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
	const [addModalOpen, setAddModalOpen] = useState(false);
	const [modelsError, setModelsError] = useState<string | null>(null);
	// Add model form state
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

	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: `${CLI_URL}/api/ai/chat`,
			body: () => ({ modelId: selectedModelId ?? "" }),
		}),
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const text = input.trim();
		if (!text || !selectedModelId) return;
		sendMessage({ text });
		setInput("");
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

	const selectedModel = models.find((m) => m.id === selectedModelId);
	const hasModels = models.length > 0;
	const canSend = hasModels && !!selectedModelId;

	return (
		<div className="mx-auto grid w-full grid-rows-[1fr_auto] overflow-hidden p-4">
			<div className="space-y-4 overflow-y-auto pb-4">
				{modelsError && (
					<div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 text-xs dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
						{modelsError}
					</div>
				)}
				{messages.length === 0 && !modelsError && (
					<div className="mt-8 text-center text-muted-foreground">
						{hasModels
							? "Ask me anything to get started!"
							: "Add a model to start chatting."}
					</div>
				)}
				{messages.length > 0 &&
					messages.map((message) => (
						<div
							key={message.id}
							className={`rounded-lg p-3 ${
								message.role === "user"
									? "ml-8 bg-primary/10"
									: "mr-8 bg-secondary/20"
							}`}
						>
							<p className="mb-1 font-semibold text-sm">
								{message.role === "user" ? "You" : "AI Assistant"}
							</p>
							{message.parts?.map((part, _index) => {
								if (part.type === "text") {
									return (
										<Streamdown
											key={part.text}
											isAnimating={
												status === "streaming" && message.role === "assistant"
											}
										>
											{part.text}
										</Streamdown>
									);
								}
								return null;
							})}
						</div>
					))}
				<div ref={messagesEndRef} />
			</div>

			<form
				onSubmit={handleSubmit}
				className="flex w-full items-center gap-2 border-t pt-2"
			>
				<Input
					name="prompt"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					className="flex-1"
					autoComplete="off"
					autoFocus
					disabled={!canSend}
				/>
				{hasModels ? (
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="shrink-0"
								>
									{selectedModel?.name ?? selectedModel?.model ?? "Model"}
									<ChevronDownIcon className="ml-1 size-4" />
								</Button>
							}
						/>
						<DropdownMenuContent align="end">
							{models.map((m) => (
								<DropdownMenuItem
									key={m.id}
									onClick={() => setSelectedModelId(m.id)}
								>
									{m.name ?? m.model}
								</DropdownMenuItem>
							))}
							<DropdownMenuItem onClick={handleAddModel}>
								<PlusIcon className="mr-2 size-4" />
								Add model
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={handleAddModel}
					>
						Add model
					</Button>
				)}
				<Button type="submit" size="icon" disabled={!canSend}>
					<Send size={18} />
				</Button>
			</form>

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
