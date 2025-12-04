import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Highlight, InsertHighlight } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useHighlights(documentId: string) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: highlights, isLoading, error } = useQuery<Highlight[]>({
        queryKey: ["highlights", documentId],
        queryFn: async () => {
            if (!documentId) return [];
            const res = await apiRequest("GET", `/api/documents/${documentId}/highlights`);
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        },
        enabled: !!documentId,
    });

    const createHighlightMutation = useMutation({
        mutationFn: async (highlight: Omit<InsertHighlight, "id" | "userId" | "createdAt" | "documentId">) => {
            const res = await apiRequest("POST", `/api/documents/${documentId}/highlights`, highlight);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["highlights", documentId] });
            // Optional: toast success? Usually highlights are instant/silent.
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create highlight",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const deleteHighlightMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/highlights/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["highlights", documentId] });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete highlight",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    return {
        highlights: highlights || [],
        isLoading,
        error,
        createHighlight: createHighlightMutation.mutateAsync,
        deleteHighlight: deleteHighlightMutation.mutateAsync,
        isCreating: createHighlightMutation.isPending,
        isDeleting: deleteHighlightMutation.isPending,
    };
}
