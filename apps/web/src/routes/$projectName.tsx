import { createFileRoute} from "@tanstack/react-router";
import {  useState } from "react";
import { CliOfflinePage } from "@/components/cli-offline-page";
import { DatabaseModule } from "@/components/project/DatabaseModule";
import { AIModule } from "@/components/project/AIModule";
import { useCliStatus } from "@/hooks/useCliStatus";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/$projectName")({
	component: ProjectDashboard,
});


function ProjectDashboard() {
	const { projectName } = Route.useParams();
	const [activeTab, setActiveTab] = useState<"database" | "ai">("database");

	const { status, retry } = useCliStatus();

	if (status === "offline") {
		return <CliOfflinePage onRetry={retry} />;
	}

	return (
		<div className="flex h-screen flex-col">
			<header className="flex h-12 items-center justify-between border-b px-4">
				<div className="flex items-center gap-2">
					<div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
						<span className="text-[10px] font-bold text-primary">S</span>
					</div>
					<h1 className="text-sm font-semibold">{projectName}</h1>
				</div>

				<Tabs 
					value={activeTab} 
					onValueChange={(v) => setActiveTab(v as "database" | "ai")}
				>
					<TabsList variant="line">
						<TabsTrigger value="database" className="gap-2">
							<Database className="h-3.5 w-3.5" />
							Database
						</TabsTrigger>
						<TabsTrigger value="ai" className="gap-2">
							<Sparkles className="h-3.5 w-3.5" />
							AI Explorer
						</TabsTrigger>
					</TabsList>
				</Tabs>

				<div className="flex items-center gap-2">
					<ThemeToggle />
				</div>
			</header>

			<main className="flex-1 overflow-hidden">
				{activeTab === "database" ? (
					<DatabaseModule />
				) : (
					<AIModule projectName={projectName} />
				)}
			</main>
		</div>
	);
}