import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Loader2, Bot, User, Trash2, Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Section } from "@/components/ui/section";
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
        timestamp: new Date().toISOString(),
      };
      setCurrentSession((prev) =>
        prev ? { ...prev, messages: [...(prev.messages as ChatMessage[]), newMessage] } : prev
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
    <Section className="flex h-[calc(100vh-4rem)] flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gfg-text" data-testid="text-page-title">AI Tutor</h1>
          <p className="text-gfg-text-light">
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
            <SelectTrigger className="w-48 bg-white dark:bg-gfg-dark-bg border-gfg-border-medium dark:border-gfg-dark-border dark:text-gfg-text-light" data-testid="select-document">
              <SelectValue placeholder="No document context" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
              <SelectItem value="none">No document context</SelectItem>
              {[...documents]
                .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                .map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleNewChat} className="border-gfg-green text-gfg-green hover:bg-gfg-green-50" data-testid="button-new-chat">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        <Card className="flex flex-1 flex-col overflow-hidden border-gfg-border-light dark:border-gfg-dark-border dark:bg-gfg-dark-card">
          <CardHeader className="border-b border-gfg-border-light dark:border-gfg-dark-border px-6 py-4 bg-gfg-bg-secondary dark:bg-gfg-dark-bg">
            <CardTitle className="flex items-center gap-2 text-lg text-gfg-text">
              <MessageSquare className="h-5 w-5 text-gfg-green" />
              {currentSession ? "Conversation" : "Start a Conversation"}
              {hasDocumentSelected && (
                <Badge variant="secondary" className="ml-2 bg-gfg-green-50 text-gfg-green border-gfg-green/20">
                  <FileText className="mr-1 h-3 w-3" />
                  Document context active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>

          <ScrollArea className="flex-1 p-6 bg-white dark:bg-gfg-dark-card" ref={scrollRef}>
            {currentSession && (currentSession.messages as ChatMessage[]).length > 0 ? (
              <div className="space-y-6">
                {(currentSession.messages as ChatMessage[]).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    data-testid={`message-${msg.id}`}
                  >
                    {msg.role === "assistant" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gfg-green text-white">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${msg.role === "user"
                        ? "bg-gfg-green text-white"
                        : "bg-gfg-bg-secondary dark:bg-gfg-dark-bg text-gfg-text dark:text-gfg-text-light border border-gfg-border-light dark:border-gfg-dark-border"
                        }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    {msg.role === "user" && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-gray-200 text-gfg-text">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-gfg-green text-white">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 rounded-lg bg-gfg-bg-secondary dark:bg-gfg-dark-bg p-4 border border-gfg-border-light dark:border-gfg-dark-border">
                      <Loader2 className="h-4 w-4 animate-spin text-gfg-green" />
                      <span className="text-sm text-gfg-text-light">Thinking...</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gfg-green-50 dark:bg-gfg-green-900/20">
                  <Bot className="h-10 w-10 text-gfg-green" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gfg-text">Ask me anything!</h3>
                  <p className="mt-1 max-w-md text-sm text-gfg-text-light">
                    I can help you understand concepts, explain topics, answer questions
                    about your documents, and guide your learning journey.
                  </p>
                </div>
                <div className="w-full max-w-lg">
                  <p className="mb-3 text-sm font-medium text-gfg-text-light">
                    Try asking:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestedQuestions.slice(0, 3).map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        className="h-auto whitespace-normal text-left border-gfg-border-medium dark:border-gfg-dark-border hover:border-gfg-green hover:text-gfg-green dark:text-gfg-text-light dark:hover:text-gfg-green"
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

          <div className="border-t border-gfg-border-light dark:border-gfg-dark-border p-4 bg-white dark:bg-gfg-dark-card">
            <div className="flex gap-2">
              <Textarea
                placeholder="Type your question here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[60px] resize-none bg-white dark:bg-gfg-dark-bg border-gfg-border-medium dark:border-gfg-dark-border focus-visible:ring-gfg-green dark:text-gfg-text-light"
                data-testid="input-message"
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() || chatMutation.isPending}
                className="h-auto"
                variant="cta"
                data-testid="button-send"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gfg-text-light">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </Card>

        {chatSessions.length > 0 && (
          <Card className="hidden w-64 shrink-0 lg:block border-gfg-border-light dark:border-gfg-dark-border dark:bg-gfg-dark-card">
            <CardHeader className="border-b border-gfg-border-light dark:border-gfg-dark-border px-4 py-3 bg-gfg-bg-secondary dark:bg-gfg-dark-bg">
              <CardTitle className="text-sm font-medium text-gfg-text">Chat History</CardTitle>
            </CardHeader>
            <ScrollArea className="h-[calc(100%-3rem)] bg-white dark:bg-gfg-dark-card">
              <div className="space-y-1 p-2">
                {chatSessions.slice().reverse().slice(0, 5).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSession(session)}
                    className={`flex w-full items-start gap-2 rounded-lg p-3 text-left transition-colors hover:bg-gfg-bg-secondary dark:hover:bg-gfg-dark-bg ${currentSession?.id === session.id ? "bg-gfg-bg-secondary dark:bg-gfg-dark-bg border border-gfg-border-light dark:border-gfg-dark-border" : ""
                      }`}
                    data-testid={`button-session-${session.id}`}
                  >
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gfg-text-light" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm text-gfg-text">
                        {(session.messages as ChatMessage[])[0]?.content.slice(0, 50) || "New conversation"}
                      </p>
                      <p className="mt-1 text-xs text-gfg-text-light">
                        {(session.messages as ChatMessage[]).length} messages
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        )}
      </div>
    </Section>
  );
}
