import React from "react";
import { Button } from "@/components/ui/button";
import {
    Highlighter,
    AlertCircle,
    HelpCircle,
    StickyNote,
    Copy,
    Trash2,
    Sparkles
} from "lucide-react";

interface HighlightMenuProps {
    position: { top: number; left: number } | null;
    onAction: (action: string) => void;
    onClose: () => void;
}

export const HighlightMenu: React.FC<HighlightMenuProps> = ({
    position,
    onAction,
    onClose,
}) => {
    if (!position) return null;

    return (
        <div
            className="fixed z-50 flex items-center gap-1 p-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200"
            style={{
                top: position.top,
                left: position.left,
                transform: "translate(-50%, -100%) translateY(-10px)",
            }}
        >
            <div className="flex items-center gap-1 pr-2 border-r border-slate-700">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-yellow-400 hover:text-yellow-300 hover:bg-slate-800"
                    onClick={() => onAction("highlight-yellow")}
                    title="Highlight"
                >
                    <Highlighter className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-orange-400 hover:text-orange-300 hover:bg-slate-800"
                    onClick={() => onAction("highlight-orange")}
                    title="Important"
                >
                    <AlertCircle className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-slate-800"
                    onClick={() => onAction("highlight-purple")}
                    title="Question"
                >
                    <HelpCircle className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex items-center gap-1 pl-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-200 hover:text-white hover:bg-slate-800"
                    onClick={() => onAction("note")}
                    title="Add Note"
                >
                    <StickyNote className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-800"
                    onClick={() => onAction("flashcard")}
                    title="Create Flashcard"
                >
                    <Sparkles className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
