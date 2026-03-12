import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAgentActions } from "../hooks/use-agent-actions";

interface DataTableProps {
	table: string;
	columns: { field: string; header: string }[];
	title?: string;
	mockData?: any[];
}

export function GenUIDataTable({
	table,
	columns,
	title,
	mockData = [],
}: DataTableProps) {
	const { callTool } = useAgentActions();
	return (
		<div className="space-y-3 rounded-xl border bg-card/50 p-4 shadow-sm backdrop-blur-sm">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-lg tracking-tight">
					{title || `${table} Data`}
				</h3>
				<span className="rounded-full bg-primary/10 px-2 py-1 font-medium text-[10px] text-primary uppercase tracking-wider">
					{table}
				</span>
			</div>
			<div className="rounded-md border bg-background/50">
				<Table>
					<TableHeader>
						<TableRow>
							{columns.map((col) => (
								<TableHead key={col.field} className="font-semibold">
									{col.header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{mockData.length > 0 ? (
							mockData.map((row, i) => (
								<TableRow
									key={row.id ?? i}
									className="cursor-pointer transition-colors hover:bg-muted/50"
									onClick={() =>
										callTool("onRowClick", { table, row, rowIndex: i })
									}
								>
									{columns.map((col) => (
										<TableCell key={col.field}>{row[col.field]}</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								{columns.map((col) => (
									<TableCell
										key={col.field}
										className="text-muted-foreground italic"
									>
										[No data available]
									</TableCell>
								))}
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
