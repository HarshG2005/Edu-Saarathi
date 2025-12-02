import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Bot, User, Trash2, Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ChatSession, ChatMessage } from "@shared/schema";
import { getStoredProvider, AISettings } from "@/components/ai-settings";

export function TutorPage() {
  const { documents, chatSessions, addChatSession, updateChatSession } = useAppStore();
  const { toast } = useToast();

  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState("");
  const [selectedDocId, setSelectedDocId] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string): Promise<{ session: ChatSession; response: string }> => {
      const payload = {
        sessionId: currentSession?.id,
        documentId: hasDocumentSelected ? selectedDocId : undefined,
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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
        timestamp: new Date(),
      };
      setCurrentSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMessage] } : prev
      );
    }

    chatMutation.mutate(userMessage);
  };

  const handleNewChat = () => {
    setCurrentSession(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestedQuestions = [
    "Explain the concept of photosynthesis in simple terms",
    "What are the key differences between mitosis and meiosis?",
    "How does the TCP/IP protocol work?",
    "Explain Newton's laws of motion",
    "What is machine learning and how does it work?",
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">AI Tutor</h1>
          <p className="text-muted-foreground">
            Ask questions about any topic or your uploaded documents
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AISettings />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-4">
        <div className="flex gap-2">
          <Select value={selectedDocId} onValueChange={setSelectedDocId}>
            <SelectTrigger className="w-48" data-testid="select-document">
              <SelectValue placeholder="No document context" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No document context</SelectItem>
              {documents.map((doc) => (
                <SelectItem key={doc.id} value={doc.id}>
                  {doc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleNewChat} data-testid="button-new-chat">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="border-b px-6 py-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              {currentSession ? "Conversation" : "Start a Conversation"}
              {hasDocumentSelected && (
                <Badge variant="secondary" className="ml-2">
                  <FileText className="mr-1 h-3 w-3" />
                  Document context active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {currentSession && currentSession.messages.length > 0 ? (
              <div className="space-y-6">
                {currentSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    data-testid={`message-${msg.id}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                        }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-secondary">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Ask me anything!</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    I can help you understand concepts, explain topics, answer questions
                    about your documents, and guide your learning journey.
                  </p>
                </div>
                <div className="w-full max-w-lg">
                  <p className="mb-3 text-sm font-medium text-muted-foreground">
                    Try asking:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.slice(0, 3).map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-auto whitespace-normal text-left"
                        onClick={() => setMessage(q)}
                        data-testid={`button-suggestion-${idx}`}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your question here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] resize-none"
                data-testid="input-message"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || chatMutation.isPending}
                className="h-auto"
                data-testid="button-send"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>

        {chatSessions.length > 0 && (
          <Card className="hidden w-64 shrink-0 lg:block">
            <CardHeader className="border-b px-4 py-3">
              <CardTitle className="text-sm font-medium">Chat History</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="space-y-1 p-2">
                {chatSessions.slice().reverse().slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSession(session)}
                    className={`flex w-full items-start gap-2 rounded-lg p-3 text-left transition-colors hover:bg-muted ${currentSession?.id === session.id ? "bg-muted" : ""
                      }`}
                    data-testid={`button-session-${session.id}`}
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm">
                        {session.messages[0]?.content.slice(0, 50) || "New conversation"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {session.messages.length} messages
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </div>
  );
}
