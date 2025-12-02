import { useState, useCallback } from "react";
import { Network, Loader2, Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const nodeDefaults = {
  style: {
    padding: 12,
    borderRadius: 8,
    border: "2px solid hsl(var(--border))",
    background: "hsl(var(--card))",
    color: "hsl(var(--card-foreground))",
    fontSize: 14,
    fontWeight: 500,
  },
};

const edgeDefaults = {
  style: {
    stroke: "hsl(var(--primary))",
    strokeWidth: 2,
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Mindmap Generator</h1>
          <p className="text-muted-foreground">
            Create visual concept maps from your documents or any topic
          </p>
        </div>
        <AISettings />
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "generate" | "view")}>
        <TabsList>
          <TabsTrigger value="generate" data-testid="tab-generate">Generate</TabsTrigger>
          <TabsTrigger value="view" data-testid="tab-view" disabled={!currentMindmap}>
            View Mindmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Generate Mindmap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document">Source Document (Optional)</Label>
                <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                  <SelectTrigger id="document" data-testid="select-document">
                    <SelectValue placeholder="Select a document or enter a topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No document (use topic only)</SelectItem>
                    {documents.map((doc) => (
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
                  placeholder="e.g., Machine Learning, Solar System, Web Development"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  data-testid="input-topic"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a topic to generate a visual concept map
                </p>
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
                    Generating...
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
              <h3 className="mb-4 text-lg font-semibold">Previous Mindmaps</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mindmaps.slice().reverse().map((mindmap) => (
                  <Card
                    key={mindmap.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => loadMindmap(mindmap)}
                    data-testid={`card-mindmap-${mindmap.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{mindmap.topic || "Mindmap"}</p>
                          <p className="text-sm text-muted-foreground">
                            {mindmap.nodes.length} concepts • {mindmap.edges.length} connections
                          </p>
                        </div>
                        <Network className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="view" className="mt-6">
          {currentMindmap && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    {currentMindmap.topic || "Generated Mindmap"}
                  </h2>
                  <Badge variant="secondary">
                    {currentMindmap.nodes.length} concepts
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportJSON}
                  data-testid="button-export"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
              </div>

              <div
                className="h-[600px] w-full overflow-hidden rounded-lg border bg-background"
                data-testid="mindmap-container"
              >
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  fitView
                  attributionPosition="bottom-left"
                >
                  <Controls />
                  <MiniMap
                    nodeColor="hsl(var(--primary))"
                    maskColor="hsl(var(--background) / 0.8)"
                  />
                  <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                  <Panel position="top-right" className="flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => { }}
                      data-testid="button-zoom-in"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => { }}
                      data-testid="button-zoom-out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => { }}
                      data-testid="button-fit"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </Panel>
                </ReactFlow>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span>Drag to pan • Scroll to zoom • Click and drag nodes to reposition</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
