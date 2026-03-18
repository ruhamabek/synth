import {
 	Columns,
 	Layout,
	Table2,
} from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function DatabaseModule() {
	const [selectedTable, setSelectedTable] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"structure" | "records">(
		"structure",
	);
	const tables = ["users", "posts", "comments", "profiles"];

	return (
		<div className="flex h-full w-full">
			{/* Sidebar */}
			<div className="flex w-56 shrink-0 flex-col border-r bg-background">
				<div className="px-4 py-3">
					<p className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
						Tables
					</p>
				</div>
				<ScrollArea className="flex-1 px-2">
					<div className="space-y-0.5 pb-4">
						{tables.map((table) => (
							<button
								type="button"
								key={table}
								onClick={() => setSelectedTable(table)}
								className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
									selectedTable === table
										? "bg-accent font-medium text-foreground"
										: "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
								}`}
							>
								<Table2 className="h-3.5 w-3.5 shrink-0" />
								<span className="truncate">{table}</span>
							</button>
						))}
					</div>
				</ScrollArea>
			</div>

			{/* Main Area */}
			<div className="flex flex-1 flex-col">
				{selectedTable ? (
					<>
						{/* Table Header */}
						<div className="flex items-center justify-between border-b px-6 py-3">
							<div className="flex items-center gap-2">
								<Table2 className="h-4 w-4 text-muted-foreground" />
								<h2 className="font-medium text-sm">{selectedTable}</h2>
							</div>
							<div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
								<button
									type="button"
									onClick={() => setViewMode("structure")}
									className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-all ${
										viewMode === "structure"
											? "bg-background text-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									<Columns className="h-3 w-3" />
									Structure
								</button>
								<button
									type="button"
									onClick={() => setViewMode("records")}
									className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium text-xs transition-all ${
										viewMode === "records"
											? "bg-background text-foreground shadow-sm"
											: "text-muted-foreground hover:text-foreground"
									}`}
								>
									<Layout className="h-3 w-3" />
									Records
								</button>
							</div>
						</div>

						{/* Table Content Placeholder */}
						<ScrollArea className="flex-1 p-6">
							<div className="animate-fade-in rounded-lg border bg-card">
								<div className="p-10">
									<div className="flex flex-col items-center justify-center text-center">
										{viewMode === "structure" ? (
											<>
												<Columns className="mb-3 h-8 w-8 text-muted-foreground/30" />
												<h3 className="font-medium text-sm">Table Structure</h3>
												<p className="mt-1 max-w-[220px] text-muted-foreground text-xs">
													Column definitions, types, and constraints for{" "}
													<span className="font-mono text-foreground/80">
														{selectedTable}
													</span>
												</p>
											</>
										) : (
											<>
												<Layout className="mb-3 h-8 w-8 text-muted-foreground/30" />
												<h3 className="font-medium text-sm">Table Records</h3>
												<p className="mt-1 max-w-[220px] text-muted-foreground text-xs">
													Browse and manage data in{" "}
													<span className="font-mono text-foreground/80">
														{selectedTable}
													</span>
												</p>
											</>
										)}
									</div>
								</div>
							</div>
						</ScrollArea>
					</>
				) : (
					/* Empty state: no table selected */
					<div className="flex flex-1 items-center justify-center">
						<div className="flex flex-col items-center text-center">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
								<Table2 className="h-5 w-5 text-muted-foreground/50" />
							</div>
							<h3 className="font-medium text-sm">Select a table</h3>
							<p className="mt-1 max-w-[220px] text-muted-foreground text-xs">
								Choose a table from the sidebar to view its schema and data.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}