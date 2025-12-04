import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Network, Sparkles } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getStoredProvider } from "@/pages/settings";
import { Mindmap } from "@shared/schema";

interface AutoGenerateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: (mindmap: Mindmap) => void;
}

export function AutoGenerateModal({ open, onOpenChange, onSuccess }: AutoGenerateModalProps) {
    const { documents, addMindmap } = useAppStore();
    const [topic, setTopic] = useState("");
    const [selectedDocId, setSelectedDocId] = useState("none");

    const generateMutation = useMutation({
        mutationFn: async (): Promise<Mindmap> => {
            const payload = {
                documentId: selectedDocId !== "none" ? selectedDocId : undefined,
                topic: topic || undefined,
                provider: getStoredProvider(),
            };
            const response = await apiRequest("POST", "/api/mindmap/generate", payload);
            return response.json();
        },
        onSuccess: (data) => {
            addMindmap(data);
            onSuccess(data);
            onOpenChange(false);
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#0b0f12] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Sparkles className="h-5 w-5 text-green-400" />
                        Generate Mindmap
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Create a structured concept map from a document or topic using AI.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="document" className="text-white">Source Document (Optional)</Label>
                        <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                            <SelectTrigger id="document" className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select a document..." />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0b0f12] border-white/10 text-white">
                                <SelectItem value="none" className="hover:bg-white/5 cursor-pointer">No document (use topic only)</SelectItem>
                                {documents
                                    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                                    .map((doc) => (
                                        <SelectItem key={doc.id} value={doc.id} className="hover:bg-white/5 cursor-pointer">
                                            {doc.name}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="topic" className="text-white">Topic {selectedDocId === "none" && "(Required)"}</Label>
                        <Input
                            id="topic"
                            placeholder="e.g., Photosynthesis, World War II"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</Button>
                    <Button
                        onClick={() => generateMutation.mutate()}
                        disabled={generateMutation.isPending || (selectedDocId === "none" && !topic.trim())}
                        className="bg-green-600 hover:bg-green-500 text-white"
                    >
                        {generateMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Network className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
