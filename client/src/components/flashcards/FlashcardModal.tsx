import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useFlashcards } from "@/hooks/useFlashcards";
import { Loader2 } from "lucide-react";

interface FlashcardModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    highlightId?: string | null;
    initialQuestion?: string;
    initialAnswer?: string;
    flashcardId?: string; // If provided, we are editing
    initialTags?: string[];
}

export function FlashcardModal({
    isOpen,
    onClose,
    documentId,
    highlightId,
    initialQuestion = "",
    initialAnswer = "",
    flashcardId,
    initialTags = [],
}: FlashcardModalProps) {
    const { createFlashcard, updateFlashcard, isCreating, isUpdating } = useFlashcards(documentId);
    const [question, setQuestion] = useState(initialQuestion);
    const [answer, setAnswer] = useState(initialAnswer);
    const [tags, setTags] = useState<string>(initialTags.join(", "));

    useEffect(() => {
        if (isOpen) {
            setQuestion(initialQuestion);
            setAnswer(initialAnswer);
            setTags(initialTags.join(", "));
        }
    }, [isOpen, initialQuestion, initialAnswer, initialTags]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const tagList = tags.split(",").map((t) => t.trim()).filter((t) => t);

        try {
            if (flashcardId) {
                await updateFlashcard({
                    id: flashcardId,
                    updates: {
                        question,
                        answer,
                        tags: tagList,
                    },
                });
            } else {
                await createFlashcard({
                    question,
                    answer,
                    highlightId: highlightId || null,
                    tags: tagList,
                    difficulty: 0,
                    interval: 0,
                    ease: 250,
                    repetition: 0,
                    nextReview: null,
                });
            }
            onClose();
        } catch (error) {
            // Error handled by hook
        }
    };

    const isLoading = isCreating || isUpdating;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{flashcardId ? "Edit Flashcard" : "Create Flashcard"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="question">Question (Front)</Label>
                        <Textarea
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter the question..."
                            required
                            className="resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="answer">Answer (Back)</Label>
                        <Textarea
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the answer..."
                            required
                            className="resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tags">Tags (comma separated)</Label>
                        <Input
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="biology, exam-1, important"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {flashcardId ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
