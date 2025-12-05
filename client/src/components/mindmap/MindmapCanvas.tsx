import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Save, Download, Layout, RotateCcw, History, ArrowDown, ArrowRight } from "lucide-react";
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

import { getGradient } from "@/lib/utils";

// Custom Node Component
const CustomNode = ({ id, data, selected, sourcePosition, targetPosition }: NodeProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [label, setLabel] = useState(data.label as string);
    const { setNodes } = useReactFlow();

    const onLabelChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(evt.target.value);
    };

    const onLabelBlur = () => {
        setIsEditing(false);
        setNodes((nodes) =>
            nodes.map((node) => {
                if (node.id === id) {
                    return { ...node, data: { ...node.data, label } };
                }
                return node;
            })
        );
    };

    const onDelete = () => {
        setNodes((nodes) => nodes.filter((node) => node.id !== id));
    };

    const onAddChild = () => {
        if (typeof data.onAddChild === 'function') {
            (data.onAddChild as (id: string) => void)(id);
        }
    };

    const gradientClass = useMemo(() => getGradient(id), [id]);

    return (
        <div
            className={`group relative px-6 py-4 shadow-xl rounded-xl min-w-[180px] text-center transition-all duration-200 ${selected
                ? "ring-4 ring-white/60 scale-105"
                : "hover:ring-2 hover:ring-white/30"
                } bg-gradient-to-br ${gradientClass}`}
            onDoubleClick={() => setIsEditing(true)}
        >
            <MindmapNodeToolbar
                nodeId={id}
                onDelete={onDelete}
                onAddChild={onAddChild}
                hasSource={!!data.source}
                onOpenSource={data.onOpenSource as any}
            />
            <Handle
                type="target"
                position={targetPosition || Position.Top}
                className="w-3 h-3 !bg-white border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            />

            {isEditing ? (
                <Input
                    value={label}
                    onChange={onLabelChange}
                    onBlur={onLabelBlur}
                    className="h-7 text-base font-bold text-center border-none shadow-none focus-visible:ring-0 p-0 bg-transparent text-white placeholder:text-white/50"
                    autoFocus
                />
            ) : (
                <div className="text-base font-bold text-white drop-shadow-lg tracking-wide leading-tight">{data.label as string}</div>
            )}

            <Handle
                type="source"
                position={sourcePosition || Position.Bottom}
                className="w-3 h-3 !bg-white border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
            />
        </div>
    );
};

interface MindmapCanvasProps {
    mindmap: Mindmap;
    onSave?: (mindmap: Mindmap) => void;
}

