import { Plus } from "lucide-react";

export function ConversationList({
	conversations,
	onSelect,
	onDelete,
	activeId,
	onNew,
}: {
	conversations: Array<{
		id: string;
		title: string;
		messageCount: number;
		updatedAt: string;
	}>;
	onSelect: (id: string) => void;
	onDelete: (id: string) => void;
	activeId?: string;
	onNew?: () => void;
}) {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between border-b p-3">
				<h2 className="font-semibold text-sm">Conversations</h2>
				<button
					type="button"
					onClick={onNew}
					className="rounded-md p-1 hover:bg-accent"
				>
					<Plus className="h-4 w-4" />
				</button>
			</div>
			<div className="flex-1 space-y-1 overflow-y-auto p-2">
				{conversations.length === 0 ? (
					<p className="p-2 text-muted-foreground text-xs">
						No conversations yet
					</p>
				) : (
					conversations.map((conv) => {
						const isActive = activeId === conv.id;
						return (
							<div
								key={conv.id}
								className={`group flex items-center justify-between rounded-md p-2 transition-colors ${
									isActive ? "bg-accent" : "hover:bg-accent/50"
								}`}
							>
								<button
									type="button"
									onClick={() => onSelect(conv.id)}
									className={`flex-1 truncate text-left text-sm ${isActive ? "font-medium" : ""}`}
								>
									{conv.title || "Untitled"}
								</button>
								<button
									type="button"
									onClick={() => onDelete(conv.id)}
									className="px-1 text-muted-foreground opacity-0 hover:text-destructive group-hover:opacity-100"
								>
									×
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
}
