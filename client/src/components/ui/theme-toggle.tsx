import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="border-gfg-border hover:bg-gfg-bg-secondary dark:border-gfg-dark-border dark:hover:bg-gfg-dark-panel">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-gfg-text dark:text-gfg-dark-text" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-gfg-text dark:text-gfg-dark-text" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gfg-card dark:bg-gfg-dark-card border-gfg-border dark:border-gfg-dark-border">
                <DropdownMenuItem onClick={() => setTheme("light")} className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel cursor-pointer">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel cursor-pointer">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel cursor-pointer">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
