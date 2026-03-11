"use client";

import { useUIStream, Renderer, StateProvider, ActionProvider, VisibilityProvider, ValidationProvider } from "@json-render/react";
import { Code, MessageSquare, SendIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { registry } from "@/lib/json-render-registry";

interface JsonRenderChatProps {
	schema?: unknown;
}

export function JsonRenderChat({ schema: _schema }: JsonRenderChatProps) {
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	// Get API URL from environment or use default
	const apiUrl =
		typeof window !== "undefined"
			? (window as unknown as { ENV?: { VITE_SYNTH_API_URL?: string } }).ENV
					?.VITE_SYNTH_API_URL || "http://localhost:4000"
			: "http://localhost:4000";

	const { spec, isStreaming, error, send, clear } = useUIStream({
		api: `${apiUrl}/api/ai-json-render`,
	});

	// Scroll to bottom when messages change
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const text = input.trim();
		if (!text || isStreaming) return;

		send(text);
		setInput("");
	};

	return (
		<div className="flex h-full w-full">
			{/* Left: Chat Interface */}
			<div className="flex w-[380px] shrink-0 flex-col border-r bg-background">
				<div className="flex items-center gap-2 border-b px-4 py-3">
					<MessageSquare className="h-4 w-4 text-muted-foreground" />
					<h3 className="font-medium text-sm">Chat</h3>
					<div className="ml-auto">
						<span
							className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
								isStreaming
									? "bg-yellow-500/20 text-yellow-500"
									: "bg-emerald-500/20 text-emerald-500"
							}`}
						>
							{isStreaming ? "Loading" : "Ready"}
						</span>
					</div>
				</div>
				<div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
					<div className="space-y-5">
						{!spec && (
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

						{error && (
							<div className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-500">
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
							placeholder="Describe your UI... (e.g., 'Show me a table of users')"
							className="min-h-[56px] w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none"
							rows={2}
							disabled={isStreaming}
						/>
						<div className="flex items-center justify-between border-border/50 border-t px-3 py-2">
							<span className="font-medium text-[10px] text-muted-foreground/60 uppercase tracking-wider">
								Enter to send
							</span>
							<Button
								type="submit"
								size="icon"
								className="h-7 w-7 rounded-full"
								disabled={isStreaming || !input.trim()}
							>
								<SendIcon className="-ml-0.5 h-3 w-3" />
							</Button>
						</div>
					</form>
				</div>
			</div>

			{/* Right: Preview */}
			<div className="flex flex-1 flex-col">
				<div className="flex items-center justify-between border-b px-4 py-3">
					<span className="text-muted-foreground text-sm">Preview</span>
					<Button
						variant="outline"
						size="sm"
						className="h-7 gap-1.5 rounded-lg border-dashed px-3 text-[11px]"
						onClick={() => clear()}
					>
						<Code className="h-3 w-3" />
						Clear
					</Button>
				</div>
				<div className="flex flex-1 items-center justify-center overflow-auto p-6">
					{spec ? (
						<div className="w-full max-w-2xl rounded-xl border bg-card p-6 shadow-sm">
							<StateProvider initialState={{}}>
								<VisibilityProvider>
									<ActionProvider handlers={{
										submit: (_params) => {
											// Handle submit action
										},
										navigate: (_params) => {
											// Handle navigate action
										},
									}}>
										<ValidationProvider customFunctions={{}}>
											<Renderer spec={spec} registry={registry} loading={isStreaming} />
										</ValidationProvider>
									</ActionProvider>
								</VisibilityProvider>
							</StateProvider>
						</div>
					) : (
						<div className="relative flex w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-xl border p-16">
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
		</div>
	);
}
