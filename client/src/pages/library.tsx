import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, Trash2, Eye, Search, Loader2, BookOpen, MoreVertical, GraduationCap, BrainCircuit } from "lucide-react";
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

// Helper to determine gradient based on document ID or name (consistent coloring)
const getGradient = (id: number) => {
  const gradients = [
    'from-purple-600 to-indigo-700',
    'from-sky-600 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-400 to-red-500',
    'from-pink-500 to-rose-500',
    'from-blue-600 to-indigo-600'
  ];
  return gradients[id % gradients.length];
};

const FileIcon = ({ className = '' }: { className?: string }) => (
  <div className={`w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 ${className}`}>
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
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-[#0b0f12] to-[#071218] text-white rounded-xl">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent" data-testid="text-page-title">
              Document Library
            </h1>
            <p className="text-gray-300 mt-1">Upload and manage your PDF textbooks and study materials</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                className="w-full md:w-80 bg-neutral-900 border border-white/10 rounded-full py-2 pl-4 pr-20 text-sm placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-gray-200"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-documents"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-full text-black text-sm font-medium transition-colors">
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
              <button className="py-2 px-4 bg-white/10 hover:bg-white/15 border border-white/5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Upload Drop Zone */}
        <div
          className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 bg-neutral-900/30 cursor-pointer group relative ${isDragging
            ? "border-green-500 bg-green-500/10 scale-[1.01]"
            : "border-green-600/30 hover:border-green-500/50"
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
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-green-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div className="text-white/90 font-medium text-lg">Processing document...</div>
                <div className="text-gray-500 text-sm">Extracting text and preparing content</div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-green-400 transition-colors">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-white/90 font-medium text-lg">Drop your PDF here</div>
                <div className="text-gray-500 text-sm">PDF files only • Max 50MB</div>
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
                  className="rounded-2xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.025] group relative"
                  data-testid={`card-document-${doc.id}`}
                  onClick={() => setLocation(`/documents/${doc.id}`)}
                >
                  {/* Gradient header */}
                  <div className={`p-5 bg-gradient-to-br ${getGradient(index)} relative`}>
                    <div className="flex items-start gap-4">
                      <FileIcon />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-lg leading-tight truncate" title={doc.name}>{doc.name}</h3>
                        <p className="text-white/80 text-sm mt-1 truncate">PDF Document</p>
                      </div>
                      <div className="text-white/80 text-sm text-right shrink-0">
                        <div className="text-xs">{doc.pageCount} pages</div>
                        <div className="text-xs opacity-80">{formatFileSize(doc.fileSize)}</div>
                      </div>
                    </div>
                    {/* subtle glow */}
                    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-3xl bg-white"></div>
                    </div>

                    {/* Context Menu */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-neutral-900 border-white/10 text-gray-200">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDocument(doc);
                              setShowPreview(true);
                            }}
                            className="hover:bg-white/10 cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDocument(doc.id);
                            }}
                            className="text-red-400 hover:bg-white/10 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="bg-neutral-900 p-5 border border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="min-w-0">
                        <p className="text-gray-200 font-semibold truncate" title={doc.name}>{doc.name}</p>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                          Uploaded • {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className="col-span-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold transition text-sm flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/documents/${doc.id}`);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        Open PDF
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm border border-white/5 flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseDocument(doc.id, "flashcards");
                        }}
                      >
                        <BrainCircuit className="w-4 h-4" />
                        Flashcards
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm border border-white/5 flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseDocument(doc.id, "mcq");
                        }}
                      >
                        <GraduationCap className="w-4 h-4" />
                        Quiz
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center border-2 border-dashed border-white/10 rounded-2xl bg-neutral-900/30">
            <div className="rounded-full bg-white/5 p-4">
              {searchQuery ? (
                <Search className="h-10 w-10 text-gray-500" />
              ) : (
                <BookOpen className="h-10 w-10 text-gray-500" />
              )}
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-medium text-gray-200">
                {searchQuery ? "No documents found" : "Your library is empty"}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {searchQuery ? "Try a different search term" : "Upload a PDF above to get started with AI-powered study tools"}
              </p>
            </div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")} className="border-white/10 text-gray-300 hover:bg-white/5">
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col bg-neutral-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-green-400" />
              <span className="truncate">{selectedDocument?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-lg border border-white/10 bg-black/20 p-1">
            <ScrollArea className="h-full p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed">
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
