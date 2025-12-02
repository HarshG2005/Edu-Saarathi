import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface NoteEditorProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (text: string) => Promise<void>;
    initialText?: string;
    highlightText?: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
    isOpen,
    onClose,
    onSave,
    initialText = "",
    highlightText,
}) => {
    const [text, setText] = useState(initialText);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setText(initialText);
    }, [initialText, isOpen]);

    const handleSave = async () => {
        if (!text.trim()) return;
        setIsSaving(true);
        try {
            await onSave(text);
            onClose();
        } catch (error) {
            console.error("Failed to save note:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {highlightText && (
                        <div className="p-3 text-sm italic text-slate-400 bg-slate-800/50 rounded-md border border-slate-700/50">
                            "{highlightText.length > 150 ? highlightText.slice(0, 150) + "..." : highlightText}"
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="note">Your Note</Label>
                        <Textarea
                            id="note"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type your thoughts here..."
                            className="h-32 bg-slate-950 border-slate-800 focus:ring-blue-500/50"
                            autoFocus
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !text.trim()} className="bg-blue-600 hover:bg-blue-700">
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
