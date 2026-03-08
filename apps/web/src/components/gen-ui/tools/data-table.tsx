import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAgentActions } from "../hooks/use-agent-actions";

interface DataTableProps {
    table: string;
    columns: { field: string; header: string }[];
    title?: string;
    mockData?: any[];
}

export function GenUIDataTable({ table, columns, title, mockData = [] }: DataTableProps) {
    const { callTool } = useAgentActions();
    return (
        <div className="space-y-3 p-4 border rounded-xl bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight">{title || `${table} Data`}</h3>
                <span className="px-2 py-1 text-[10px] font-medium bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                    {table}
                </span>
            </div>
            <div className="rounded-md border bg-background/50">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((col) => (
                                <TableHead key={col.field} className="font-semibold">{col.header}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockData.length > 0 ? (
                            mockData.map((row, i) => (
                                <TableRow
                                    key={i}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => callTool("onRowClick", { table, row, rowIndex: i })}
                                >
                                    {columns.map((col) => (
                                        <TableCell key={col.field}>{row[col.field]}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                {columns.map((col) => (
                                    <TableCell key={col.field} className="text-muted-foreground italic">
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
