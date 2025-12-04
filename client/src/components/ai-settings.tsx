import { useState, useEffect } from "react";
import { Settings, Cpu, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    const [dailyGoal, setDailyGoal] = useState("20");
    const [theme, setTheme] = useState("system");

    useEffect(() => {
        setProvider(getStoredProvider());
        setDailyGoal(localStorage.getItem("daily_goal") || "20");
        setTheme(localStorage.getItem("theme") || "system");
    }, []);

    const handleSaveProvider = (value: AIProvider) => {
        setProvider(value);
        localStorage.setItem("ai_provider", value);
    };

    const handleSaveGoal = (value: string) => {
        setDailyGoal(value);
        localStorage.setItem("daily_goal", value);
    };

    const handleSaveTheme = (value: string) => {
        setTheme(value);
        localStorage.setItem("theme", value);
        // In a real app, we'd apply the theme class here or via a context
        if (value === "dark") {
            document.documentElement.classList.add("dark");
        } else if (value === "light") {
            document.documentElement.classList.remove("dark");
        } else {
            // System
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" title="Settings">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Customize your learning experience.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Daily Goal */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Daily Review Goal</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={dailyGoal}
                                onChange={(e) => handleSaveGoal(e.target.value)}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">cards per day</span>
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="space-y-2">
                        <Label className="text-base font-semibold">Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={handleSaveTheme}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="light" id="light" />
                                <Label htmlFor="light">Light</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dark" id="dark" />
                                <Label htmlFor="dark">Dark</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="system" id="system" />
                                <Label htmlFor="system">System</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="border-t pt-4">
                        <Label className="text-base font-semibold mb-2 block">AI Provider</Label>
                        <RadioGroup
                            value={provider}
                            onValueChange={(v) => handleSaveProvider(v as AIProvider)}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
