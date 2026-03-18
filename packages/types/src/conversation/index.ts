import type { FullSchemaType } from "..";

export interface Conversation {
  id: string;
  projectName: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  schema: FullSchemaType;
  lastGeneratedUiJson?: unknown;
  lastMessageSummary?: string;
  messageCount: number;
}
