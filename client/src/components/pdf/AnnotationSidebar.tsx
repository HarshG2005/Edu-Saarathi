
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { UserNote, UserFlashcard } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, StickyNote, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AnnotationSidebarProps {
    documentId: string;
}

export const AnnotationSidebar: React.FC<AnnotationSidebarProps> = ({ documentId }) => {
    const { data: notes = [], isLoading: isLoadingNotes } = useQuery<UserNote[]>({
        queryKey: ["/api/documents", documentId, "user-notes"],
    });

    const { data: flashcards = [], isLoading: isLoadingFlashcards } = useQuery<UserFlashcard[]>({
        queryKey: ["/api/documents", documentId, "user-flashcards"],
    });

    return (
        <div className="w-80 border-l bg-background flex flex-col h-full">
            <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">My Annotations</h2>
            </div>

            <Tabs defaultValue="notes" className="flex-1 flex flex-col min-h-0">
                <TabsList className="w-full justify-start rounded-none border-b px-4 h-12 bg-transparent">
                    <TabsTrigger value="notes" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none">
                        Notes ({notes.length})
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none">
                        Flashcards ({flashcards.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="flex-1 min-h-0 m-0">
                    <ScrollArea className="h-full p-4">
                        {isLoadingNotes ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : notes.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8 text-sm">
                                <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                No notes yet. Highlight text to add one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {notes.map((note) => (
                                    <Card key={note.id} className="bg-muted/50">
                                        <CardContent className="p-3 space-y-2">
                                            <p className="text-sm">{note.text}</p>
                                            <p className="text-xs text-muted-foreground text-right">
                                                {formatDate(note.createdAt)}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="flashcards" className="flex-1 min-h-0 m-0">
                    <ScrollArea className="h-full p-4">
                        {isLoadingFlashcards ? (
                            <div className="flex justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : flashcards.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8 text-sm">
                                <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                No flashcards yet. Highlight text to create one.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {flashcards.map((card) => (
                                    <Card key={card.id} className="bg-muted/50">
                                        <CardContent className="p-3 space-y-3">
                                            <div>
                                                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Q</span>
                                                <p className="text-sm font-medium mt-1">{card.question}</p>
                                            </div>
                                            <div className="border-t pt-2">
                                                <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">A</span>
                                                <p className="text-sm mt-1">{card.answer}</p>
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
    );
};
