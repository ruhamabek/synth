"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"

export interface RatingSelectorProps {
    title: string
    description?: string
    initialRating?: number
    maxRating?: number
    allowHalf?: boolean
    className?: string
}

export function RatingSelector({
    title,
    description,
    initialRating = 0,
    maxRating = 5,
    className,
}: RatingSelectorProps) {
    const { callTool } = useAgentActions()
    const [rating, setRating] = useState(initialRating)
    const [hover, setHover] = useState(0)

    const handleRatingSubmit = (val: number) => {
        setRating(val)
        callTool("submitRating", { rating: val, maxRating })
    }

    return (
        <Card className={cn("w-full max-w-sm", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col items-center py-6">
                <div className="flex gap-1">
                    {Array.from({ length: maxRating }).map((_, index) => {
                        const starValue = index + 1
                        const isFilled = hover >= starValue || (!hover && rating >= starValue)
                        return (
                            <button
                                key={index}
                                className="outline-none focus:ring-2 focus:ring-primary/20 rounded-full p-1 transition-transform active:scale-90"
                                onMouseEnter={() => setHover(starValue)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => handleRatingSubmit(starValue)}
                            >
                                <Star
                                    className={cn(
                                        "h-8 w-8 transition-colors",
                                        isFilled ? "fill-amber-400 text-amber-400" : "text-muted border-muted-foreground/20",
                                    )}
                                />
                            </button>
                        )
                    })}
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">
                    {rating > 0 ? `You selected ${rating} out of ${maxRating} stars` : "Click to rate"}
                </div>
            </CardContent>
        </Card>
    )
}
