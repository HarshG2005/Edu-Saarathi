import { useState, useEffect } from "react";
import { MindmapSidebar } from "@/components/mindmap/MindmapSidebar";
import { MindmapCanvas } from "@/components/mindmap/MindmapCanvas";
import { AutoGenerateModal } from "@/components/mindmap/AutoGenerateModal";
import { useMindmaps } from "@/hooks/useMindmaps";
import { Mindmap } from "@shared/schema";
import { Layout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MindmapPage() {
  const { mindmaps, deleteMindmap } = useMindmaps();
  const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-background">
      <MindmapSidebar
        mindmaps={mindmaps}
        selectedId={selectedMindmap?.id}
        onSelect={setSelectedMindmap}
        onCreateNew={() => setIsGenerateOpen(true)}
        onDelete={(id) => {
          deleteMindmap(id);
          if (selectedMindmap?.id === id) {
            setSelectedMindmap(null);
          }
        }}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-background">
        {selectedMindmap ? (
          <MindmapCanvas
            key={selectedMindmap.id} // Force re-mount on change
            mindmap={selectedMindmap}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="bg-white/5 p-6 rounded-full shadow-sm border border-white/10">
              <Layout className="h-12 w-12 text-green-400 opacity-80" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Mindmap Generator</h2>
              <p className="max-w-md text-center text-gray-400">
                Select a mindmap from the sidebar or create a new one to get started.
                Visualize your notes and documents with AI-powered concept maps.
              </p>
            </div>
            <Button onClick={() => setIsGenerateOpen(true)} className="mt-4 bg-green-600 hover:bg-green-500 text-white">
              <Sparkles className="mr-2 h-4 w-4" />
              Create New Mindmap
            </Button>
          </div>
        )}
      </div>

      <AutoGenerateModal
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
        onSuccess={(mindmap) => setSelectedMindmap(mindmap)}
      />
    </div>
  );
}
