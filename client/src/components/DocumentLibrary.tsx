import React from 'react';
import { FileText, Search, Upload, ChevronRight, Clock, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Document } from '@shared/schema';
import { format } from 'date-fns';

// Reusable Icon component (small)
const FileIcon = ({ className = '' }: { className?: string }) => (
    <div className={`w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 ${className}`}>
        <FileText className="w-6 h-6 opacity-90" />
    </div>
);

// Document Card — visually polished
function DocumentCard({ doc }: { doc: Document }) {
    // Generate a consistent gradient based on ID
    const gradients = [
        'from-purple-600 to-indigo-700',
        'from-sky-600 to-cyan-600',
        'from-emerald-500 to-teal-600',
        'from-orange-400 to-red-500',
        'from-pink-500 to-rose-500',
        'from-blue-500 to-indigo-600'
    ];
    const gradient = gradients[doc.id % gradients.length];

    return (
        <div className={`rounded-2xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.025] group`}>
            {/* Gradient header */}
            <div className={`p-5 bg-gradient-to-br ${gradient} relative`}>
                <div className="flex items-start gap-4">
                    <FileIcon />
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg leading-tight truncate" title={doc.name}>{doc.name}</h3>
                        <p className="text-white/80 text-sm mt-1">PDF</p>
                    </div>
                    <div className="text-white/80 text-sm text-right">
                        <div className="text-xs">{doc.pageCount} pages</div>
                        <div className="text-xs opacity-80">{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</div>
                    </div>
                </div>
                {/* subtle glow */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                    <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full opacity-10 blur-3xl bg-white"></div>
                </div>
            </div>

            {/* Card body */}
            <div className="bg-neutral-900 p-5 border border-white/5 group-hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-gray-200 font-semibold truncate max-w-[120px]" title={doc.name}>{doc.name}</p>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                            Uploaded • {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold transition text-sm">Open</button>
                        <button className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm border border-white/5">Flashcards</button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="opacity-80">{(doc.fileSize / 1024).toFixed(0)} KB</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <span>{doc.pageCount} pages</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DocumentLibrary() {
    const { data: documents, isLoading } = useQuery<Document[]>({
        queryKey: ['/api/documents'],
    });

    return (
        <div className="min-h-screen p-8 bg-gradient-to-b from-[#0b0f12] to-[#071218] text-white">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-300 bg-clip-text text-transparent">Document Library</h1>
                        <p className="text-gray-300 mt-1">Upload and manage your PDF textbooks and study materials</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <input
                                className="w-full md:w-80 bg-neutral-900 border border-white/10 rounded-full py-2 pl-4 pr-20 text-sm placeholder:text-gray-500 focus:outline-none focus:border-green-500/50 transition-colors text-gray-200"
                                placeholder="Search documents..."
                            />
                            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-full text-black text-sm font-medium transition-colors">
                                Search
                            </button>
                        </div>
                        <button className="py-2 px-4 bg-white/10 hover:bg-white/15 border border-white/5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap">
                            <Upload className="w-4 h-4" />
                            <span>Upload PDF</span>
                        </button>
                    </div>
                </header>

                {/* Upload drop area */}
                <div className="mb-8 p-8 rounded-2xl border-2 border-dashed border-green-600/30 hover:border-green-500/50 transition-colors bg-neutral-900/30 cursor-pointer group">
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-green-400 transition-colors">
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-white/90 font-medium text-lg">Drop your PDF here</div>
                        <div className="text-gray-500 text-sm">PDF files only • Max 50MB</div>
                    </div>
                </div>

                {/* Grid of cards */}
                <section>
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                        </div>
                    ) : documents && documents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {documents.map(doc => (
                                <DocumentCard doc={doc} key={doc.id} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No documents found. Upload one to get started!
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
