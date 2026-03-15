import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
	ArrowRight,
	ChevronRight,
	Database,
	Loader2,
	Plus,
	Terminal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CliOfflinePage } from "@/components/cli-offline-page";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/")({
	component: HomeComponent,
});

const CLI_URL = "http://localhost:4000";

function HomeComponent() {
	const navigate = useNavigate();
	const [cliStatus, setCliStatus] = useState<"loading" | "online" | "offline">(
		"loading",
	);
	const [projects, setProjects] = useState<string[]>([]);
	const [isCreating, setIsCreating] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [name, setName] = useState("");
	const [dbType, setDbType] = useState("postgresql");
	const [connectionUrl, setConnectionUrl] = useState("");

	useEffect(() => {
		checkCli();
		fetchProjects();
	}, []);

	const checkCli = async () => {
		setCliStatus("loading");
		try {
			const res = await fetch(`${CLI_URL}/api/health`, {
				signal: AbortSignal.timeout(5000), // 5 second timeout
			});
			if (res.ok) {
				setCliStatus("online");
			} else {
				setCliStatus("offline");
			}
		} catch {
			setCliStatus("offline");
		}
	};

	const fetchProjects = async () => {
		try {
			const res = await fetch(`${CLI_URL}/api/projects`);
			const data = await res.json();
			if (data.success) {
				setProjects(data.projects);
			}
		} catch (err) {
			console.error("Failed to fetch projects", err);
		}
	};

	const handleCreateProject = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !connectionUrl) {
			toast.error("Please fill in all fields");
			return;
		}

		setIsCreating(true);
		try {
			const res = await fetch(`${CLI_URL}/api/projects`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, dbType, connectionString: connectionUrl }),
			});
			const data = await res.json();
			if (data.success) {
				toast.success("Project created successfully!");
				navigate({ to: "/$projectName", params: { projectName: name } });
			} else {
				toast.error(data.error || "Failed to create project");
			}
		} catch (err: any) {
			toast.error(err.message || "An error occurred");
		} finally {
			setIsCreating(false);
		}
	};

	// Show CLI offline page if CLI is offline
	if (cliStatus === "offline") {
		return <CliOfflinePage onRetry={checkCli} />;
	}

	return (
		<div className="flex min-h-screen flex-col bg-background">
			{/* Navigation */}
			<header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
				<div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
					<div className="flex items-center gap-6">
						<Link to="/" className="flex items-center gap-2.5">
							<div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground">
								<Database className="h-3.5 w-3.5 text-background" />
							</div>
							<span className="font-semibold text-sm tracking-tight">
								Synth
							</span>
						</Link>

						<nav className="hidden items-center gap-1 sm:flex">
							<Link
								to="/"
								className="rounded-md px-3 py-1.5 font-medium text-foreground text-sm transition-colors"
							>
								Projects
							</Link>
							<Link
								to="/ai"
								className="rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground"
							>
								AI Chat
							</Link>
						</nav>
					</div>

					<div className="flex items-center gap-2">
						<ThemeToggle />
						<div className="h-4 w-px bg-border" />
						{/* CLI Status */}
						<div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
							<div
								className={`h-1.5 w-1.5 rounded-full ${
									cliStatus === "online"
										? "bg-emerald-500"
										: cliStatus === "loading"
											? "animate-pulse-subtle bg-amber-500"
											: "bg-red-500"
								}`}
							/>
							<span className="text-muted-foreground text-xs">
								{cliStatus === "online"
									? "Connected"
									: cliStatus === "loading"
										? "Connecting..."
										: "CLI Offline"}
							</span>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
				{/* Page Header */}
				<div className="mb-10 flex items-end justify-between">
					<div>
						<h1 className="font-semibold text-2xl tracking-tight">Projects</h1>
						<p className="mt-1 text-muted-foreground text-sm">
							Manage your AI-powered database projects.
						</p>
					</div>
					<Button
						onClick={() => setShowCreateForm(!showCreateForm)}
						size="sm"
						className="h-9 gap-2 rounded-lg px-4 text-sm"
					>
						<Plus className="h-4 w-4" />
						New Project
					</Button>
				</div>

				{/* Create Project Form */}
				{showCreateForm && (
					<div className="mb-10 animate-fade-in rounded-xl border bg-card p-6">
						<div className="mb-5">
							<h2 className="font-medium text-base">Initialize Project</h2>
							<p className="mt-1 text-muted-foreground text-sm">
								Connect a database to introspect its schema and start exploring.
							</p>
						</div>
						<form
							onSubmit={handleCreateProject}
							className="grid gap-5 sm:grid-cols-2"
						>
							<div className="space-y-2">
								<Label
									htmlFor="name"
									className="font-medium text-muted-foreground text-xs"
								>
									Project Name
								</Label>
								<Input
									id="name"
									placeholder="my-project"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
									className="h-10 bg-background"
								/>
							</div>
							<div className="space-y-2">
								<Label
									htmlFor="dbType"
									className="font-medium text-muted-foreground text-xs"
								>
									Database Type
								</Label>
								<Select
									value={dbType}
									onValueChange={(val) => val && setDbType(val)}
								>
									<SelectTrigger id="dbType" className="h-10 bg-background">
										<SelectValue placeholder="Select DB type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="postgresql">PostgreSQL</SelectItem>
										<SelectItem value="mysql">MySQL</SelectItem>
										<SelectItem value="sqlite">SQLite</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2 sm:col-span-2">
								<Label
									htmlFor="url"
									className="font-medium text-muted-foreground text-xs"
								>
									Connection URL
								</Label>
								<Input
									id="url"
									placeholder="postgres://user:pass@localhost:5432/db"
									value={connectionUrl}
									onChange={(e) => setConnectionUrl(e.target.value)}
									required
									className="h-10 bg-background font-mono text-xs"
								/>
							</div>
							<div className="flex items-center gap-3 sm:col-span-2">
								<Button
									type="submit"
									size="sm"
									className="h-9 gap-2 px-5"
									disabled={isCreating || cliStatus !== "online"}
								>
									{isCreating ? (
										<>
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
											Connecting...
										</>
									) : (
										<>
											Connect & Introspect
											<ArrowRight className="h-3.5 w-3.5" />
										</>
									)}
								</Button>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-9 text-muted-foreground"
									onClick={() => setShowCreateForm(false)}
								>
									Cancel
								</Button>
								{cliStatus !== "online" && cliStatus !== "loading" && (
									<p className="text-red-500 text-xs">
										Start the CLI first to create projects.
									</p>
								)}
							</div>
						</form>
					</div>
				)}

				{/* Projects List */}
				{projects.length === 0 ? (
					<div className="flex animate-fade-in flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
							<Terminal className="h-5 w-5 text-muted-foreground" />
						</div>
						<h3 className="font-medium text-foreground text-sm">
							No projects yet
						</h3>
						<p className="mt-1.5 max-w-[280px] text-muted-foreground text-sm">
							Create a project to connect a database and start exploring its
							schema.
						</p>
						{!showCreateForm && (
							<Button
								variant="outline"
								size="sm"
								className="mt-5 h-9 gap-2 rounded-lg"
								onClick={() => setShowCreateForm(true)}
							>
								<Plus className="h-3.5 w-3.5" />
								Create your first project
							</Button>
						)}
					</div>
				) : (
					<div className="stagger-children space-y-2">
						{projects.map((project) => (
							<button
								type="button"
								key={project}
								className="group flex w-full items-center justify-between rounded-lg border bg-card p-4 text-left transition-all hover:border-foreground/20 hover:bg-accent/50"
								onClick={() =>
									navigate({
										to: "/$projectName",
										params: { projectName: project },
									})
								}
							>
								<div className="flex items-center gap-4">
									<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-foreground group-hover:text-background">
										<Database className="h-4 w-4" />
									</div>
									<div>
										<h3 className="font-medium text-sm">{project}</h3>
										<p className="text-muted-foreground text-xs">
											Local Project
										</p>
									</div>
								</div>
								<ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
							</button>
						))}
					</div>
				)}
			</main>

			{/* Footer */}
			<footer className="border-t">
				<div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-6 text-muted-foreground text-xs">
					<span>Synth</span>
				</div>
			</footer>
		</div>
	);
}
