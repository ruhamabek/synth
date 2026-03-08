"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"
import { MessageSquare, Reply, Trash2, Heart } from "lucide-react"

export interface Comment {
    id: string
    author: {
        name: string
        avatarUrl?: string
    }
    content: string
    timestamp: string
    likes?: number
    replies?: Comment[]
}

export interface ThreadedCommentsProps {
    title: string
    description?: string
    comments: Comment[]
    className?: string
}

export function ThreadedComments({ title, description, comments: initialComments, className }: ThreadedCommentsProps) {
    const { callTool } = useAgentActions()
    const [comments, setComments] = useState(initialComments)
    const [newComment, setNewComment] = useState("")

    const handlePostComment = () => {
        if (!newComment.trim()) return
        const comment = {
            id: `comment-${Date.now()}`,
            author: { name: "You", avatarUrl: "" },
            content: newComment,
            timestamp: "Just now",
            likes: 0,
            replies: [],
        }
        setComments([comment, ...comments])
        setNewComment("")
        callTool("postComment", { content: newComment })
    }

    const handleDeleteComment = (id: string) => {
        setComments(comments.filter((c) => c.id !== id))
        callTool("deleteComment", { commentId: id })
    }

    const renderComment = (comment: Comment, depth = 0) => (
        <div key={comment.id} className={cn("space-y-4", depth > 0 && "ml-10 pt-4 border-l pl-4")}>
            <div className="flex gap-4">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
                    <AvatarFallback>{comment.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold">{comment.author.name}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-medium">{comment.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Heart className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteComment(comment.id)}>
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4 pt-1">
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-wider gap-1 hover:text-primary">
                            <Reply className="h-3 w-3" />
                            Reply
                        </Button>
                        {comment.likes !== undefined && (
                            <span className="text-[10px] text-muted-foreground font-bold">{comment.likes} Likes</span>
                        )}
                    </div>
                </div>
            </div>
            {comment.replies && comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
    )

    return (
        <Card className={cn("w-full border-none shadow-xl bg-card/50 backdrop-blur-md", className)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    {title}
                </CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[100px] resize-none border-none bg-muted/50 rounded-2xl focus-visible:ring-primary/20"
                    />
                    <div className="flex justify-end">
                        <Button onClick={handlePostComment} disabled={!newComment.trim()} className="rounded-xl px-6 font-bold uppercase tracking-tighter text-xs">
                            Post Comment
                        </Button>
                    </div>
                </div>

                <Separator className="opacity-50" />

                <div className="space-y-8 py-4">
                    {comments.map((comment) => renderComment(comment))}
                </div>
            </CardContent>
        </Card>
    )
}
