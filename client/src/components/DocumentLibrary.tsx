import React from 'react';
import { FileText, Search, Upload, ChevronRight, Clock } from 'lucide-react';

// Sample data — replace with your real documents from backend
interface Doc {
    id: number;
    title: string;
    size: string;
    pages: number;
    date: string;
    tag: string;
    gradient: string;
}

const sampleDocs: Doc[] = [
    { id: 1, title: 'DBMS Report', size: '1.5 MB', pages: 22, date: 'Dec 5, 2025', tag: 'DBMS', gradient: 'from-purple-600 to-indigo-700' },
    { id: 2, title: 'RMIPR (1)', size: '222.7 KB', pages: 19, date: 'Dec 4, 2025', tag: 'RMIPR', gradient: 'from-sky-600 to-cyan-600' },
    { id: 3, title: 'SE-PM Module-1 Notes', size: '1000.1 KB', pages: 15, date: 'Dec 3, 2025', tag: 'Notes', gradient: 'from-emerald-500 to-teal-600' },
    { id: 4, title: 'Misc Lecture Slides', size: '2.2 MB', pages: 38, date: 'Nov 28, 2025', tag: 'Slides', gradient: 'from-orange-400 to-red-500' }
];

// Reusable Icon component (small)
const FileIcon = ({ className = '' }: { className?: string }) => (
    <div className={`w-11 h-11 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white/90 ${className}`}>
        <FileText className="w-6 h-6 opacity-90" />
    </div>
);

// Document Card — visually polished
function DocumentCard({ doc }: { doc: Doc }) {
    return (
        <div className={`rounded-2xl overflow-hidden drop-shadow-lg transform transition-all duration-300 hover:scale-[1.025] group`}>
            {/* Gradient header */}
            <div className={`p-5 bg-gradient-to-br ${doc.gradient} relative`}>
                <div className="flex items-start gap-4">
                    <FileIcon />
                    <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg leading-tight">{doc.title}</h3>
                        <p className="text-white/80 text-sm mt-1">{doc.tag}</p>
                    </div>
                    <div className="text-white/80 text-sm text-right">
                        <div className="text-xs">{doc.pages} pages</div>
                        <div className="text-xs opacity-80">{doc.size}</div>
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
                        <p className="text-gray-200 font-semibold truncate max-w-[120px]" title={doc.title}>{doc.title}</p>
                        <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                            Uploaded • {doc.date}
                        </p>
                    </div>
                    <div className="flex gap-2 items-center">
                        <button className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-black font-semibold transition text-sm">Open</button>
                        <button className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm border border-white/5">Flashcards</button>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <span className="opacity-80">{doc.size}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <span>{doc.pages} pages</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DocumentLibrary() {
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {sampleDocs.map(doc => (
                            <DocumentCard doc={doc} key={doc.id} />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}
