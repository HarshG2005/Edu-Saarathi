import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { HighlightLayer } from "./HighlightLayer";
import { HighlightMenu } from "./HighlightMenu";
import { Highlight } from "@shared/schema";
import { Loader2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    file: any;
    highlights: Highlight[];
    onHighlightCreate: (
        highlight: Omit<Highlight, "id" | "createdAt" | "userId" | "documentId">,
        action?: "note" | "flashcard"
    ) => void;
    onHighlightClick: (highlight: Highlight) => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
    file,
    highlights,
    onHighlightCreate,
    onHighlightClick,
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [selection, setSelection] = useState<{
        text: string;
        page: number;
        bbox: { x: number; y: number; width: number; height: number };
    } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const handleSelection = () => {
        const windowSelection = window.getSelection();
        if (!windowSelection || windowSelection.isCollapsed) {
            setMenuPosition(null);
            setSelection(null);
            return;
        }

        const range = windowSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const text = windowSelection.toString().trim();

        if (!text) return;

        // Find the page element
        let node = windowSelection.anchorNode;
        while (node && node.nodeType !== Node.ELEMENT_NODE) {
            node = node.parentNode;
        }
        const pageElement = (node as Element)?.closest(".react-pdf__Page");

        if (pageElement) {
            const pageRect = pageElement.getBoundingClientRect();
            const pageIndex = parseInt(pageElement.getAttribute("data-page-number") || "1", 10);

            // Calculate normalized coordinates
            const bbox = {
                x: (rect.left - pageRect.left) / pageRect.width,
                y: (rect.top - pageRect.top) / pageRect.height,
                width: rect.width / pageRect.width,
                height: rect.height / pageRect.height,
            };

            setSelection({ text, page: pageIndex, bbox });
            setMenuPosition({
                top: rect.top + window.scrollY,
                left: rect.left + rect.width / 2 + window.scrollX,
            });
        }
    };

    const handleAction = (action: string) => {
        if (!selection) return;

        if (action.startsWith("highlight-")) {
            const color = action.split("-")[1];
            onHighlightCreate({
                page: selection.page,
                text: selection.text,
                color,
                bbox: selection.bbox,
            });
            // Clear selection
            window.getSelection()?.removeAllRanges();
            setMenuPosition(null);
            setSelection(null);
        } else if (action === "note") {
            onHighlightCreate({
                page: selection.page,
                text: selection.text,
                color: "yellow",
                bbox: selection.bbox,
            }, "note");
            window.getSelection()?.removeAllRanges();
            setMenuPosition(null);
            setSelection(null);
        } else if (action === "flashcard") {
            onHighlightCreate({
                page: selection.page,
                text: selection.text,
                color: "yellow",
                bbox: selection.bbox,
            }, "flashcard");
            window.getSelection()?.removeAllRanges();
            setMenuPosition(null);
            setSelection(null);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full bg-gfg-bg dark:bg-gfg-dark-bg min-h-screen flex flex-col items-center p-8 transition-colors duration-300"
            onMouseUp={handleSelection}
        >
            <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={(error) => {
                    console.error("Error loading PDF:", error);
                }}
                error={
                    <div className="flex flex-col items-center gap-2 text-gfg-dark-danger p-4 bg-red-50 dark:bg-gfg-dark-danger/10 rounded-lg border border-red-200 dark:border-gfg-dark-danger/20">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span className="font-medium">Failed to load PDF</span>
                        <span className="text-sm text-gfg-text-light dark:text-gfg-dark-muted text-center max-w-md">
                            Please ensure this is a valid PDF uploaded recently. Older documents may not have PDF data stored.
                        </span>
                    </div>
                }
                loading={
                    <div className="flex items-center gap-2 text-gfg-text-light dark:text-gfg-dark-muted">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading PDF...</span>
                    </div>
                }
                className="flex flex-col gap-8"
            >
                {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} className="relative shadow-gfg-light dark:shadow-gfg-dark">
                        <Page
                            pageNumber={index + 1}
                            width={800}
                            renderAnnotationLayer={false}
                            renderTextLayer={true}
                            className="bg-white"
                        />
                        <HighlightLayer
                            highlights={highlights.filter(h => h.page === index + 1)}
                            scale={1}
                            onHighlightClick={onHighlightClick}
                        />
                    </div>
                ))}
            </Document>

            <HighlightMenu
                position={menuPosition}
                onAction={handleAction}
                onClose={() => setMenuPosition(null)}
            />
        </div>
    );
};