function MindmapCanvasContent({ mindmap, onSave }: MindmapCanvasProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { fitView, getNode } = useReactFlow();

    // Initialize graph
    useEffect(() => {
        if (mindmap.graph) {
            const graph = mindmap.graph as any;
            // Inject callbacks into node data
            const nodesWithCallbacks = (graph.nodes || []).map((node: any) => ({
                ...node,
                data: {
                    ...node.data,
                    onOpenSource: handleOpenSource,
                },
                type: 'custom', // Force custom type
            }));
            setNodes(nodesWithCallbacks);

            // Force apply edge defaults to ensure visibility and fix missing IDs
            const edgesWithStyles = (graph.edges || []).map((edge: any) => ({
                ...edge,
                ...edgeDefaults,
                id: edge.id || `e${edge.source}-${edge.target}`,
                source: edge.source,
                target: edge.target,
            }));
            setEdges(edgesWithStyles);

            setTimeout(() => fitView(), 100);
        }
    }, [mindmap.id]); // Re-init when mindmap ID changes

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge({ ...params, ...edgeDefaults }, eds)),
        [setEdges]
    );

    const handleAddChild = useCallback((parentId: string) => {
        const parentNode = getNode(parentId);
        if (!parentNode) return;

        const newNodeId = crypto.randomUUID();
        const newNode: Node = {
            id: newNodeId,
            type: 'custom',
            position: {
                x: parentNode.position.x,
                y: parentNode.position.y + 100,
            },
            data: {
                label: 'New Node',
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
    }, [getNode, setNodes, setEdges]);

    const handleOpenSource = useCallback((nodeId: string) => {
        // TODO: Implement open source logic (navigate to PDF)
        console.log("Open source for", nodeId);
        toast({ title: "Opening source...", description: "Feature coming soon" });
    }, [toast]);

    const handleLayout = useCallback((direction = 'TB') => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        );
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        window.requestAnimationFrame(() => fitView());
    }, [nodes, edges, setNodes, setEdges, fitView]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            const graph = { nodes, edges, viewport: {} }; // Viewport TODO
            const res = await apiRequest("PUT", `/api/mindmaps/${mindmap.id}`, {
                graph,
                name: mindmap.name // Preserve name
            });
            return res.json();
        },
        onSuccess: (data) => {
            toast({ title: "Saved", description: "Mindmap saved successfully" });
            queryClient.invalidateQueries({ queryKey: [`/api/mindmaps/${mindmap.id}`] });
            if (onSave) onSave(data);
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to save mindmap", variant: "destructive" });
        }
    });

    const snapshotMutation = useMutation({
        mutationFn: async () => {
            const graph = { nodes, edges };
            await apiRequest("POST", `/api/mindmaps/${mindmap.id}/snapshot`, {
                graph,
                note: "Manual snapshot"
            });
        },
        onSuccess: () => {
            toast({ title: "Snapshot created", description: "Version saved" });
            queryClient.invalidateQueries({ queryKey: [`/api/mindmaps/${mindmap.id}/snapshots`] });
        }
    });

    // Fetch snapshots
    const { data: snapshots } = useQuery<MindmapSnapshot[]>({
        queryKey: [`/api/mindmaps/${mindmap.id}/snapshots`],
        queryFn: async () => {
            const res = await apiRequest("GET", `/api/mindmaps/${mindmap.id}/snapshots`);
            return res.json();
        },
        enabled: !!mindmap.id
    });

    const handleRestoreSnapshot = (snapshot: MindmapSnapshot) => {
        const graph = snapshot.graph as any;
        if (graph) {
            const nodesWithCallbacks = (graph.nodes || []).map((node: any) => ({
                ...node,
                data: {
                    ...node.data,
                    onAddChild: handleAddChild,
                    onOpenSource: handleOpenSource,
                },
                type: 'custom',
            }));
            setNodes(nodesWithCallbacks);

            // Force apply edge defaults to snapshots too
            const edgesWithStyles = (graph.edges || []).map((edge: any) => ({
                ...edge,
                ...edgeDefaults,
                id: edge.id || `e${edge.source}-${edge.target}`,
                source: edge.source,
                target: edge.target,
            }));
            setEdges(edgesWithStyles);

            setTimeout(() => fitView(), 100);
            toast({ title: "Restored", description: "Snapshot restored. Don't forget to save if you want to keep this version." });
        }
    };

    return (
        <div className="h-full w-full relative group">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                className="bg-gfg-bg-secondary/5"
            >
                <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} color="#6b7280" />
                <Controls className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 [&>button]:dark:bg-neutral-900 [&>button]:dark:border-neutral-800 [&>button]:dark:fill-white [&>button:hover]:dark:bg-neutral-800" />
                <MiniMap
                    nodeColor="#4ade80"
                    maskColor="rgba(0, 0, 0, 0.6)"
                    className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800"
                />

                <Panel position="top-right" className="flex gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 shadow-md transition-all">
                                <Layout className="mr-2 h-4 w-4" />
                                Auto Layout
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="dark:bg-neutral-900 dark:border-neutral-800">
                            <DropdownMenuItem onClick={() => handleLayout('LR')} className="dark:focus:bg-neutral-800">
                                <ArrowDown className="mr-2 h-4 w-4" />
                                Vertical
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLayout('TB')} className="dark:focus:bg-neutral-800">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Horizontal
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white border-green-500 hover:border-green-600 shadow-md transition-all">
                                <History className="mr-2 h-4 w-4" />
                                History
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 dark:bg-neutral-900 dark:border-neutral-800">
                            <DropdownMenuItem onClick={() => snapshotMutation.mutate()} className="dark:focus:bg-neutral-800">
                                <Save className="mr-2 h-4 w-4" />
                                Create Snapshot
                            </DropdownMenuItem>
                            {snapshots?.map((snap) => (
                                <DropdownMenuItem key={snap.id} onClick={() => handleRestoreSnapshot(snap)} className="dark:focus:bg-neutral-800">
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    {new Date(snap.createdAt).toLocaleString()}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        size="sm"
                        onClick={() => saveMutation.mutate()}
                        disabled={saveMutation.isPending}
                        className="bg-gfg-green hover:bg-gfg-green/90 text-white border-0 shadow-md"
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Save
                    </Button>
                </Panel>
            </ReactFlow>
        </div >
    );
}

export function MindmapCanvas(props: MindmapCanvasProps) {
    return (
        <ReactFlowProvider>
            <MindmapCanvasContent {...props} />
        </ReactFlowProvider>
    );
}
