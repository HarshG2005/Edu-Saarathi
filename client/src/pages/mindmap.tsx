import { useState, useCallback } from "react";
import { Network, Loader2, Download, ZoomIn, ZoomOut, Maximize2, Settings2, Sparkles, Layout } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  BackgroundVariant,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Mindmap } from "@shared/schema";
import { getStoredProvider, AISettings } from "@/components/ai-settings";
import { formatDate } from "@/lib/utils";

const nodeDefaults = {
  style: {
    padding: "12px 20px",
    borderRadius: "12px",
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    color: "hsl(var(--card-foreground))",
    fontSize: 14,
    fontWeight: 500,
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    minWidth: "150px",
    textAlign: "center" as const,
  },
};

const edgeDefaults = {
  style: {
    stroke: "hsl(var(--primary))",
    strokeWidth: 2,
    opacity: 0.6,
  },
  animated: true,
};

export function MindmapPage() {
  const { documents, currentDocumentId, mindmaps, addMindmap } = useAppStore();
  const { toast } = useToast();

  const [topic, setTopic] = useState("");
  const [selectedDocId, setSelectedDocId] = useState(currentDocumentId || "");
  const [activeTab, setActiveTab] = useState<"generate" | "view">("generate");

  const [currentMindmap, setCurrentMindmap] = useState<Mindmap | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const hasDocumentSelected = selectedDocId && selectedDocId !== "none";

  const generateMutation = useMutation({
    mutationFn: async (): Promise<Mindmap> => {
      const payload = {
        documentId: hasDocumentSelected ? selectedDocId : undefined,
        topic: topic || undefined,
        provider: getStoredProvider(),
      };
      const response = await apiRequest("POST", "/api/mindmap/generate", payload);
      return response.json();
    },
    onSuccess: (data) => {
      addMindmap(data);
      setCurrentMindmap(data);

      const flowNodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        type: node.type || "default",
        position: node.position,
        data: node.data,
        ...nodeDefaults,
      }));

      const flowEdges: Edge[] = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        ...edgeDefaults,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setActiveTab("view");

      toast({
        title: "Mindmap generated",
        description: "Your concept map is ready to explore.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const loadMindmap = useCallback((mindmap: Mindmap) => {
    setCurrentMindmap(mindmap);

    const flowNodes: Node[] = mindmap.nodes.map((node) => ({
      id: node.id,
      type: node.type || "default",
      position: node.position,
      data: node.data,
      ...nodeDefaults,
    }));

    const flowEdges: Edge[] = mindmap.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      ...edgeDefaults,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
    setActiveTab("view");
  }, [setNodes, setEdges]);

  const handleExportJSON = () => {
    if (!currentMindmap) return;

    const content = JSON.stringify(currentMindmap, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mindmap-${currentMindmap.topic || "generated"}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Mindmap has been exported as JSON.",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto">
      <div className="flex items-start justify-between shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Mindmap Generator</h1>
          <p className="text-muted-foreground text-lg">
            Create visual concept maps from your documents or any topic
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")} className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b pb-4 shrink-0">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="generate" className="px-6" data-testid="tab-generate">Generate</TabsTrigger>
            <TabsTrigger value="view" className="px-6" data-testid="tab-view" disabled={!currentMindmap}>
              View Mindmap
            </TabsTrigger>
          </TabsList>

          {activeTab === "view" && currentMindmap && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="h-8 px-3 text-sm font-normal">
                {currentMindmap.nodes.length} concepts
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                data-testid="button-export"
                className="h-8"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Export JSON
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Mindmap
              </CardTitle>
              <CardDescription>
                Configure the AI to generate a structured concept map
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="document">Source Document (Optional)</Label>
                  <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                    <SelectTrigger id="document" data-testid="select-document">
                      <SelectValue placeholder="Select a document..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No document (use topic only)</SelectItem>
                      {[...documents]
                        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
                        .map((doc) => (
                          <SelectItem key={doc.id} value={doc.id}>
                            {doc.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic {!hasDocumentSelected && "(Required)"}</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Quantum Physics, The French Revolution"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    data-testid="input-topic"
                  />
                </div>
              </div>

              <Button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || (!hasDocumentSelected && !topic.trim())}
                className="w-full"
                data-testid="button-generate-mindmap"
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Concept Map...
                  </>
                ) : (
                  <>
                    <Network className="mr-2 h-4 w-4" />
                    Generate Mindmap
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {mindmaps.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-4 text-lg font-semibold">Recent Mindmaps</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mindmaps.slice().reverse().slice(0, 5).map((mindmap) => (
                  <Card
                    key={mindmap.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => loadMindmap(mindmap)}
                    data-testid={`card-mindmap-${mindmap.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-medium leading-none line-clamp-1">{mindmap.topic || "Untitled Mindmap"}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDate(mindmap.createdAt)}</span>
                            <span>•</span>
                            <span>{mindmap.nodes.length} nodes</span>
                          </div>
                        </div>
                        <Network className="h-4 w-4 text-muted-foreground/50" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="view" className="mt-4 flex-1 min-h-0 border rounded-xl overflow-hidden shadow-sm bg-background relative">
          {currentMindmap ? (
            <div className="h-full w-full" data-testid="mindmap-container">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                attributionPosition="bottom-left"
                className="bg-muted/5"
              >
                <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="hsl(var(--muted-foreground) / 0.2)" />
                <Controls showInteractive={false} className="bg-background border shadow-sm rounded-lg overflow-hidden" />
                <MiniMap
                  nodeColor="hsl(var(--primary))"
                  maskColor="hsl(var(--background) / 0.8)"
                  className="bg-background border shadow-sm rounded-lg overflow-hidden"
                />
                <Panel position="top-right" className="flex gap-2 p-2">
                  <div className="bg-background/80 backdrop-blur-sm border shadow-sm rounded-lg p-1 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => { }}
                      data-testid="button-zoom-in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => { }}
                      data-testid="button-zoom-out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <div className="w-px bg-border my-1" />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => { }}
                      data-testid="button-fit"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Panel>
              </ReactFlow>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Layout className="h-12 w-12 mb-4 opacity-20" />
              <p>Select or generate a mindmap to view</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div >
  );
}
