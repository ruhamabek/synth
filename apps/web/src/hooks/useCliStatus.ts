import { useEffect, useState } from "react";
import { API } from "@/api/cli/api";

export function useCliStatus() {
	const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");

	const check = async () => {
		setStatus("loading");
		try {
			const ok = await API.fetchHealth();
			setStatus(ok ? "online": "offline");
		} catch {
			setStatus("offline");
		}
	};

	useEffect(() => {
		check();
	}, []);

	return { status, retry: check };
}