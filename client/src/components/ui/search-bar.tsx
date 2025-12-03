import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
    ({ className, ...props }, ref) => {
        return (
            <div className={cn("relative w-full", className)}>
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gfg-text-light dark:text-gfg-dark-muted" />
                <Input
                    type="search"
                    className="w-full pl-9 bg-white dark:bg-gfg-dark-panel border-gfg-border dark:border-gfg-dark-border focus-visible:ring-gfg-green rounded-md"
                    ref={ref}
                    {...props}
                />
            </div>
        )
    }
)
SearchBar.displayName = "SearchBar"

export { SearchBar }
