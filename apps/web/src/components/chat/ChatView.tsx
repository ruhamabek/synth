import { ChevronDown, Sparkles } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ChatView({
	messages,
	input,
	onChange,
	onSubmit,
	isLoading,
	onStop,
	models = [],
	selectedModelId,
	onModelChange,
	error,
}: {
	messages: Array<{ role: string; content: string }>;
	input: string;
	onChange: (value: string) => void;
	onSubmit: (e: React.FormEvent) => void;
	isLoading?: boolean;
	onStop?: () => void;
	models?: Array<{ id: string; provider: string; model: string; name?: string }>;
	selectedModelId?: string | null;
	onModelChange?: (id: string) => void;
	error?: Error | null;
}) {
	const selectedModel = models.find((m) => m.id === selectedModelId);

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 space-y-5 overflow-y-auto p-4">
				{messages.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 text-center">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
							<Sparkles className="h-6 w-6 text-primary" />
						</div>
						<h3 className="font-semibold text-lg">Synth AI</h3>
						<p className="mt-1 max-w-[240px] text-muted-foreground text-sm">
							How can I help you build your UI today?
						</p>
					</div>
				)}

				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${
							msg.role === "user" ? "justify-end" : "justify-start"
						}`}
					>
						<div
							className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
								msg.role === "user"
									? "bg-primary text-primary-foreground shadow-sm"
									: "bg-muted text-foreground"
							}`}
						>
							<p className="whitespace-pre-wrap text-[14px] leading-relaxed">
								{msg.content}
							</p>
						</div>
					</div>
				))}

				{error && (
					<div className="mx-auto max-w-[90%] rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
						{error.message}
					</div>
				)}

				{isLoading && (
					<div className="flex justify-start">
						<div className="bg-muted flex items-center gap-2 rounded-2xl px-4 py-2.5">
							<div className="flex gap-1">
								<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.3s]" />
								<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50 [animation-delay:-0.15s]" />
								<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/50" />
							</div>
							<span className="text-muted-foreground text-xs">Generating...</span>
						</div>
					</div>
				)}
			</div>

			<div className="border-t p-4">
				<form
					onSubmit={onSubmit}
					className="flex flex-col overflow-hidden rounded-xl border bg-muted/30 focus-within:border-primary/30"
				>
					<textarea
						value={input}
						onChange={(e) => onChange(e.target.value)}
						placeholder="Message Synth AI..."
						disabled={isLoading}
						rows={2}
						className="w-full resize-none bg-transparent px-4 py-3 text-sm focus:outline-none disabled:opacity-50"
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								onSubmit(e as any);
							}
						}}
					/>
					<div className="flex items-center justify-between border-t border-border/40 px-3 py-2">
						<div className="flex items-center gap-2">
							{models.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger
										render={
											<Button
												variant="ghost"
												size="sm"
												className="h-7 gap-1 px-2 text-[11px] font-medium"
											>
												{selectedModel?.name || selectedModel?.model || "Model"}
												<ChevronDown className="h-3 w-3 opacity-50" />
											</Button>
										}
									/>
									<DropdownMenuContent align="start" className="w-[180px]">
										{models.map((m) => (
											<DropdownMenuItem
												key={m.id}
												onClick={() => onModelChange?.(m.id)}
												className="text-xs"
											>
												{m.name || m.model}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>

						{isLoading ? (
							<Button
								type="button"
								size="sm"
								variant="destructive"
								onClick={onStop}
								className="h-8 rounded-full px-4 text-xs font-medium"
							>
								Stop
							</Button>
						) : (
							<Button
								type="submit"
								size="sm"
								disabled={!input.trim() || !selectedModelId}
								className="h-8 rounded-full px-4 text-xs font-medium"
							>
								Send
							</Button>
						)}
					</div>
				</form>
				<p className="mt-2 text-center text-[10px] text-muted-foreground">
					Synth AI can make mistakes. Check important info.
				</p>
			</div>
		</div>
	);
}
