import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { PdfViewer } from "@/components/pdf/PdfViewer";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { FlashcardCreator } from "@/components/flashcards/FlashcardCreator";
import { AnnotationSidebar } from "@/components/pdf/AnnotationSidebar";
import { apiRequest } from "@/lib/queryClient";
import { Highlight, UserNote, UserFlashcard } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const DocumentViewerPage: React.FC = () => {
    const params = useParams<{ id: string }>();
    const id = params.id;
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
    const [isFlashcardCreatorOpen, setIsFlashcardCreatorOpen] = useState(false);
    const [pendingHighlight, setPendingHighlight] = useState<Omit<Highlight, "id" | "createdAt" | "userId" | "documentId"> | null>(null);

    // Fetch Highlights
    const { data: highlights = [], isLoading: isLoadingHighlights } = useQuery<Highlight[]>({
        queryKey: ["/api/documents", id, "highlights"],
    });

    // Create Highlight Mutation
    const createHighlightMutation = useMutation({
        mutationFn: async (newHighlight: Omit<Highlight, "id" | "createdAt" | "userId" | "documentId">) => {
            const res = await apiRequest("POST", `/api/documents/${id}/highlights`, newHighlight);
            return res.json();
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/api/documents", id, "highlights"] });
            return data;
        },
        onError: (error) => {
            toast({
                title: "Error creating highlight",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Create Note Mutation
    const createNoteMutation = useMutation({
        mutationFn: async ({ highlightId, text }: { highlightId: string; text: string }) => {
            const res = await apiRequest("POST", "/api/user-notes", {
                documentId: id,
                highlightId,
                text,
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Note saved successfully" });
        },
        onError: (error) => {
            toast({
                title: "Error saving note",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Create Flashcard Mutation
    const createFlashcardMutation = useMutation({
        mutationFn: async ({ highlightId, question, answer }: { highlightId: string; question: string; answer: string }) => {
            const res = await apiRequest("POST", "/api/user-flashcards", {
                documentId: id,
                highlightId,
                question,
                answer,
            });
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Flashcard created successfully" });
        },
        onError: (error) => {
            toast({
                title: "Error creating flashcard",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleHighlightCreate = async (
        highlight: Omit<Highlight, "id" | "createdAt" | "userId" | "documentId">,
        action?: "note" | "flashcard"
    ) => {
        try {
            // Optimistically create highlight
            const newHighlight = await createHighlightMutation.mutateAsync(highlight);

            if (action === "note") {
                setActiveHighlight(newHighlight);
                setIsNoteEditorOpen(true);
            } else if (action === "flashcard") {
                setActiveHighlight(newHighlight);
                setIsFlashcardCreatorOpen(true);
            }
        } catch (error) {
            console.error("Failed to create highlight:", error);
        }
    };

    const handleHighlightClick = (highlight: Highlight) => {
        setActiveHighlight(highlight);
        // For now, clicking a highlight opens the note editor. 
        // Ideally, we should show a menu or existing notes.
        // But per requirements: "Clicking an existing highlight opens NoteEditor/FlashcardCreator for that highlight."
        // I'll default to NoteEditor for now, or maybe a small menu?
        // Let's open NoteEditor as it's more generic.
        setIsNoteEditorOpen(true);
    };

    // Fetch PDF Blob
    const { data: pdfBlob, isLoading: isLoadingPdf, error: pdfError } = useQuery({
        queryKey: ["/api/documents", id, "pdf"],
        queryFn: async () => {
            const res = await fetch(`/api/documents/${id}/pdf`);
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to load PDF");
            }
            return res.blob();
        }
    });

    if (isLoadingPdf) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading PDF...</span>
            </div>
        );
    }

    if (pdfError) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4">
                <div className="text-destructive font-medium">Failed to load PDF</div>
                <div className="text-muted-foreground text-sm">{pdfError.message}</div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full overflow-hidden flex flex-row">
            <div className="flex-1 relative overflow-auto flex flex-col">
                <PdfViewer
                    file={pdfBlob}
                    highlights={highlights}
                    onHighlightCreate={(
                        h: Omit<Highlight, "id" | "createdAt" | "userId" | "documentId">,
                        action?: "note" | "flashcard"
                    ) => {
                        handleHighlightCreate(h, action);
                    }}
                    onHighlightClick={handleHighlightClick}
                />
            </div>

            <AnnotationSidebar documentId={id} />

            {/* Note Editor Modal */}
            <NoteEditor
                isOpen={isNoteEditorOpen}
                onClose={() => {
                    setIsNoteEditorOpen(false);
                    setActiveHighlight(null);
                }}
                onSave={async (text) => {
                    if (activeHighlight) {
                        await createNoteMutation.mutateAsync({ highlightId: activeHighlight.id, text });
                        queryClient.invalidateQueries({ queryKey: ["/api/documents", id, "user-notes"] });
                    }
                }}
                highlightText={activeHighlight?.text}
            />

            {/* Flashcard Creator Modal */}
            <FlashcardCreator
                isOpen={isFlashcardCreatorOpen}
                onClose={() => {
                    setIsFlashcardCreatorOpen(false);
                    setActiveHighlight(null);
                }}
                onSave={async (question, answer) => {
                    if (activeHighlight) {
                        await createFlashcardMutation.mutateAsync({ highlightId: activeHighlight.id, question, answer });
                        queryClient.invalidateQueries({ queryKey: ["/api/documents", id, "user-flashcards"] });
                    }
                }}
                highlightText={activeHighlight?.text}
            />
        </div>
    );
};
