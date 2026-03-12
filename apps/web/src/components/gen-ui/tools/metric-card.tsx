import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentActions } from "../hooks/use-agent-actions";

interface MetricCardProps {
	title: string;
	value: string | number;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	icon?: React.ReactNode;
}

export function GenUIMetricCard({
	title,
	value,
	trend,
	icon,
}: MetricCardProps) {
	const { callTool } = useAgentActions();
	return (
		<Card
			className="cursor-pointer rounded-2xl border-none bg-linear-to-br from-card to-muted/20 shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
			onClick={() => callTool("onMetricClick", { title, value, trend })}
		>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
					{title}
				</CardTitle>
				{icon && (
					<div className="rounded-xl bg-primary/10 p-2 text-primary">
						{icon}
					</div>
				)}
			</CardHeader>
			<CardContent>
				<div className="font-bold text-3xl tracking-tight">{value}</div>
				{trend && (
					<div
						className={`mt-1 flex items-center font-semibold text-xs ${trend.isPositive ? "text-emerald-500" : "text-rose-500"}`}
					>
						{trend.isPositive ? (
							<ArrowUpIcon className="mr-1 h-3 w-3" />
						) : (
							<ArrowDownIcon className="mr-1 h-3 w-3" />
						)}
						{trend.value}%
						<span className="ml-1 font-normal text-muted-foreground">
							vs last month
						</span>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
