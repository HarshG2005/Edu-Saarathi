import { NodeToolbar } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, FileText, ExternalLink, Highlighter } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface MindmapNodeToolbarProps {
    nodeId: string;
    onDelete: (id: string) => void;
    onAddChild: (parentId: string) => void;
    onAttachNote?: (id: string) => void;
    onOpenSource?: (id: string) => void;
    hasSource?: boolean;
}

export function MindmapNodeToolbar({
    nodeId,
    onDelete,
    onAddChild,
    onAttachNote,
    onOpenSource,
    hasSource
}: MindmapNodeToolbarProps) {
    return (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex gap-1 bg-white dark:bg-gfg-dark-card p-1 rounded-lg border border-gfg-border-light dark:border-gfg-dark-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-50">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-gfg-green-50 hover:text-gfg-green"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddChild(nodeId);
                            }}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Child Node</TooltipContent>
                </Tooltip>

                {onAttachNote && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gfg-green-50 hover:text-gfg-green"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAttachNote(nodeId);
                                }}
                            >
                                <FileText className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Attach Note</TooltipContent>
                    </Tooltip>
                )}

                {hasSource && onOpenSource && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-gfg-green-50 hover:text-gfg-green"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenSource(nodeId);
                                }}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Open Source Document</TooltipContent>
                    </Tooltip>
                )}

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-red-50 hover:text-red-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(nodeId);
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Node</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}
