import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { UserFlashcard, Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, PlayCircle, BookOpen, Sparkles } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export const FlashcardsPage: React.FC = () => {
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [selectedDocId, setSelectedDocId] = useState<string>("none");
    const [topic, setTopic] = useState("");
    const [count, setCount] = useState("10");

    const { documents } = useAppStore();

    const { data: dueFlashcards = [], isLoading: isLoadingDue } = useQuery<UserFlashcard[]>({
        queryKey: ["/api/flashcards/due"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/flashcards/due");
            return res.json();
        },
    });

    const generateMutation = useMutation({
        mutationFn: async () => {
            const payload: any = {
                count: parseInt(count),
                topic: topic || undefined,
            };

            if (selectedDocId && selectedDocId !== "none") {
                payload.documentId = selectedDocId;
            }

            const res = await apiRequest("POST", "/api/flashcards/batch-generate", payload);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/flashcards/due"] });
            setIsGenerateOpen(false);
            setTopic("");
            setSelectedDocId("none");
            toast({
                title: "Flashcards Generated",
                description: `Successfully created ${data.length} new flashcards.`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Generation Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (isLoadingDue) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg">
                <Loader2 className="h-8 w-8 animate-spin text-gfg-green" />
            </div>
        );
    }

    const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

    return (
        <ErrorBoundary>
            <div className="min-h-screen w-full bg-gfg-bg dark:bg-gfg-dark-bg p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gfg-text dark:text-gfg-dark-text">Smart Review</h1>
                            <p className="text-gfg-text-light dark:text-gfg-dark-muted mt-2">
                                Review your knowledge with spaced repetition.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                className="gap-2"
                                onClick={() => {
                                    useAppStore.getState().setCurrentFeature("flashcards");
                                    setLocation("/");
                                }}
                            >
                                &larr; Back to Standard Mode
                            </Button>
                            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2">
                                        <Sparkles className="h-4 w-4 text-gfg-green" />
                                        Generate Deck
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Generate Flashcards</DialogTitle>
                                        <DialogDescription>
                                            Create a new deck from a document or a specific topic.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="document">Source Document (Optional)</Label>
                                            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a document..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">No document (Topic only)</SelectItem>
                                                    {documents.map((doc) => (
                                                        <SelectItem key={doc.id} value={doc.id}>
                                                            {doc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="topic">Topic {!hasDocumentSelected && "(Required)"}</Label>
                                            <Input
                                                id="topic"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder={hasDocumentSelected ? "Optional topic focus..." : "e.g. Photosynthesis, World War II..."}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="count">Number of Cards</Label>
                                            <Select value={count} onValueChange={setCount}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select count" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5 Cards</SelectItem>
                                                    <SelectItem value="10">10 Cards</SelectItem>
                                                    <SelectItem value="15">15 Cards</SelectItem>
                                                    <SelectItem value="20">20 Cards</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => generateMutation.mutate()}
                                            disabled={(!hasDocumentSelected && !topic) || generateMutation.isPending}
                                            className="bg-gfg-green-cta hover:bg-gfg-green text-white"
                                        >
                                            {generateMutation.isPending ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                "Generate"
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Button
                                onClick={() => setLocation("/flashcards/review")}
                                disabled={dueFlashcards.length === 0}
                                className="bg-gfg-green-cta hover:bg-gfg-green text-white gap-2"
                            >
                                <PlayCircle className="h-4 w-4" />
                                Review Due ({dueFlashcards.length})
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Stats Card */}
                        <Card className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border">
                            <CardHeader>
                                <CardTitle>Due Today</CardTitle>
                                <CardDescription>Cards waiting for review</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-gfg-green">{dueFlashcards.length}</div>
                            </CardContent>
                        </Card>

                        {/* Add more stats here if needed */}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-gfg-text dark:text-gfg-dark-text mb-4">Your Decks (by Document)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents
                                .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                                .map((doc) => (
                                    <Card
                                        key={doc.id}
                                        className="bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border hover:border-gfg-green/50 transition-colors cursor-pointer"
                                        onClick={() => setLocation(`/documents/${doc.id}`)}
                                    >
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <CardTitle className="line-clamp-1">{doc.name}</CardTitle>
                                                    <CardDescription>
                                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </CardDescription>
                                                </div>
                                                <BookOpen className="h-5 w-5 text-gfg-text-light dark:text-gfg-dark-muted" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Button variant="link" className="p-0 h-auto text-gfg-green">
                                                View Document & Flashcards &rarr;
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            {documents.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gfg-text-light dark:text-gfg-dark-muted border-2 border-dashed border-gfg-border dark:border-gfg-dark-border rounded-lg">
                                    No documents found. Upload a PDF to start creating flashcards!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};
