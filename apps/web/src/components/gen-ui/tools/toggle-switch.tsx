"use client";

import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useAgentActions } from "../hooks/use-agent-actions";

export interface ToggleSwitchProps {
	title: string;
	description?: string;
	initialChecked?: boolean;
	label?: string;
	className?: string;
}

export function ToggleSwitch({
	title,
	description,
	initialChecked = false,
	label,
	className,
}: ToggleSwitchProps) {
	const { callTool } = useAgentActions();
	const [checked, setChecked] = useState(initialChecked);

	const handleToggle = (val: boolean) => {
		setChecked(val);
		callTool("toggleSetting", { settingTitle: title, value: val });
	};

	return (
		<Card className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle className="text-lg">{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<div className="flex items-center justify-between space-x-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
					<Label
						htmlFor={`toggle-${title}`}
						className="cursor-pointer font-bold text-sm uppercase tracking-tight"
					>
						{label || "Enable Feature"}
					</Label>
					<Switch
						id={`toggle-${title}`}
						checked={checked}
						onCheckedChange={handleToggle}
						className="data-[state=checked]:bg-primary"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
