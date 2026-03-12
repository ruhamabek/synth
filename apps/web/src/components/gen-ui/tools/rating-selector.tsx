"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAgentActions } from "../hooks/use-agent-actions";

export interface RatingSelectorProps {
	title: string;
	description?: string;
	initialRating?: number;
	maxRating?: number;
	allowHalf?: boolean;
	className?: string;
}

export function RatingSelector({
	title,
	description,
	initialRating = 0,
	maxRating = 5,
	className,
}: RatingSelectorProps) {
	const { callTool } = useAgentActions();
	const [rating, setRating] = useState(initialRating);
	const [hover, setHover] = useState(0);

	const handleRatingSubmit = (val: number) => {
		setRating(val);
		callTool("submitRating", { rating: val, maxRating });
	};

	return (
		<Card className={cn("w-full max-w-sm", className)}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				{description && <CardDescription>{description}</CardDescription>}
			</CardHeader>
			<CardContent className="flex flex-col items-center py-6">
				<div className="flex gap-1">
					{Array.from({ length: maxRating }).map((_, index) => {
						const starValue = index + 1;
						const isFilled =
							hover >= starValue || (!hover && rating >= starValue);
						return (
							<button
								type="button"
								key={starValue}
								className="rounded-full p-1 outline-none transition-transform focus:ring-2 focus:ring-primary/20 active:scale-90"
								onMouseEnter={() => setHover(starValue)}
								onMouseLeave={() => setHover(0)}
								onClick={() => handleRatingSubmit(starValue)}
							>
								<Star
									className={cn(
										"h-8 w-8 transition-colors",
										isFilled
											? "fill-amber-400 text-amber-400"
											: "border-muted-foreground/20 text-muted",
									)}
								/>
							</button>
						);
					})}
				</div>
				<div className="mt-4 font-medium text-muted-foreground text-sm">
					{rating > 0
						? `You selected ${rating} out of ${maxRating} stars`
						: "Click to rate"}
				</div>
			</CardContent>
		</Card>
	);
}
