import { Node, Edge, MarkerType, Position } from "@xyflow/react";
import dagre from "dagre";
import { MindmapNode, MindmapEdge } from "@shared/schema";

// Node types for React Flow
export type FlowNode = Node<MindmapNode["data"]>;
export type FlowEdge = Edge;

export const nodeDefaults = {
    style: {
        // We remove visual styles here to let CustomNode handle them via Tailwind
        // Only keep layout-related styles if necessary, or empty
        width: 150, // Default width
    },
};

export const edgeDefaults = {
    style: {
        stroke: "#ffffff",
        strokeWidth: 3,
    },
    animated: false,
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#ffffff",
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
