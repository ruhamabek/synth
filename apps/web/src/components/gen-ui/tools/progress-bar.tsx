"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAgentActions } from "../hooks/use-agent-actions";

export interface ProgressBarProps {
	title: string;
	description?: string;
	value: number; // 0 to 100
	status?: "loading" | "success" | "error" | "default";
	allowCancel?: boolean;
	allowComplete?: boolean;
	className?: string;
}

export function ProgressBar({
	title,
	description,
	value,
	status = "default",
	allowCancel = false,
	allowComplete = false,
	className,
}: ProgressBarProps) {
	const { callTool } = useAgentActions();

	const handleCancel = () => {
		callTool("cancelTask", { title });
	};

	const handleComplete = () => {
		callTool("completeTask", { title });
	};

	return (
		<Card className={cn("w-full", className)}>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>{title}</CardTitle>
						{description && <CardDescription>{description}</CardDescription>}
					</div>
					<div className="font-medium text-sm">{Math.round(value)}%</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<Progress value={value} className="h-3" />

				<div className="flex items-center justify-between pt-2">
					<div className="flex items-center gap-2">
						{status === "success" && (
							<div className="flex items-center font-medium text-emerald-600 text-sm">
								<CheckCircle2 className="mr-1 h-4 w-4" />
								Complete
							</div>
						)}
						{status === "error" && (
							<div className="flex items-center font-medium text-rose-600 text-sm">
								<XCircle className="mr-1 h-4 w-4" />
								Failed
							</div>
						)}
						{status === "loading" && (
							<div className="flex items-center text-muted-foreground text-sm">
								<div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
								In progress...
							</div>
						)}
					</div>

					<div className="flex gap-2">
						{allowCancel && value < 100 && (
							<Button variant="outline" size="sm" onClick={handleCancel}>
								Cancel
							</Button>
						)}
						{allowComplete && value >= 100 && status !== "success" && (
							<Button size="sm" onClick={handleComplete}>
								Mark Fixed
							</Button>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
