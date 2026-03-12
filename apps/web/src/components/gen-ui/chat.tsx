"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { DatabaseIcon, SendIcon, SparklesIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AccordionContent } from "./tools/accordion-content";
import { AvatarCard } from "./tools/avatar-card";
import { CartSummaryPanel } from "./tools/cart-summary-panel";
import { GenUIChart } from "./tools/chart";
import { ChecklistWithProgress } from "./tools/checklist-with-progress";
import { ColumnToggleTable } from "./tools/column-toggle-table";
import { CrudDataTable } from "./tools/crud-data-table";
import { GenUIDataTable } from "./tools/data-table";
import { EditableDataTable } from "./tools/editable-data-table";
import { FallbackComponent } from "./tools/fallback-component";
import { GenUIMetricCard } from "./tools/metric-card";
import { MetricCardGrid } from "./tools/metric-card-grid";
import { MultiStepForm } from "./tools/multi-step-form";
import { OrderStatusTracker } from "./tools/order-status-tracker";
import { PaymentDetailsForm } from "./tools/payment-details-form";
import { ProductCatalogGrid } from "./tools/product-catalog-grid";
import { ProgressBar } from "./tools/progress-bar";
import { RatingSelector } from "./tools/rating-selector";
import { SearchWithFilters } from "./tools/search-with-filters";
import { TabLayout } from "./tools/tab-layout";
import { TeamMemberList } from "./tools/team-member-list";
import { ThemeToggle } from "./tools/theme-toggle";
import { ThreadedComments } from "./tools/threaded-comments";
import { ToastStack } from "./tools/toast-stack";
import { ToggleSwitch } from "./tools/toggle-switch";
import { GenUIUserForm } from "./tools/user-form";

interface GenerativeUIChatProps {
	schema: any;
}

