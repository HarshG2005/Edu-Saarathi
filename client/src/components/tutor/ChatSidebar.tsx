import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatSession, ChatMessage } from "@shared/schema";
import { getStoredProvider } from "@/pages/settings";

interface ChatSidebarProps {
    documentId: string;
}

export function ChatSidebar({ documentId }: ChatSidebarProps) {
    const { chatSessions, addChatSession, updateChatSession, setPdfTargetPage } = useAppStore();
    const { toast } = useToast();

    const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
    const [message, setMessage] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const chatMutation = useMutation({
        mutationFn: async (userMessage: string): Promise<{ session: ChatSession; response: string }> => {
            const payload = {
                sessionId: currentSession?.id,
                documentId: documentId,
                message: userMessage,
                provider: getStoredProvider(),
            };
            const response = await apiRequest("POST", "/api/tutor/chat", payload);
            return response.json();
        },
        onSuccess: (data) => {
            if (!currentSession) {
                addChatSession(data.session);
            } else {
                updateChatSession(data.session.id, data.session);
            }
            setCurrentSession(data.session);
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to send message",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (scrollRef.current) {
            // Find the viewport element inside ScrollArea
            const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [currentSession?.messages]);

    const handleSend = () => {
        if (!message.trim() || chatMutation.isPending) return;

        const userMessage = message.trim();
        setMessage("");

        if (currentSession) {
            const newMessage: ChatMessage = {
                id: crypto.randomUUID(),
                role: "user",
                content: userMessage,
                timestamp: new Date().toISOString(),
            };
            setCurrentSession((prev) =>
                prev ? { ...prev, messages: [...(prev.messages as ChatMessage[]), newMessage] } : prev
            );
        }

        chatMutation.mutate(userMessage);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Helper to parse text with [Page X] links
    const renderMessageContent = (text: string) => {
        const parts = text.split(/(\[Page \d+\])/g);
        return parts.map((part, i) => {
            const match = part.match(/\[Page (\d+)\]/);
            if (match) {
                const pageNum = parseInt(match[1]);
                return (
                    <button
                        key={i}
                        onClick={() => setPdfTargetPage(pageNum)}
                        className="text-primary hover:underline font-semibold cursor-pointer px-1 bg-primary/10 rounded mx-0.5 inline-flex items-center text-xs align-middle"
                        title={`Jump to Page ${pageNum}`}
                    >
                        {part}
                    </button>
                );
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {currentSession && (currentSession.messages as ChatMessage[]).length > 0 ? (
                    <div className="space-y-4">
                        {(currentSession.messages as ChatMessage[]).map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.role === "assistant" && (
                                    <Avatar className="h-6 w-6 shrink-0 mt-1">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                            <Bot className="h-3 w-3" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div
                                    className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted border border-border"
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">
                                        {renderMessageContent(msg.content)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {chatMutation.isPending && (
                            <div className="flex gap-3">
                                <Avatar className="h-6 w-6 shrink-0 mt-1">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                                        <Bot className="h-3 w-3" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg bg-muted p-3 border border-border flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 mt-10">
                        <Bot className="h-12 w-12" />
                        <div className="space-y-1">
                            <p className="font-medium">Ask about this document</p>
                            <p className="text-xs text-muted-foreground">I can answer questions and cite pages.</p>
                        </div>
                    </div>
                )}
            </ScrollArea>

            <div className="p-4 border-t bg-background">
                <div className="relative">
                    <Textarea
                        placeholder="Ask a question..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[80px] resize-none pr-12 text-sm bg-muted/50"
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!message.trim() || chatMutation.isPending}
                        className="absolute bottom-2 right-2 h-8 w-8"
                    >
                        {chatMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
