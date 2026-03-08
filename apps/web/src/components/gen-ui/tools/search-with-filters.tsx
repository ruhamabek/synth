"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"

export interface SearchFilter {
    id: string
    label: string
    isActive: boolean
}

export interface SearchWithFiltersProps {
    placeholder?: string
    initialQuery?: string
    filters?: SearchFilter[]
    className?: string
}

export function SearchWithFilters({
    placeholder = "Search...",
    initialQuery = "",
    filters: initialFilters = [],
    className,
}: SearchWithFiltersProps) {
    const { callTool } = useAgentActions()
    const [query, setQuery] = useState(initialQuery)
    const [filters, setFilters] = useState<SearchFilter[]>(initialFilters)

    const toggleFilter = (id: string) => {
        const updatedFilters = filters.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f))
        setFilters(updatedFilters)
        handleSearch(query, updatedFilters)
    }

    const handleClear = () => {
        setQuery("")
        handleSearch("", filters)
    }

    const handleSearch = (q: string, f: SearchFilter[]) => {
        const activeFilters = f.filter((filter) => filter.isActive).map((filter) => filter.id)
        callTool("searchWithFilters", {
            query: q,
            activeFilters,
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch(query, filters)
        }
    }

    return (
        <div className={cn("w-full space-y-4", className)}>
            <div className="relative flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    className="pl-10 pr-10"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                {query && (
                    <button
                        className="absolute right-3 p-1 hover:bg-muted rounded-full"
                        onClick={handleClear}
                    >
                        <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                )}
            </div>

            {filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {filters.map((filter) => (
                        <Badge
                            key={filter.id}
                            variant={filter.isActive ? "default" : "outline"}
                            className={cn(
                                "cursor-pointer select-none transition-all",
                                !filter.isActive && "hover:bg-muted",
                            )}
                            onClick={() => toggleFilter(filter.id)}
                        >
                            {filter.label}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
