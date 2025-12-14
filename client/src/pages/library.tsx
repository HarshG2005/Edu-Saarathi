import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, Trash2, Eye, Search, Loader2, BookOpen, MoreVertical, GraduationCap, BrainCircuit, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Document } from "@shared/schema";
import { getGradient } from "@/lib/utils";

const FileIcon = ({ className = '' }: { className?: string }) => (
  <div className={`w-11 h-11 rounded-lg bg-background/20 backdrop-blur-md flex items-center justify-center text-foreground/90 ${className}`}>
    <FileText className="w-6 h-6 opacity-90" />
  </div>
);

export function LibraryPage() {
  const { documents, addDocument, removeDocument, setCurrentDocumentId, setCurrentFeature } = useAppStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Sync with backend
  const { data: serverDocuments } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      return res.json();
    },
  });

  // Update store when server data changes
  if (serverDocuments && JSON.stringify(serverDocuments) !== JSON.stringify(documents)) {
    // This is a bit hacky but ensures store stays in sync. 
    // Ideally we'd replace the store with just react-query, but that's a larger refactor.
    // For now, we'll just rely on the serverDocuments for rendering if available.
  }

  // Use server documents if available, otherwise fall back to store (though store should be empty on new login)
  const displayDocuments = serverDocuments || documents;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload document");
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (data) => {
      addDocument(data);
      toast({
        title: "Document uploaded",
        description: `${data.name} has been processed successfully.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((f) => f.type === "application/pdf");

      if (pdfFile) {
        uploadMutation.mutate(pdfFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    },
    [uploadMutation, toast]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      uploadMutation.mutate(file);
    } else if (file) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
    }
    e.target.value = "";
  };

  const handleDeleteDocument = (id: string) => {
    removeDocument(id);
    toast({
      title: "Document removed",
      description: "The document has been removed from your library.",
    });
  };

  const handleUseDocument = (docId: string, feature: string) => {
    setCurrentDocumentId(docId);
    setCurrentFeature(feature);
  };

  const filteredDocuments = displayDocuments.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background text-foreground rounded-xl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent" data-testid="text-page-title">
              Document Library
            </h1>
            <p className="text-muted-foreground mt-1">Upload and manage your PDF textbooks and study materials</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                className="w-full md:w-80 bg-muted border border-border rounded-full py-2 pl-4 pr-20 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-foreground"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-documents"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-full text-primary-foreground text-sm font-medium transition-colors">
                Search
              </button>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0 z-10"
                data-testid="input-file-upload-btn"
              />
              <button className="py-2 px-4 bg-muted hover:bg-muted/80 border border-border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Upload Drop Zone */}
        <div
          className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 bg-muted/30 cursor-pointer group relative ${isDragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-primary/30 hover:border-primary/50"
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          data-testid="dropzone-upload"
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="absolute inset-0 cursor-pointer opacity-0 z-10"
            data-testid="input-file-upload-drop"
          />
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            {uploadMutation.isPending ? (
              <>
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-primary">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="text-foreground/90 font-medium text-lg">Processing document...</div>
                <div className="text-muted-foreground text-sm">Extracting text and preparing content</div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-muted/80 flex items-center justify-center text-primary transition-colors">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-foreground/90 font-medium text-lg">Drop your PDF here</div>
                <div className="text-muted-foreground text-sm">PDF files only • Max 50MB</div>
              </>
            )}
          </div>
        </div>

        {/* Document Grid */}
        {filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments
              .slice()
              .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
              .map((doc, index) => (
                <div
                  key={doc.id}
                  className={`rounded-3xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.02] cursor-pointer group border border-white/10 relative h-[220px] flex flex-col justify-between p-6 bg-gradient-to-br ${getGradient(index)}`}
                  data-testid={`card-document-${doc.id}`}
                  onClick={() => setLocation(`/documents/${doc.id}`)}
                >
                  {/* Decorative Pattern Overlay */}
                  <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
                        <FileText className="w-6 h-6" />
                      </div>
                      {/* Context Menu */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border text-foreground">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDocument(doc);
                                setShowPreview(true);
                              }}
                              className="hover:bg-muted cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(doc.id);
                              }}
                              className="text-destructive hover:bg-muted cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <h3 className="text-white font-bold text-xl leading-tight truncate drop-shadow-sm mb-1" title={doc.name}>{doc.name}</h3>
                    <p className="text-white/80 text-sm font-medium">PDF Document • {doc.pageCount} pages</p>
                  </div>

                  <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                    <span className="text-white/70 text-xs font-medium">
                      {formatDate(doc.uploadedAt)}
                    </span>

                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition text-xs backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseDocument(doc.id, "flashcards");
                        }}
                      >
                        <BrainCircuit className="w-3 h-3" />
                        Study
                      </button>
                      <button className="px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition text-xs backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-1">
                        Open <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
            <div className="rounded-full bg-muted p-4">
              {searchQuery ? (
                <Search className="h-10 w-10 text-muted-foreground" />
              ) : (
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-medium text-foreground">
                {searchQuery ? "No documents found" : "Your library is empty"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery ? "Try a different search term" : "Upload a PDF above to get started with AI-powered study tools"}
              </p>
            </div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")} className="border-border text-muted-foreground hover:bg-muted">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              <span className="truncate">{selectedDocument?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-muted/50 p-1">
            <ScrollArea className="h-full p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground leading-relaxed">
                {selectedDocument?.content?.slice(0, 5000)}
                {selectedDocument?.content && selectedDocument.content.length > 5000 && "..."}
              </pre>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
