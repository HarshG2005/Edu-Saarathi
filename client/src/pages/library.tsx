import { useState, useCallback } from "react";
import { Upload, FileText, Trash2, Eye, MoreVertical, Search, Loader2, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Document } from "@shared/schema";

export function LibraryPage() {
  const { documents, addDocument, removeDocument, setCurrentDocumentId, setCurrentFeature } = useAppStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreview, setShowPreview] = useState(false);

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

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Document Library</h1>
        <p className="text-muted-foreground">
          Upload and manage your PDF textbooks and study materials
        </p>
      </div>

      <div
        className={`relative flex min-h-48 flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors ${isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        data-testid="dropzone-upload"
      >
        {uploadMutation.isPending ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing document...</p>
            <p className="text-sm text-muted-foreground">
              Extracting text and preparing content
            </p>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Drop your PDF here</p>
              <p className="text-sm text-muted-foreground">or click to browse</p>
            </div>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              data-testid="input-file-upload"
            />
            <Badge variant="secondary" className="mt-2">
              PDF files only • Max 50MB
            </Badge>
          </>
        )}
      </div>

      {documents.length > 0 && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-documents"
            />
          </div>
          <Badge variant="outline">{documents.length} documents</Badge>
        </div>
      )}

      {filteredDocuments.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments
            .slice()
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 5)
            .map((doc) => (
              <Card
                key={doc.id}
                className="group hover-elevate cursor-pointer transition-all"
                data-testid={`card-document-${doc.id}`}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <CardTitle className="line-clamp-1 text-base font-semibold">
                        {doc.name}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>{doc.pageCount} pages</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100"
                        data-testid={`button-document-menu-${doc.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedDocument(doc);
                          setShowPreview(true);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview content
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="mb-4 text-xs text-muted-foreground">
                    Uploaded {formatDate(doc.uploadedAt)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUseDocument(doc.id, "mcq")}
                      data-testid={`button-generate-mcq-${doc.id}`}
                    >
                      Generate MCQs
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleUseDocument(doc.id, "flashcards")}
                      data-testid={`button-generate-flashcards-${doc.id}`}
                    >
                      Flashcards
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      ) : documents.length > 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground/50" />
          <div>
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm text-muted-foreground">
              Try a different search term
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground/30" />
          <div>
            <p className="text-lg font-medium">Your library is empty</p>
            <p className="text-sm text-muted-foreground">
              Upload a PDF to get started with AI-powered study tools
            </p>
          </div>
        </div>
      )}

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedDocument?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96 rounded-lg border bg-muted/50 p-4">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {selectedDocument?.content?.slice(0, 3000)}
              {selectedDocument?.content && selectedDocument.content.length > 3000 && "..."}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
