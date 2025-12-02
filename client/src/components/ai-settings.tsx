import { useState, useEffect } from "react";
import { Settings, Cpu, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

export type AIProvider = "gemini" | "ollama";

export function getStoredProvider(): AIProvider {
    return (localStorage.getItem("ai_provider") as AIProvider) || "gemini";
}

export function AISettings() {
    const [provider, setProvider] = useState<AIProvider>("gemini");
    const [open, setOpen] = useState(false);

    useEffect(() => {
        setProvider(getStoredProvider());
    }, []);

    const handleSave = (value: AIProvider) => {
        setProvider(value);
        localStorage.setItem("ai_provider", value);
        // setOpen(false); // Keep open to show confirmation or just let user close
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" title="AI Settings">
                    {provider === "gemini" ? <Cloud className="h-4 w-4" /> : <Cpu className="h-4 w-4" />}
                    <span className="hidden sm:inline">AI: {provider === "gemini" ? "Gemini" : "Local"}</span>
                    <Settings className="h-4 w-4 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>AI Provider Settings</DialogTitle>
                    <DialogDescription>
                        Choose between Cloud AI (Gemini) or Local AI (Ollama).
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <RadioGroup
                        value={provider}
                        onValueChange={(v) => handleSave(v as AIProvider)}
                        className="grid gap-4"
                    >
                        <div>
                            <RadioGroupItem
                                value="gemini"
                                id="gemini"
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor="gemini"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <Cloud className="h-6 w-6" />
                                    <span className="font-semibold">Google Gemini</span>
                                </div>
                                <div className="text-center text-sm text-muted-foreground">
                                    Fast, high quality, requires internet.
                                </div>
                            </Label>
                        </div>

                        <div>
                            <RadioGroupItem
                                value="ollama"
                                id="ollama"
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor="ollama"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <Cpu className="h-6 w-6" />
                                    <span className="font-semibold">Local (Ollama)</span>
                                </div>
                                <div className="text-center text-sm text-muted-foreground">
                                    100% Offline, private, requires Ollama running.
                                </div>
                                <Badge variant="secondary" className="mt-2">
                                    Experimental
                                </Badge>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </DialogContent>
        </Dialog>
    );
}
