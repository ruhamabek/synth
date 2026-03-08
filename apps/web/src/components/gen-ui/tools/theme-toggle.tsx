"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun, Moon, Laptop } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"

export interface ThemeToggleProps {
    title?: string
    description?: string
    initialTheme?: "light" | "dark" | "system"
    className?: string
}

export function ThemeToggle({
    title = "Appearance",
    description = "Customize how the interface looks on your device.",
    initialTheme = "system",
    className,
}: ThemeToggleProps) {
    const { callTool } = useAgentActions()
    const [theme, setTheme] = useState(initialTheme)

    const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
        setTheme(newTheme)
        callTool("toggleTheme", { theme: newTheme })
    }

    return (
        <Card className={cn("w-full max-w-sm", className)}>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1 rounded-xl">
                    <button
                        onClick={() => handleThemeChange("light")}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                            theme === "light" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <Sun className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Light</span>
                    </button>

                    <button
                        onClick={() => handleThemeChange("dark")}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                            theme === "dark" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <Moon className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Dark</span>
                    </button>

                    <button
                        onClick={() => handleThemeChange("system")}
                        className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg transition-all",
                            theme === "system" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:bg-muted/50"
                        )}
                    >
                        <Laptop className="h-5 w-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">System</span>
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}
