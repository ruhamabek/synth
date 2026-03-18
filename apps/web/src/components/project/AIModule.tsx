import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useProjectData } from "@/hooks/useProjectData";
import { JsonRenderChat } from "../gen-ui/json-render-chat";
import Loader from "../loader";

export function AIModule({ projectName }: { projectName: string }) {
	const [selectedConversationId, setSelectedConversationId] =
		useState<string>();

	const { conversations, schema, loading, reloadConversations } =
		useProjectData(projectName);

	if (loading) {
		return <Loader />;
	}

	if (!schema) {
		return <ErrorState projectName={projectName} />;
	}

	return (
		<div className="h-full w-full">
			<JsonRenderChat
				projectName={projectName}
				schema={schema}
				conversationId={selectedConversationId}
				conversations={conversations}
				onConversationChange={(id: string | undefined) => {
					setSelectedConversationId(id);
					reloadConversations();
				}}
				onNewMessage={() => {
					setTimeout(reloadConversations, 100);
				}}
				onLoadConversations={reloadConversations}
			/>
		</div>
	);
}

function ErrorState({ projectName }: { projectName: string }) {
	return (
		<div className="flex h-full flex-col items-center justify-center p-8 text-center text-sm">
			<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border bg-muted/50">
				<AlertCircle className="h-6 w-6 text-muted-foreground/50" />
			</div>
			<h3 className="font-medium">No schema found for {projectName}</h3>
			<p className="mt-1 text-muted-foreground">
				Please make sure the project exists and contains a valid database
				schema.
			</p>
		</div>
	);
}
