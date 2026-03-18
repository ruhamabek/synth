import { useReducer } from "react";

type Message = { role: string; content: string };

type State = {
	messages: Message[];
	conversationId?: string;
	input: string;
	modelId: string | null;
};

type Action =
	| { type: "SET_INPUT"; payload: string }
	| { type: "ADD_MESSAGE"; payload: Message }
	| { type: "SET_MESSAGES"; payload: Message[] }
	| { type: "SET_CONVERSATION"; payload?: string }
	| { type: "SET_MODEL"; payload: string | null }
	| { type: "RESET" };

const initialState: State = {
	messages: [],
	conversationId: "",
	input: "",
	modelId: null,
};

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case "SET_INPUT":
			return { ...state, input: action.payload };
		case "ADD_MESSAGE":
			return { ...state, messages: [...state.messages, action.payload] };
		case "SET_MESSAGES":
			return { ...state, messages: action.payload };
		case "SET_CONVERSATION":
			return { ...state, conversationId: action.payload };
		case "SET_MODEL":
			return { ...state, modelId: action.payload };
		case "RESET":
			return initialState;
		default:
			return state;
	}
}

export function useChatCustom() {
	const [state, dispatch] = useReducer(reducer, initialState);

	return {
		state,
		dispatch,
	};
}