import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";

interface FlashcardCreatorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (question: string, answer: string) => Promise<void>;
    initialQuestion?: string;
    initialAnswer?: string;
    highlightText?: string;
}

export const FlashcardCreator: React.FC<FlashcardCreatorProps> = ({
    isOpen,
    onClose,
    onSave,
    initialQuestion = "",
    initialAnswer = "",
    highlightText,
}) => {
    const [question, setQuestion] = useState(initialQuestion);
    const [answer, setAnswer] = useState(initialAnswer);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setQuestion(initialQuestion || (highlightText ? `Explain: "${highlightText.slice(0, 50)}..."` : ""));
            setAnswer(initialAnswer || highlightText || "");
        }
    }, [isOpen, initialQuestion, initialAnswer, highlightText]);

    const handleSave = async () => {
        if (!question.trim() || !answer.trim()) return;
        setIsSaving(true);
        try {
            await onSave(question, answer);
            onClose();
        } catch (error) {
            console.error("Failed to save flashcard:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-400" />
                        Create Flashcard
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="question">Question</Label>
                        <Textarea
                            id="question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Enter the question..."
                            className="h-24 bg-slate-950 border-slate-800 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Textarea
                            id="answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Enter the answer..."
                            className="h-24 bg-slate-950 border-slate-800 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !question.trim() || !answer.trim()} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Flashcard
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
