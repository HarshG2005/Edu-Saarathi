// File: MindmapCanvas.tsx
// Improved dark-mode readability and industry-ready styling
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  NodeProps,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Layout, RotateCcw, History } from "lucide-react";
import { MindmapNodeToolbar } from "./NodeToolbar";
import { nodeDefaults, edgeDefaults, getLayoutedElements } from "@/lib/mindmapUtils";
import { Mindmap, MindmapSnapshot } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Styling / UX notes:
 * - This file focuses on readability in dark mode:
 *   - higher contrast text
 *   - clearer node borders and focus ring
 *   - visible handles (source/target) with accent color
 * - Tailwind tokens used should exist in your project; change names to match your theme if needed.
 */

/* ------------------------------- Small Icon / File Icon ------------------------------ */
/* If you have a shared Icon component in project, replace this inline SVG with it */
const FileIcon = ({ className = "" }: { className?: string }) => (
  <div
    className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white/6 backdrop-blur ${className}`}
    aria-hidden
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" opacity=".9" />
      <path d="M14 2v6h6" opacity=".6" />
    </svg>
  </div>
);

/* ------------------------------- Custom Node Component ------------------------------ */
/* This component renders each node. Keep it lightweight and accessible. */
const CustomNode: React.FC<NodeProps> = ({ id, data, selected }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(String(data.label ?? "Untitled"));
  const { setNodes } = useReactFlow();

  useEffect(() => {
    // keep local label in sync if parent updates it externally
    setLabel(String(data.label ?? "Untitled"));
  }, [data.label]);

  const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => setLabel(evt.target.value);

  const onLabelBlur = () => {
    setIsEditing(false);
    // persist label into global nodes list
    setNodes((nodes) =>
      nodes.map((node) => (node.id === id ? { ...node, data: { ...node.data, label } } : node))
    );
  };

  const onDelete = () => setNodes((nodes) => nodes.filter((node) => node.id !== id));

  const onAddChild = () => {
    if (typeof data.onAddChild === "function") {
      (data.onAddChild as (nodeId: string) => void)(id);
    }
  };

  const onKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
  };

  return (
    <div
      role="group"
      aria-label={`Mindmap node ${label}`}
      className={`min-w-[150px] max-w-[260px] rounded-xl border transition-all duration-150 shadow-sm
        ${selected ? "ring-2 ring-gfg-green/40 border-gfg-green" : "border-white/10"}
        bg-neutral-900 text-white`}
      onDoubleClick={() => setIsEditing(true)}
    >
      {/* Node toolbar (delete / add child / open source). Keep toolbar visually subtle. */}
      <MindmapNodeToolbar
        nodeId={id}
        onDelete={onDelete}
        onAddChild={onAddChild}
        hasSource={!!data.source}
        onOpenSource={data.onOpenSource as any}
      />

      {/* Top handle - target */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 bg-gfg-green/80 border-2 border-white/10"
        aria-label="incoming connection handle"
      />

      <div className="px-4 py-3 text-center">
        <div className="flex items-center gap-3 justify-center mb-2">
          <FileIcon />
        </div>

        {isEditing ? (
          <Input
            value={label}
            onChange={onLabelChange}
            onBlur={onLabelBlur}
            onKeyDown={onKeyDownInput}
            autoFocus
            className="w-full text-sm text-center bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-white"
          />
        ) : (
          <div className="text-sm font-semibold leading-tight text-white/95 truncate px-1">{label}</div>
        )}
      </div>

      {/* Bottom handle - source */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 bg-gfg-green/80 border-2 border-white/10"
        aria-label="outgoing connection handle"
      />
    </div>
  );
};

/* ------------------------------- Canvas Component ------------------------------ */

interface MindmapCanvasProps {
  mindmap: Mindmap;
  onSave?: (mindmap: Mindmap) => void;
}

function MindmapCanvasContent({ mindmap, onSave }: MindmapCanvasProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const { fitView, getNode } = useReactFlow();

  // Inject callbacks into node.data when initializing or restoring snapshot
  useEffect(() => {
    if (!mindmap?.graph) return;

    const graph = mindmap.graph as any;
    const nodesWithCallbacks: Node[] = (graph.nodes || []).map((n: any) => ({
      ...n,
      data: {
        ...n.data,
        onAddChild: handleAddChild,
        onOpenSource: handleOpenSource,
      },
      type: "custom",
    }));

    setNodes(nodesWithCallbacks);
    setEdges(graph.edges || []);
    // small delay so ReactFlow can measure and fit
    setTimeout(() => fitView(), 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mindmap?.id]);

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, ...edgeDefaults }, eds)),
    [setEdges]
  );

  // Add child node attached to parent; use callbacks so nodes have access
  const handleAddChild = useCallback(
    (parentId: string) => {
      const parentNode = getNode(parentId);
      if (!parentNode) return;

      const newNodeId = crypto.randomUUID();
      const newNode: Node = {
        id: newNodeId,
        type: "custom",
        position: {
          x: parentNode.position.x + 20,
          y: parentNode.position.y + 120,
        },
        data: {
          label: "New Node",
          onAddChild: handleAddChild,
          onOpenSource: handleOpenSource,
        },
        ...nodeDefaults,
      };

      const newEdge: Edge = {
        id: `e${parentId}-${newNodeId}`,
        source: parentId,
        target: newNodeId,
        ...edgeDefaults,
      };

      setNodes((nds) => [...nds, newNode]);
      setEdges((eds) => [...eds, newEdge]);
      // after adding, smooth fit view
      setTimeout(() => fitView(), 60);
    },
    [getNode, setNodes, setEdges, fitView]
  );

  const handleOpenSource = useCallback(
    (nodeId: string) => {
      // Placeholder behavior; swap for actual navigation to resource
      toast({ title: "Opening source", description: `Node ${nodeId} source opening soon` });
      console.log("Open source for node:", nodeId);
    },
    [toast]
  );

  // Auto-layout (uses your existing layout util)
  const handleLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    window.requestAnimationFrame(() => fitView());
  }, [nodes, edges, setNodes, setEdges, fitView]);

  // Save mutation (PUT)
  const saveMutation = useMutation({
    mutationFn: async () => {
      const graph = { nodes, edges }; // consider adding viewport if needed
      const res = await apiRequest("PUT", `/api/mindmaps/${mindmap.id}`, {
        graph,
        name: mindmap.name,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Saved", description: "Mindmap saved successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/mindmaps/${mindmap.id}`] });
      if (onSave) onSave(data);
    },
    onError: () => {
      toast({ title: "Save failed", description: "Could not save mindmap", variant: "destructive" });
    },
  });

  // Snapshot mutation (POST)
  const snapshotMutation = useMutation({
    mutationFn: async () => {
      const graph = { nodes, edges };
      await apiRequest("POST", `/api/mindmaps/${mindmap.id}/snapshot`, {
        graph,
        note: "Manual snapshot",
      });
    },
    onSuccess: () => {
      toast({ title: "Snapshot created", description: "Version saved" });
      queryClient.invalidateQueries({ queryKey: [`/api/mindmaps/${mindmap.id}/snapshots`] });
    },
  });

  // Fetch snapshots (read-only)
  const { data: snapshots } = useQuery<MindmapSnapshot[]>({
    queryKey: [`/api/mindmaps/${mindmap.id}/snapshots`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/mindmaps/${mindmap.id}/snapshots`);
      return res.json();
    },
    enabled: !!mindmap?.id,
  });

  const handleRestoreSnapshot = (snapshot: MindmapSnapshot) => {
    const graph = snapshot.graph as any;
    if (!graph) return;
    const nodesWithCallbacks: Node[] = (graph.nodes || []).map((n: any) => ({
      ...n,
      data: {
        ...n.data,
        onAddChild: handleAddChild,
        onOpenSource: handleOpenSource,
      },
      type: "custom",
    }));
    setNodes(nodesWithCallbacks);
    setEdges(graph.edges || []);
    setTimeout(() => fitView(), 120);
    toast({ title: "Restored", description: "Snapshot restored. Save to persist changes." });
  };

  return (
    <div className="h-full w-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gradient-to-b from-neutral-950 to-neutral-900"
      >
        {/* Subtle, dimmed dotted background for texture — readable but not noisy */}
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#374151" />

        {/* Controls + minimap */}
        <Controls className="!bg-transparent" />
        <MiniMap nodeColor="#22c55e" maskColor="rgba(255,255,255,0.06)" />

        {/* Top-right action panel */}
        <Panel position="top-right" className="flex gap-2 items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLayout}
            className="bg-white/6 hover:bg-white/8 text-white"
            aria-label="Auto layout"
          >
            <Layout className="mr-2 h-4 w-4" />
            Auto Layout
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-white/6">
                <History className="mr-2 h-4 w-4" />
                History
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => snapshotMutation.mutate()}>
                <Save className="mr-2 h-4 w-4" />
                Create Snapshot
              </DropdownMenuItem>

              {snapshots?.length ? (
                snapshots.map((snap) => (
                  <DropdownMenuItem key={snap.id} onClick={() => handleRestoreSnapshot(snap)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    <span className="truncate">{new Date(snap.createdAt).toLocaleString()}</span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No snapshots
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            size="sm"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="bg-gfg-green hover:bg-gfg-green/90 text-black"
            aria-label="Save mindmap"
          >
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

/* Export wrapper with provider so component can mount anywhere */
export function MindmapCanvas(props: MindmapCanvasProps) {
  return (
    <ReactFlowProvider>
      <MindmapCanvasContent {...props} />
    </ReactFlowProvider>
  );
}
