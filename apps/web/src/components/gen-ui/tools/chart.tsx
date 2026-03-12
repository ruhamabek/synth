"use client";

import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAgentActions } from "../hooks/use-agent-actions";

interface ChartProps {
	title: string;
	type: "bar" | "line" | "pie" | "area"; // pie to be implemented eventually
	data: any[];
	xAxis: string;
	yAxis: string;
}

export function GenUIChart({ title, data, xAxis, yAxis, type }: ChartProps) {
	const { callTool } = useAgentActions();

	const handlePointClick = (data: any) => {
		if (!data) return;
		// Recharts passes the data point in different ways depending on the trigger
		const point = data.activePayload ? data.activePayload[0].payload : data;
		callTool("onChartPointClick", { title, point, xAxis, yAxis, type });
	};

	const renderChart = () => {
		switch (type) {
			case "line":
				return (
					<LineChart data={data} onClick={handlePointClick}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--muted-foreground) / 0.1)"
						/>
						<XAxis
							dataKey={xAxis}
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--popover))",
								borderRadius: "12px",
								border: "none",
								boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
							}}
							itemStyle={{
								color: "hsl(var(--primary))",
								fontSize: "12px",
								fontWeight: "bold",
							}}
						/>
						<Line
							type="monotone"
							dataKey={yAxis}
							stroke="hsl(var(--primary))"
							strokeWidth={3}
							dot={{
								r: 4,
								fill: "hsl(var(--primary))",
								strokeWidth: 2,
								stroke: "hsl(var(--background))",
							}}
							activeDot={{ r: 6, strokeWidth: 0 }}
						/>
					</LineChart>
				);
			case "area":
				return (
					<AreaChart data={data} onClick={handlePointClick}>
						<defs>
							<linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
								<stop
									offset="5%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0.3}
								/>
								<stop
									offset="95%"
									stopColor="hsl(var(--primary))"
									stopOpacity={0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--muted-foreground) / 0.1)"
						/>
						<XAxis
							dataKey={xAxis}
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "hsl(var(--popover))",
								borderRadius: "12px",
								border: "none",
								boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
							}}
							itemStyle={{
								color: "hsl(var(--primary))",
								fontSize: "12px",
								fontWeight: "bold",
							}}
						/>
						<Area
							type="monotone"
							dataKey={yAxis}
							stroke="hsl(var(--primary))"
							fillOpacity={1}
							fill="url(#colorValue)"
							strokeWidth={2}
						/>
					</AreaChart>
				);
			default:
				return (
					<BarChart data={data} onClick={handlePointClick}>
						<CartesianGrid
							strokeDasharray="3 3"
							vertical={false}
							stroke="hsl(var(--muted-foreground) / 0.1)"
						/>
						<XAxis
							dataKey={xAxis}
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<YAxis
							fontSize={10}
							tickLine={false}
							axisLine={false}
							tick={{ fill: "hsl(var(--muted-foreground))" }}
						/>
						<Tooltip
							cursor={{ fill: "hsl(var(--muted) / 0.4)", radius: 8 }}
							contentStyle={{
								backgroundColor: "hsl(var(--popover))",
								borderRadius: "12px",
								border: "none",
								boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
							}}
							itemStyle={{
								color: "hsl(var(--primary))",
								fontSize: "12px",
								fontWeight: "bold",
							}}
						/>
						<Bar
							dataKey={yAxis}
							fill="hsl(var(--primary))"
							radius={[6, 6, 0, 0]}
							className="transition-all duration-300"
						>
							{data.map((entry) => (
								<Cell
									key={`cell-${entry[xAxis]}`}
									className="cursor-pointer transition-opacity hover:opacity-80"
								/>
							))}
						</Bar>
					</BarChart>
				);
		}
	};

	return (
		<Card className="overflow-hidden rounded-2xl border-none bg-card shadow-lg">
			<CardHeader className="pb-2">
				<CardTitle className="font-semibold text-base tracking-tight">
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent className="p-4 pt-0">
				<div className="mt-2 h-48 w-full">
					<ResponsiveContainer width="100%" height="100%">
						{renderChart()}
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
