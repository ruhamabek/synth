"use client";

import { Columns } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAgentActions } from "../hooks/use-agent-actions";

export interface ColumnToggleTableProps {
	title: string;
	description?: string;
	columns: Array<{
		key: string;
		label: string;
	}>;
	rows: Array<Record<string, any>>;
	visibleColumns?: string[];
	className?: string;
}

export function ColumnToggleTable({
	title,
	description,
	columns,
	rows,
	visibleColumns: initialVisibleColumns,
	className,
}: ColumnToggleTableProps) {
	const { callTool } = useAgentActions();
	const [visibleColumns, setVisibleColumns] = useState<string[]>(
		initialVisibleColumns || columns.map((col) => col.key),
	);

	const toggleColumn = (columnKey: string) => {
		let updatedColumns: string[];
		if (visibleColumns.includes(columnKey)) {
			if (visibleColumns.length === 1) return;
			updatedColumns = visibleColumns.filter((key) => key !== columnKey);
		} else {
			updatedColumns = [...visibleColumns, columnKey];
		}
		setVisibleColumns(updatedColumns);
		callTool("updateVisibleColumns", { visibleColumns: updatedColumns });
	};

	const filteredColumns = columns.filter((col) =>
		visibleColumns.includes(col.key),
	);

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader className="flex flex-row items-center justify-between">
				<div>
					<CardTitle>{title}</CardTitle>
					{description && <CardDescription>{description}</CardDescription>}
				</div>
				<Popover>
					<PopoverTrigger>
						<Button variant="outline" size="sm">
							<Columns className="mr-2 h-4 w-4" />
							Columns
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-56" align="end">
						<div className="space-y-2">
							<h4 className="font-medium leading-none">Toggle Columns</h4>
							<p className="text-muted-foreground text-sm">
								Select which columns to display.
							</p>
							<div className="grid gap-2 pt-2">
								{columns.map((column) => (
									<div key={column.key} className="flex items-center space-x-2">
										<Checkbox
											id={`column-${column.key}`}
											checked={visibleColumns.includes(column.key)}
											onCheckedChange={() => toggleColumn(column.key)}
											disabled={
												visibleColumns.length === 1 &&
												visibleColumns.includes(column.key)
											}
										/>
										<Label htmlFor={`column-${column.key}`}>
											{column.label}
										</Label>
									</div>
								))}
							</div>
						</div>
					</PopoverContent>
				</Popover>
			</CardHeader>
			<CardContent className="p-0">
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								{filteredColumns.map((column) => (
									<TableHead key={column.key}>{column.label}</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{rows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={filteredColumns.length}
										className="h-24 text-center"
									>
										No results.
									</TableCell>
								</TableRow>
							) : (
								rows.map((row, rowIndex) => (
									<TableRow key={row.id ?? rowIndex}>
										{filteredColumns.map((column) => (
											<TableCell key={column.key}>
												{row[column.key] !== undefined
													? String(row[column.key])
													: "—"}
											</TableCell>
										))}
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}
