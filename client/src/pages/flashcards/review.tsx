import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UserFlashcard } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, RotateCcw, CheckCircle, Clock, ThumbsUp, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { getFlashcardTheme } from "@/lib/flashcard-theme";

export const FlashcardReviewPage: React.FC = () => {
    const [location, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [sessionComplete, setSessionComplete] = useState(false);
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

    // Fetch due flashcards
    // We need an endpoint for "due" flashcards.
    // Currently we have GET /api/documents/:id/flashcards (all for doc)
    // and GET /api/flashcards (all for user? No, I didn't implement that yet, only doc specific).
    // Wait, `server/routes/flashcards.ts` has:
    // router.get("/documents/:documentId/flashcards", ...)
    // It does NOT have a global "get all due flashcards" endpoint.
    // I should probably add one, or filter on client side (not ideal if many).
    // For now, I'll assume we are reviewing for a specific document, or I need to add the endpoint.
    // The requirements implied "FlashcardsList" and "Review".
    // If I want to review ALL due cards, I need a new endpoint.
    // Let's check `server/routes/flashcards.ts` again.

    // It seems I missed adding a "get all due flashcards" endpoint.
    // I will add it now. GET /api/flashcards/due

    // For now, I will write the component assuming the endpoint exists, 
    // and then I will go add the endpoint.

    const { data: dueFlashcards = [], isLoading } = useQuery<UserFlashcard[]>({
        queryKey: ["/api/flashcards/due"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/flashcards/due");
            const data = await res.json();
            // Sort by documentId to group them together
            return data.sort((a: UserFlashcard, b: UserFlashcard) => {
                if (a.documentId === b.documentId) return 0;
                if (!a.documentId) return 1;
                if (!b.documentId) return -1;
                return a.documentId.localeCompare(b.documentId);
            });
        },
    });

    const updateFlashcardMutation = useMutation({
        mutationFn: async ({ id, quality, previous }: { id: string; quality: number; previous: UserFlashcard }) => {
            const res = await apiRequest("PUT", `/api/flashcards/${id}`, { quality, previous });
            return res.json();
        },
        onSuccess: () => {
            // Move to next card
            if (currentIndex < dueFlashcards.length - 1) {
                setIsFlipped(false);
                setCurrentIndex((prev) => prev + 1);
            } else {
                setSessionComplete(true);
            }
            // Do NOT invalidate here to keep the list stable during review.
            // queryClient.invalidateQueries({ queryKey: ["/api/flashcards/due"] });
        },
        onError: (error) => {
            toast({
                title: "Failed to update flashcard",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleRate = (quality: number) => {
        const card = dueFlashcards[currentIndex];
        updateFlashcardMutation.mutate({ id: card.id, quality, previous: card });
    };

    const searchParams = new URLSearchParams(window.location.search);
    const returnTo = searchParams.get("returnTo");

    const handleBack = () => {
        if (returnTo) {
            window.location.href = returnTo;
        } else {
            setLocation("/");
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg">
                <Loader2 className="h-8 w-8 animate-spin text-gfg-green" />
            </div>
        );
    }

    if (dueFlashcards.length === 0 && !sessionComplete) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg p-4">
                <div className="text-center space-y-4">
                    <CheckCircle className="h-16 w-16 text-gfg-green mx-auto" />
                    <h1 className="text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">All Caught Up!</h1>
                    <p className="text-gfg-text-light dark:text-gfg-dark-muted">No flashcards due for review right now.</p>
                    <Button onClick={handleBack}>Back</Button>
                </div>
            </div>
        );
    }

    if (sessionComplete) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg p-4">
                <div className="text-center space-y-4">
                    <Sparkles className="h-16 w-16 text-yellow-400 mx-auto" />
                    <h1 className="text-2xl font-bold text-gfg-text dark:text-gfg-dark-text">Session Complete!</h1>
                    <p className="text-gfg-text-light dark:text-gfg-dark-muted">You've reviewed all due cards.</p>
                    <Button onClick={handleBack}>Back</Button>
                </div>
            </div>
        );
    }

    const currentCard = dueFlashcards[currentIndex];

    if (!currentCard) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gfg-bg dark:bg-gfg-dark-bg">
                <Loader2 className="h-8 w-8 animate-spin text-gfg-green" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gfg-bg dark:bg-gfg-dark-bg flex flex-col items-center py-8 px-4">
            <div className="w-full max-w-2xl flex items-center justify-between mb-8">
                <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleBack} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button variant="ghost" onClick={() => setLocation("/flashcards/smart-review")} className="gap-2">
                        <Home className="h-4 w-4" /> Home
                    </Button>
                </div>
                <div className="text-sm font-medium text-gfg-text-light dark:text-gfg-dark-muted">
                    Card {currentIndex + 1} of {dueFlashcards.length}
                </div>
            </div>

            <div className="w-full max-w-2xl perspective-1000">
                <motion.div
                    className="relative w-full aspect-video cursor-pointer"
                    onClick={() => !isFlipped && setIsFlipped(true)}
                    initial={false}
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* Front */}
                    <Card className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-2 shadow-lg ${cardTheme.class}`}>
                        <CardContent>
                            <h2 className="text-2xl font-semibold mb-4">{currentCard.question}</h2>
                            <p className="text-sm opacity-70">Tap to flip</p>
                        </CardContent>
                    </Card>

                    {/* Back */}
                    <Card
                        className={`absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-2 shadow-lg ${cardTheme.class}`}
                        style={{ transform: "rotateY(180deg)" }}
                    >
                        <CardContent className="overflow-y-auto max-h-[60%] w-full">
                            <p className="text-xl whitespace-pre-wrap">{currentCard.answer}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <AnimatePresence>
                {isFlipped && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 flex gap-4 flex-wrap justify-center"
                    >
                        <Button
                            variant="outline"
                            className="border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 min-w-[100px]"
                            onClick={() => handleRate(1)}
                        >
                            Again (1)
                        </Button>
                        <Button
                            variant="outline"
                            className="border-orange-200 hover:bg-orange-50 dark:border-orange-900/50 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400 min-w-[100px]"
                            onClick={() => handleRate(3)}
                        >
                            Hard (3)
                        </Button>
                        <Button
                            variant="outline"
                            className="border-blue-200 hover:bg-blue-50 dark:border-blue-900/50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 min-w-[100px]"
                            onClick={() => handleRate(4)}
                        >
                            Good (4)
                        </Button>
                        <Button
                            variant="outline"
                            className="border-green-200 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 min-w-[100px]"
                            onClick={() => handleRate(5)}
                        >
                            Easy (5)
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Helper for backface-hidden (Tailwind doesn't have it by default usually, but we can use style or custom class)
// I used style={{ transformStyle: "preserve-3d" }} and backface-hidden class.
// I might need to add utility class or inline style for backface-visibility.
// I'll add a style tag or just use inline styles for safety.
function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    )
}
