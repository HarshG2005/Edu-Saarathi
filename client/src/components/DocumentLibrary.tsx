import React from 'react';
import { FileText, Search, Upload, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Document } from '@shared/schema';
import { format } from 'date-fns';
import { getGradient } from '@/lib/utils';

// Reusable Icon component (small)
const FileIcon = ({ className = '' }: { className?: string }) => (
    <div className={`w-11 h-11 rounded-lg bg-background/20 backdrop-blur-md flex items-center justify-center text-foreground/90 ${className}`}>
        <FileText className="w-6 h-6 opacity-90" />
    </div>
);

// Document Card — Unified Full Color Card
function DocumentCard({ doc, gradientIndex }: { doc: Document; gradientIndex: number }) {
    return (
        <div className={`rounded-3xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.02] cursor-pointer group border border-white/10 relative h-[220px] flex flex-col justify-between p-6 bg-gradient-to-br ${getGradient(gradientIndex)}`}>

            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-sm ring-1 ring-white/20">
                        <FileText className="w-6 h-6" />
                    </div>
                </div>

                <h3 className="text-white font-bold text-xl leading-tight truncate drop-shadow-sm mb-1" title={doc.name}>{doc.name}</h3>
                <p className="text-white/80 text-sm font-medium">PDF Document • {doc.pageCount} pages</p>
            </div>

            <div className="relative z-10 flex items-center justify-between mt-auto pt-4 border-t border-white/20">
                <span className="text-white/70 text-xs font-medium">
                    {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                </span>

                <button className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold transition text-xs backdrop-blur-sm border border-white/10 shadow-sm flex items-center gap-2">
                    Open <ChevronRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
}

export default function DocumentLibrary() {
    const { data: documents, isLoading } = useQuery<Document[]>({
        queryKey: ['/api/documents'],
    });

    return (
        <div className="min-h-screen p-8 bg-background text-foreground">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Document Library</h1>
                        <p className="text-muted-foreground mt-1">Upload and manage your PDF textbooks and study materials</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <input
                                className="w-full md:w-80 bg-muted border border-border rounded-full py-2 pl-4 pr-20 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-foreground"
                                placeholder="Search documents..."
                            />
                            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-full text-primary-foreground text-sm font-medium transition-colors">
                                Search
                            </button>
                        </div>
                        <button className="py-2 px-4 bg-muted hover:bg-muted/80 border border-border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            <span>Upload PDF</span>
                        </button>
                    </div>
                </header>

                {/* Upload drop area */}
                <div className="mb-8 p-8 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors bg-muted/30 cursor-pointer group">
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-muted group-hover:bg-muted/80 flex items-center justify-center text-primary transition-colors">
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-foreground/90 font-medium text-lg">Drop your PDF here</div>
                        <div className="text-muted-foreground text-sm">PDF files only • Max 50MB</div>
                    </div>
                </div>

                {/* Grid of cards */}
                <section>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : documents && documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {documents.map((doc, index) => (
                                <DocumentCard doc={doc} key={doc.id} gradientIndex={index} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            No documents found. Upload one to get started!
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
