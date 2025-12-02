import React from "react";
import { Highlight } from "@shared/schema";

interface HighlightLayerProps {
    highlights: Highlight[];
    scale: number;
    onHighlightClick: (highlight: Highlight) => void;
}

export const HighlightLayer: React.FC<HighlightLayerProps> = ({
    highlights,
    scale,
    onHighlightClick,
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {highlights.map((highlight) => {
                const bbox = highlight.bbox as { x: number; y: number; width: number; height: number };

                let colorClass = "bg-yellow-300/40 border-yellow-500/50";
                if (highlight.color === "orange") colorClass = "bg-orange-300/40 border-orange-500/50";
                if (highlight.color === "purple") colorClass = "bg-purple-300/40 border-purple-500/50";

                return (
                    <div
                        key={highlight.id}
                        className={`absolute border cursor-pointer pointer-events-auto hover:opacity-80 transition-opacity ${colorClass}`}
                        style={{
                            left: `${bbox.x * 100}%`,
                            top: `${bbox.y * 100}%`,
                            width: `${bbox.width * 100}%`,
                            height: `${bbox.height * 100}%`,
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onHighlightClick(highlight);
                        }}
                    />
                );
            })}
        </div>
    );
};
