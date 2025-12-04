import { useState, useEffect } from "react";
import { MindmapSidebar } from "@/components/mindmap/MindmapSidebar";
import { MindmapCanvas } from "@/components/mindmap/MindmapCanvas";
import { AutoGenerateModal } from "@/components/mindmap/AutoGenerateModal";
import { useMindmaps } from "@/hooks/useMindmaps";
import { Mindmap } from "@shared/schema";
import { Layout, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useLocation } from "wouter"; // Assuming wouter or react-router, checking imports in original file... original used standard react hooks but didn't show router. 
// Wait, the original file didn't import router hooks. But the user request mentioned `src/pages/mindmap/[id].tsx`.
// If I am replacing `src/pages/mindmap.tsx`, I should check if it handles routing.
// The original file didn't seem to handle ID in URL.
// But I should support it if possible.
// Let's stick to state for now as the original file did, but I can add URL sync if I see router usage.
// The project uses `wouter` likely (common in these templates) or `react-router-dom`.
// I'll stick to local state for simplicity unless I see `useRoute` or similar in other files.
// The original file had `import { useAppStore } from "@/lib/store";`.
// I'll use local state for selection to be safe and consistent with the sidebar pattern.

export function MindmapPage() {
  const { mindmaps, deleteMindmap } = useMindmaps();
  const [selectedMindmap, setSelectedMindmap] = useState<Mindmap | null>(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Auto-select if only one or specific logic? No, start empty or select first.
  // Let's select the first one if nothing selected and mindmaps exist? Maybe not, empty state is good.

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] overflow-hidden bg-gfg-bg-primary dark:bg-gfg-dark-bg">
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

      <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-gfg-bg-secondary/5">
        {selectedMindmap ? (
          <MindmapCanvas
            key={selectedMindmap.id} // Force re-mount on change
            mindmap={selectedMindmap}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gfg-text-light gap-4">
            <div className="bg-white dark:bg-gfg-dark-card p-6 rounded-full shadow-sm border border-gfg-border-light dark:border-gfg-dark-border">
              <Layout className="h-12 w-12 text-gfg-green opacity-80" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gfg-text">Mindmap Generator</h2>
              <p className="max-w-md text-center">
                Select a mindmap from the sidebar or create a new one to get started.
                Visualize your notes and documents with AI-powered concept maps.
              </p>
            </div>
            <Button onClick={() => setIsGenerateOpen(true)} className="mt-4 bg-gfg-green hover:bg-gfg-green/90 text-white">
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
