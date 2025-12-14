import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, StickyNote, GraduationCap, Highlighter, FileText, RotateCw, Settings } from "lucide-react";
import { UserNote, UserFlashcard, Highlight, Document } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/section";
import { getFlashcardTheme } from "@/lib/flashcard-theme";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

function FlipCard({ question, answer, theme }: { question: string; answer: string; theme: any }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="perspective-1000 w-full aspect-[3/2] relative group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <motion.div
                className="w-full h-full relative preserve-3d transition-all duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden">
                    <Card className={`w-full h-full flex flex-col items-center justify-center p-6 text-center border-2 shadow-lg ${theme.class}`}>
                        <div className="absolute top-4 left-4 text-xs font-medium opacity-70 uppercase tracking-wider">
                            Question
                        </div>
                        <p className="text-lg font-medium leading-relaxed line-clamp-4">
                            {question}
                        </p>
                        <div className="absolute bottom-4 text-xs opacity-70 flex items-center gap-2">
                            <RotateCw className="h-3 w-3" />
                            Click to flip
                        </div>
                    </Card>
                </div>

                {/* Back */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <Card className={`w-full h-full flex flex-col items-center justify-center p-6 text-center border-2 shadow-lg ${theme.class}`}>
                        <div className="absolute top-4 left-4 text-xs font-medium opacity-70 uppercase tracking-wider">
                            Answer
                        </div>
                        <p className="text-base leading-relaxed line-clamp-6 whitespace-pre-wrap">
                            {answer}
                        </p>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
}

export default function StudyGuidePage() {
    const { documents } = useAppStore();
    const [selectedDocId, setSelectedDocId] = useState<string>("");
    const [cardTheme, setCardTheme] = useState(getFlashcardTheme("default"));

    useEffect(() => {
        const loadTheme = () => {
            const savedColor = localStorage.getItem("flashcard_color") || "default";
            setCardTheme(getFlashcardTheme(savedColor));
        };
        loadTheme();
        window.addEventListener("flashcard-theme-changed", loadTheme);
        return () => window.removeEventListener("flashcard-theme-changed", loadTheme);
    }, []);

    const { data: notes = [], isLoading: isLoadingNotes } = useQuery<UserNote[]>({
        queryKey: ["/api/documents", selectedDocId, "user-notes"],
        enabled: !!selectedDocId,
    });

    const { data: flashcards = [], isLoading: isLoadingFlashcards } = useQuery<UserFlashcard[]>({
        queryKey: ["/api/documents", selectedDocId, "flashcards"],
        enabled: !!selectedDocId,
    });

    const { data: highlights = [], isLoading: isLoadingHighlights } = useQuery<Highlight[]>({
        queryKey: ["/api/documents", selectedDocId, "highlights"],
        enabled: !!selectedDocId,
    });

    const selectedDoc = documents.find(d => d.id === selectedDocId);

    const sortedDocuments = [...documents].sort((a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return (
        <Section className="flex flex-col gap-6 h-full">
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">Study Guide</h1>
                    <p className="text-gray-400">
                        Review all your learning materials for a specific document in one place.
                    </p>
                </div>
                <Link href="/settings">
                    <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Settings className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Card className="border-border shadow-sm bg-card">
                <CardHeader>
                    <CardTitle className="text-foreground">Select Document</CardTitle>
                    <CardDescription className="text-muted-foreground">Choose a document to view its study guide</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                        <SelectTrigger className="w-full md:w-[400px] bg-muted border-border text-foreground">
                            <SelectValue placeholder="Select a document..." />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border text-foreground">
                            {sortedDocuments.map((doc) => (
                                <SelectItem key={doc.id} value={doc.id} className="hover:bg-muted cursor-pointer">
                                    {doc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedDocId && (
                <div className="flex-1 flex flex-col min-h-0">
                    <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                        <TabsList className="bg-muted border border-border">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Overview</TabsTrigger>
                            <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Notes ({notes.length})</TabsTrigger>
                            <TabsTrigger value="flashcards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Flashcards ({flashcards.length})</TabsTrigger>
                            <TabsTrigger value="highlights" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-muted-foreground">Highlights ({highlights.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-6">
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card className="border-border shadow-sm bg-card">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-foreground">Total Notes</CardTitle>
                                        <StickyNote className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-primary">{notes.length}</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border shadow-sm bg-card">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-foreground">Total Flashcards</CardTitle>
                                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-primary">{flashcards.length}</div>
                                    </CardContent>
                                </Card>
                                <Card className="border-border shadow-sm bg-card">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-foreground">Total Highlights</CardTitle>
                                        <Highlighter className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-primary">{highlights.length}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {selectedDoc && (
                                <Card className="border-border shadow-sm bg-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-foreground">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Document Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between py-1 border-b border-border">
                                            <span className="font-medium text-foreground">Name</span>
                                            <span className="text-muted-foreground">{selectedDoc.name}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-border">
                                            <span className="font-medium text-foreground">File Name</span>
                                            <span className="text-muted-foreground">{selectedDoc.fileName}</span>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-border">
                                            <span className="font-medium text-foreground">Uploaded</span>
                                            <span className="text-muted-foreground">{formatDate(selectedDoc.uploadedAt)}</span>
                                        </div>
                                        <div className="flex justify-between py-1">
                                            <span className="font-medium text-foreground">Pages</span>
                                            <span className="text-muted-foreground">{selectedDoc.pageCount}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="notes" className="mt-6">
                            <ScrollArea className="h-[600px] rounded-md border border-border p-4 bg-card">
                                {isLoadingNotes ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : notes.length === 0 ? (
                                    <div className="text-center text-muted-foreground p-8">No notes found.</div>
                                ) : (
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                        {notes.map((note) => (
                                            <Card key={note.id} className="border-border shadow-sm bg-muted/50">
                                                <CardHeader>
                                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                                        {formatDate(note.createdAt)}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="whitespace-pre-wrap text-foreground">{note.text}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="flashcards" className="mt-6">
                            <ScrollArea className="h-[600px] rounded-md border border-border p-4 bg-card">
                                {isLoadingFlashcards ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : flashcards.length === 0 ? (
                                    <div className="text-center text-muted-foreground p-8">No flashcards found.</div>
                                ) : (
                                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {flashcards.map((card) => (
                                            <FlipCard key={card.id} question={card.question} answer={card.answer} theme={cardTheme} />
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="highlights" className="mt-6">
                            <ScrollArea className="h-[600px] rounded-md border border-border p-4 bg-card">
                                {isLoadingHighlights ? (
                                    <div className="flex justify-center p-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    </div>
                                ) : highlights.length === 0 ? (
                                    <div className="text-center text-muted-foreground p-8">No highlights found.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {highlights.map((highlight) => (
                                            <Card key={highlight.id} className="border-border shadow-sm bg-muted/50">
                                                <CardContent className="p-4 flex gap-4">
                                                    <div
                                                        className="w-1 self-stretch rounded-full shrink-0"
                                                        style={{ backgroundColor: highlight.color || "yellow" }}
                                                    />
                                                    <div>
                                                        <p className="italic text-foreground">"{highlight.text}"</p>
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Page {highlight.page} • {formatDate(highlight.createdAt)}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </Section>
    );
}
