import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserFlashcard, InsertUserFlashcard } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useFlashcards(documentId: string) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: flashcards, isLoading, error } = useQuery<UserFlashcard[]>({
        queryKey: ["/api/documents", documentId, "flashcards"],
        queryFn: async () => {
            if (!documentId) return [];
            const res = await apiRequest("GET", `/api/documents/${documentId}/flashcards`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!documentId,
    });

    const createFlashcardMutation = useMutation({
        mutationFn: async (flashcard: Omit<InsertUserFlashcard, "id" | "userId" | "createdAt" | "updatedAt" | "documentId">) => {
            const res = await apiRequest("POST", "/api/flashcards", { ...flashcard, documentId });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "flashcards"] });
            toast({
                title: "Flashcard created",
                description: "Successfully added to your deck.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create flashcard",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const updateFlashcardMutation = useMutation({
        mutationFn: async ({ id, updates, quality, previous }: { id: string; updates?: Partial<UserFlashcard>; quality?: number; previous?: any }) => {
            const res = await apiRequest("PUT", `/api/flashcards/${id}`, { ...updates, quality, previous });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "flashcards"] });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update flashcard",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteFlashcardMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/flashcards/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/documents", documentId, "flashcards"] });
            toast({
                title: "Flashcard deleted",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete flashcard",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        flashcards: flashcards || [],
        isLoading,
        error,
        createFlashcard: createFlashcardMutation.mutateAsync,
        updateFlashcard: updateFlashcardMutation.mutateAsync,
        deleteFlashcard: deleteFlashcardMutation.mutateAsync,
        isCreating: createFlashcardMutation.isPending,
        isUpdating: updateFlashcardMutation.isPending,
        isDeleting: deleteFlashcardMutation.isPending,
    };
}
