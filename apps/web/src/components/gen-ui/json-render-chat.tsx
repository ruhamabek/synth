import type { Conversation, FullSchemaType } from "@synth/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useUIStream } from "@json-render/react";
import { API, CLI_URL } from "@/api/conversation/api";
import { useChatCustom } from "@/hooks/useChatCustom";
import { ChatView } from "../chat/ChatView";
import { ConversationList } from "../chat/ConversationList";
import { PreviewPanel } from "../chat/PreviewPanel";
import { useResizable } from "@/hooks/useResizable";

export interface JsonRenderChatProps {
	projectName: string;
	schema: FullSchemaType;
	conversationId?: string;
	conversations?: Conversation[];
	onConversationChange?: (id: string | undefined) => void;
	onNewMessage?: () => void;
	onLoadConversations?: () => Promise<void>;
}

export function JsonRenderChat({
	projectName,
	schema,
	conversationId: _initialConversationId,
	conversations: externalConversations,
	onConversationChange,
	onNewMessage,
	onLoadConversations,
}: JsonRenderChatProps) {
	const { state, dispatch } = useChatCustom();
	const queryClient = useQueryClient();
	const lastPersistedSpecRef = useRef<string | null>(null);

	const {
		width: previewWidth,
		isResizing,
		startResizing,
	} = useResizable({
		initialWidth: 384,
		minWidth: 384,
	});

	const { data: fetchedConversations = [] } = useQuery({
		queryKey: ["conversations", projectName],
		queryFn: () => API.getConversations(projectName),
		enabled: !externalConversations,
	});

	const conversations = externalConversations ?? fetchedConversations;

	const { data: models = [] } = useQuery({
		queryKey: ["ai-models"],
		queryFn: () => API.getModels().then((res) => res.models || []),
	});

	useEffect(() => {
		if (models.length > 0 && !state.modelId) {
			dispatch({ type: "SET_MODEL", payload: models[0].id });
		}
	}, [models, state.modelId, dispatch]);

	const { data: messagesData } = useQuery({
		queryKey: ["messages", projectName, state.conversationId],
		queryFn: () => {
			if (!state.conversationId) return Promise.resolve([]);
			return API.getConversation(projectName, state.conversationId).then(
				(res) => res.conversation?.messages || [],
			);
		},
		enabled: !!state.conversationId,
	});

	useEffect(() => {
		if (messagesData) {
			dispatch({ type: "SET_MESSAGES", payload: messagesData });
		}
	}, [messagesData, dispatch]);

	const { spec, isStreaming, error, send, clear } = useUIStream({
		api: `${CLI_URL}/api/ai-json-render`,
	});

 	useEffect(() => {
		if (!state.conversationId || isStreaming || !spec) return;

		const serializedSpec = JSON.stringify(spec);
		if (lastPersistedSpecRef.current === serializedSpec) {
			return;
		}

		lastPersistedSpecRef.current = serializedSpec;

		fetch(`${CLI_URL}/api/conversations/${projectName}/${state.conversationId}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				lastGeneratedUiJson: spec,
			}),
		}).catch((err) =>
			console.error("Failed to persist generated UI JSON:", err),
		);
	}, [state.conversationId, isStreaming, spec, projectName]);

	const createConversation = useMutation({
		mutationFn: () => API.createConversation(projectName, schema),
	});

	const handleSelectConversation = (id: string) => {
		dispatch({ type: "SET_CONVERSATION", payload: id });
		clear();
		lastPersistedSpecRef.current = null;
		if (onConversationChange) {
			onConversationChange(id);
		}
	};

	const handleNewConversation = () => {
		dispatch({ type: "SET_CONVERSATION", payload: undefined });
		dispatch({ type: "SET_MESSAGES", payload: [] });
		clear();
		lastPersistedSpecRef.current = null;
		onConversationChange?.(undefined);
	};

	const handleSendMessage = async (e: React.FormEvent) => {
		e.preventDefault();

		const text = state.input.trim();
		if (!text || isStreaming) return;

		dispatch({ type: "ADD_MESSAGE", payload: { role: "user", content: text } });
		dispatch({ type: "SET_INPUT", payload: "" });

		let conversationId = state.conversationId;

		if (!conversationId) {
			const data = await createConversation.mutateAsync();
			const newConversationId = data?.conversation?.metadata?.id;
			if (newConversationId) {
				dispatch({ type: "SET_CONVERSATION", payload: newConversationId });
				if (onConversationChange) {
					onConversationChange(newConversationId);
				}
				onLoadConversations?.();
				conversationId = newConversationId;
			}
		}

		if (conversationId) {
			await API.saveMessage(projectName, conversationId, {
				role: "user",
				content: text,
			});
			onNewMessage?.();
		}

 		let enhancedPrompt = text;
		if (messagesData && messagesData.length > 0) {
			const recentMessages = messagesData
				.slice(-6)
				.map((m: any) => `${m.role}: ${m.content}`)
				.join("\n");
			enhancedPrompt = `Previous conversation:\n${recentMessages}\n\nCurrent request: ${text}`;
		}

		send(enhancedPrompt, {
			modelId: state.modelId,
			projectName,
			conversationId,
		});
	};

	const deleteConversation = async (id: string) => {
		if (!window.confirm("Delete this conversation?")) return;
		await API.deleteConversation(projectName, id);
		queryClient.invalidateQueries({ queryKey: ["conversations"] });
		if (state.conversationId === id) {
			handleNewConversation();
		}
		onLoadConversations?.();
	};

	return (
		<div className="flex h-full w-full">
			{/* Sidebar - Conversations */}
			<div className="w-64 shrink-0 border-r bg-muted/20">
				<ConversationList
					conversations={conversations}
					onSelect={handleSelectConversation}
					onDelete={deleteConversation}
					activeId={state.conversationId}
					onNew={handleNewConversation}
				/>
			</div>

			{/* Main - Chat */}
			<div className="flex min-w-0 flex-1 flex-col">
				<ChatView
					messages={state.messages}
					input={state.input}
					onChange={(val) => dispatch({ type: "SET_INPUT", payload: val })}
					onSubmit={handleSendMessage}
					isLoading={isStreaming}
					models={models}
					selectedModelId={state.modelId}
					onModelChange={(id) => dispatch({ type: "SET_MODEL", payload: id })}
					error={error}
				/>
			</div>

			{/* Resizer Handle */}
			<div
				onMouseDown={startResizing}
				onTouchStart={startResizing}
				className={`group relative w-1 cursor-col-resize transition-colors hover:bg-primary/40 ${
					isResizing ? "bg-primary/60" : "bg-border/50"
				}`}
			>
				<div className="absolute inset-y-0 -left-1 -right-1 z-10" />
			</div>

			{/* Right Panel - Preview/Canvas */}
			<div
				className="shrink-0 border-l bg-background"
				style={{ width: `${previewWidth}px` }}
			>
				<PreviewPanel spec={spec as any} isLoading={isStreaming} />
			</div>
		</div>
	);
}
