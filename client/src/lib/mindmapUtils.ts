import { Node, Edge, MarkerType, Position } from "@xyflow/react";
import dagre from "dagre";
import { MindmapNode, MindmapEdge } from "@shared/schema";

// Node types for React Flow
export type FlowNode = Node<MindmapNode["data"]>;
export type FlowEdge = Edge;

export const nodeDefaults = {
    style: {
        padding: "12px 20px",
        borderRadius: "12px",
        border: "1px solid #d1d5db", // gfg-border-light
        background: "#ffffff", // white
        color: "#1f2937", // gfg-text
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        minWidth: "150px",
        textAlign: "center" as const,
    },
};

export const edgeDefaults = {
    style: {
        stroke: "#2F8D46", // gfg-green
        strokeWidth: 2,
        opacity: 0.6,
    },
    animated: true,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#2F8D46",
    },
};

// Auto-layout using Dagre
export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: 150, height: 50 }); // Estimate dimensions
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            position: {
                x: nodeWithPosition.x - 75, // Center offset
                y: nodeWithPosition.y - 25,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

// Convert heading list to graph (placeholder for now, logic can be moved here from AutoGenerateModal)
export const headingsToGraph = (headings: any[]) => {
    // Implementation depends on heading structure
    return { nodes: [], edges: [] };
};
