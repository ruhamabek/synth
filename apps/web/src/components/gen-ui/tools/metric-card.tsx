import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
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

export function GenUIMetricCard({ title, value, trend, icon }: MetricCardProps) {
    const { callTool } = useAgentActions();
    return (
        <Card
            className="rounded-2xl border-none shadow-lg bg-linear-to-br from-card to-muted/20 cursor-pointer hover:shadow-xl transition-all active:scale-[0.98]"
            onClick={() => callTool("onMetricClick", { title, value, trend })}
        >
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
                {icon && <div className="p-2 bg-primary/10 rounded-xl text-primary">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{value}</div>
                {trend && (
                    <div className={`flex items-center mt-1 text-xs font-semibold ${trend.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend.isPositive ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                        {trend.value}%
                        <span className="ml-1 text-muted-foreground font-normal">vs last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
