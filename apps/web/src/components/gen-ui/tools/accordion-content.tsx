"use client";

import type React from "react";
import { useState } from "react";
import {
	Accordion,
	AccordionTrigger,
	AccordionContent as UIAccordionContent,
	AccordionItem as UIAccordionItem,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAgentActions } from "../hooks/use-agent-actions";

export interface AccordionItemType {
	id: string;
	title: string;
	content: string | React.ReactNode;
}

export interface AccordionContentProps {
	title: string;
	description?: string;
	items: AccordionItemType[];
	defaultValue?: string;
	className?: string;
}

/**
 * AccordionContent - Collapsible sections for FAQ, docs, etc.
 *
 * Component for organizing content in collapsible sections
 */
export function AccordionContent({
	title,
	description,
	items,
	defaultValue,
	className,
}: AccordionContentProps) {
	const { callTool } = useAgentActions();
	const [openItem, setOpenItem] = useState<string | undefined>(defaultValue);

	const handleValueChange = (value: string) => {
		setOpenItem(value);
		if (value) {
			callTool("toggleAccordionItem", { itemId: value, open: true });
		}
	};

	return (
		<Card className={cn("overflow-hidden", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent>
				<Accordion
					value={openItem ? [openItem] : []}
					onValueChange={(value) => handleValueChange(value[0] || "")}
					className="w-full"
				>
					{items.map((item) => (
						<UIAccordionItem key={item.id} value={item.id}>
							<AccordionTrigger>{item.title}</AccordionTrigger>
							<UIAccordionContent>
								{typeof item.content === "string" ? (
									<div className="text-muted-foreground text-sm">
										{item.content}
									</div>
								) : (
									item.content
								)}
							</UIAccordionContent>
						</UIAccordionItem>
					))}
				</Accordion>
			</CardContent>
		</Card>
	);
}
