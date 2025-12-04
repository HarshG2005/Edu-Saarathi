import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, Search, Network, Trash2 } from "lucide-react";
import { Mindmap } from "@shared/schema";
import { formatDate, getGradient } from "@/lib/utils";
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
        <div className="w-80 border-r border-white/5 bg-[#0b0f12] flex flex-col h-full">
            <div className="p-4 border-b border-white/5 space-y-4">
                <Button onClick={onCreateNew} className="w-full bg-green-600 hover:bg-green-500 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    New Mindmap
                </Button>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search mindmaps..."
                        className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredMindmaps.map((mindmap, index) => (
                        <div
                            key={mindmap.id}
                            className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all hover:scale-[1.02] mb-3 ${selectedId === mindmap.id ? 'ring-2 ring-green-500' : ''}`}
                            onClick={() => onSelect(mindmap)}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-10 group-hover:opacity-20 transition-opacity`} />

                            {/* Left Border Strip */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getGradient(index)}`} />

                            <div className="relative p-3 pl-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${getGradient(index)} text-white shadow-sm`}>
                                        <Network className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="font-medium truncate text-white text-sm">{mindmap.name || "Untitled"}</span>
                                        <span className="text-xs text-gray-400 truncate">
                                            {formatDate(mindmap.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-500/10"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(mindmap.id);
                                    }}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {filteredMindmaps.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No mindmaps found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
