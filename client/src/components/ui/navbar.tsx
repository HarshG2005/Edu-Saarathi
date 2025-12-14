import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { BookOpen, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
    const { user } = useAuth();
    const [location] = useLocation();

    if (!user) return null;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-4 gap-4">
                <SidebarTrigger className="-ml-2" />

                <div className="flex items-center gap-2 font-bold text-xl mr-4 text-foreground">
                    <div className="p-1 rounded-md bg-primary/10">
                        <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <span className="hidden md:inline-block">Edu Saarathi</span>
                </div>

                <div className="flex-1 flex max-w-xl mx-auto">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search courses, tutorials..."
                            className="w-full bg-muted pl-9 md:w-[300px] lg:w-[400px] border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                        />
                    </div>
                </div>

                <div className="ml-auto flex items-center space-x-4">
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </header>
    );
}
