import { AlertCircle, RefreshCw, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CliOfflinePageProps {
	onRetry?: () => void;
}

export function CliOfflinePage({ onRetry }: CliOfflinePageProps) {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
			<div className="flex w-full max-w-md flex-col items-center text-center">
				{/* Error Icon */}
				<div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-destructive/20 bg-destructive/10">
					<AlertCircle className="h-8 w-8 text-destructive" />
				</div>

				{/* Error Message */}
				<h1 className="mb-2 font-semibold text-2xl text-foreground tracking-tight">
					CLI Offline
				</h1>
				<p className="mb-6 text-muted-foreground text-sm leading-relaxed">
					Cannot connect to the Synth CLI. Make sure the CLI is running on{" "}
					<code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
						localhost:4000
					</code>
					.
				</p>

				{/* Instructions */}
				<div className="mb-8 w-full rounded-lg border bg-card p-4 text-left">
					<div className="mb-3 flex items-center gap-2">
						<Terminal className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
							Troubleshooting
						</h3>
					</div>
					<ol className="space-y-2 text-muted-foreground text-sm">
						<li className="flex gap-2">
							<span className="font-mono text-foreground/60">1.</span>
							<span>
								Start the CLI by running:{" "}
								<code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
									synth
								</code>
							</span>
						</li>
						<li className="flex gap-2">
							<span className="font-mono text-foreground/60">2.</span>
							<span>Verify the CLI is running on port 4000</span>
						</li>
						<li className="flex gap-2">
							<span className="font-mono text-foreground/60">3.</span>
							<span>Check for firewall or network restrictions</span>
						</li>
					</ol>
				</div>

				{/* Retry Button */}
				{onRetry && (
					<Button
						onClick={onRetry}
						variant="default"
						size="default"
						className="w-full gap-2"
					>
						<RefreshCw className="h-4 w-4" />
						Retry Connection
					</Button>
				)}
			</div>
		</div>
	);
}
