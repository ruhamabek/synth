import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface FallbackComponentProps {
	componentType: string;
	props: Record<string, any>;
	error?: string;
}

export function FallbackComponent({
	componentType,
	props,
	error,
}: FallbackComponentProps) {
	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-amber-600">
					Component Rendering Issue
				</CardTitle>
				<CardDescription>
					There was an issue rendering the requested component
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>
						{error || `Could not render component of type "${componentType}"`}
					</AlertDescription>
				</Alert>

				<div className="space-y-2">
					<h3 className="font-medium text-sm">Component Type:</h3>
					<pre className="overflow-auto rounded-md bg-muted p-2 text-xs">
						{componentType}
					</pre>
				</div>

				<div className="space-y-2">
					<h3 className="font-medium text-sm">Provided Props:</h3>
					<pre className="overflow-auto rounded-md bg-muted p-2 text-xs">
						{JSON.stringify(props, null, 2)}
					</pre>
				</div>
			</CardContent>
		</Card>
	);
}
