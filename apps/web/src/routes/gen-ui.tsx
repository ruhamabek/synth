import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { GenerativeUIChat } from "@/components/gen-ui/chat";

const genUISearchSchema = z.object({
	schema: z
		.string()
		.optional()
		.describe("Base64 encoded JSON of the FullSchemaType"),
});

export const Route = createFileRoute("/gen-ui")({
	validateSearch: (search) => genUISearchSchema.parse(search),
	component: GenUIRouteComponent,
});

function GenUIRouteComponent() {
	const { schema: encodedSchema } = Route.useSearch();

	let schema = null;
	if (encodedSchema) {
		try {
			// In a real app, we might want to use a more robust compression/storage
			schema = JSON.parse(atob(encodedSchema));
		} catch (e) {
			console.error("Failed to parse schema from URL", e);
		}
	}

	return (
		<div className="flex h-screen w-full flex-col items-center justify-center bg-slate-950 p-4">
			{!schema ? (
				<div className="max-w-md space-y-4 text-center">
					<h1 className="font-bold text-2xl text-white">No Schema Detected</h1>
					<p className="text-slate-400 text-sm italic">
						Please use the Synth CLI to introspect your database and open this
						page with the generated context.
					</p>
					<div className="rounded-lg border border-slate-800 bg-slate-900 p-4 text-left font-mono text-[10px] text-slate-500">
						$ synth introspect "postgresql://..."
					</div>
				</div>
			) : (
				<div className="h-full w-full max-w-6xl">
					<GenerativeUIChat schema={schema} />
				</div>
			)}
		</div>
	);
}
