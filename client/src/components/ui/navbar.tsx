import * as React from "react"
import { Menu, User } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { SearchBar } from "@/components/ui/search-bar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Link } from "wouter"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Navbar() {
    const { user, logoutMutation } = useAuth()

    return (
        <header className="sticky top-0 z-50 flex h-[60px] w-full items-center justify-between border-b border-gfg-border bg-gfg-bg-card px-4 shadow-gfg-light dark:bg-gfg-dark-card dark:border-gfg-dark-border dark:shadow-gfg-dark transition-colors duration-300">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="text-gfg-text hover:bg-gfg-bg-secondary hover:text-gfg-green dark:text-gfg-dark-text dark:hover:bg-gfg-dark-panel dark:hover:text-gfg-green-light" />
                <Link href="/">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <img
                            src="/logo.png"
                            alt="Edu Saarathi Logo"
                            className="h-10 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen"
                        />
                        <span className="hidden text-xl font-bold text-gfg-text dark:text-gfg-dark-text md:inline-block">
                            Edu Saarathi
                        </span>
                    </div>
                </Link>
            </div>

            <div className="hidden flex-1 items-center justify-center px-8 md:flex">
                <SearchBar className="max-w-md w-full" placeholder="Search courses, tutorials..." />
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8 border border-gfg-border dark:border-gfg-dark-border">
                                    <AvatarFallback className="bg-gfg-green text-white font-semibold">
                                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 bg-gfg-bg-card border-gfg-border dark:bg-gfg-dark-card dark:border-gfg-dark-border" align="end" forceMount>
                            <div className="px-2 py-1.5 text-sm font-semibold text-gfg-text dark:text-gfg-dark-text">
                                {user.displayName || user.email}
                            </div>
                            <DropdownMenuItem className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel cursor-pointer">
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel cursor-pointer">
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-gfg-text dark:text-gfg-dark-text hover:bg-gfg-bg dark:hover:bg-gfg-dark-panel cursor-pointer">
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link href="/auth">
                        <Button variant="cta" size="sm">
                            Sign In
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    )
}
