import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mindmap } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useMindmaps() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: mindmaps = [], isLoading } = useQuery<Mindmap[]>({
        queryKey: ["/api/mindmaps"],
        queryFn: async () => {
            const res = await apiRequest("GET", "/api/mindmaps");
            return res.json();
        }
    });

    const createMindmapMutation = useMutation({
        mutationFn: async (mindmap: Partial<Mindmap>) => {
            const res = await apiRequest("POST", "/api/mindmaps", mindmap);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mindmaps"] });
            toast({ title: "Mindmap created" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMindmapMutation = useMutation({
        mutationFn: async (id: string) => {
            await apiRequest("DELETE", `/api/mindmaps/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/mindmaps"] });
            toast({ title: "Mindmap deleted" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    return {
        mindmaps,
        isLoading,
        createMindmap: createMindmapMutation.mutate,
        deleteMindmap: deleteMindmapMutation.mutate,
        isCreating: createMindmapMutation.isPending,
        isDeleting: deleteMindmapMutation.isPending
    };
}
