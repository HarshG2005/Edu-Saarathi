import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { PdfViewer } from "@/components/pdf/PdfViewer";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { FlashcardModal } from "@/components/flashcards/FlashcardModal";
import { AnnotationSidebar } from "@/components/pdf/AnnotationSidebar";
import { apiRequest } from "@/lib/queryClient";
import { Highlight } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHighlights } from "@/hooks/useHighlights";
import { useFlashcards } from "@/hooks/useFlashcards";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export const DocumentViewerPage: React.FC = () => {
    const params = useParams<{ id: string }>();
    const id = params.id || "";
    const { toast } = useToast();
    const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);
    const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
    const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

    // Hooks
    const { highlights, createHighlight } = useHighlights(id);
    // useFlashcards is used inside FlashcardModal, but we might need it here if we want to show list?
    // The sidebar shows the list.

    // Create Note Mutation (Still manual as I didn't create useNotes hook yet, or maybe I should have?)
    // I'll keep it manual for now or move to a hook later.
    // Actually, I should probably leave notes as is for now to minimize scope creep, 
    // but I'll use apiRequest directly as before.
    // Wait, I can just copy the existing mutation logic for notes.

    const handleHighlightCreate = async (
        highlightData: Omit<Highlight, "id" | "createdAt" | "userId" | "documentId">,
        action?: "note" | "flashcard"
    ) => {
        try {
            // Create highlight
            const newHighlight = await createHighlight({
                ...highlightData,
                bbox: highlightData.bbox as any
            });

            if (action === "note") {
                setActiveHighlight(newHighlight);
                setIsNoteEditorOpen(true);
            } else if (action === "flashcard") {
                setActiveHighlight(newHighlight);
                setIsFlashcardModalOpen(true);
            }
        } catch (error) {
            // Error handled by hook
        }
    };

    const handleHighlightClick = (highlight: Highlight) => {
        setActiveHighlight(highlight);
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
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gfg-dark-bg">
                <Loader2 className="h-10 w-10 animate-spin text-gfg-green dark:text-gfg-green-light" />
                <span className="mt-4 text-lg font-medium text-gfg-text-light dark:text-gfg-dark-muted">Loading Document...</span>
            </div>
        );
    }

    if (pdfError) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center gap-4 bg-white dark:bg-gfg-dark-bg p-6 text-center">
                <div className="rounded-full bg-red-50 dark:bg-red-900/20 p-4">
                    <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gfg-text dark:text-gfg-dark-text">Failed to load PDF</h3>
                    <p className="text-gfg-text-light dark:text-gfg-dark-muted max-w-md mx-auto">{(pdfError as Error).message}</p>
                </div>
                <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <ErrorBoundary>
            <div className="h-screen w-full overflow-hidden flex flex-row bg-gfg-bg dark:bg-gfg-dark-bg transition-colors duration-300">
                <div className="flex-1 relative overflow-auto flex flex-col bg-white dark:bg-gfg-dark-panel shadow-sm m-4 rounded-xl border border-gfg-border dark:border-gfg-dark-border">
                    <PdfViewer
                        file={pdfBlob}
                        highlights={highlights}
                        onHighlightCreate={handleHighlightCreate}
                        onHighlightClick={handleHighlightClick}
                    />
                </div>

                <div className="w-[350px] border-l border-gfg-border dark:border-gfg-dark-border bg-white dark:bg-gfg-dark-panel">
                    <AnnotationSidebar documentId={id} />
                </div>

                {/* Note Editor Modal */}
                <NoteEditor
                    isOpen={isNoteEditorOpen}
                    onClose={() => {
                        setIsNoteEditorOpen(false);
                        setActiveHighlight(null);
                    }}
                    onSave={async (text) => {
                        if (activeHighlight) {
                            await apiRequest("POST", "/api/user-notes", {
                                documentId: id,
                                highlightId: activeHighlight.id,
                                text,
                            });
                        }
                    }}
                    highlightText={activeHighlight?.text}
                />

                {/* Flashcard Modal */}
                {activeHighlight && activeHighlight.text && (
                    <FlashcardModal
                        isOpen={isFlashcardModalOpen}
                        onClose={() => {
                            setIsFlashcardModalOpen(false);
                            setActiveHighlight(null);
                        }}
                        documentId={id}
                        highlightId={activeHighlight.id}
                        initialQuestion={`Explain: "${activeHighlight.text.slice(0, 100)}${activeHighlight.text.length > 100 ? "..." : ""}"`}
                        initialAnswer={activeHighlight.text}
                    />
                )}
            </div>
        </ErrorBoundary>
    );
};
