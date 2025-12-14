import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function UserNav() {
    const { user, logoutMutation } = useAuth();

    if (!user) {
        return (
            <Link href="/auth">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign In
                </Button>
            </Link>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                <div className="px-2 py-1.5 text-sm font-semibold text-foreground">
                    {user.displayName || user.email}
                </div>
                <DropdownMenuItem className="text-foreground focus:bg-muted cursor-pointer">
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground focus:bg-muted cursor-pointer">
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-foreground focus:bg-muted cursor-pointer">
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
