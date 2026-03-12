"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAgentActions } from "../hooks/use-agent-actions";

export interface ThemeToggleProps {
	title?: string;
	description?: string;
	initialTheme?: "light" | "dark" | "system";
	className?: string;
}

export function ThemeToggle({
	title = "Appearance",
	description = "Customize how the interface looks on your device.",
	initialTheme = "system",
	className,
}: ThemeToggleProps) {
	const { callTool } = useAgentActions();
	const [theme, setTheme] = useState(initialTheme);

	const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
		setTheme(newTheme);
		callTool("toggleTheme", { theme: newTheme });
	};

	return (
		<Card className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-1">
					<button
						type="button"
						onClick={() => handleThemeChange("light")}
						className={cn(
							"flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
							theme === "light"
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:bg-muted/50",
						)}
					>
						<Sun className="h-5 w-5" />
						<span className="font-bold text-[10px] uppercase tracking-wider">
							Light
						</span>
					</button>

					<button
						type="button"
						onClick={() => handleThemeChange("dark")}
						className={cn(
							"flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
							theme === "dark"
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:bg-muted/50",
						)}
					>
						<Moon className="h-5 w-5" />
						<span className="font-bold text-[10px] uppercase tracking-wider">
							Dark
						</span>
					</button>

					<button
						type="button"
						onClick={() => handleThemeChange("system")}
						className={cn(
							"flex flex-col items-center gap-2 rounded-lg p-3 transition-all",
							theme === "system"
								? "bg-background text-primary shadow-sm"
								: "text-muted-foreground hover:bg-muted/50",
						)}
					>
						<Laptop className="h-5 w-5" />
						<span className="font-bold text-[10px] uppercase tracking-wider">
							System
						</span>
					</button>
				</div>
			</CardContent>
		</Card>
	);
}
