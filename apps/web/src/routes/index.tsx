import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Database, Loader2, Plus, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
	const [name, setName] = useState("");
	const [dbType, setDbType] = useState("postgresql");
	const [connectionUrl, setConnectionUrl] = useState("");

	useEffect(() => {
		checkCli();
		fetchProjects();
	}, []);

	const checkCli = async () => {
		try {
			const res = await fetch(`${CLI_URL}/api/health`);
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

	return (
		<div className="container mx-auto max-w-5xl px-4 py-12">
			<div className="mb-12 flex items-center justify-between">
				<div>
					<h1 className="font-bold text-4xl tracking-tight">Synth CLI</h1>
					<p className="mt-2 text-muted-foreground">
						Manage your AI-powered database projects locally.
					</p>
				</div>
				<div className="flex items-center gap-2 rounded-full border bg-secondary/50 px-4 py-2">
					<div
						className={`h-2 w-2 rounded-full ${cliStatus === "online" ? "bg-green-500" : cliStatus === "loading" ? "bg-yellow-500" : "bg-red-500"}`}
					/>
					<span className="font-medium text-sm">
						CLI: {cliStatus.charAt(0).toUpperCase() + cliStatus.slice(1)}
					</span>
				</div>
			</div>

			<div className="grid gap-8 md:grid-cols-2">
				{/* Create Project Section */}
				<Card className="border-border shadow-md">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Plus className="h-5 w-5" /> Initialize Project
						</CardTitle>
						<CardDescription>
							Connect your database to begin. Schema metadata will be saved
							locally.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCreateProject} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="name">Project Name</Label>
								<Input
									id="name"
									placeholder="my-cool-project"
									value={name}
									onChange={(e) => setName(e.target.value)}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="dbType">Database Type</Label>
								<Select
									value={dbType}
									onValueChange={(val) => val && setDbType(val)}
								>
									<SelectTrigger id="dbType">
										<SelectValue placeholder="Select DB type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="postgresql">PostgreSQL</SelectItem>
										<SelectItem value="mysql">MySQL</SelectItem>
										<SelectItem value="sqlite">SQLite</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-2">
								<Label htmlFor="url">Connection URL</Label>
								<Input
									id="url"
									placeholder="postgres://user:pass@localhost:5432/db"
									value={connectionUrl}
									onChange={(e) => setConnectionUrl(e.target.value)}
									required
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={isCreating || cliStatus !== "online"}
							>
								{isCreating ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Connecting & Introspecting...
									</>
								) : (
									"Connect & Introspect"
								)}
							</Button>
							{cliStatus !== "online" && cliStatus !== "loading" && (
								<p className="mt-2 text-center text-red-500 text-xs">
									Please start the CLI to create projects.
								</p>
							)}
						</form>
					</CardContent>
				</Card>

				{/* Projects List Section */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-xl">Your Projects</h2>
						<span className="font-bold text-muted-foreground text-xs uppercase tracking-wider">
							{projects.length} Projects
						</span>
					</div>

					{projects.length === 0 ? (
						<div className="flex flex-col items-center justify-center rounded-lg border border-border border-dashed bg-muted/30 p-12 text-center">
							<Terminal className="mb-4 h-12 w-12 text-muted-foreground/30" />
							<p className="text-muted-foreground text-sm">
								No projects found. Create one to get started.
							</p>
						</div>
					) : (
						<div className="grid gap-4">
							{projects.map((project) => (
								<Card
									key={project}
									className="group cursor-pointer transition-all hover:border-black"
									onClick={() =>
										navigate({
											to: "/$projectName",
											params: { projectName: project },
										})
									}
								>
									<CardContent className="flex items-center justify-between p-4">
										<div className="flex items-center gap-4">
											<div className="rounded-md bg-secondary p-2 transition-colors group-hover:bg-black group-hover:text-white">
												<Database className="h-5 w-5" />
											</div>
											<div>
												<h3 className="font-medium">{project}</h3>
												<p className="text-muted-foreground text-xs">
													Local Project
												</p>
											</div>
										</div>
										<Button
											variant="ghost"
											size="sm"
											className="opacity-0 transition-opacity group-hover:opacity-100"
										>
											Open
										</Button>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
