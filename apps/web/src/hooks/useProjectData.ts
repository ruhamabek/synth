import { useEffect, useState, useCallback } from "react";
import { API } from "@/api/cli/api";
import type { Conversation, FullSchemaType } from "@synth/types";

export function useProjectData(projectName: string) {
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [schema, setSchema] = useState<FullSchemaType | null>();
	const [loading, setLoading] = useState(true);

	const loadConversations = useCallback(async () => {
		try {
			const data = await API.fetchConversations(projectName);
			setConversations(data);
		} catch {
			setConversations([]);
		}
	}, [projectName]);

	const loadSchema = useCallback(async () => {
		try {
			const data = await API.fetchSchema(projectName);
			setSchema(data);
		} catch {
			setSchema(null);
		} finally {
			setLoading(false);
		}
	}, [projectName]);

	useEffect(() => {
		loadConversations();
		loadSchema();
	}, [loadConversations, loadSchema]);

	return {
		conversations,
		schema,
		loading,
		reloadConversations: loadConversations,
	};
}