export function GenerativeUIChat({ schema }: GenerativeUIChatProps) {
	const [input, setInput] = useState("");
	const scrollRef = useRef<HTMLDivElement>(null);

	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: "/api/gen-ui",
			body: {
				schema,
			},
		}),
	});

	const isLoading = status === "streaming" || status === "submitted";

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const text = input.trim();
		if (!text || isLoading) return;

		sendMessage({ role: "user", parts: [{ type: "text", text }] });
		setInput("");
	};

	return (
		<div className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden border-x bg-background/50 shadow-2xl backdrop-blur-xl">
			{/* Header */}
			<div className="flex items-center justify-between border-b bg-muted/30 p-4">
				<div className="flex items-center space-x-2">
					<div className="rounded-xl bg-primary p-2 text-primary-foreground shadow-lg shadow-primary/20">
						<SparklesIcon className="h-5 w-5" />
					</div>
					<div>
						<h2 className="font-bold text-sm uppercase tracking-tight">
							Synth Generative UI
						</h2>
						<div className="flex items-center font-medium text-[10px] text-muted-foreground uppercase tracking-widest">
							<DatabaseIcon className="mr-1 h-3 w-3" />
							Connected to Schema
						</div>
					</div>
				</div>
				<div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 font-bold text-[10px] text-emerald-500 uppercase tracking-tighter">
					{status}
				</div>
			</div>

			{/* Messages Area */}
			<div
				ref={scrollRef}
				className="flex-1 space-y-8 overflow-y-auto scroll-smooth p-6"
			>
				{messages.length === 0 && (
					<div className="flex h-full flex-col items-center justify-center space-y-4 text-center opacity-50">
						<div className="rounded-full bg-muted p-4">
							<SparklesIcon className="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<p className="font-medium text-sm">
								How should I build your dashboard today?
							</p>
							<p className="mt-1 text-muted-foreground text-xs">
								Try: "Show me a table of recent orders with total revenue
								metrics"
							</p>
						</div>
					</div>
				)}

				{messages.map((message) => (
					<div
						key={message.id}
						className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
					>
						<div
							className={`max-w-[85%] space-y-2 ${message.role === "user" ? "rounded-2xl bg-primary px-4 py-2 text-primary-foreground shadow-lg shadow-primary/10" : "w-full"}`}
						>
							{message.role === "user" ? (
								<p className="text-sm leading-relaxed">
									{message.parts?.[0]?.type === "text"
										? message.parts[0].text
										: ""}
								</p>
							) : (
								<div className="space-y-6">
									{message.parts?.map((part, index) => {
										if (part.type === "text") {
											return (
												<p
													// biome-ignore lint/suspicious/noArrayIndexKey: parts are ordered and don't have unique IDs
													key={`${message.id}-text-${index}`}
													className="font-medium text-foreground/80 text-sm leading-relaxed"
												>
													{part.text}
												</p>
											);
										}

										// AI SDK 5.0 Typed Tool Parts Rendering: tool-${toolName}
										if (part.type.startsWith("tool-")) {
											const toolName = part.type.replace("tool-", "");
											const state = (part as any).state;
											const output = (part as any).output;

											return (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: parts are ordered and don't have unique IDs
													key={`${message.id}-tool-${index}`}
													className="fade-in slide-in-from-bottom-2 animate-in duration-500"
												>
													{(state === "input-available" ||
														state === "input-streaming") && (
														<div className="flex items-center space-x-2 py-2 text-muted-foreground text-xs">
															<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
															<span>Gathering data for {toolName}...</span>
														</div>
													)}

													{state === "output-available" && (
														<div className="my-4">
															{toolName === "renderDataTable" && (
																<GenUIDataTable {...output} />
															)}
															{toolName === "renderMetricCard" && (
																<GenUIMetricCard {...output} />
															)}
															{toolName === "renderChart" && (
																<GenUIChart {...output} />
															)}
															{toolName === "renderUserForm" && (
																<GenUIUserForm {...output} />
															)}
															{toolName === "renderToastStack" && (
																<ToastStack {...output} />
															)}
															{toolName === "renderAccordion" && (
																<AccordionContent {...output} />
															)}
															{toolName === "renderCrudDataTable" && (
																<CrudDataTable {...output} />
															)}
															{toolName === "renderAvatarCard" && (
																<AvatarCard {...output} />
															)}
															{toolName === "renderCartSummaryPanel" && (
																<CartSummaryPanel {...output} />
															)}
															{toolName === "renderChecklistWithProgress" && (
																<ChecklistWithProgress {...output} />
															)}
															{toolName === "renderColumnToggleTable" && (
																<ColumnToggleTable {...output} />
															)}
															{toolName === "renderEditableDataTable" && (
																<EditableDataTable {...output} />
															)}
															{toolName === "renderFallbackComponent" && (
																<FallbackComponent {...output} />
															)}
															{toolName === "renderMetricCardGrid" && (
																<MetricCardGrid {...output} />
															)}
															{toolName === "renderMultiStepForm" && (
																<MultiStepForm {...output} />
															)}
															{toolName === "renderOrderStatusTracker" && (
																<OrderStatusTracker {...output} />
															)}
															{toolName === "renderPaymentDetailsForm" && (
																<PaymentDetailsForm {...output} />
															)}
															{toolName === "renderProductCatalogGrid" && (
																<ProductCatalogGrid {...output} />
															)}
															{toolName === "renderProgressBar" && (
																<ProgressBar {...output} />
															)}
															{toolName === "renderRatingSelector" && (
																<RatingSelector {...output} />
															)}
															{toolName === "renderSearchWithFilters" && (
																<SearchWithFilters {...output} />
															)}
															{toolName === "renderTabLayout" && (
																<TabLayout {...output} />
															)}
															{toolName === "renderTeamMemberList" && (
																<TeamMemberList {...output} />
															)}
															{toolName === "renderThemeToggle" && (
																<ThemeToggle {...output} />
															)}
															{toolName === "renderThreadedComments" && (
																<ThreadedComments {...output} />
															)}
															{toolName === "renderToggleSwitch" && (
																<ToggleSwitch {...output} />
															)}
														</div>
													)}

													{state === "output-error" && (
														<div className="my-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-destructive text-xs">
															Error rendering {toolName}:{" "}
															{(part as any).errorText || "Unknown error"}
														</div>
													)}
												</div>
											);
										}
										return null;
									})}
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{/* Input Area */}
			<div className="border-t bg-muted/5 p-6">
				<form
					onSubmit={handleSubmit}
					className="flex items-center space-x-3 rounded-2xl border bg-background p-1 shadow-inner transition-all focus-within:ring-2 focus-within:ring-primary/20"
				>
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="Describe your dashboard features..."
						className="h-11 flex-1 border-none bg-transparent font-medium text-sm placeholder:text-muted-foreground/50 focus-visible:ring-0"
						disabled={isLoading}
						autoComplete="off"
					/>
					<Button
						type="submit"
						size="icon"
						className={`h-10 w-10 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 ${isLoading ? "opacity-50" : ""}`}
						disabled={isLoading || !input.trim()}
					>
						<SendIcon className="h-4 w-4" />
					</Button>
				</form>
			</div>
		</div>
	);
}
