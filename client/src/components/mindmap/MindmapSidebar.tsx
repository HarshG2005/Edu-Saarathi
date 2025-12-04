import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, Search, FileText, Network, Trash2 } from "lucide-react";
import { Mindmap } from "@shared/schema";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

interface MindmapSidebarProps {
    mindmaps: Mindmap[];
    selectedId?: string;
    onSelect: (mindmap: Mindmap) => void;
    onCreateNew: () => void;
    onDelete: (id: string) => void;
}

export function MindmapSidebar({
    mindmaps,
    selectedId,
    onSelect,
    onCreateNew,
    onDelete
}: MindmapSidebarProps) {
    const [search, setSearch] = useState("");

    const filteredMindmaps = mindmaps
        .filter(m => (m.name || "").toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="w-80 border-r border-gfg-border-light dark:border-gfg-dark-border bg-white dark:bg-gfg-dark-card flex flex-col h-full">
            <div className="p-4 border-b border-gfg-border-light dark:border-gfg-dark-border space-y-4">
                <Button onClick={onCreateNew} className="w-full bg-gfg-green hover:bg-gfg-green/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Mindmap
                </Button>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gfg-text-light" />
                    <Input
                        placeholder="Search mindmaps..."
                        className="pl-8 bg-gfg-bg-secondary/10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredMindmaps.map((mindmap) => (
                        <div
                            key={mindmap.id}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedId === mindmap.id
                                ? "bg-gfg-green/10 text-gfg-green"
                                : "hover:bg-gfg-bg-secondary/10 text-gfg-text"
                                }`}
                            onClick={() => onSelect(mindmap)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Network className="h-4 w-4 shrink-0" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-medium truncate">{mindmap.name || "Untitled"}</span>
                                    <span className="text-xs opacity-70 truncate">
                                        {formatDate(mindmap.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(mindmap.id);
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}
                    {filteredMindmaps.length === 0 && (
                        <div className="p-4 text-center text-sm text-gfg-text-light">
                            No mindmaps found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
