import { useFlashcards } from "@/hooks/useFlashcards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Edit2, PlayCircle } from "lucide-react";
import { useState } from "react";
import { FlashcardModal } from "./FlashcardModal";
import { UserFlashcard } from "@shared/schema";

interface FlashcardsListProps {
    documentId: string;
}

export function FlashcardsList({ documentId }: FlashcardsListProps) {
    const { flashcards, isLoading, deleteFlashcard, isDeleting } = useFlashcards(documentId);
    const [editingCard, setEditingCard] = useState<UserFlashcard | null>(null);

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (flashcards.length === 0) {
        return (
            <div className="text-center p-8 text-muted-foreground">
                No flashcards created yet. Highlight text in the document to create one!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                <div className="text-sm font-medium">
                    {flashcards.length} Cards
                </div>
                <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                        window.location.href = `/flashcards/review?returnTo=/documents/${documentId}`;
                    }}
                >
                    <PlayCircle className="h-4 w-4" />
                    Study Deck
                </Button>
            </div>

            {flashcards.map((card) => (
                <Card key={card.id} className="relative group">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Question</CardTitle>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditingCard(card)}
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => deleteFlashcard(card.id)}
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <p className="font-semibold mt-1">{card.question}</p>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Answer</p>
                        <p className="text-sm">{card.answer}</p>
                        {card.tags && Array.isArray(card.tags) && (card.tags as string[]).length > 0 && (
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {(card.tags as string[]).map((tag, i) => (
                                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {editingCard && (
                <FlashcardModal
                    isOpen={!!editingCard}
                    onClose={() => setEditingCard(null)}
                    documentId={documentId}
                    flashcardId={editingCard.id}
                    initialQuestion={editingCard.question}
                    initialAnswer={editingCard.answer}
                    initialTags={Array.isArray(editingCard.tags) ? (editingCard.tags as string[]) : []}
                />
            )}
        </div>
    );
}
