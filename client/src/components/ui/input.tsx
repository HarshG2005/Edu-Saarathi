import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-gfg-border bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gfg-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gfg-green disabled:cursor-not-allowed disabled:opacity-50 text-gfg-text dark:bg-gfg-dark-panel dark:border-gfg-dark-border dark:text-gfg-dark-text dark:placeholder:text-gfg-dark-muted dark:focus-visible:ring-gfg-green",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
