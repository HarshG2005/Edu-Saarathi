import { useState, useEffect } from "react";
import { Settings, Cpu, Cloud, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { useLocation } from "wouter";
import { FLASHCARD_THEMES } from "@/lib/flashcard-theme";

export type AIProvider = "gemini" | "ollama";

export function getStoredProvider(): AIProvider {
    return (localStorage.getItem("ai_provider") as AIProvider) || "gemini";
}

export default function SettingsPage() {
    const [location, setLocation] = useLocation();
    const [provider, setProvider] = useState<AIProvider>("gemini");
    const [dailyGoal, setDailyGoal] = useState("20");
    const [theme, setTheme] = useState("system");
    const [cardColor, setCardColor] = useState("default");

    useEffect(() => {
        setProvider(getStoredProvider());
        setDailyGoal(localStorage.getItem("daily_goal") || "20");
        setTheme(localStorage.getItem("theme") || "system");
        setCardColor(localStorage.getItem("flashcard_color") || "default");
    }, []);

    const handleSaveProvider = (value: AIProvider) => {
        setProvider(value);
        localStorage.setItem("ai_provider", value);
    };

    const handleSaveGoal = (value: string) => {
        setDailyGoal(value);
        localStorage.setItem("daily_goal", value);
    };

    const handleSaveCardColor = (value: string) => {
        setCardColor(value);
        localStorage.setItem("flashcard_color", value);
        // Dispatch a custom event so other components can update immediately
        window.dispatchEvent(new Event("flashcard-theme-changed"));
    };

    const handleSaveTheme = (value: string) => {
        setTheme(value);
        localStorage.setItem("theme", value);
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
        <Section className="flex flex-col gap-6 h-full max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gfg-text">Settings</h1>
                    <p className="text-gfg-text-light">
                        Customize your learning experience.
                    </p>
                </div>
            </div>

            <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm dark:bg-gfg-dark-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gfg-green" />
                        Preferences
                    </CardTitle>
                    <CardDescription>Manage your app preferences and defaults.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Daily Goal */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Daily Review Goal</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="number"
                                value={dailyGoal}
                                onChange={(e) => handleSaveGoal(e.target.value)}
                                className="w-24 bg-white dark:bg-gfg-dark-bg"
                            />
                            <span className="text-sm text-muted-foreground">cards per day</span>
                        </div>
                    </div>

                    {/* Theme */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">App Theme</Label>
                        <RadioGroup
                            value={theme}
                            onValueChange={handleSaveTheme}
                            className="flex gap-6"
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

                    {/* Flashcard Color */}
                    <div className="space-y-3">
                        <Label className="text-base font-semibold">Flashcard Theme</Label>
                        <div className="flex flex-wrap gap-3">
                            {FLASHCARD_THEMES.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => handleSaveCardColor(t.id)}
                                    className={`w-10 h-10 rounded-full border-2 transition-all ${cardColor === t.id
                                        ? "border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-gfg-dark-card"
                                        : "border-transparent hover:scale-110"
                                        } ${t.preview}`}
                                    title={t.name}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-gfg-border-light dark:border-gfg-dark-border shadow-sm dark:bg-gfg-dark-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Cloud className="h-5 w-5 text-gfg-green" />
                        AI Provider
                    </CardTitle>
                    <CardDescription>Choose the AI model that powers EduQuest.</CardDescription>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={provider}
                        onValueChange={(v) => handleSaveProvider(v as AIProvider)}
                        className="grid gap-4 md:grid-cols-2"
                    >
                        <div>
                            <RadioGroupItem
                                value="gemini"
                                id="gemini"
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor="gemini"
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
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
                                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
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
                </CardContent>
            </Card>
        </Section>
    );
}
