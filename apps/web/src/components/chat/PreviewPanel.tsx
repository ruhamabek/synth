import {
	ActionProvider,
	Renderer,
	StateProvider,
	ValidationProvider,
	VisibilityProvider,
	type Spec,
} from "@json-render/react";
import { registry } from "@/lib/json-render-registry";
import { Loader2, Sparkles } from "lucide-react";

export function PreviewPanel({
	spec,
	isLoading,
}: {
	spec: Spec | null;
	isLoading?: boolean;
}) {
	if (!spec) {
		return (
			<div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden p-16">
				<div className="absolute inset-0 bg-[radial-gradient(oklch(0.3_0_0)_1px,transparent_1px)] opacity-20 [background-size:20px_20px]" />
				<div className="relative z-10 flex flex-col items-center">
					<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border bg-muted/30">
						<Sparkles className="h-4 w-4 text-muted-foreground/50" />
					</div>
					<p className="font-medium text-sm">Canvas is empty</p>
					<p className="mt-1 text-center text-muted-foreground text-xs text-balance opacity-60">
						Describe a UI in the chat to generate it using JSON Render
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="relative h-full w-full overflow-y-auto p-6">
			{isLoading && (
				<div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full border bg-background/80 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
					<Loader2 className="h-3 w-3 animate-spin text-primary" />
					<span>Streaming UI...</span>
				</div>
			)}
			<div className="w-full rounded-xl border bg-card p-6 shadow-sm">
				<StateProvider initialState={{}}>
					<VisibilityProvider>
						<ActionProvider
							handlers={{
								submit: (params) => {
									console.log("Submit action triggered:", params);
								},
								navigate: (params) => {
									console.log("Navigate action triggered:", params);
								},
							}}
						>
							<ValidationProvider customFunctions={{}}>
								<Renderer spec={spec} registry={registry} loading={isLoading} />
							</ValidationProvider>
						</ActionProvider>
					</VisibilityProvider>
				</StateProvider>
			</div>
		</div>
	);
}