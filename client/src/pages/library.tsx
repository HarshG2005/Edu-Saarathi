import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Upload, FileText, Trash2, Eye, MoreVertical, Search, Loader2, BookOpen, Calendar, File, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
import type { Document } from "@shared/schema";

export function LibraryPage() {
  const { documents, addDocument, removeDocument, setCurrentDocumentId, setCurrentFeature } = useAppStore();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
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

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-page-title">Document Library</h1>
        <p className="text-muted-foreground text-lg">
          Upload and manage your PDF textbooks and study materials
        </p>
      </div>

      <div
        className={`relative flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed p-8 transition-all duration-200 ${isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border hover:border-primary/50 hover:bg-muted/50"
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
            <div className="rounded-full bg-primary/10 p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-lg font-medium">Processing document...</p>
              <p className="text-sm text-muted-foreground">
                Extracting text and preparing content
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 shadow-sm">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
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
            <Badge variant="secondary" className="mt-2 font-normal text-muted-foreground bg-muted">
              PDF files only • Max 50MB
            </Badge>
          </>
        )}
      </div>

      <div className="space-y-4">
        {documents.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background"
                data-testid="input-search-documents"
              />
            </div>
            <div className="ml-auto text-sm text-muted-foreground font-medium">
              {documents.length} documents
            </div>
          </div>
        )}

        {filteredDocuments.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDocuments
              .slice()
              .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
              .slice(0, 8)
              .map((doc) => (
                <Card
                  key={doc.id}
                  className="group flex flex-col hover-elevate cursor-pointer transition-all border-border/60 bg-card/50 hover:bg-card hover:border-border"
                  data-testid={`card-document-${doc.id}`}
                  onClick={() => setLocation(`/documents/${doc.id}`)}
                >
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-5 pb-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-6 w-6" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          data-testid={`button-document-menu-${doc.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDocument(doc);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview content
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>

                  <CardContent className="flex-1 px-5 py-2">
                    <h3 className="font-semibold leading-tight line-clamp-2 mb-3 min-h-[2.5rem]" title={doc.name}>
                      {doc.name}
                    </h3>

                    <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <File className="h-3.5 w-3.5" />
                        <span>{formatFileSize(doc.fileSize)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{doc.pageCount} pages</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(doc.uploadedAt)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-5 pt-3 grid grid-cols-2 gap-3">
                    <Button
                      size="sm"
                      className="w-full text-xs font-medium col-span-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/documents/${doc.id}`);
                      }}
                    >
                      <Eye className="mr-2 h-3.5 w-3.5" />
                      Open PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs font-medium bg-secondary/50 hover:bg-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseDocument(doc.id, "mcq");
                      }}
                      data-testid={`button-generate-mcq-${doc.id}`}
                    >
                      Quiz
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs font-medium bg-secondary/50 hover:bg-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseDocument(doc.id, "flashcards");
                      }}
                      data-testid={`button-generate-flashcards-${doc.id}`}
                    >
                      Flashcards
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : documents.length > 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center border rounded-xl border-dashed bg-muted/10">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">No documents found</p>
              <p className="text-sm text-muted-foreground">
                Try a different search term
              </p>
            </div>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center border rounded-xl border-dashed bg-muted/10">
            <div className="rounded-full bg-muted p-4">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-medium">Your library is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload a PDF above to get started with AI-powered study tools
              </p>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-5 w-5 text-primary" />
              <span className="truncate">{selectedDocument?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden rounded-lg border bg-muted/30 p-1">
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
