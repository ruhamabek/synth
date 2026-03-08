"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"

export interface TabItem {
    id: string
    label: string
    content: string | React.ReactNode
}

export interface TabLayoutProps {
    title?: string
    description?: string
    tabs: TabItem[]
    defaultTabId?: string
    className?: string
}

export function TabLayout({
    title,
    description,
    tabs,
    defaultTabId,
    className,
}: TabLayoutProps) {
    const { callTool } = useAgentActions()
    const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id)

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        callTool("changeTab", { tabId: value })
    }

    return (
        <Card className={cn("w-full", className)}>
            {(title || description) && (
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
            )}
            <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="px-4 py-2 data-[state=active]:bg-background"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    {tabs.map((tab) => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-4 animate-in fade-in-50 duration-300">
                            {typeof tab.content === "string" ? (
                                <div className="text-sm leading-relaxed">{tab.content}</div>
                            ) : (
                                tab.content
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}
