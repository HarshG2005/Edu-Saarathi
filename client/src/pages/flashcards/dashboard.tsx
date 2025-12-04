import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { UserFlashcard, Document } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, PlayCircle, BookOpen, Sparkles, FileText } from "lucide-react";
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
import { getGradient } from "@/lib/utils";

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
            <div className="h-screen w-full flex items-center justify-center bg-[#0b0f12]">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            </div>
        );
    }

    const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

    return (
        <ErrorBoundary>
            <div className="min-h-screen w-full p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">Smart Review</h1>
                            <p className="text-gray-400 mt-2">
                                Review your knowledge with spaced repetition.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                variant="ghost"
                                className="gap-2 text-gray-400 hover:text-white hover:bg-white/10"
                                onClick={() => {
                                    useAppStore.getState().setCurrentFeature("flashcards");
                                    setLocation("/");
                                }}
                            >
                                &larr; Back to Standard Mode
                            </Button>
                            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300">
                                        <Sparkles className="h-4 w-4" />
                                        Generate Deck
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-[#0b0f12] border-white/10 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Generate Flashcards</DialogTitle>
                                        <DialogDescription className="text-gray-400">
                                            Create a new deck from a document or a specific topic.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="document" className="text-white">Source Document (Optional)</Label>
                                            <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select a document..." />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0b0f12] border-white/10 text-white">
                                                    <SelectItem value="none" className="hover:bg-white/5 cursor-pointer">No document (Topic only)</SelectItem>
                                                    {documents.map((doc) => (
                                                        <SelectItem key={doc.id} value={doc.id} className="hover:bg-white/5 cursor-pointer">
                                                            {doc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="topic" className="text-white">Topic {!hasDocumentSelected && "(Required)"}</Label>
                                            <Input
                                                id="topic"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                placeholder={hasDocumentSelected ? "Optional topic focus..." : "e.g. Photosynthesis, World War II..."}
                                                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-green-500"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="count" className="text-white">Number of Cards</Label>
                                            <Select value={count} onValueChange={setCount}>
                                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                                    <SelectValue placeholder="Select count" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0b0f12] border-white/10 text-white">
                                                    <SelectItem value="5" className="hover:bg-white/5 cursor-pointer">5 Cards</SelectItem>
                                                    <SelectItem value="10" className="hover:bg-white/5 cursor-pointer">10 Cards</SelectItem>
                                                    <SelectItem value="15" className="hover:bg-white/5 cursor-pointer">15 Cards</SelectItem>
                                                    <SelectItem value="20" className="hover:bg-white/5 cursor-pointer">20 Cards</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            onClick={() => generateMutation.mutate()}
                                            disabled={(!hasDocumentSelected && !topic) || generateMutation.isPending}
                                            className="bg-green-600 hover:bg-green-500 text-white"
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
                                className="bg-green-600 hover:bg-green-500 text-white gap-2"
                            >
                                <PlayCircle className="h-4 w-4" />
                                Review Due ({dueFlashcards.length})
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Stats Card */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white">Due Today</CardTitle>
                                <CardDescription className="text-gray-400">Cards waiting for review</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-green-400">{dueFlashcards.length}</div>
                            </CardContent>
                        </Card>

                        {/* Add more stats here if needed */}
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4">Your Decks (by Document)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {documents
                                .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                                .map((doc, index) => (
                                    <div
                                        key={doc.id}
                                        className="rounded-2xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.025] group relative cursor-pointer"
                                        onClick={() => setLocation(`/documents/${doc.id}`)}
                                    >
                                        {/* Gradient header */}
                                        <div className={`p-5 bg-gradient-to-br ${getGradient(index)} relative`}>
                                            <div className="flex items-start gap-4">
                                                <div className="w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90">
                                                    <FileText className="w-6 h-6 opacity-90" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-semibold text-lg leading-tight truncate" title={doc.name}>{doc.name}</h3>
                                                    <p className="text-white/80 text-sm mt-1 truncate">Flashcard Deck</p>
                                                </div>
                                            </div>
                                            {/* subtle glow */}
                                            <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                                                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-3xl bg-white"></div>
                                            </div>
                                        </div>

                                        {/* Card body */}
                                        <div className="bg-neutral-900 p-5 border border-white/5 group-hover:border-white/10 transition-colors">
                                            <div className="flex items-center justify-between gap-4 mb-4">
                                                <div className="min-w-0">
                                                    <p className="text-gray-200 font-semibold truncate" title={doc.name}>{doc.name}</p>
                                                    <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                                                        Created • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button variant="link" className="p-0 h-auto text-green-400 hover:text-green-300">
                                                View Document & Flashcards &rarr;
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            {documents.length === 0 && (
                                <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-white/10 rounded-lg">
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
