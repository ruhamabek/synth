"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"
import { Mail, MessageSquare } from "lucide-react"

export interface TeamMember {
    id: string
    name: string
    role: string
    avatarUrl?: string
    status: "online" | "offline" | "busy" | "away"
    skills?: string[]
}

export interface TeamMemberListProps {
    title: string
    description?: string
    members: TeamMember[]
    className?: string
}

export function TeamMemberList({ title, description, members, className }: TeamMemberListProps) {
    const { callTool } = useAgentActions()

    const handleMemberClick = (member: TeamMember) => {
        callTool("selectTeamMember", { memberId: member.id, name: member.name })
    }

    const statusColors = {
        online: "bg-emerald-500",
        offline: "bg-slate-300",
        busy: "bg-rose-500",
        away: "bg-amber-500",
    }

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-4">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-all group cursor-pointer"
                        onClick={() => handleMemberClick(member)}
                    >
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar>
                                    <AvatarImage src={member.avatarUrl} alt={member.name} />
                                    <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", statusColors[member.status])} />
                            </div>
                            <div>
                                <div className="font-medium text-sm">{member.name}</div>
                                <div className="text-xs text-muted-foreground">{member.role}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden md:flex flex-wrap gap-1 mr-4">
                                {member.skills?.slice(0, 2).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-1.5 h-4">
                                        {skill}
                                    </Badge>
                                ))}
                                {(member.skills?.length ?? 0) > 2 && (
                                    <span className="text-[10px] text-muted-foreground">+{member.skills!.length - 2}</span>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Mail className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
